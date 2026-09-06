# AI Day Planner & Reminder Assistant

Jenita personal AI assistant that doesn't just notify you about your schedule — it talks to you. Instead of a silent push notification you can swipe away without reading, this assistant speaks your reminder out loud, keeps repeating it until you verbally confirm, and lets you talk back to schedule or adjust events on the spot. Email backs it up for anything you want in writing.

## Why

Most reminder apps assume you'll see the notification. This one doesn't. When a reminder is due, it's spoken aloud and repeated — with increasing urgency — until you actually acknowledge it out loud. No phone calls, no SMS, no third-party telephony provider: the voice interaction happens directly through the device the app runs on.

## How it works

You schedule tasks and events for your day — either through the UI or just by talking to the assistant. A background scheduler tracks what's coming due. When a reminder fires, the assistant speaks it aloud via the Gemini Live API. If you don't respond, it repeats the reminder — looping with escalating urgency — until you say something that counts as acknowledgment ("done", "got it", "snooze 10 minutes"). At the same time, or as a backup, an email is sent summarizing what's due.

Because the voice interaction is a real two-way conversation (not just text-to-speech), you can also say things like "actually push that to 3pm" or "add a call with Sarah tomorrow at 9" and the assistant updates your schedule directly — no separate form to fill in.

A small set of AI agents drive the experience:
- **Planning Agent** — turns loosely described tasks, spoken or typed, into structured, scheduled items
- **Priority/Timing Agent** — learns how far in advance and how insistently to remind you, based on how quickly you tend to confirm
- **Voice Reminder Agent** (Gemini Live) — speaks the reminder aloud, listens for your response, and repeats/escalates until confirmed
- **Conversational Scheduling Agent** (Gemini Live, function calling) — handles you talking back mid-reminder to create, edit, or reschedule events
- **Daily Briefing Agent** — composes a short spoken or written summary of the day ahead
- **Email Agent** — sends a written reminder/summary as backup or record

## Core Features

- Task and schedule management with recurrence support
- Spoken reminders via on-device voice (Gemini Live), repeated until verbally confirmed
- Two-way voice: talk back to schedule, reschedule, or cancel events mid-conversation
- Email reminders/summaries as a written backup channel
- Quiet hours, with explicit override for tasks marked urgent
- Daily briefing summarizing the day's schedule
- Full reminder and conversation history, used to tune future timing

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, PostgreSQL, SQLAlchemy (async), Alembic |
| Scheduler | Celery + Redis (or APScheduler), run as an independent process |
| Voice | Gemini Live API (native audio) — real-time speech in/out, function calling |
| Email | Transactional email API (SendGrid/Postmark/Resend) |
| AI | Gemini API (Live for voice, Flash for text/reasoning agents) |
| Frontend | Next.js — hosts mic/speaker access and the Live session |

## Architecture

```
┌───────────────────────────┐        ┌───────────────────────────────────┐
│      FRONTEND (Next.js)     │        │             BACKEND                 │
│  Calendar/task UI            │◄──────►│   FastAPI REST API                 │
│  Mic + speaker (Live session)│  HTTP  │   Auth · Tasks · Schedule · Prefs   │
└─────────────┬───────────────┘        └───────────────┬─────────────────────┘
              │ WebSocket (audio in/out)                 │
              ▼                                          │
   ┌─────────────────────────┐            ┌────────────▼─────────────┐
   │   Gemini Live API         │            │   SCHEDULER (Celery/APS)   │
   │  Voice Reminder Agent     │◄──────────►│  checks upcoming reminders │
   │  Conversational Scheduling│  function  └────────────┬─────────────┘
   │  Agent (function calling) │  calls                  │
   └─────────────────────────┘             ┌─────────────┴─────────────┐
                                            ▼                           ▼
                                   Planning Agent /            Email Agent
                                   Priority-Timing Agent        (SendGrid/Postmark/
                                                                 Resend)
                                                       │
                                                       ▼
                                            ┌────────────────────┐
                                            │   PostgreSQL         │
                                            │  Tasks · Schedule    │
                                            │  Preferences          │
                                            │  Reminder & voice     │
                                            │  confirmation history │
                                            └────────────────────┘
```

The Voice Reminder Agent and Conversational Scheduling Agent both run through the same Gemini Live WebSocket session — one speaks the reminder and listens for confirmation, the other handles you talking back to change your schedule, using function calling to hit the FastAPI backend directly (create/update/cancel task).

## Project Structure

