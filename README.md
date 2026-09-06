# jenita
jenita — a personal AI assistant and day planner that doesn't just notify you, it actually reaches you. Instead of a silent push notification you can swipe away without seeing, this assistant reminds you about your scheduled tasks through phone call, SMS, and email — whichever channel actually gets your attention.

# AI Day Planner & Reminder Assistant

A personal AI assistant that doesn't just notify you about your schedule — it reaches you. Instead of a silent push notification you can swipe away without reading, this assistant follows up through **phone call, SMS, and email**, escalating until you actually acknowledge what's due.

## Why

Most reminder apps assume you'll see the notification. This one doesn't. If a text goes unacknowledged, it escalates — email, then an actual phone call reading out what you're supposed to be doing right now.

## How it works

You schedule tasks and events for your day. A background scheduler tracks what's coming due. When a reminder fires, a Notification Router picks the right channel based on urgency and your preferences. Voice reminders use text-to-speech and accept simple responses (e.g. "press 1 for done, 2 to snooze") so the system knows whether the reminder actually landed — and if it didn't, the Escalation Agent bumps it up the channel ladder automatically.

A small set of AI agents drive the personalization:
- **Planning Agent** — turns loosely described tasks ("call the dentist sometime this week") into structured, scheduled items
- **Priority/Timing Agent** — learns how far in advance and how insistently to remind you, based on your past acknowledgment behavior
- **Notification Router** — decides which channel (call/SMS/email) fits a given reminder
- **Escalation Agent** — watches for unacknowledged reminders and decides when to escalate
- **Voice Call Agent** — delivers the spoken reminder and parses your response (snooze/done/reschedule)
- **Daily Briefing Agent** — composes a short morning summary of the day ahead

## Core Features

- Task and schedule management with recurrence support
- Multi-channel reminders: voice call, SMS, and email
- Automatic escalation when reminders go unacknowledged
- Quiet hours, with explicit override for tasks marked urgent
- Daily briefing summarizing the day's schedule
- Full reminder and call-transcript history, used to tune future timing

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, PostgreSQL, SQLAlchemy (async), Alembic |
| Scheduler | Celery + Redis (or APScheduler), run as an independent process |
| Communications | Africa's Talking — Voice + SMS; transactional email API (SendGrid/Postmark/Resend) |
| AI | Gemini API (Gemini 2.5 Flash) |
| Frontend | Next.js |

## Architecture

```
┌───────────────────────┐        ┌───────────────────────────────────┐
│      FRONTEND          │        │             BACKEND                 │
│  Next.js                │◄──────►│   FastAPI REST API                 │
│  Calendar/task UI       │  HTTP  │   Auth · Tasks · Schedule · Prefs   │
└───────────────────────┘        └───────────────┬─────────────────────┘
                                                  │
                                     ┌────────────▼─────────────┐
                                     │   SCHEDULER (Celery/APS)   │
                                     │  checks upcoming reminders │
                                     └────────────┬─────────────┘
                                                  │
                     ┌───────────────┬────────────┴────────────┬───────────────┐
                     ▼               ▼                         ▼               ▼
              Planning Agent   Priority/Timing Agent    Notification Router   Escalation Agent
                                                                  │
                              ┌───────────────────────────────────┼───────────────────────┐
                              ▼                                   ▼                        ▼
                        Voice Call Agent                    SMS Sender                Email Sender
                        (Africa's Talking Voice)            (Africa's Talking SMS)    (SendGrid/Postmark/
                                                                                        Resend)
                              │
                              ▼
                     ┌────────────────────┐
                     │   PostgreSQL         │
                     │  Tasks · Schedule    │
                     │  Contact prefs       │
                     │  Reminder history    │
                     │  Call transcripts     │
                     └────────────────────┘
```

## Project Structure

```
planner-backend/
├── app/
│   ├── main.py                # FastAPI entrypoint
│   ├── api/v1/
│   │   ├── tasks.py
│   │   ├── schedule.py
│   │   ├── preferences.py
│   │   └── reminders.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py        # JWT/OAuth
│   ├── models/                # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── crud/                   # DB access functions per domain
│   ├── notify/
│   │   ├── voice.py            # Africa's Talking Voice
│   │   ├── sms.py               # Africa's Talking SMS
│   │   └── email.py             # SendGrid/Postmark/Resend
│   ├── agents/                 # LLM wrappers per agent role
│   └── db/
│       ├── session.py
│       └── migrations/         # Alembic
├── scheduler/
│   └── worker.py               # separate process
└── pyproject.toml

planner-frontend/
├── app/
├── features/
├── services/
└── components/
```

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis (if using Celery)
- Node.js 18+ (frontend)
- An Africa's Talking account and API credentials
- A transactional email provider account (SendGrid/Postmark/Resend)
- A Gemini API key

### Backend setup
```bash
git clone <repo-url>
cd planner-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in: DATABASE_URL, AT_API_KEY, AT_USERNAME, EMAIL_API_KEY, GEMINI_API_KEY

alembic upgrade head
uvicorn app.main:app --reload
```

> **Tip:** Start with Africa's Talking's sandbox app (free, no charges) to build and test the full voice/SMS integration end-to-end before switching to a live app and real credentials.

### Scheduler (separate process)
```bash
# Celery
celery -A scheduler.worker worker --beat --loglevel=info

# or APScheduler
python scheduler/worker.py
```

### Frontend setup
```bash
cd planner-frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AT_API_KEY` | Africa's Talking API key |
| `AT_USERNAME` | Africa's Talking application username |
| `AT_SENDER_ID` | Registered sender ID / shortcode for SMS and voice |
| `EMAIL_API_KEY` | Email provider API key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `REDIS_URL` | Redis connection string (if using Celery) |
| `JWT_SECRET` | Secret for signing auth tokens |

## Roadmap

1. **Foundation** — auth, task CRUD, basic agenda UI (no AI, no calls yet)
2. **Scheduled SMS + email reminders** — fixed-offset reminders, no AI
3. **Voice calls (one-way)** — TTS reminders with button-press acknowledgment
4. **Escalation logic** — rule-based SMS → email → call ladder
5. **Planning Agent** — natural-language task creation
6. **Priority/Timing + Daily Briefing Agents** — personalized timing, morning summary
7. **Two-way Voice Agent** — real conversational snooze/reschedule via speech-to-text

## Cost Notes

Africa's Talking runs on a prepaid wallet, pay-as-you-go model — there's no free tier for real SMS/voice traffic, but it does provide a **sandbox environment** for building and testing the full integration without spending real money before going live. Rates are competitive for Kenyan/African numbers specifically (better local deliverability than Twilio or MessageBird tend to offer here), though voice pricing runs higher than SMS on this platform, worth factoring in since the escalation ladder ends in a phone call. Real ongoing cost at personal-assistant volume (a handful of reminders a day, one recipient) should still land at just a few dollars a month once you move off the sandbox. The Gemini API free tier is generous enough for a single-user assistant's agent calls at this scale.

## License

MIT
