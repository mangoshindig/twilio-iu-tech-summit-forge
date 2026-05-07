# Python Callback Contract

This file defines the workshop callback contract to implement with Twilio Agent Connect.

Scope:
- Keep these as TODO stubs during workshop setup.
- Implement only when teams are ready to wire TAC.
- Register channels with TAC and run through `TACFastAPIServer`.

## 1) on_message_ready

Expected registration:
- tac.on_message_ready(handler)

Expected handler input:
```py
user_message: str
context: ConversationSession
memory_response: TACMemoryResponse | None
```

Expected handler output:
```py
str | None
```
or async equivalent:
```py
Awaitable[str | None]
```

Behavior:
- Return str: TAC can auto-send that response.
- Return None: app handles response send manually.

Workshop TODO:
- TODO: Send user_message to AI runtime.
- TODO: Inject Conversation Memory and profile traits into model context.
- TODO: Enforce spend cap before returning model response.

Required env vars for this flow:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_CONVERSATION_CONFIGURATION_ID` (omit for voice-only mode)

## 2) on_conversation_ended

Expected registration:
- tac.on_conversation_ended(handler)

Expected handler input:
```py
context: ConversationSession
```

Expected handler output:
```py
None
```
or async equivalent:
```py
Awaitable[None]
```

Behavior:
- Called when channel closes a conversation.
- Use for cleanup and workshop scoring persistence.

Workshop TODO:
- TODO: Persist summary, score, and usage metrics.
- TODO: Clear local in-memory state for the conversation.

## Suggested starter stub

```py
async def on_message_ready_stub(
    user_message: str,
    context: "ConversationSession",
    memory_response: "TACMemoryResponse | None",
) -> str:
    # TODO: call AI runtime
    # TODO: add memory/profile context
    # TODO: enforce spend cap
    return "TODO: AI response"

async def on_conversation_ended_stub(context: "ConversationSession") -> None:
    # TODO: persist summary and usage
    return None
```
