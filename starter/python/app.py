import os

from dotenv import load_dotenv

from tac import TAC, TACConfig
from tac.channels.sms import SMSChannel, SMSChannelConfig
from tac.channels.voice import VoiceChannel, VoiceChannelConfig
from tac.models.session import ConversationSession
from tac.models.tac import TACMemoryResponse
from tac.server import TACFastAPIServer

load_dotenv()

TEAM_ID = os.getenv("TEAM_ID", "team-unknown")
SPEND_CAP_USD = float(os.getenv("WORKSHOP_SPEND_CAP_USD", "5"))

usage_by_conversation: dict[str, float] = {}


def estimate_cost(input_text: str, output_text: str) -> float:
    chars = len(input_text) + len(output_text)
    return chars * 0.000002


def extract_first_name(context: ConversationSession) -> str | None:
    profile = context.profile
    if profile is None or profile.traits is None:
        return None

    first_name = profile.traits.get("firstName")
    return first_name if isinstance(first_name, str) else None


async def handle_message_ready(
    user_message: str,
    context: ConversationSession,
    memory_response: TACMemoryResponse | None,
) -> str:
    # TODO: Send "user_message" to your AI runtime and return the model response.
    # TODO: Use Conversation Memory and profile traits from "context" and "memory_response".
    first_name = extract_first_name(context)
    response_text = (
        f"{first_name}, TODO: AI response for message \"{user_message}\""
        if first_name
        else f"TODO: AI response for message \"{user_message}\""
    )

    conversation_id = context.conversation_id
    current = usage_by_conversation.get(conversation_id, 0.0)
    current += estimate_cost(user_message, response_text)
    usage_by_conversation[conversation_id] = current

    if current > SPEND_CAP_USD:
        return "Team spend cap reached. Please ask a facilitator to continue."

    _ = memory_response
    return response_text


async def handle_conversation_ended(context: ConversationSession) -> None:
    # TODO: Persist final transcript/score metrics for judging.
    # TODO: Replace local cleanup with durable storage if needed.
    usage_by_conversation.pop(context.conversation_id, None)


tac = TAC(config=TACConfig.from_env())
sms_channel = SMSChannel(tac, config=SMSChannelConfig(memory_mode="always"))
voice_channel = None

if os.getenv("TWILIO_VOICE_PUBLIC_DOMAIN"):
    voice_channel = VoiceChannel(tac, config=VoiceChannelConfig(memory_mode="always"))

tac.on_message_ready(handle_message_ready)
tac.on_conversation_ended(handle_conversation_ended)

server = TACFastAPIServer(
    tac=tac,
    voice_channel=voice_channel,
    messaging_channels=[sms_channel],
)

app = server.app


@app.get("/health")
async def health() -> dict[str, object]:
    return {
        "ok": True,
        "teamId": TEAM_ID,
        "spendCapUsd": SPEND_CAP_USD,
        "activeConversations": len(usage_by_conversation),
        "tacSdk": "twilio-agent-connect==1.0.0",
    }


if __name__ == "__main__":
    server.start()
