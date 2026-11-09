# 🌿 Atmo-Care (AirWise)

> A gamified environmental wellness app built with React Native & Expo

Atmo-Care is a beautifully crafted mobile application that helps users stay aware of their environment while building healthy, eco-friendly habits.  
It combines real-time AQI insights, smart recommendations, and gamification to create an engaging daily experience.

---

## 📸 Screenshots

<p align="center">
  <img src="assets/auth.jpeg" width="250" />
  <img src="assets/home.jpeg" width="250" />
  <img src="assets/settings.jpeg" width="250" />
</p>

<p align="center">
  <img src="assets/activities.jpeg" width="250" />
  <img src="assets/activities_logs.jpeg" width="250" />
  <img src="assets/plant_wiki.jpeg" width="250" />
</p>

## ✨ Features

### 🌍 Real-Time AQI Monitoring

- Live Air Quality Index (AQI) with PM2.5 and PM10 levels
- Location-based data from the OpenWeather Air Pollution API, proxied through our server so the API key never ships in the app

### 🧠 Smart Recommendations

- Suggests activities based on AQI + time of day
- Examples:
  - 🌅 Morning Jog (good AQI)
  - 🧘 Indoor Yoga (poor AQI)

### 🎮 Gamification, Streaks & Leaderboard

- Earn Eco Points for activities and plant care (💧 water, ☀️ sun, 🧹 clean)
- Points for each activity count once per day; logging it again is recorded but earns nothing
- Daily streaks, calculated in your own timezone
- Green levels: Seedling → Sprout → Sapling → Grove → Sage
- Weekly and all-time community leaderboard (opt out in Settings)

### 🔔 Push Notifications

- AQI alerts when the air near you turns unhealthy (at most every 6 hours, never between 10pm and 7am)
- Plant reminders at 9am if you haven't logged a watering in two days

### 🌱 Plant Wiki

- Air-purifying plant library with care instructions
- Favorites saved to your account

### 🔐 Authentication

- Email + password with email verification and password reset
- Google & Apple sign-in
- Powered by Clerk

---

## 🛠 Tech Stack

| Layer    | Technology                                                            |
| -------- | --------------------------------------------------------------------- |
| App      | React Native 0.86 + Expo (SDK 57), Expo Router                        |
| Data     | TanStack Query                                                        |
| Auth     | Clerk (`@clerk/expo` in the app, `@clerk/express` on the server)      |
| API      | Node + Express 5 + TypeScript                                         |
| Database | PostgreSQL + Drizzle ORM                                              |
| Push     | `expo-notifications` + Expo Push Service (`expo-server-sdk`)          |
| AQI data | OpenWeather Air Pollution API                                         |
| Tests    | Vitest + Supertest against a real Postgres                            |

---

## 📂 Project Structure

```bash
atmo-care/
├── client/                  # Expo app
│   └── src/
│       ├── app/             # Expo Router screens: (auth), (tabs), profile, wiki
│       │   └── components/  # UI components (AQI card, leaderboard, sheets…)
│       ├── api/             # HTTP client, API types, React Query hooks
│       ├── hooks/           # useAirQuality, useAccountSync, push notifications…
│       ├── constants/       # Theme, interaction config
│       ├── types/
│       └── utils/           # Recommendations, plant wiki data, helpers
│
└── server/                  # Express API
    ├── src/
    │   ├── routes/          # /me, /logs, /favorites, /leaderboard, /aqi
    │   ├── jobs/            # AQI alerts + plant reminders
    │   ├── services/        # OpenWeather proxy, Expo push, stats
    │   ├── db/              # Drizzle schema + migrations runner
    │   └── catalog.ts       # Activities, points and green levels
    ├── drizzle/             # SQL migrations
    └── test/
```

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 20.19.4+
- Docker (for the local Postgres database)
- Expo Go for SDK 57 on your phone, or an Android/iOS emulator
- A [Clerk](https://clerk.com) application and an [OpenWeather](https://openweathermap.org/api) API key

### 2. Start the server

```bash
cd server
npm install
cp .env.example .env     # then fill in the keys (see below)
npm run db:up            # starts Postgres in Docker on port 5433
npm run dev              # applies migrations and starts the API on :4000
```

`server/.env`:

```env
DATABASE_URL=postgres://atmo:atmo@localhost:5433/atmocare
CLERK_PUBLISHABLE_KEY=pk_test_...   # same key the app uses
CLERK_SECRET_KEY=sk_test_...        # Clerk dashboard → API Keys
OPENWEATHER_API_KEY=...
JOBS_ENABLED=true                   # run the notification jobs in-process
```

Run the tests with `npm test`. They use a separate `atmocare_test` database in the same container.

### 3. Start the app

```bash
cd client
npm install
cp .env.example .env     # add your Clerk publishable key
npm start
```

- Press `a` → Android emulator
- Press `i` → iOS simulator
- Scan QR code → Expo Go on device

In development the app finds the API on the computer running Metro, port 4000. Your phone and computer need to be on the same Wi-Fi. For deployed builds, set `EXPO_PUBLIC_API_URL` in `client/.env`.

### 4. Push notifications (optional)

1. Run `npx eas init` in `client/` once. This adds the EAS project ID that Expo push tokens need.
2. Use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`npx expo run:android` / `run:ios`). Remote push doesn't work in Expo Go on Android.
3. Push only works on a physical device.

---

## 🧩 How It Works

- **Auth:** the app sends its Clerk session token as a `Bearer` header. The server verifies it and creates a `users` row on first contact.
- **Points:** the server owns the activity catalog (`server/src/catalog.ts`). The app sends only *which* activity was done, so it can't award itself points.
- **Streaks:** each log stores the calendar day in the user's timezone. A streak is the number of consecutive days with at least one log, ending today or yesterday.
- **Notifications:** a scheduler runs every 15 minutes. Its jobs can also run once with `npm run jobs:once`, for example from a cron job on your host (set `JOBS_ENABLED=false` on the API in that case).
- **Privacy:** the server stores your location only while AQI alerts are on, rounded to about 1 km. The leaderboard shows just your first name and last initial.

### API

All routes are under `/api` and need a Clerk token.

| Method         | Route                       | Purpose                                   |
| -------------- | --------------------------- | ----------------------------------------- |
| GET / PATCH    | `/me`                       | Profile and settings                      |
| GET            | `/me/stats`                 | Points, streak, level, today's plant care |
| PUT / DELETE   | `/me/push-token`            | Register / remove this device for push    |
| GET / POST     | `/logs`                     | Activity history / log an activity        |
| GET            | `/favorites`                | Saved plants                              |
| PUT / DELETE   | `/favorites/:plantKey`      | Save / unsave a plant                     |
| GET            | `/leaderboard?period=week`  | Top 20 + your rank (`week` or `all`)      |
| GET            | `/aqi?lat=…&lon=…`          | Current air quality (cached ~10 min)      |

---

## 🔮 Roadmap

- [x] Backend integration for persistent data
- [x] Push notifications for AQI alerts and plant care reminders
- [x] Community leaderboard
- [ ] Deploy the API (e.g. Render web service + Postgres)
- [ ] Community messages

---

## 👤 Author

**Chinmay Dubey** — [@ChinmayDubey231](https://github.com/ChinmayDubey231)
