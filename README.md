# RoadTrack - Road Construction Tracker (Frontend Demo)

Credosis Internship Phase 02, Frontend track.

## Problem
Road construction crews in Bangladesh are tracked on paper. Headcounts drift, wasted material goes unexplained, rest breaks get skipped, and older or sick workers are paid the same as everyone else. Many workers cannot read, so a normal app would shut them out.

## Designed for people who cannot read
- **Road-sign pictograms.** Green plates for information, blue circles for "do this", red triangles for problems. Shape and colour carry the meaning, words are optional.
- **People as signs.** Every worker is shown as their work icon (shovel, brick wall, roller) on their own colour. Tap a person and the phone says their name.
- **Voice.** Every key card has a speaker button that reads it aloud in Bangla or English. Break reminders speak on their own. Workers can record a voice message instead of writing a complaint.
- **No typing.** Numbers use big minus and plus buttons. Tap the number to type if you prefer.
- **Bangla and English.** One tap switches the language, including Bangla digits. Bangla text uses Kalpurush; English uses Tiro Bangla for headings and Anek for everything else.
- **Plain switches.** Choices are shown by coloured text, not filled pill buttons.
- **Phone and laptop.** Big bottom tabs and one column on phones; top tabs and two columns on laptops.

## Features
- **Choose a road.** Four demo roads in Gazipur, Dhaka, Savar and Rangpur. Each has its own shifts, machines and progress. Work places are named (Board Bazar, Mirpur 11 Bus Stand), never coordinates.
- **Core: shift lifecycle (Supervisor).** Pick the crew by tapping them, issue materials, choose the place, enter how many km of road are done (the app works out the percent), then a live shift timer. Finish in four steps: recount, materials used and wasted, progress and problems, pay list. Pay is calculated automatically: elders (50+) get +15%, sick or hurt workers get +20%, and anyone who left early gets -50%.
- **Rest and snack reminders** with spoken alerts, phone vibration and notifications. A fast demo timer is included.
- **Head office dashboard.** A photo of the road with its progress strip right under it, charts, pay approval, complaints with voice playback, raise approvals and full shift records with CSV export.
- **Add roads.** Head office can add a new road (names in English and Bangla, start and end, length, work places, optional photo) and remove roads it added.
- **Password reset.** Supervisor and head office can reset a forgotten password with a 6-digit code (shown on screen in this demo, since there is no SMS service), a 5-minute expiry and 3 tries.
- **Equipment tracking.** Every roller, truck, mixer and generator on the road: working, idle or broken, fuel level, hours run today and when the next service is due.
- **Worker phone view.** My money, my health (workers tell the supervisor if they are sick or hurt, by tapping or by voice), ask for a raise, make a complaint (by voice or text, optionally anonymous).
- **Ask Apa.** A drawn Bangladeshi site helper on every screen. Her speech bubble says what to do now and when (break due, a sick worker, a broken machine, time to finish). Tap a question, speak (Bangla or English) or type, and she answers out loud from the app's own data. Turn on "Call me by saying Apa" to open her hands-free.

## Architecture (clean, layered)
```
src/app       routing, shell, role guard
src/pages     thin pages that only compose features
src/features  self-contained bricks: road, session, workforce, shift, reminders, payroll, complaints, raise-requests, equipment, health, dashboard, assistant
src/shared    i18n, voice, UI kit (pictograms, steppers, wizard, road strip), utils
src/data      demo seed data
src/core      pure business rules and types: pay, breaks, health, roads, materials, complaints, accounts
```
Dependencies point inwards only: `app -> pages -> features -> shared / data -> core`. `core` imports nothing outside itself, not even React.
Each feature exposes its public API through `index.ts`; other code may not import its inner files.
ESLint enforces these boundaries and a 160-line limit per file (`npm run lint`).

## Privacy
A complaint sent with "Hide my name" is stored without the sender. Only the sender's own device keeps a receipt so they can follow it.

## Run
```
npm install
npm run dev
npm test        # unit tests for the core rules (Vitest)
npm run check   # type check, lint and tests together
```
