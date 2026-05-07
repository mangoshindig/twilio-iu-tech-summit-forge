# Python Starter

This starter uses GA Twilio Agent Connect with TACFastAPIServer and TODO callback logic.

Callback contract reference:
- See CALLBACK_CONTRACT.md for exact on_message_ready and on_conversation_ended signatures.

## Start
1. cp .env.example .env
2. python -m venv .venv
3. source .venv/bin/activate (macOS/Linux) or .venv\\Scripts\\activate (Windows)
4. pip install -r requirements.txt
5. python3 app.py

Server routes:
- GET /health
- POST /webhook
- POST /twiml
- /ws (WebSocket upgrade path for voice)
- POST /conversation-relay-callback

## Local webhook test
curl -X POST http://localhost:8000/webhook \
  -H "content-type: application/json" \
  -d '{
    "conversation_id": "conv-1",
    "text": "Hi there",
    "profile": { "traits": { "firstName": "Alex" } }
  }'

## TAC wiring tasks
- Replace TODO logic inside tac.on_message_ready with your AI runtime call.
- Keep Conversation Memory and profile-trait usage in the prompt path.
- Keep spend-cap guard active using WORKSHOP_SPEND_CAP_USD.
- Replace TODO logic inside tac.on_conversation_ended with persistence for judging.

## Optional voice task
- Set TWILIO_VOICE_PUBLIC_DOMAIN and wire Twilio Voice webhook to /twiml.
- Keep /conversation-relay-callback reachable from the same public domain.
- Keep first-call behavior simple and demo-ready.
