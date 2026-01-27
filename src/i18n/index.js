// Internationalization (i18n) module for MachineID-Manage

class I18n {
    constructor() {
        this.locale = 'en';
        this.fallbackLocale = 'en';
        this.translations = {};
        this.initialized = false;
    }

    async init() {
        const userLocale = this.getUserLocale();
        const supportedLocales = ['en', 'zh-CN', 'zh'];

        this.locale = this.findSupportedLocale(userLocale, supportedLocales);
        this.fallbackLocale = 'en';

        await this.loadTranslations(this.locale);
        this.initialized = true;

        console.log(`[i18n] Initialized with locale: ${this.locale}`);
    }

    getUserLocale() {
        if (typeof navigator !== 'undefined') {
            return navigator.language || navigator.userLanguage || 'en';
        }
        return 'en';
    }

    findSupportedLocale(userLocale, supportedLocales) {
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

    async loadTranslations(locale) {
        try {
            const response = await fetch(`i18n/${locale}.json`);
            if (response.ok) {
                this.translations = await response.json();
            } else {
                console.warn(`[i18n] Translation file not found for locale: ${locale}, falling back to English`);
                await this.loadTranslations('en');
            }
        } catch (error) {
            console.error(`[i18n] Failed to load translations for ${locale}:`, error);
            if (locale !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    t(key, params = {}) {
        let text = this.translations[key] || key;

        for (const [paramKey, paramValue] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
        }

        return text;
    }

    setLocale(locale) {
        this.locale = locale;
        this.loadTranslations(locale).then(() => {
            this.updateAllTexts();
        });
    }

    getLocale() {
        return this.locale;
    }

    updateAllTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
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
            const key = element.getAttribute('data-i18n-html');
            element.innerHTML = this.t(key);
        });
    }

    updateElementText(element, key, params = {}) {
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
