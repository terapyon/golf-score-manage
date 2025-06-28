# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a golf score management web application (ゴルフのスコア履歴を管理するWebアプリ) designed to help users track and manage their golf score history.

## Current State

This repository is in the initial setup phase and contains only basic scaffolding:
- README.md with project description in Japanese
- LICENSE file
- .gitignore configured for Node.js projects
- .devcontainer setup with Node.js and Python support
- GitHub Dependabot configuration

## Missing Implementation

The project currently lacks:
- package.json and dependency management
- Source code directories and files
- Build configuration
- Testing setup
- Actual application implementation

## Development Environment

The project is configured with:
- **Devcontainer**: Supports both Node.js and Python development environments
- **Git**: Repository initialized with comprehensive Node.js .gitignore
- **GitHub**: Dependabot configured for devcontainer updates

## Expected Architecture

Based on the .gitignore configuration, this should be a Node.js-based web application. When implementing:
- Use standard Node.js project structure with src/ directory
- Include package.json with appropriate scripts for build, test, and development
- Consider modern web frameworks suitable for a score tracking application
- Implement proper database integration for score persistence

## Language Note

The project description is in Japanese, indicating this may be intended for Japanese users. Consider internationalization if expanding beyond Japanese market.