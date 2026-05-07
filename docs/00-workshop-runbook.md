# Workshop Runbook (120 minutes)

## Learning objective
Each team ships a conversational AI demo on Twilio channels.
Minimum requirement: working SMS AI bot.
Stretch requirement: working voice call flow.

## Session structure
- 00:00 to 00:20: Concepts, architecture, and live baseline demo
- 00:20 to 01:40: Team build time
- 01:40 to 02:00: Team demos and judging

## Minute-by-minute plan

### 00:00 to 00:05
- Welcome and outcomes
- Explain success criteria: demo on SMS or voice

### 00:05 to 00:12
- Architecture walkthrough:
  - Agent runtime (team-selected AI runtime wired into starter TODO callbacks)
  - Twilio Agent Connect as middleware
  - Conversation Orchestrator for flow + webhooks
  - Conversation Memory for context and profile traits (optional)

### 00:12 to 00:20
- Live demo by facilitator - RAMP:
  - Send SMS to bot
  - Show memory-backed personalization
  - Show optional voice call baseline

### 00:20 to 00:30
- Team setup sprint with checkpoints:
  - Checkpoint A: German mobile number provisioned, Conversation Configuration created, and env file validated
  - Checkpoint B: local server starts and ngrok forwarding URL is active
  - Checkpoint C: Messaging webhook is set on Conversation Configuration, phone number is mapped, and webhook test receives event

### 00:30 to 01:10
- Build sprint 1 (required):
  - Implement SMS bot behavior in starter callback TODOs
  - Add personality/tone instructions (system prompt or instruction layer)
  - Add memory retrieval and one profile trait in prompts
  - Add cost guardrails

### 01:10 to 01:30
- Build sprint 2 (optional stretch):
  - Add voice call path - choose a voice
  - Improve first-call voice response quality

### 01:30 to 01:40
- Demo prep:
  - Final smoke tests
  - Submit judging form

### 01:40 to 02:00
- Team demos and scoring

## Team tasks

## Required tasks
- Bot replies over SMS
- Messaging webhook is configured on Conversation Configuration and number mapping is correct
- Adds personality/tone instructions in prompt construction
- Uses Conversation Memory context
- Uses at least one profile trait
- Enforces configurable cost cap

## Optional tasks
- Voice channel demo
- Better retrieval strategy
- Better prompt safety and escalation
- Add an intelligence service integration for improved insights/routing

## Facilitator checklist during build
- Confirm every team reaches Checkpoint C by 00:35
- Ensure no team exceeds spend cap
- Offer fallback route if ngrok/webhook issues occur
- Verify each team can point to where they edited callbacks and prompt logic in code

## Deliverable at end
One live demo per team:
- SMS conversation that demonstrates personality/tone, context-aware behavior, and spend-cap guardrail, or
- Voice call with at least one successful exchange built on the same agent logic
