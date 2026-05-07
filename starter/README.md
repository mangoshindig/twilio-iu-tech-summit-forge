# Starter Tracks

Choose one track per team.

## Track A: TypeScript
Path: starter/typescript

Run:
1. cp .env.example .env
2. npm install
3. npm run dev

## Track B: Python
Path: starter/python

Run:
1. cp .env.example .env
2. python -m venv .venv
3. source .venv/bin/activate (macOS/Linux) or .venv\\Scripts\\activate (Windows)
4. pip install -r requirements.txt
5. python3 app.py

## Setup checkpoints
- Checkpoint A: GET /health returns ok true
- Checkpoint B: POST /webhook returns response text
- Checkpoint C: Twilio webhook reaches local endpoint through ngrok

## Suggested build order
1. Get SMS baseline working
2. Add Conversation Memory context usage
3. Add profile trait personalization
4. Add spend cap logging and hard stop
5. Add optional voice flow via /twiml, /ws, and /conversation-relay-callback