```
planner-backend/
├── app/
│   ├── main.py                # FastAPI entrypoint
│   ├── api/v1/
│   │   ├── tasks.py
│   │   ├── schedule.py
│   │   ├── preferences.py
│   │   ├── reminders.py
│   │   └── live_session.py    # mints ephemeral Gemini Live tokens for the client
│   ├── core/
│   │   ├── config.py
│   │   └── security.py        # JWT/OAuth
│   ├── models/                # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── crud/                   # DB access functions per domain
│   ├── notify/
│   │   └── email.py             # SendGrid/Postmark/Resend
│   ├── agents/                 # LLM wrappers per agent role (Planning, Priority, Daily Briefing)
│   ├── functions/              # function-calling handlers exposed to the Live session
│   │   ├── create_task.py
│   │   ├── update_task.py
│   │   └── confirm_reminder.py
│   └── db/
│       ├── session.py
│       └── migrations/         # Alembic
├── scheduler/
│   └── worker.py               # separate process
└── pyproject.toml

planner-frontend/
├── app/
├── features/
│   └── liveSession/            # mic capture, audio playback, WS connection state
├── services/
└── components/
```

## Voice Agent Design Notes

- **Use the Live API's native audio models** (e.g. `gemini-live-2.5-flash-preview-native-audio`) rather than chaining separate speech-to-text → text LLM → text-to-speech calls — the Live API streams audio both ways over one WebSocket, which is what makes the reminder feel like a real spoken interruption rather than a laggy voice memo.
- **Mint ephemeral session tokens server-side** (`api/v1/live_session.py`) rather than sending your Gemini API key to the browser — the frontend connects to the Live API using a short-lived token issued by your backend.
- **Use function calling, not free-form parsing**, for anything that changes your schedule. When you say "push that to 3pm," the Live session should call a defined `update_task` function with structured arguments, not just reply conversationally and hope your backend guesses what changed.
- **The confirmation loop needs a hard ceiling.** Repeating a reminder every few seconds forever if you don't respond is more disruptive than helpful — cap it (e.g. 3 repeats over 2 minutes) and fall back to the email reminder if voice confirmation never comes.
- **Voice activity detection (VAD) and barge-in matter here.** You should be able to interrupt the assistant mid-reminder to say "done" or "snooze" without waiting for it to finish talking — the Live API supports this natively.

## Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis (if using Celery)
- Node.js 18+ (frontend)
- A Google AI Studio account and Gemini API key (Live API access)
- A transactional email provider account (SendGrid/Postmark/Resend)

### Backend setup
```bash
git clone <repo-url>
cd planner-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in: DATABASE_URL, GEMINI_API_KEY, EMAIL_API_KEY

alembic upgrade head
uvicorn app.main:app --reload
```

> **Tip:** Build against the free Google AI Studio API key first. Note that free-tier usage may be used by Google to improve their models — switch to a paid key (billing enabled, same API) once you're comfortable, if that matters to you given this app listens to your schedule and voice.

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
| `GEMINI_API_KEY` | Google Gemini API key (used for Live voice sessions and text agents) |
| `EMAIL_API_KEY` | Email provider API key |
| `REDIS_URL` | Redis connection string (if using Celery) |
| `JWT_SECRET` | Secret for signing auth tokens |

## Roadmap

1. **Foundation** — auth, task CRUD, basic agenda UI (no AI, no voice yet)
2. **Scheduled email reminders** — fixed-offset reminders, no AI
3. **One-way spoken reminders** — Gemini Live reads the reminder aloud at the scheduled time, no listening yet
4. **Confirmation loop** — repeat/escalate the spoken reminder until the user verbally confirms
5. **Planning Agent** — natural-language task creation, typed or spoken
6. **Conversational Scheduling Agent** — talk back mid-reminder to reschedule/cancel/add events via function calling
7. **Priority/Timing + Daily Briefing Agents** — personalized timing, spoken morning summary

## Cost Notes

The Gemini Live API is accessible for free through Google AI Studio, which is enough for a single-user assistant's voice sessions at this scale — a handful of short reminder/confirmation exchanges a day is well within free-tier limits. The one thing to know: **free-tier requests may be used by Google to improve their models**, unlike paid-key traffic. Since this app is listening to your schedule and your voice, decide up front whether that's acceptable for your use case, or budget for a paid key (billing enabled, same API, usage-based pricing) if not. Email sending through SendGrid/Postmark/Resend is also effectively free at personal volume — these providers offer free tiers well above what a single person's daily reminders would use.

## License

MIT
