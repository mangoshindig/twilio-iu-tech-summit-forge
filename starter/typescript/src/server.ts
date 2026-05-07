import { config as loadEnv } from "dotenv";
import {
  TAC,
  TACConfig,
  TACServer,
  SMSChannel,
  VoiceChannel
} from "twilio-agent-connect";

loadEnv();

const teamId = process.env.TEAM_ID || "team-unknown";
const spendCapUsd = Number(process.env.WORKSHOP_SPEND_CAP_USD || 5);
const usageByConversation = new Map<string, number>();

function estimateCost(input: string, output: string): number {
  const chars = input.length + output.length;
  return chars * 0.000002;
}

function extractProfileFirstName(session: unknown): string | undefined {
  if (!session || typeof session !== "object") {
    return undefined;
  }

  const profile = (session as { profile?: { traits?: Record<string, unknown> } }).profile;
  const firstName = profile?.traits?.firstName;
  return typeof firstName === "string" ? firstName : undefined;
}

async function start(): Promise<void> {
  const tac = await TAC.create({ config: TACConfig.fromEnv() });

  const smsChannel = new SMSChannel(tac, { memoryMode: "always" });
  tac.registerChannel(smsChannel);

  const voiceEnabled = Boolean(process.env.TWILIO_VOICE_PUBLIC_DOMAIN);
  if (voiceEnabled) {
    const voiceChannel = new VoiceChannel(tac, { memoryMode: "always" });
    tac.registerChannel(voiceChannel);
  }

  tac.onMessageReady(async ({ conversationId, message, session }) => {
    // TODO: Send "message" to your AI runtime and return the model response text.
    // TODO: Use Conversation Memory and profile traits from "session" in prompt construction.
    const profileFirstName = extractProfileFirstName(session);
    const response = `${profileFirstName ? `${profileFirstName}, ` : ""}TODO: AI response for message \"${message}\"`;

    const key = String(conversationId);
    const current = usageByConversation.get(key) ?? 0;
    const next = current + estimateCost(message, response);
    usageByConversation.set(key, next);

    if (next > spendCapUsd) {
      return "Team spend cap reached. Please ask a facilitator to continue.";
    }

    return response;
  });

  tac.onConversationEnded(async ({ session }) => {
    // TODO: Persist final transcript/score metrics for judging.
    // TODO: Replace local cleanup with durable storage if needed.
    usageByConversation.delete(String(session.conversationId));
  });

  const server = new TACServer(tac, {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 8000)
  });

  server.fastify.get("/health", async () => ({
    ok: true,
    teamId,
    spendCapUsd,
    activeConversations: usageByConversation.size,
    tacSdk: "twilio-agent-connect@1.0.0"
  }));

  await server.start();
}

void start().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
