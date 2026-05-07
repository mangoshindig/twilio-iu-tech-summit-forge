# Twilio Agent Connect Workshop Kit

This repository is a 2-hour hackathon quickstart kit for conversational AI using Twilio Agent Connect, Conversation Orchestrator, and Conversation Memory.

Audience assumptions:
- Mixed developer backgrounds
- Beginner familiarity with Twilio and agent frameworks
- Teams of developers

Workshop design goals:
- Fast setup with guided checkpoints
- Working SMS AI bot baseline for every team
- Voice extension as an optional stretch goal
- Cost controls with a configurable 5 USD cap per team

Included deliverables:
- Minute-by-minute runbook: docs/00-workshop-runbook.md
- Participant prework checklist: docs/01-prework.md
- Facilitator troubleshooting guide: docs/02-facilitator-guide.md
- Demo judging rubric: docs/03-judging-rubric.md
- Workshop preflight checklist: docs/04-workshop-preflight-checklist.md
- Twilio Console setup guide: docs/05-twilio-console-setup.md
- Single starter scaffold with two tracks:
  - TypeScript starter: starter/typescript
  - Python starter: starter/python

Important:
- Shared Twilio resources are assumed to be pre-provisioned by facilitator.
- Credentials are distributed via per-team environment files.
- Terminology uses GA names only.

Recommended start point:
1. Read docs/00-workshop-runbook.md
2. Prepare team env files from docs/01-prework.md
3. Have teams choose TypeScript or Python starter

Official TAC docs map:
- Platform landing and legal notes: https://www.twilio.com/docs/conversations/agent-connect
- TAC overview and production considerations: https://www.twilio.com/docs/conversations/agent-connect/overview
- Workshop quickstart baseline and webhook setup: https://www.twilio.com/docs/conversations/agent-connect/quickstart
- SDK integration and server routes: https://www.twilio.com/docs/conversations/agent-connect/build-with-tac
- Channel behavior and default endpoints: https://www.twilio.com/docs/conversations/agent-connect/channels
- Memory retrieval and tool patterns: https://www.twilio.com/docs/conversations/agent-connect/memory-and-tool-patterns
- Outbound conversation flows: https://www.twilio.com/docs/conversations/agent-connect/initiate-outbound-conversations
- Human handoff flow and Studio integration: https://www.twilio.com/docs/conversations/agent-connect/escalate-to-human-agent
- Core architecture and deployment modes: https://www.twilio.com/docs/conversations/agent-connect/core-concepts
- Troubleshooting checklist and known failure modes: https://www.twilio.com/docs/conversations/agent-connect/troubleshooting

Workshop file to TAC page crosswalk:
- docs/00-workshop-runbook.md -> overview, quickstart, channels, troubleshooting
- docs/01-prework.md -> quickstart prerequisites, build-with-tac prerequisites
- docs/02-facilitator-guide.md -> troubleshooting, channels, escalate-to-human-agent
- docs/03-judging-rubric.md -> core-concepts, memory-and-tool-patterns, channels
- starter/typescript/README.md -> build-with-tac, channels, quickstart
- starter/python/README.md -> build-with-tac, channels, quickstart
- starter/typescript/CALLBACK_CONTRACT.md -> build-with-tac (message/conversation callbacks), core-concepts
- starter/python/CALLBACK_CONTRACT.md -> build-with-tac (message/conversation callbacks), core-concepts
