# MachineID-Manage

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**[English](README.md)** | **[中文](README.zh-CN.md)**

*A Windows MachineGuid Manager built with Rust + Tauri 2*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()
[![Release](https://img.shields.io/github/v/release/luxiaosen8/MachineID-Manage)](https://github.com/luxiaosen8/MachineID-Manage/releases)

</div>

---

## Overview

MachineID-Manage is a Windows MachineGuid management tool developed using **Rust + Tauri 2**. It enables users to read, backup, replace, and randomly generate Windows MachineGuid identifiers. The application provides a user-friendly graphical interface for performing system registry operations safely and efficiently.

This project was entirely developed by **AI** and cannot guarantee complete functionality or freedom from bugs. Testing has been primarily conducted on **Windows 11**, and compatibility with other Windows versions is not guaranteed.

---

## Download

### Latest Release (v1.4.0)

| Platform | Installer | Portable |
|----------|-----------|----------|
| Windows x64 | [MachineID-Manage_1.4.0_x64-setup.exe](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | [MachineID-Manage_1.4.0_windows_portable.zip](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) |
| Windows MSI | [MachineID-Manage_1.4.0_x64_en-US.msi](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | - |

> **Note**: All downloads are available on the [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) page.

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

## Platform Compatibility

### Feature Matrix

| Feature | Windows | macOS | Linux | Notes |
|:-------:|:-------:|:-----:|:-----:|-------|
| Read Machine ID | ✅ | ✅ | ✅ | Full support on all platforms |
| Write Machine ID | ✅ | ❌ | ✅ | macOS write not supported (system limitation) |
| Backup | ✅ | ✅ | ✅ | Full support on all platforms |
| Restore | ✅ | ❌ | ✅ | macOS restore not supported |
| Random Generate | ✅ | ❌ | ❌ | Windows only |
| Permission Check | ✅ | ✅ | ✅ | Full support on all platforms |
| Admin Restart | ✅ | ✅ | ✅ | Full support on all platforms |
| UI Rendering | ✅ | ✅ | ✅ | Full support on all platforms |
| Internationalization | ✅ | ✅ | ✅ | Full support on all platforms |

### Platform Notes

- **Windows**: Full functionality available. Requires administrator privileges for registry modifications.
- **macOS**: Read and backup operations supported. Write operations are not supported due to macOS system limitations on hardware UUID modification.
- **Linux**: Read and backup operations supported. Write operations require root privileges.

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

#### Option 1: Installer (Recommended)
1. Download the latest `.msi` or `.exe` installer from [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases)
2. Run the installer and follow the setup wizard
3. Launch MachineID-Manage from the Start Menu

#### Option 2: Portable Version
1. Download the `MachineID-Manage_*_windows_portable.zip` from [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases)
2. Extract the ZIP file to your desired location
3. Run `machineid-manage.exe` directly

---

## Development

### Prerequisites

- **Rust** 1.70+ ([Install Rust](https://rustup.rs/))
- **Node.js** 18+ ([Install Node.js](https://nodejs.org/))
- **Tauri CLI**: `cargo install tauri-cli`

### Setup

```bash
# Clone the repository
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# Install dependencies
npm install

# Run in development mode (requires administrator privileges)
npm run tauri dev

# Build for production
npm run tauri build
```

---

## Technical Architecture

### Tech Stack

- **Backend**: Rust + Tauri 2
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Registry Operations**: winreg (Windows Registry API)
- **Build Tool**: Tauri CLI
- **Package Manager**: npm

### Project Structure

```
MachineID-Manage/
├── src/                    # Frontend source code
│   ├── index.html         # Main HTML file
│   ├── style.css          # Stylesheet
│   ├── script.js          # JavaScript logic
│   └── i18n/              # Internationalization
│       ├── index.js       # i18n core
│       ├── en.json        # English translations
│       └── zh-CN.json     # Chinese translations
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Application entry
│   │   ├── lib.rs         # Library exports
│   │   ├── machine_id.rs  # Machine ID operations
│   │   └── commands.rs    # Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── docs/                  # Documentation
└── README.md              # This file
```

---

## Security

⚠️ **Important Security Notice**

- This tool modifies Windows Registry settings. Always create backups before making changes.
- Administrator privileges are required for registry modifications.
- The application performs validation on all GUID inputs to prevent invalid entries.
- All backup data is stored locally in JSON format.

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Tauri](https://tauri.app/) - Build smaller, faster, and more secure desktop applications
- [Rust](https://www.rust-lang.org/) - A language empowering everyone to build reliable and efficient software
- [winreg](https://docs.rs/winreg/) - Rust library for accessing the Windows Registry

---

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/luxiaosen8/MachineID-Manage/issues) on GitHub.

---

<div align="center">

**[⬆ Back to Top](#machineid-manage)**

Made with ❤️ by AI

</div>
