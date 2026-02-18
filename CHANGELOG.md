# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.0] 2026-02-18

### Added

- Support for using callTag for joining an interpretation session without the
  need of entering a PIN.
- Support for displaying a subset of available languages based on the VMR
  description field.

## [1.1.0] 2025-11-04

### Added

- i18n support for English, Spanish, and French languages.

### Changed

- Updated dependencies to their latest versions for improved security and
  performance.

### Fixed

- Disable the main room mute button when the user is in interpretation mode to
  prevent conflicts.
- Disconnect interpretation audio streams when the user leaves the meeting.

## [1.0.0] 2024-07-03

### Added

- Initial release of the interpretation plugin.
