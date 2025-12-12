# 🎮 EXCOFF E7 Builder & Guides

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A community-driven platform for Epic Seven players to discover, create, and share character builds and game guides.

## 🌟 Features

- **Hero Wiki** - Complete database with stats, skills, and multipliers
- **Community Builds** - Create and share builds with recommended stats, sets, and artifacts
- **Game Guides** - Guides for PVE, RTA, Arena, Guild War, and more
- **Multi-language Support** - English, Spanish, Korean, Japanese, Chinese, Portuguese
- **OAuth Login** - Login with Google or Discord

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18, TailwindCSS |
| Backend | Laravel 11, PHP 8.2 |
| Database | MySQL/MariaDB |
| Auth | Laravel Sanctum, Socialite |

## 📦 Installation

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- MySQL/MariaDB

### Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Backend Setup
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## 🤝 Credits & Attributions

This project uses data and resources from:

### Data Sources
- **[Fribbels Epic 7 Optimizer](https://github.com/fribbels/Fribbels-Epic-7-Optimizer)** - Hero stats, skills, and artifact data
- **[EpicSevenDB](https://epicsevendb.com/)** - Additional hero information

### Game Assets
- **Epic Seven** - All game images, characters, and assets are property of **Smilegate & Super Creative**
- This project is NOT affiliated with Smilegate or Super Creative

### Open Source Libraries
- [Next.js](https://nextjs.org/) - React Framework
- [Laravel](https://laravel.com/) - PHP Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [TanStack Query](https://tanstack.com/query/) - Data Fetching
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

- This is a fan-made project and is NOT affiliated with Smilegate or Super Creative
- Epic Seven and all related content are property of their respective owners
- All game assets used are property of Smilegate RPG & Super Creative
- This project is for educational and community purposes only

## 👨‍💻 Author

- **EXCOFFee** - [GitHub](https://github.com/EXCOFFee)

---

Made with ❤️ for the Epic Seven community
