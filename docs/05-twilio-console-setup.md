# Twilio Console Setup (Step-by-step)

Use this guide to configure the Twilio-side wiring for TAC workshop demos.

## Before you start

You need:
- A running local TAC server on port 8000
- A live ngrok tunnel to port 8000
- Your active public domain from ngrok (domain only)
- A Twilio phone number
- A Conversation Configuration ID

## 1) Confirm your active ngrok domain

1. Start ngrok:

```bash
ngrok http 8000
```

2. Copy the domain from ngrok output (example: abc123xyz.ngrok-free.app).
3. Update local env:
- TWILIO_VOICE_PUBLIC_DOMAIN=abc123xyz.ngrok-free.app

Important:
- Use domain only, no https:// prefix.
- If ngrok URL changes, update env and Twilio webhooks.

## 2) Verify the phone number is a sender for your configuration

1. Open Twilio Console.
2. Go to Products & services > Conversation Orchestrator > Conversation Configurations.
3. Open the configuration referenced by TWILIO_CONVERSATION_CONFIGURATION_ID.
4. Verify your Twilio phone number is associated as the sender/origination number.

If it is not associated, add it before testing SMS.

## 3) Configure SMS webhook

1. In Twilio Console, go to Products & services > Conversation Orchestrator > Conversation Configurations.
2. Open your Conversation Configuration.
3. In Overview, click Edit.
4. Set callback URL to:
- https://<your-ngrok-domain>/webhook
5. Set HTTP method to POST.
6. Save changes.

## 4) Configure Voice webhook

1. In Twilio Console, go to Products & services > Numbers & senders.
2. Select your Twilio phone number.
3. Under Configuration details, edit Voice configuration.
4. Use Webhooks as the primary method.
5. Set primary webhook URL to:
- https://<your-ngrok-domain>/twiml
6. Set HTTP method to POST.
7. Save changes.

## 5) Remove legacy number-level Messaging webhook (important)

If your number was used by older demos, it may still have a direct inbound SMS handler that sends Twilio's default/demo reply. Remove it so TAC is the only SMS responder.

1. In Twilio Console, go to Products & services > Numbers & senders > Manage > Active numbers.
2. Select the same phone number used in this workshop.
3. Open the Messaging configuration section.
4. Find the inbound SMS handler (often shown as "A message comes in").
5. Remove any legacy demo webhook / TwiML app / Studio flow assignment for inbound SMS.
6. Save changes.

Expected outcome:
- The number no longer sends Twilio default/demo inbound SMS replies.
- SMS responses come only from TAC through Conversation Configuration webhook routing.

## 6) Confirm server is reachable

With the Python server running:

```bash
curl -s http://localhost:8000/health
```

Expected:
- JSON with ok true.

## 7) Validate SMS end-to-end

1. Send SMS to your Twilio number.
2. Confirm server logs show an inbound /webhook request.
3. Confirm a reply is delivered back to your phone.

If no inbound webhook appears:
- Re-check step 2 sender association.
- Re-check step 3 callback URL and POST method.
- Confirm ngrok is running and domain is current.

If you still receive two SMS replies:
- Re-check this section and confirm the number-level inbound SMS handler is fully removed.

## 8) Validate Voice end-to-end

1. Call your Twilio number.
2. Confirm inbound /twiml request in server logs.
3. Confirm websocket activity on /ws.
4. Confirm /conversation-relay-callback is hit.

If call drops or fails:
- Re-check voice webhook URL is https://<domain>/twiml and method POST.
- Confirm ngrok domain matches current tunnel.

## 9) Optional debug checks

Add to env:
- TWILIO_LOG_LEVEL=DEBUG

Restart server and test again to inspect memory retrieval and channel routing logs.

## 10) Reset checklist for next test session

When restarting ngrok:
1. Update TWILIO_VOICE_PUBLIC_DOMAIN in local env.
2. Update SMS and Voice webhook URLs in Twilio Console.
3. Restart the TAC server.
