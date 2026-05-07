# TypeScript Starter

This starter uses GA Twilio Agent Connect with TACServer and TODO callback logic.

Callback contract reference:
- See CALLBACK_CONTRACT.md for exact onMessageReady and onConversationEnded signatures.

## Start
1. cp .env.example .env
2. npm install
3. npm run dev

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
- Replace TODO logic inside tac.onMessageReady with your AI runtime call.
- Keep Conversation Memory and profile-trait usage in the prompt path.
- Keep spend-cap guard active using WORKSHOP_SPEND_CAP_USD.
- Replace TODO logic inside tac.onConversationEnded with persistence for judging.

## Optional voice task
- Set TWILIO_VOICE_PUBLIC_DOMAIN and wire Twilio Voice webhook to /twiml.
- Keep /conversation-relay-callback reachable from the same public domain.
- Keep first-call behavior simple and demo-ready.
