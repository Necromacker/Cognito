# 🧠 Cognito

> **A gentle cognitive care, memory engagement, and clinical tracking platform for people living with dementia, their caretakers, and their doctors.**

---

## 🌟 Live Development Server
The application is running locally:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Username / Email | Password / PIN | Description |
|---|---|---|---|
| **Patient** | *Select Tile or enter PIN* | **`1234`** | Ramesh Sharma (74 yrs, Early-stage) |
| **Caretaker** | `caretaker@demo.com` | `demo1234` | Priya Sharma (Daughter & Primary Caregiver) |
| **Doctor** | `doctor@demo.com` | `demo1234` | Dr. Anjali Desai (Verified Clinician) |
| **Admin** | `admin@demo.com` | `demo1234` | System Administrator |

> 💡 **Quick Login:** On the login page, you can click any of the **Quick Demo Access** chips to test each role with a single click.

---

## 🎨 UI & Design Principles
- **Design Tokens:** Extracted from the Pixel Picnic dark/hot-pink/gold/green aesthetic, refined with gentle high-contrast dementia-friendly tokens in [variables.css](file:///Users/krishnagorde/Documents/GitHub/Cognito/client/src/styles/variables.css).
- **Strict Plain CSS:** Separate `.css` file for every single page and component with BEM naming. No Tailwind, no Bootstrap.
- **GSAP Calming Motion:** Slow, soothing transitions (`power2.out`, 0.4s to 0.8s), star celebrations, and progress bar fills. Fully respects `prefers-reduced-motion`.
- **Gentle Encouragement Rules:**
  - Never displays red, buzzers, or the word "wrong".
  - Always uses compassionate feedback (*"Nice try! Let's look together..."*).
  - Minimum 56px touch targets (72px+ on patient screens).
  - Maximum 3 choices per screen on patient views.
  - Multi-lingual Text-to-Speech (Web Speech API) reads questions aloud.

---

## 🕹️ All 14 Cognitive Engagement Games

### Personalised Games (Powered by Caretaker Uploads)
1. **Who is this?** — Shows a loved one's photo with 2 to 3 name choices.
2. **Whose voice is this?** — Plays a recorded voice clip to identify who is speaking.
3. **Name to face** — Read a family member's name and pick the correct photo.
4. **Relationship match** — Connect the person with their relationship (*Daughter, Wife, Son, Friend*).
5. **Place recognition** — Recognise ancestral homes, gardens, and holiday locations.
6. **Life timeline** — Re-order milestone events in chronological sequence.
7. **Familiar songs** — Listen to a nostalgic classic melody and pick the title.

### Mind & Comfort Games
8. **Memory pairs** — Soothing 3-pair (6 cards) memory match with emoji symbols.
9. **Object naming** — Name everyday household items (teacup, spectacles, watch).
10. **Simple sorting** — Categorise objects (fruit vs vegetable, warm vs cold).
11. **Colour and shape matching** — Match friendly geometric shapes and cheerful colours.
12. **Orientation questions** — Gentle questions about the time of day, day of week, and seasons.
13. **Gentle jigsaw** — 4-piece soothing puzzle generated from family photos.
14. **Daily routine sequencing** — Sequence peaceful steps like making chai or morning teeth brushing.

---

## 🌐 Multi-Language Support
- **English** (en)
- **हिन्दी (Hindi)** (hi)
- **मराठी (Marathi)** (mr)
Integrated reactive switcher on top of the navigation bar with speech synthesis matching the selected language.

---

## 🔒 Privacy, Safety & Local Storage
- **100% Local Storage:** Runs completely offline without cloud dependencies.
- **SQLite Database:** Local persistent database stored at `./data/app.db`.
- **Media Uploads:** Stored locally in `./data/uploads/<patient_id>/`.
- **Backup & Restore:** Full 1-click ZIP export and restore built into **Settings**.
- **Clinical Consent:** Doctors can only see patients whose caretakers have explicitly granted active consent. All views are logged in `audit_logs`.
- **Disclaimer:** *"This app supports cognitive engagement and tracking. It is not a diagnostic tool."*

---

## 🚀 Setup & Commands (Windows / Mac)

```bash
# 1. Install root dependencies
npm install

# 2. Seed demo users, family content, and sample clinical logs
npm run seed

# 3. Start both frontend and backend concurrently
npm run dev
```
