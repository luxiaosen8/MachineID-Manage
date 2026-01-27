# MachineID-Manage

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**[English](README.md)** | **[中文](README.zh-CN.md)**

*A Windows MachineGuid Manager built with Rust + Tauri 2*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()

</div>

---

## Overview

MachineID-Manage is a Windows MachineGuid management tool developed using **Rust + Tauri 2**. It enables users to read, backup, replace, and randomly generate Windows MachineGuid identifiers. The application provides a user-friendly graphical interface for performing system registry operations safely and efficiently.

This project was entirely developed by **AI** and cannot guarantee complete functionality or freedom from bugs. Testing has been primarily conducted on **Windows 11**, and compatibility with other Windows versions is not guaranteed.

---

## Features

| Icon | Feature | Description |
|:----:|---------|-------------|
| 📖 | Read MachineGuid | Read MachineGuid from Windows Registry |
| 💾 | Backup Management | Backup and manage machine ID configurations |
| 🔄 | Restore Backup | Restore machine ID from previous backups |
| 🎲 | Random Generation | Generate random valid GUIDs |
| 🔧 | Custom Replace | Replace with custom MachineGuid values |
| 📋 | Copy Function | One-click copy to clipboard |

---

## Quick Start

### System Requirements

| Requirement | Details |
|-------------|---------|
| Operating System | Windows 10/11 |
| Rust | Version 1.70+ |
| Node.js | Version 18+ (for development) |
| Administrator Rights | Required for registry modification |

### Installation

```bash
# Clone the repository
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# Install dependencies
npm install

# Start development server
cargo tauri dev

# Build production version
cargo tauri build
```

### Operations Guide

1. **Read MachineGuid** - Click "Read MachineGuid" to get the current MachineGuid
2. **Backup** - Click "Backup" to save the current machine ID to local storage
3. **Random Generate** - Click "Random Generate" to create and replace with a new random GUID
4. **Custom Replace** - Enter a valid GUID format and confirm replacement
5. **Restore Backup** - Select a backup from the list and click restore

---

## Project Structure

```
MachineID-Manage/
├── src-tauri/                # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri command entry point
│   │   └── machine_id.rs    # Machine ID read/write operations
│   ├── Cargo.toml           # Rust dependencies configuration
│   ├── tauri.conf.json      # Tauri configuration
│   └── icons/               # Application icons
├── src/                     # Frontend source code
│   ├── index.html           # Main page
│   ├── style.css            # Styles
│   └── script.js            # Client-side logic
├── tests/                   # Test files
├── README.md                # Project documentation (English)
├── README.zh-CN.md          # 项目说明（中文）
├── CONTRIBUTING.md          # Contribution guidelines
├── LICENSE                  # MIT License
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
```

---

## Tech Stack

- **Rust** - Systems programming language
- **Tauri 2** - Cross-platform application framework
- **Windows Registry** - System registry operations (winreg crate)
- **HTML/CSS/JavaScript** - Frontend interface

---

## Security Notes

> **WARNING**
>
> Modifying the Windows Registry carries inherent risks. Always create system backups before performing any operations.

### Security Measures

| Icon | Measure | Description |
|:----:|---------|-------------|
| 🔒 | Permission Check | Check administrator rights before write operations |
| 💾 | Auto Backup | Automatic backup before modification |
| ✅ | User Confirmation | Require user confirmation for dangerous operations |
| 📝 | Operation Log | Log all registry modifications |
| 🔍 | Input Validation | Validate GUID format before writing |

### Security Recommendations

1. **Always backup** - Export and save the current MachineGuid before use
2. **Test first** - Verify operation effects in a test environment
3. **Minimal permissions** - Only grant administrator rights when necessary

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contact

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)

---

<div align="center">

**Thank you for using MachineID-Manage!**

</div>
