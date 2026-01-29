# MachineID-Manage

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**[English](README.md)** | **[中文](README.zh-CN.md)**

*A Windows Machine Code Manager built with Rust + Tauri 2 + Vue 3*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()
[![Release](https://img.shields.io/github/v/release/luxiaosen8/MachineID-Manage)](https://github.com/luxiaosen8/MachineID-Manage/releases)

</div>

---

## Overview

MachineID-Manage is a Windows machine code management tool built with **Rust + Tauri 2 + Vue 3**. It allows you to read, backup, replace, and randomly generate Windows MachineGuid (machine identifier). The application provides a modern graphical interface to help users safely and efficiently perform system registry operations.

### Key Features

- 📖 **Read Machine ID** - Read MachineGuid from Windows registry
- 💾 **Backup Management** - Backup and manage machine code configurations with custom descriptions
- 🔄 **Restore Backup** - Restore machine code from backup
- 🎲 **Random Generation** - Generate random valid GUIDs with preview
- 🔧 **Custom Replacement** - Replace with custom machine code
- 📋 **Copy Feature** - One-click copy machine code to clipboard
- 🔒 **Permission Detection** - Real-time admin permission status

---

## Downloads

### Latest Version (v2.2.0)

| Platform | Installer | Portable |
|----------|-----------|----------|
| Windows x64 | [MachineID-Manage_2.2.0_x64-setup.exe](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | [MachineID-Manage_2.2.0_windows_portable.zip](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) |
| Windows MSI | [MachineID-Manage_2.2.0_x64_en-US.msi](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | - |

> **Note**: All downloads are available on the [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) page.

---

## Features

| Icon | Feature | Description |
|:----:|---------|-------------|
| 📖 | Read Machine ID | Read MachineGuid from Windows registry |
| 💾 | Backup Management | Backup and manage machine code configurations |
| 📝 | Edit Description | Add or edit backup descriptions |
| 🔄 | Restore Backup | Restore machine code from backup |
| 🎲 | Random Generation | Generate random valid GUIDs with preview |
| 🔧 | Custom Replacement | Replace with custom machine code |
| 📋 | Copy Feature | One-click copy machine code to clipboard |
| 🔒 | Permission Detection | Real-time admin permission status |
| 🛡️ | Auto Backup | Automatic backup before modifications |

---

## Tech Stack

### Backend
- **Rust** - Systems programming language
- **Tauri 2** - Cross-platform application framework
- **winreg** - Windows registry operations
- **tracing** - Structured logging

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend build tool
- **Pinia** - Vue state management
- **Tailwind CSS** - Utility-first CSS framework
- **VueUse** - Vue composition utilities

---

## Quick Start

### System Requirements

| Requirement | Details |
|-------------|---------|
| OS | Windows 10/11 |
| Rust | 1.70 or higher |
| Node.js | 18+ (for development) |
| Admin Rights | Required for registry modifications |

### Installation

#### Method 1: Installer (Recommended)
1. Download the latest `.msi` or `.exe` installer from [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases)
2. Run the installer and follow the wizard
3. Launch MachineID-Manage from the Start menu

#### Method 2: Portable (No Installation)
1. Download `MachineID-Manage_*_windows_portable.zip` from [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases)
2. Extract the ZIP file to your desired location
3. Run `machineid-manage.exe` directly

> **Note**: Portable version stores data in the `.data` folder within the application directory.

#### Method 3: Build from Source
```bash
# Clone the repository
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# Install dependencies
npm install

# Start development server
npm run tauri:dev

# Build production version
npm run tauri:build
```

### Usage Instructions

1. **Read Machine ID** - Automatically reads current MachineGuid on app startup
2. **Backup Machine ID** - Click "Backup Machine ID" to save current machine code
3. **Edit Description** - Click the edit icon on any backup to add/modify description
4. **Random Generation** - Click "Random Generate" to create a new random GUID (preview shown before confirmation)
5. **Custom Replacement** - Enter a valid GUID and confirm replacement
6. **Restore Backup** - Select and restore from the backup list

---

## Project Structure

```
MachineID-Manage/
├── src-tauri/                # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri command entry
│   │   ├── machine_id.rs    # Machine ID read/write logic
│   │   └── platform/        # Platform-specific code
│   ├── Cargo.toml           # Rust dependencies
│   ├── tauri.conf.json      # Tauri configuration
│   └── icons/               # App icons
├── src/                      # Vue 3 frontend
│   ├── components/          # Vue components
│   │   ├── ui/             # Base UI components
│   │   ├── layout/         # Layout components
│   │   ├── features/       # Feature components
│   │   └── modals/         # Modal components
│   ├── stores/             # Pinia state management
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── App.vue             # Root component
│   └── main.ts             # Entry file
├── package.json            # Node.js dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind configuration
├── README.md               # Project documentation (English)
├── README.zh-CN.md         # Project documentation (Chinese)
├── LICENSE                 # MIT License
└── .github/workflows/      # CI/CD workflows
```

---

## Development Guide

### Common Commands

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Tauri development mode
npm run tauri:dev

# Build production version
npm run build

# Tauri build
npm run tauri:build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Development Environment Setup

1. Install [Rust](https://rustup.rs/)
2. Install [Node.js](https://nodejs.org/) 18+
3. Install Tauri CLI: `cargo install tauri-cli`
4. Clone the project and install dependencies

---

## Security Considerations

> **Warning**
>
> Modifying the Windows registry carries inherent risks. Always create a system backup before performing any operations.

### Security Measures

| Icon | Measure | Description |
|:----:|---------|-------------|
| 🔒 | Permission Detection | Checks admin rights before write operations |
| 💾 | Auto Backup | Automatically backs up before modifications |
| ✅ | User Confirmation | Dangerous operations require user confirmation |
| 📝 | Operation Logging | Records all registry modification operations |
| 🔍 | Input Validation | Validates GUID format before writing |

### Security Recommendations

1. **Always Backup** - Export and save your current MachineGuid before use
2. **Test First** - Verify operations in a test environment
3. **Least Privilege** - Grant admin rights only when necessary

---

## Changelog

### v2.2.0 (2026-01-30)
- ✨ **Version Auto-Sync** - Version number now automatically syncs from Cargo.toml
- 🎯 **GUID Preview Consistency** - Preview value now matches the actual replacement value
- 🔄 **Auto Refresh Backups** - Backup list automatically refreshes after operations
- 📝 **Edit Backup Description** - Support for editing backup descriptions
- 📁 **Data Storage Path** - Changed to store data in `.data` folder within application directory
- 🖱️ **Disable Context Menu** - Disabled browser context menu for native app experience

### v2.1.0 (2026-01-29)
- 🔧 **Fixed UAC Elevation Issue**
- Replaced PowerShell-based elevation with native Windows API `ShellExecuteW`
- Improved error handling for UAC cancellation
- Added detailed error codes and messages
- Fixed admin restart functionality
- Enhanced stability and reliability

### v2.0.0 (2026-01-29)
- 🎉 **Major Refactoring Version**
- Frontend fully upgraded to Vue 3 + TypeScript
- Replaced traditional build with Vite
- Introduced Pinia state management
- Tailwind CSS modern UI
- Full Tauri 2.0 support
- Added permission visualization
- Enhanced user experience

### v1.4.0 (2026-01-28)
- Fixed Tauri v2 GitHub Actions workflow
- Version updated to 1.4.0
- Improved CI/CD process

### v1.3.7
- Initial stable version
- Basic machine code management features
- Backup and restore functionality

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)
- **Releases**: [https://github.com/luxiaosen8/MachineID-Manage/releases](https://github.com/luxiaosen8/MachineID-Manage/releases)

---

<div align="center">

**Thank you for using MachineID-Manage!**

</div>
