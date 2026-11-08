# RoadTrack

**Road construction tracker for Bangladesh, built so workers who cannot read can still use it.**
Frontend demo for the Credosis Internship, Phase 02.

**Live demo:** https://roadtrack-tan.vercel.app/

---

## Contents
1. [Demo sign-in (phone, email, password)](#1-demo-sign-in)
2. [How to try it in 2 minutes](#2-how-to-try-it-in-2-minutes)
3. [The problem](#3-the-problem)
4. [Made for people who cannot read](#4-made-for-people-who-cannot-read)
5. [Features](#5-features)
6. [Run it on your computer](#6-run-it-on-your-computer)
7. [Code structure](#7-code-structure)
8. [Privacy](#8-privacy)

---

## 1. Demo sign-in

Pick a role on the home page, then use these details.

### Supervisor

| | |
| --- | --- |
| **Name** | Engr. Tanvir Rahman |
| **Phone** | `01711000100` |
| **Password** | `Tanvir@2026` |
| **Google / Apple email** | `tanvir.rahman@roadtrack.demo` |

### Head office

| | |
| --- | --- |
| **Phone** | `01711000200` |
| **Password** | `Office@2026` |
| **Google / Apple email** | `office@roadtrack.demo` |

### Worker

No password. Tap **Worker**, then tap your own name and photo.

> **Good to know**
> - Google and Apple sign-in are simulated: type the email above instead of a real Google or Apple login.
> - A changed password or a new contractor sign-up is saved only in your browser.
> - **Start again** in the top bar resets everything to the starting data.

---

## 2. How to try it in 2 minutes

1. **Home page:** choose a road, then choose **Supervisor**.
2. **Supervisor:** sign in, start a shift (pick the crew, give materials, set the place), then finish it.
3. **Worker:** go home, choose **Worker**, tap a name and look at money, health and complaints.
4. **Head office:** sign in to see progress, approve pay, read complaints and approve new contractors.
5. **New contractor:** on the Supervisor sign-in, press **Register**, then approve it from Head office → **Contractors**.

---

## 3. The problem

Road crews in Bangladesh are tracked on paper. Headcounts drift, wasted material goes unexplained, rest breaks get skipped, and older or sick workers are paid the same as everyone else. Many workers cannot read, so a normal app would shut them out.

---

## 4. Made for people who cannot read

| Idea | What it means |
| --- | --- |
| **Road-sign pictures** | Green plates = information, blue circles = do this, red triangles = problem. Shape and colour carry the meaning. |
| **Faces, not names** | Every worker is shown by their photo. Tap a person and the phone says their name. |
| **Voice** | Speaker buttons read cards aloud in Bangla or English. Break reminders speak on their own. Complaints can be recorded by voice. |
| **No typing** | Big minus and plus buttons for numbers. |
| **Bangla and English** | One tap switches language, including Bangla digits. Fonts: Kalpurush for Bangla, Times New Roman for numbers. |
| **Phone and laptop** | Big bottom tabs on phones, top tabs and two columns on laptops. |

---

## 5. Features

### Supervisor
- **Shifts from start to finish:** pick the crew, issue materials, choose the place, enter km done (the app works out the percent), live shift timer.
- **Finish in four steps:** recount, materials used and wasted, progress and problems, pay list.
- **Automatic pay:** elders (50+) get +15%, sick or hurt workers +20%, leaving early −50%.
- **Rest and snack reminders** with spoken alerts and vibration (a fast demo timer is included).
- **Machines:** working, idle or broken; fuel; hours today; next service; cost of each repair.

### Worker (phone view)
- My money, my health (tell the supervisor you are sick or hurt), ask for a raise, make a complaint (voice or text, can hide your name).

### Head office
- Road photo with a progress strip, charts, pay approval, complaints with voice playback, raise approvals, shift records with CSV export.
- **Add or remove roads** (English and Bangla names, start and end, length, work places, optional photo).
- **Approve contractors:** new sign-ups wait under **Contractors** until approved or rejected.

### Sign-in
- **Phone and password** for supervisor and head office.
- **Continue with Google or Apple** (simulated). A new email on the Supervisor sign-in starts contractor registration.
- **Forgot password:** 6-digit code (shown on screen, since there is no SMS), expires in 5 minutes, 3 tries.

### Ask Apa
A drawn site helper on every screen. She says what to do now (break due, sick worker, broken machine, time to finish) and answers questions out loud, by tap, voice or typing.

### Roads
Four demo roads in Gazipur, Dhaka, Savar and Rangpur. Each has its own shifts, machines and progress. Places are named (Board Bazar, Mirpur 10 Circle), never coordinates.

---

## 6. Run it on your computer

```bash
npm install
npm run dev      # start at http://localhost:5173
npm test         # unit tests (Vitest)
npm run check    # type check + lint + tests
```

---

## 7. Code structure
src/app routing, page shell, role guard
src/pages thin pages that only combine features
src/features road, session, workforce, shift, reminders, payroll, complaints,
raise-requests, equipment, health, dashboard, assistant
src/shared language, voice, UI kit, helpers
src/data demo data
src/core pure business rules (pay, breaks, health, roads, machines, accounts ...)

- Imports only point inward: `app → pages → features → shared / data → core`.
- `core` is plain TypeScript with no React.
- Each feature is used only through its `index.ts`.
- ESLint enforces these rules and a 160-line limit per file.

---

## 8. Privacy

A complaint sent with **Hide my name** is stored without the sender. Only the sender's own phone keeps a receipt so they can follow it.
