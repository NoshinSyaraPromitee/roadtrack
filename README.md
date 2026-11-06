# RoadTrack - Road Construction Tracker (Frontend Demo)

Credosis Internship Phase 02, Frontend track.

## Problem
Road construction crews in Bangladesh are tracked on paper. Headcounts drift, wasted material goes unexplained, rest breaks get skipped, and older or sick workers are paid the same as everyone else. Many workers cannot read, so a normal app would shut them out.

## Designed for people who cannot read
- **Road-sign pictograms.** Green plates for information, blue circles for "do this", red triangles for problems. Shape and colour carry the meaning, words are optional.
- **People as signs.** Every worker is shown as their work icon (shovel, brick wall, roller) on their own colour. Tap a person and the phone says their name.
- **Voice.** Every key card has a speaker button that reads it aloud in Bangla or English. Break reminders speak on their own. Workers can record a voice message instead of writing a complaint.
- **No typing.** Numbers use big minus and plus buttons. Tap the number to type if you prefer.
- **Bangla and English.** One tap switches the language, including Bangla digits. Bangla text uses the Kalpurush font.
- **Phone and laptop.** Big bottom tabs and one column on phones; top tabs and two columns on laptops.

## Features
- **Core: shift lifecycle (Supervisor).** Pick the crew by tapping them, issue materials, mark the road progress, then a live shift timer. Finish in four steps: recount, materials used and wasted, progress and problems, pay list. Pay is calculated automatically: elders (50+) get +15%, sick or hurt workers get +20%, and anyone who left early gets -50%.
- **Rest and snack reminders** with spoken alerts, phone vibration and notifications. A fast demo timer is included.
- **Head office dashboard.** Road progress drawn as a road, charts, pay approval, complaints with voice playback, raise approvals and full shift records with CSV export.
- **Worker phone view.** My money, ask for a raise, make a complaint (by voice or text, optionally anonymous).
- **Ask Apa.** A drawn Bangladeshi site helper on every screen. Tap a question, speak (Bangla or English) or type, and she answers out loud from the app's own data: pay, breaks, raises, complaints, road progress and waste. No internet or AI service needed.

## Architecture (feature-based "lego")
```
src/app       routing, shell, role guard
src/pages     thin pages that only compose features
src/features  self-contained bricks: session, workforce, shift, reminders, payroll, complaints, raise-requests, dashboard, assistant
src/core      pure domain: types, catalog, pay rules, break policy, seed data
src/shared    i18n, voice, UI kit (pictograms, steppers, wizard, road strip), utils
```
Each feature exposes its public API through `index.ts`. Features talk to each other only through those files.

## Run
```
npm install
npm run dev
```
