// Internationalization (i18n) module for MachineID-Manage

const I18N_PATH = 'i18n';
const DEFAULT_LOCALE = 'en';

class I18n {
    constructor() {
        this.locale = DEFAULT_LOCALE;
        this.fallbackLocale = DEFAULT_LOCALE;
        this.translations = {};
        this.initialized = false;
    }

    async init() {
        const userLocale = this.getUserLocale();
        const supportedLocales = ['en', 'zh-CN', 'zh'];

        this.locale = this.findSupportedLocale(userLocale, supportedLocales);
        this.fallbackLocale = DEFAULT_LOCALE;

        await this.loadTranslations(this.locale);
        this.initialized = true;

        console.log(`[i18n] Initialized with locale: ${this.locale}`);
    }

    getUserLocale() {
        if (typeof navigator !== 'undefined' && navigator.language) {
            return navigator.language;
        }
        if (typeof navigator !== 'undefined' && navigator.userLanguage) {
            return navigator.userLanguage;
        }
        return DEFAULT_LOCALE;
    }

    findSupportedLocale(userLocale, supportedLocales) {
        if (!userLocale || typeof userLocale !== 'string') {
            return this.fallbackLocale;
        }

        const normalizedUserLocale = userLocale.toLowerCase().replace('_', '-');

        for (const locale of supportedLocales) {
            if (normalizedUserLocale === locale.toLowerCase()) {
                return locale;
            }
        }

        for (const locale of supportedLocales) {
            if (normalizedUserLocale.startsWith(locale.toLowerCase())) {
                return locale;
            }
        }

        for (const locale of supportedLocales) {
            if (locale.startsWith('zh')) {
                if (normalizedUserLocale.includes('zh')) {
                    return 'zh-CN';
                }
            }
            if (locale === 'en' && normalizedUserLocale.startsWith('en')) {
                return 'en';
            }
        }

        return this.fallbackLocale;
    }

    getTranslationPath(locale) {
        return `${I18N_PATH}/${locale}.json`;
    }

    async loadTranslations(locale) {
        if (!locale || typeof locale !== 'string') {
            locale = this.fallbackLocale;
        }

        const translationPath = this.getTranslationPath(locale);

        try {
            const response = await fetch(translationPath);

            if (!response.ok) {
                console.warn(`[i18n] Translation file not found for locale: ${locale} (HTTP ${response.status})`);

                if (locale !== this.fallbackLocale) {
                    return this.loadTranslations(this.fallbackLocale);
                }
                return;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
                console.warn(`[i18n] Invalid content type for translation file: ${translationPath}`);
                if (locale !== this.fallbackLocale) {
                    return this.loadTranslations(this.fallbackLocale);
                }
                return;
            }

            this.translations = await response.json();
            console.log(`[i18n] Successfully loaded translations for: ${locale}`);

        } catch (error) {
            console.error(`[i18n] Failed to load translations for ${locale}:`, error.message);

            if (locale !== this.fallbackLocale) {
                console.log(`[i18n] Falling back to default locale: ${this.fallbackLocale}`);
                return this.loadTranslations(this.fallbackLocale);
            }
        }
    }

    t(key, params = {}) {
        if (!key || typeof key !== 'string') {
            return '';
        }

        let text = this.translations[key];

        if (text === undefined || text === null) {
            text = key;
        }

        if (typeof text !== 'string') {
            text = String(text);
        }

        if (params && typeof params === 'object') {
            for (const [paramKey, paramValue] of Object.entries(params)) {
                if (paramValue !== undefined) {
                    const regex = new RegExp(`\\{${paramKey}\\}`, 'g');
                    text = text.replace(regex, String(paramValue));
                }
            }
        }

        return text;
    }

    setLocale(locale) {
        const supportedLocales = ['en', 'zh-CN', 'zh'];
        const normalizedLocale = locale?.toLowerCase().replace('_', '-');

        const isSupported = supportedLocales.some(
            supported => normalizedLocale === supported.toLowerCase()
        );

        if (!isSupported) {
            console.warn(`[i18n] Unsupported locale: ${locale}, using current: ${this.locale}`);
            return;
        }

        this.locale = locale;
        this.loadTranslations(locale).then(() => {
            this.updateAllTexts();
        });
    }

    getLocale() {
        return this.locale;
    }

    updateAllTexts() {
        if (!this.initialized) {
            console.warn('[i18n] Not initialized, skipping text update');
            return;
        }

        document.querySelectorAll('[data-i18n]').forEach(element => {
            if (!element) return;

            const key = element.getAttribute('data-i18n');
            if (!key) return;

            if (element.getAttribute('data-i18n-attr')) {
                const attr = element.getAttribute('data-i18n-attr');
                element.setAttribute(attr, this.t(key));
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = this.t(key);
            } else {
                element.textContent = this.t(key);
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            if (!element) return;

            const key = element.getAttribute('data-i18n-html');
            if (!key) return;

            element.innerHTML = this.t(key);
        });
    }

    updateElementText(element, key, params = {}) {
        if (!element || !key) return;

        if (element.getAttribute('data-i18n-attr')) {
            const attr = element.getAttribute('data-i18n-attr');
            element.setAttribute(attr, this.t(key, params));
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = this.t(key, params);
        } else {
            element.textContent = this.t(key, params);
        }
    }
}

window.i18n = new I18n();
