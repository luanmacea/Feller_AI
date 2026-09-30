<div align="center">

# 🤖 Feller AI

**AI-powered investment assistant — 🥇 1st place at FIAP NEXT 2025**

![Expo](https://img.shields.io/badge/Expo_SDK_52-000020?style=flat-square&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native_0.76-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)

</div>

Feller AI helps everyday investors understand where their money is and what to do next. The mobile app puts the portfolio, market highlights and personalized recommendations in one place, and a virtual assistant powered by an LLM (Llama) analyzes the portfolio and suggests adjustments that fit the investor's profile. The back-end (Java + Spring Boot, documented with OpenAPI) orchestrates the conversation between the app and the model.

## ✨ Features

- **Authentication** — sign up, sign in, sign out, persisted session, and password recovery with CPF verification
- **Investor profile** — questionnaire and timeline; the profile can be re-evaluated at any time and shapes every recommendation
- **Home dashboard** — portfolio summary, daily highlights and quick access to recommendations
- **Wallet** — interactive charts with period filters and a **scenario simulator**
- **Recommended wallet & investment details** — suggested allocations and the details of each asset
- **Virtual assistant** — chat with the AI about your portfolio and investments
- **Asset playlists** — build lists of assets, public or private, optionally open to collaboration
- **Light/dark theme**, a reusable global alert and centralized API error handling

## 🧱 Stack & architecture

| Layer | Choice |
| :--- | :--- |
| App | Expo SDK 52 · React Native 0.76 · Expo Router (file-based, `(auth)` and `(app)` route groups) |
| Language | TypeScript |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod |
| Networking | Axios with request/response interceptors (`src/services`) |
| UI | React Native Paper · RNE UI · Expo Linear Gradient |
| Quality | ESLint · `tsc --noEmit` · `yarn audit` · depcheck (`yarn validate`) |

```
src/
  app/(auth)/        sign-in, sign-up, reset-password
  app/(app)/         home, wallet, investments, investment details, investor profile,
                     recommended wallet, virtual assistant, playlists, profile, menu
  components/        reusable UI (Button, Card, Modal, GlobalAlert, InvestmentCard…)
  services/          API client and interceptors
  redux/             store and slices
```

## 🚀 Getting started

Requirements: Node.js 18+, Yarn, and Android Studio (SDK + emulator) for Android builds.

```bash
yarn            # install dependencies
yarn start      # Expo dev server
yarn dev        # native build on a connected Android device or emulator
yarn validate   # lint + audit + unused dependencies + typecheck
```

The project keeps the native `android/` and `ios/` folders; run `npx expo prebuild` to apply `app.json` changes to them.

## 👥 Team

- Davi Passanha de Sousa Guerra
- Cauã Gonçalves de Jesus
- **Luan Silveira Macea** — [@luanmacea](https://github.com/luanmacea)
- Rui Amorim Siqueira
- Luigi Ferrara Sinno

<sub>Built for FIAP's NEXT competition, where it won 1st place in 2025.</sub>
