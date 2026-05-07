# TypeScript Callback Contract

This file defines the workshop callback contract to implement with Twilio Agent Connect.

Scope:
- Keep these as TODO stubs during workshop setup.
- Implement only when teams are ready to wire TAC.
- Register channels with TAC and run through `TACServer`.

## 1) onMessageReady

Expected registration:
- tac.onMessageReady(handler)

Expected handler input:
```ts
{
  conversationId: string;
  profileId: string | undefined;
  message: string;
  author: string;
  memory: TACMemoryResponse | undefined;
  session: ConversationSession;
  channel: ChannelType;
}
```

Expected handler output:
```ts
Promise<string | null | void> | string | null | void
```

Behavior:
- Return string: TAC can auto-send that response.
- Return null or void: app handles response send manually.

Workshop TODO:
- TODO: Send input message to AI runtime.
- TODO: Inject Conversation Memory and profile traits into model context.
- TODO: Enforce spend cap before returning model response.

Required env vars for this flow:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_CONVERSATION_CONFIGURATION_ID` (omit for voice-only mode)

## 2) onConversationEnded

Expected registration:
- tac.onConversationEnded(handler)

Expected handler input:
```ts
{
  session: ConversationSession;
}
```

Expected handler output:
```ts
Promise<void> | void
```

Behavior:
- Called when channel closes a conversation.
- Use for cleanup and workshop scoring persistence.

Workshop TODO:
- TODO: Persist summary, score, and usage metrics.
- TODO: Clear local in-memory state for the conversation.

## Suggested starter stub

```ts
async function onMessageReadyStub(params: {
  conversationId: string;
  profileId?: string;
  message: string;
  author: string;
  memory: unknown;
  session: unknown;
  channel: string;
}): Promise<string> {
  // TODO: call AI runtime
  // TODO: add memory/profile context
  // TODO: enforce spend cap
  return "TODO: AI response";
}

async function onConversationEndedStub(params: { session: unknown }): Promise<void> {
  // TODO: persist summary and usage
}
```
