# TransitHub — Mobile App

Ghana's intercity bus ticketing app. Search routes, pick seats, pay, and travel with a QR ticket that conductors scan at boarding.

Built with **React Native (Expo)** and **TypeScript**.

## Features

- 🔎 Search intercity buses by route, date, and class (Regular / Executive)
- 💺 Visual seat picker showing booked vs. available seats
- 🎫 QR-code tickets — scanned by conductors to mark a trip complete
- 🔔 Push notifications and trip reminders
- ⭐ Saved routes / favourites for one-tap re-booking
- 🕔 Recent searches
- 🌗 Automatic dark / light mode (follows the phone, with manual override)
- 👤 Profile with photo, trip stats, and ticket history

## Tech stack

- **React Native + Expo** (Expo Router for navigation)
- **TypeScript**
- **AsyncStorage** for local persistence
- **expo-camera** for QR scanning
- **expo-notifications** for reminders
- Talks to the [TransitHub backend](https://github.com/transithubgroup74/transithub-backend) (Spring Boot on Railway)

## Getting started

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go**, or install a build.

## Building

```bash
# Android APK (shareable, installs directly)
eas build --profile preview --platform android

# Push an over-the-air update (no rebuild needed for JS/UI changes)
eas update --branch main --message "your message"
```

## Project structure

```
app/            Screens (Expo Router file-based routing)
  (auth)/       Splash, welcome, login, register
  (tabs)/       Home, tickets, notifications, profile
  screens/      Search results, seats, payment, ticket detail, conductor scan
components/     Shared UI
context/        Theme provider
services/       API client (axios)
utils/          Notifications, saved routes, recent searches
constants/      Theme colours & fonts
assets/         Icons & splash
```

---

Part of the **TransitHub** project: this app · [backend](https://github.com/transithubgroup74/transithub-backend) · [admin dashboard](https://github.com/transithubgroup74/transithub-admin-dashboard).
