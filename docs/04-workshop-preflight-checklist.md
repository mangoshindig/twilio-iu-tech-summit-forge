# Workshop Preflight Checklist

Use this checklist 24 to 48 hours before the workshop, then again 30 minutes before start time.

## 1) Host machine baseline

Run:

```bash
python3 --version
node --version
npm --version
ngrok version
```

Pass criteria:
- Python is 3.10 or later
- Node is 22.13.0 or later (required for TypeScript TAC runtime)
- ngrok is installed and can start a tunnel

## 2) Team env files prepared

For each team, prepare both:
- starter/python/.env
- starter/typescript/.env

Required values:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_API_KEY
- TWILIO_API_SECRET
- TWILIO_PHONE_NUMBER
- TWILIO_CONVERSATION_CONFIGURATION_ID
- TWILIO_VOICE_PUBLIC_DOMAIN
- OPENAI_API_KEY
- TEAM_ID
- WORKSHOP_SPEND_CAP_USD

Optional:
- TWILIO_MEMORY_PROFILE_TRAIT_GROUPS

## 3) Python track smoke test

From starter/python:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

In another terminal:

```bash
curl -s http://localhost:8000/health
```

Pass criteria:
- Server starts without configuration errors
- Health endpoint returns ok true

## 4) TypeScript track smoke test

From starter/typescript:

```bash
npm install
npm run typecheck
npm run dev
```

In another terminal:

```bash
curl -s http://localhost:8000/health
```

Pass criteria:
- Typecheck passes
- Server starts without TAC config errors
- Health endpoint returns ok true

## 5) Public tunnel and webhook wiring

For click-by-click Twilio Console steps, use:
- docs/05-twilio-console-setup.md

Start ngrok:

```bash
ngrok http 8000
```

Set TWILIO_VOICE_PUBLIC_DOMAIN to domain only, for example:
- abc123xyz.ngrok.app

Configure SMS webhook in Twilio Conversation Configuration:
- URL: https://<your-domain>.ngrok.app/webhook
- Method: POST

Configure Voice webhook on Twilio number:
- URL: https://<your-domain>.ngrok.app/twiml
- Method: POST

Also remove any legacy number-level inbound SMS webhook/demo handler in the phone number Messaging settings.

## 6) Live channel verification

SMS test:
1. Text your Twilio number.
2. Confirm your server receives webhook traffic.
3. Confirm a response is returned.

Voice test:
1. Call your Twilio number.
2. Confirm request to /twiml and websocket activity on /ws.
3. Confirm conversation relay callback hits /conversation-relay-callback.

## 7) Memory and profile verification

Set:
- TWILIO_LOG_LEVEL=DEBUG

Then send an SMS and verify memory retrieval logs appear.

Pass criteria:
- Callback receives memory object or retrieval logs indicate fallback mode
- Profile traits are available when configured in Conversation Memory

## 8) Escalation safety check (if using handoff)

If using human handoff:
- Set TWILIO_STUDIO_HANDOFF_FLOW_SID
- Confirm Studio Flow is published
- Confirm Voice captureRules are removed from Conversation Configuration

Pass criteria:
- No duplicate voice messages after handoff
- Handoff reaches Studio/Flex path

## 9) Workshop-day fallback plan

Prepare one known-good fallback:
- One pre-validated Python env file
- One pre-validated TypeScript env file
- One machine already connected to ngrok and Twilio webhooks

If a team is blocked for more than 10 minutes:
1. Move them to the known-good env file
2. Prioritize SMS baseline over voice
3. Defer advanced memory/tool work until baseline is live
