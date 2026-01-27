# MachineID-Manage / 鏈哄櫒鐮佺鐞嗗櫒

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**English** | [涓枃](#涓枃璇存槑)

*A Windows MachineGuid Manager built with Rust + Tauri 2*

*鍩轰簬 Rust + Tauri 2 鐨?Windows 鏈哄櫒鐮佺鐞嗗櫒*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()

</div>

---

## 椤圭洰绠€浠?/ Project Overview

### English

MachineID-Manage is a Windows MachineGuid management tool developed primarily using **Rust + Tauri 2**. It enables users to read, backup, replace, and randomly generate Windows MachineGuid identifiers. The application provides a user-friendly graphical interface for performing system registry operations safely and efficiently.

This project was entirely developed by **AI** and cannot guarantee complete functionality or freedom from bugs. Testing has been primarily conducted on **Windows 11**, and compatibility with other Windows versions is not guaranteed.

### 涓枃

MachineID-Manage 鏄竴娆惧熀浜?**Rust + Tauri 2** 寮€鍙戠殑 Windows 鏈哄櫒鐮佺鐞嗗伐鍏枫€傚畠浣胯兘澶熻鍙栥€佸浠姐€佹浛鎹㈠拰闅忔満鐢熸垚 Windows MachineGuid锛堟満鍣ㄧ爜鏍囪瘑绗︼級銆傝搴旂敤绋嬪簭鎻愪緵鍙嬪ソ鐨勫浘褰㈢晫闈紝甯姪鐢ㄦ埛瀹夊叏楂樻晥鍦版墽琛岀郴缁熸敞鍐岃〃鎿嶄綔銆?
鏈」鐩?*鍏ㄧ▼鐢?AI 寮€鍙?*锛屾棤娉曚繚璇佸姛鑳芥€у畬鍠勫強鏃?BUG銆傞」鐩凡鍦?**Windows 11** 涓嬫祴璇曟湁鏁堬紝鍏朵粬绯荤粺鐗堟湰璇疯嚜琛屾祴璇曘€?
---

## 鍔熻兘鐗规€?/ Features

| Feature | 鍔熻兘 | Description | 璇存槑 |
|---------|------|-------------|------|
| 馃摉 | 璇诲彇鏈哄櫒鐮?| Read MachineGuid from Windows Registry | 浠?Windows 娉ㄥ唽琛ㄨ鍙?MachineGuid |
| 馃捑 | 澶囦唤绠＄悊 | Backup and manage machine IDs | 澶囦唤鍜岀鐞嗘満鍣ㄧ爜閰嶇疆 |
| 馃攧 | 鎭㈠澶囦唤 | Restore machine ID from backup | 浠庡浠芥仮澶嶆満鍣ㄧ爜 |
| 馃幉 | 闅忔満鐢熸垚 | Generate random valid GUID | 鐢熸垚闅忔満鏈夋晥鐨?GUID |
| 馃敡 | 鑷畾涔夋浛鎹?| Replace with custom MachineGuid | 浣跨敤鑷畾涔夋満鍣ㄧ爜鏇挎崲 |
| 馃搵 | 澶嶅埗鍔熻兘 | One-click copy to clipboard | 涓€閿鍒舵満鍣ㄧ爜鍒板壀璐存澘 |

---

## 浣跨敤璇存槑 / Usage Guide

### 绯荤粺瑕佹眰 / System Requirements

| Requirement | 瑕佹眰 | Details | 璇︽儏 |
|-------------|------|---------|------|
| Operating System | 鎿嶄綔绯荤粺 | Windows 10/11 | Windows 10/11 |
| Rust | Rust | Version 1.70+ | 1.70 鎴栨洿楂樼増鏈?|
| Node.js | Node.js | Version 18+ (for development) | 18+锛堢敤浜庡紑鍙戯級 |
| Administrator Rights | 绠＄悊鍛樻潈闄?| Required for registry modification | 淇敼娉ㄥ唽琛ㄦ椂闇€瑕?|

### 蹇€熷紑濮?/ Quick Start

```bash
# 1. 鍏嬮殕浠撳簱 / Clone the repository
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 2. 瀹夎渚濊禆 / Install dependencies
npm install

# 3. 鍚姩寮€鍙戞ā寮?/ Start development server
cargo tauri dev

# 4. 鏋勫缓鐢熶骇鐗堟湰 / Build production version
cargo tauri build
```

### 鎿嶄綔璇存槑 / Operations Guide

1. **璇诲彇鏈哄櫒鐮?* - 鐐瑰嚮"璇诲彇鏈哄櫒鐮?鎸夐挳鑾峰彇褰撳墠 MachineGuid
2. **澶囦唤鏈哄櫒鐮?* - 鐐瑰嚮"澶囦唤"淇濆瓨褰撳墠鏈哄櫒鐮佸埌鏈湴瀛樺偍
3. **闅忔満鐢熸垚** - 鐐瑰嚮"闅忔満鐢熸垚"鍒涘缓鏂扮殑闅忔満 GUID 骞舵浛鎹?4. **鑷畾涔夋浛鎹?* - 杈撳叆鏈夋晥鐨?GUID 鏍煎紡骞剁‘璁ゆ浛鎹?5. **鎭㈠澶囦唤** - 鍦ㄥ浠藉垪琛ㄤ腑閫夋嫨澶囦唤椤瑰苟鐐瑰嚮鎭㈠

---

## 椤圭洰缁撴瀯 / Project Structure

```
MachineID-Manage/
鈹溾攢鈹€ src-tauri/                # Tauri 鍚庣 (Rust)
鈹?  鈹溾攢鈹€ src/
鈹?  鈹?  鈹溾攢鈹€ main.rs          # Tauri 鍛戒护鍏ュ彛 / Command entry point
鈹?  鈹?  鈹斺攢鈹€ machine_id.rs    # 鏈哄櫒鐮佽鍐欓€昏緫 / Machine ID operations
鈹?  鈹溾攢鈹€ Cargo.toml           # Rust 渚濊禆閰嶇疆
鈹?  鈹溾攢鈹€ tauri.conf.json      # Tauri 閰嶇疆
鈹?  鈹斺攢鈹€ icons/               # 搴旂敤鍥炬爣
鈹溾攢鈹€ src/                     # 鍓嶇婧愮爜
鈹?  鈹溾攢鈹€ index.html           # 涓婚〉闈?/ Main page
鈹?  鈹溾攢鈹€ style.css            # 鏍峰紡鏂囦欢 / Styles
鈹?  鈹斺攢鈹€ script.js            # 浜や簰閫昏緫 / Client-side logic
鈹溾攢鈹€ scripts/                 # 宸ュ叿鑴氭湰
鈹?  鈹斺攢鈹€ create-portable.ps1  # 鍏嶅畨瑁呭寘鍒朵綔鑴氭湰
鈹溾攢鈹€ tests/                   # 娴嬭瘯鏂囦欢
鈹溾攢鈹€ AGENTS.md               # 椤圭洰寮€鍙戣鑼?鈹溾攢鈹€ LICENSE                 # 鑻辨枃寮€婧愯鍙瘉
鈹溾攢鈹€ LICENSE.zh-CN           # 涓枃寮€婧愯鍙瘉
鈹溾攢鈹€ DISCLAIMER.md           # 鍏嶈矗澹版槑
鈹溾攢鈹€ CONTRIBUTING.md         # 璐＄尞鎸囧崡
鈹溾攢鈹€ SECURITY.md             # 瀹夊叏鏀跨瓥
鈹斺攢鈹€ README.md               # 鏈枃浠?```

---

## 鎶€鏈爤 / Technology Stack

### 鍚庣 / Backend

- **Rust** - 绯荤粺缂栫▼璇█锛屾彁渚涢珮鎬ц兘鍜屽唴瀛樺畨鍏?- **Tauri 2** - 妗岄潰搴旂敤妗嗘灦锛屾浛浠?Electron 鐨勮交閲忕骇鏂规
- **winreg** - Rust crate锛岀敤浜?Windows 娉ㄥ唽琛ㄦ搷浣?
### 鍓嶇 / Frontend

- **HTML5** - 缁撴瀯鍖栨爣璁拌瑷€
- **CSS3** - 鏍峰紡琛紝鎻愪緵鐜颁唬鍖?UI
- **JavaScript** - 浜や簰閫昏緫锛屼笌 Tauri 鍚庣閫氫俊

### 寮€鍙戝伐鍏?/ Development Tools

- **Cargo** - Rust 鍖呯鐞嗗櫒
- **npm** - Node.js 鍖呯鐞嗗櫒
- **Git** - 鐗堟湰鎺у埗

---

## API 璇存槑 / API Reference

### Tauri Commands / Tauri 鍛戒护

```rust
// 璇诲彇鏈哄櫒鐮?#[tauri::command]
fn read_machine_id() -> Result<MachineIdInfo, String>

// 澶囦唤褰撳墠鏈哄櫒鐮?#[tauri::command]
fn backup_current_machine_guid(description: Option<String>) -> Result<Option<MachineIdBackup>, BackupError>

// 鍐欏叆鏈哄櫒鐮侊紙鏇挎崲锛?#[tauri::command]
fn write_machine_guid_command(new_guid: String, description: Option<String>) -> Result<WriteGuidResponse, String>

// 闅忔満鐢熸垚鏈哄櫒鐮?#[tauri::command]
fn generate_random_guid_command(description: Option<String>) -> Result<GenerateRandomGuidResponse, String>

// 鍒犻櫎澶囦唤
#[tauri::command]
fn delete_backup_by_id(id: String) -> Result<BackupResponse, String>

// 娓呯┖鎵€鏈夊浠?#[tauri::command]
fn clear_all_backups() -> Result<BackupResponse, String>

// 鑾峰彇澶囦唤鍒楄〃
#[tauri::command]
fn get_all_backups() -> Result<Vec<MachineIdBackup>, String>

// 娴嬭瘯鍐欏叆鏉冮檺
#[tauri::command]
fn test_write_access_command() -> Result<PermissionCheckResult, String>
```

### 鏁版嵁缁撴瀯 / Data Structures

```rust
// 鏈哄櫒鐮佷俊鎭?struct MachineIdInfo {
    guid: String,
    source: String,
}

// 澶囦唤璁板綍
struct MachineIdBackup {
    id: String,
    guid: String,
    source: String,
    timestamp: u64,
    description: Option<String>,
}

// 澶囦唤瀛樺偍
struct BackupStore {
    backups: Vec<MachineIdBackup>,
}
```

---

## 瀹夊叏娉ㄦ剰浜嬮」 / Security Notes

鈿狅笍 **璀﹀憡 / WARNING**

> **English**: Modifying the Windows Registry carries inherent risks. Always create system backups before performing any operations.
>
> **涓枃**: 淇敼 Windows 娉ㄥ唽琛ㄥ瓨鍦ㄥ浐鏈夐闄┿€傛墽琛屼换浣曟搷浣滃墠锛岃鍔″繀鍒涘缓绯荤粺澶囦唤銆?
### 瀹夊叏鎺柦 / Security Measures

| Measure | 鎺柦 | Description | 璇存槑 |
|---------|------|-------------|------|
| 馃敀 | 鏉冮檺妫€娴?| Check administrator rights before write operations | 鍐欏叆鎿嶄綔鍓嶆娴嬬鐞嗗憳鏉冮檺 |
| 馃捑 | 鑷姩澶囦唤 | Automatic backup before modification | 淇敼鍓嶈嚜鍔ㄥ浠?|
| 鉁?| 鐢ㄦ埛纭 | Require user confirmation for dangerous operations | 鍗遍櫓鎿嶄綔闇€瑕佺敤鎴风‘璁?|
| 馃摑 | 鎿嶄綔鏃ュ織 | Log all registry modifications | 璁板綍鎵€鏈夋敞鍐岃〃淇敼鎿嶄綔 |
| 馃攳 | 杈撳叆楠岃瘉 | Validate GUID format before writing | 鍐欏叆鍓嶉獙璇?GUID 鏍煎紡 |

### 瀹夊叏寤鸿 / Security Recommendations

1. **Always backup** - 浣跨敤鍓嶅鍑哄苟淇濆瓨褰撳墠 MachineGuid
2. **Test first** - 鍦ㄦ祴璇曠幆澧冮獙璇佹搷浣滄晥鏋?3. **Minimal permissions** - 浠呭湪闇€瑕佹椂鎺堜簣绠＄悊鍛樻潈闄?4. **Verify changes** - 鎿嶄綔鍚庨獙璇佺郴缁熸甯歌繍琛?
璇﹁ [DISCLAIMER.md](DISCLAIMER.md) 鍜?[SECURITY.md](SECURITY.md)

---

## 璐＄尞 / Contributing

鎴戜滑娆㈣繋鍚勭褰㈠紡鐨勮础鐚紒/ We welcome contributions in various forms!

- 馃悰 鎶ュ憡 Bug / Report bugs
- 馃挕 鎻愬嚭寤鸿 / Suggest features
- 馃摑 鏀硅繘鏂囨。 / Improve documentation
- 馃敡 鎻愪氦淇 / Submit fixes
- 鉁?娣诲姞鍔熻兘 / Add new features

璇﹁ [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 寮€婧愬崗璁?/ Open Source License

鏈」鐩噰鐢?**MIT 璁稿彲璇?* 寮€婧愩€? This project is open source under the **MIT License**.

### 璁稿彲璇佹枃浠?/ License Files

| File | Language | Description |
|------|----------|-------------|
| [LICENSE](LICENSE) | English | MIT License |
| [LICENSE.zh-CN](LICENSE.zh-CN) | 涓枃 | MIT 璁稿彲璇?|
| [DISCLAIMER.md](DISCLAIMER.md) | 涓枃 | 鍏嶈矗澹版槑 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 涓枃 | 璐＄尞鎸囧崡 |

### 鏉冨埄涓庝箟鍔?/ Rights and Obligations

**鎮ㄥ彲浠?/ You May:**
- 鉁?鍏嶈垂浣跨敤 / Use freely
- 鉁?淇敼婧愮爜 / Modify source code
- 鉁?鍒嗗彂杞欢 / Distribute software
- 鉁?鍟嗕笟浣跨敤 / Commercial use
- 鉁?绉佹湁浣跨敤 / Private use

**鎮ㄩ渶瑕?/ You Must:**
- 馃搵 淇濈暀鐗堟潈澹版槑 / Retain copyright notice
- 馃搵 鍖呭惈璁稿彲璇佸壇鏈?/ Include license copy

**鎮ㄤ笉寰?/ You May Not:**
- 鉂?鍒犻櫎鐗堟潈澹版槑 / Remove copyright notice
- 鉂?鐢ㄤ簬闈炴硶鐢ㄩ€?/ Use for illegal purposes

---

## 鐗堟潈澹版槑 / Copyright Notice

```
Copyright (c) 2025 MachineID-Manage Contributors

鏈」鐩噰鐢?MIT 璁稿彲璇佸紑婧愶紝璇﹁ LICENSE 鏂囦欢銆?This project is open source under the MIT License. See LICENSE file for details.
```

---

## 鑱旂郴鏂瑰紡 / Contact

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)
- **璐＄尞鎸囧崡**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **瀹夊叏鏀跨瓥**: [SECURITY.md](SECURITY.md)
- **鍏嶈矗澹版槑**: [DISCLAIMER.md](DISCLAIMER.md)

---

## 鑷磋阿 / Acknowledgments

- [Tauri Team](https://tauri.app/) - For the excellent desktop framework
- [Rust Team](https://www.rust-lang.org/) - For the safe and fast programming language
- [All Contributors](https://github.com/luxiaosen8/MachineID-Manage/graphs/contributors) - For your support and contributions

---

<div align="center">

**MachineID-Manage** / 鏈哄櫒鐮佺鐞嗗櫒

*Built with 鉂わ笍 by AI / 鐢?AI 鍏ㄧ▼寮€鍙?

</div>

