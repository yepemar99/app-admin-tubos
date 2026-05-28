# 🚀 app-admin-tubos

<div align="center">

![Electron](https://img.shields.io/badge/Electron-19.1.9-blue.svg?style=for-the-badge&logo=Electron)

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

[![GitHub stars](https://img.shields.io/github/stars/yepemar99/app-admin-tubos?style=for-the-badge)](https://github.com/yepemar99/app-admin-tubos/stargazers)

[![GitHub forks](https://img.shields.io/github/forks/yepemar99/app-admin-tubos?style=for-the-badge)](https://github.com/yepemar99/app-admin-tubos/network)

[![GitHub issues](https://img.shields.io/github/issues/yepemar99/app-admin-tubos?style=for-the-badge)](https://github.com/yepemar99/app-admin-tubos/issues)

[![GitHub license](https://img.shields.io/github/license/yepemar99/app-admin-tubos?style=for-the-badge)](LICENSE)

**A cross-platform desktop administration application for managing "tubos" (pipes/tubes) data, built with Electron and React.**

</div>

## 📖 Overview

`app-admin-tubos` is a robust desktop application designed to provide administrative functionalities for managing data related to "tubos" (pipes or tubes). Leveraging the power of Electron, it offers a native-like user experience across Windows, macOS, and Linux, combined with a modern and interactive frontend built with React. The application is configured to interact with an external API for data persistence and business logic, making it a flexible solution for various data management needs within an administrative context.

## ✨ Features

-   🎯 **Dedicated Desktop Experience:** Enjoy a native application feel with system-level integrations and offline capabilities.
-   🛠️ **Intuitive React UI:** A responsive and interactive user interface built with React and TypeScript for efficient data management.
-   🔗 **External API Integration:** Seamlessly connects to a backend API to perform CRUD (Create, Read, Update, Delete) operations on "tubos" data.
-   ⚙️ **Configurable Settings:** Easily customize core application parameters such as API base URL and app title via a dedicated `settings.json` file.
-   📦 **Cross-Platform Compatibility:** Packaged using Electron Forge, ensuring distributable builds for Windows, macOS, and Linux.
-   🧹 **Code Quality & Consistency:** Maintained with ESLint for linting and Prettier for consistent code formatting.

## 🛠️ Tech Stack

**Frontend (Renderer Process):**
-   **Framework:** React v18.2.0
-   **Language:** TypeScript v4.9.5
-   **Routing:** React Router DOM
-   **HTTP Client:** Axios
-   **Styling:** Pure CSS (via `css-loader`, `style-loader`)

**Backend (Main Process & Runtime):**
-   **Runtime:** Node.js
-   **Desktop Framework:** Electron v22.3.25

**Build Tools & Development:**
-   **Bundler:** Webpack v5.x
-   **Desktop Packaging:** Electron Forge v6.0.0-beta.67
-   **Code Quality:** ESLint, Prettier

## 🚀 Quick Start

Follow these steps to get your development environment set up and the application running.

### Prerequisites

Before you begin, ensure you have the following installed:

-   [Node.js](https://nodejs.org/en/) (v16.x or later recommended)
-   npm (comes with Node.js)
-   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yepemar99/app-admin-tubos.git
    cd app-admin-tubos
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configuration setup**
    The application uses a `settings.json` file for configuration. Review and modify it as needed.
    ```json
    // settings.json
    {
      "apiBaseUrl": "http://localhost:3000/api", // Your backend API base URL
      "appTitle": "Admin Tubos Desktop App",    // Title of the application
      "defaultTheme": "light"                   // Default UI theme
    }
    ```
    If your project uses environment variables (e.g., via `dotenv`), create a `.env` file in the root directory:
    ```bash
    cp .env.example .env # If .env.example exists
    # Or create it manually:
    # API_KEY=your_api_key_here
    ```
    <!-- TODO: Confirm if .env.example exists or specify actual env vars if detected -->

4.  **Start development server**
    This command will launch the Electron application in development mode with live reloading.
    ```bash
    npm run start
    ```

## 📁 Project Structure

```
app-admin-tubos/
├── src/                      # Application source code
│   ├── main/                 # Electron Main Process code (e.g., main.ts)
│   ├── renderer/             # React Renderer Process code (components, pages, etc.)
│   └── preload/              # Electron Preload script (for context isolation)
├── .gitignore                # Files/folders to be ignored by Git
├── .prettierrc               # Prettier configuration for code formatting
├── package.json              # Project metadata, scripts, and dependencies
├── package-lock.json         # Records exact dependency versions
├── settings.json             # Application-specific configuration
├── webpack.main.config.js    # Webpack configuration for Electron's main process
├── webpack.renderer.config.js # Webpack configuration for Electron's renderer process
└── webpack.rules.js          # Shared Webpack rules for both processes
```

## ⚙️ Configuration

### Application Settings (settings.json)

The `settings.json` file in the root directory allows you to configure essential application parameters.

| Variable       | Description                       | Default                 | Required |

|----------------|-----------------------------------|-------------------------|----------|

| `apiBaseUrl`   | The base URL for the backend API. | `http://localhost:3000/api` | Yes      |

| `appTitle`     | The title displayed in the application window. | `Admin Tubos Desktop App` | Yes      |

| `defaultTheme` | The default visual theme for the application. | `light`                 | No       |

### Environment Variables

The project uses `dotenv` to manage environment variables. While no `.env.example` was found, you might need to create a `.env` file in the project root for sensitive information or environment-specific configurations.
<!-- TODO: If specific environment variables are found in code, list them here. -->

## 🔧 Development

### Available Scripts

In the project directory, you can run:

| Command        | Description                                       |

|----------------|---------------------------------------------------|

| `npm run start`| Starts the Electron application in development mode. |

| `npm run lint` | Runs ESLint to check for code quality and style issues. |

| `npm run package` | Packages the Electron application into an OS-specific distributable (e.g., `.app`, `.exe`). |

| `npm run make` | Creates installers for the packaged Electron application. |

### Development Workflow

1.  After cloning and installing dependencies (`npm install`), configure your `settings.json`.
2.  Run `npm run start` to open the development version of the application. This will automatically reload the app when changes are made to the source code.
3.  Use `npm run lint` regularly to maintain code quality.

## 🧪 Testing

The project uses ESLint for static code analysis and linting. No explicit unit or integration testing frameworks (like Jest, Mocha, or Cypress) were detected in `package.json` scripts or dependencies.

### Code Linting

```bash
npm run lint
```
This command will check your code against the ESLint rules defined in the project.

## 🚀 Deployment

The application utilizes Electron Forge for building and packaging production-ready desktop installers.

### Production Build

To create a distributable package for your operating system:

```bash
npm run package
```
This command will generate a folder (e.g., `out/app-admin-tubos-win32-x64`) containing the packaged application.

### Creating Installers

To create full installers (e.g., `.exe` for Windows, `.deb` for Debian-based Linux, `.dmg` for macOS):

```bash
npm run make
```
The installers will be found in the `out/make` directory.

## 🤝 Contributing

We welcome contributions to `app-admin-tubos`! Please consider the following guidelines:

### Development Setup for Contributors
1.  Fork the repository.
2.  Clone your forked repository: `git clone https://github.com/YOUR_USERNAME/app-admin-tubos.git`
3.  Install dependencies: `npm install`
4.  Make your changes.
5.  Ensure your code passes linting: `npm run lint`
6.  Commit your changes following conventional commit messages.
7.  Push to your fork and submit a pull request.

## 📄 License

This project is licensed under the [LICENSE_NAME](LICENSE) - see the [LICENSE](LICENSE) file for details. <!-- TODO: Specify actual license, e.g., MIT, Apache 2.0 -->

## 🙏 Acknowledgments

-   Built with [Electron](https://www.electronjs.org/) for desktop capabilities.
-   Powered by [React](https://react.dev/) for the user interface.
-   Managed with [Electron Forge](https://www.electronforge.io/) for development and packaging.
-   Code quality ensured by [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/).

## 📞 Support & Contact

-   📧 Email: [contact@example.com] <!-- TODO: Add a specific contact email -->
-   🐛 Issues: [GitHub Issues](https://github.com/yepemar99/app-admin-tubos/issues)
-   💬 Discussions: [GitHub Discussions](https://github.com/yepemar99/app-admin-tubos/discussions) <!-- TODO: Enable GitHub Discussions if desired -->

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [yepemar99]

</div>
```

