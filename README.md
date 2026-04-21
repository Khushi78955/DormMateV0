# 🏠 DormMate — Smart Shared Living Platform

> A modern React + Firebase platform for hostel students, roommates, PG residents, and flatmates.

## 🎯 Problem Statement
Students living in shared spaces face daily friction — expense disputes, missed chores, uncoordinated shopping, and communication breakdowns. DormMate centralizes all of this into one beautiful, real-time platform.

## ✨ Features
- 💰 Expense Splitter with auto settlement calculation
- 🧹 Chore Manager with leaderboards & badges
- 🛒 Shared Shopping List with categories
- 🍕 Food Order Coordination & Polling
- 🔧 Maintenance Request Tracker with kanban view
- 🔇 Noise Complaint System with quiet hours
- 📍 Roommate Attendance Status (real-time)
- 🎭 Room Mood Selector
- 📅 Shared Room Calendar
- 📊 Monthly Analytics & Spending Charts

## 🛠 Tech Stack
| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite               |
| Styling   | Tailwind CSS (glassmorphism)  |
| Animation | Framer Motion                 |
| Charts    | Recharts                      |
| Backend   | Firebase (Auth + Firestore)   |
| Routing   | React Router v6               |
| State     | Context API + useState/useMemo |
| UI Extras | React Hot Toast, React Icons  |

## 🚀 Local Setup
1. Clone: `git clone <repo-url> && cd dormmate`
2. Install: `npm install`
3. Configure: Copy `.env.example` → `.env`, fill in Firebase credentials
4. Run: `npm run dev`

## 🔐 Firebase Setup
1. Create project: [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Email/Password Authentication
3. Create Firestore database (production mode, asia-south1)
4. Register Web App → copy config to `.env`
5. Apply security rules from `/firebase.rules`

## 🌐 Live Demo
deployment link : https://dorm-mate-v0.vercel.app/