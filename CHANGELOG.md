# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-01-28

### Added
- Platform-specific machine ID management modules for Windows, macOS, and Linux
- Permission checking and management system
- Admin restart functionality for elevated privileges
- Comprehensive compatibility documentation (COMPATIBILITY_FIXES.md, COMPATIBILITY_REPORT.md)
- AGENTS.md for AI agent development guidelines

### Changed
- **BREAKING**: Migrated from Tauri 1.x to Tauri 1.5 to resolve dependency compatibility issues
- Refactored GitHub Actions workflow using official Tauri Action
- Updated frontend UI with improved dialogs and styling
- Enhanced machine ID read/write operations with better error handling
- Optimized build configuration for cross-platform compatibility

### Fixed
- Fixed GitHub Actions workflow YAML syntax errors
- Resolved macOS build issues by disabling LTO optimization
- Fixed cookie dependency by downgrading to v0.17.0 and using git source
- Fixed Windows registry permission handling
- Added cargo clean step to GitHub Actions to resolve cache issues

### Technical Improvements
- Updated Cargo dependencies for better compatibility
- Improved Tauri configuration and capabilities
- Enhanced platform-specific code organization
- Better internationalization support (i18n)
- Optimized frontend code structure and performance

### Documentation
- Added comprehensive platform compatibility matrix
- Updated installation and usage instructions
- Added security notes and best practices
- Improved project structure documentation

## [1.3.7] - Previous Release

### Added
- Initial stable release
- Basic MachineGuid management features
- Backup and restore functionality
- Random GUID generation
- Custom MachineGuid replacement

---

[1.4.0]: https://github.com/luxiaosen8/MachineID-Manage/releases/tag/v1.4.0
[1.3.7]: https://github.com/luxiaosen8/MachineID-Manage/releases/tag/v1.3.7
