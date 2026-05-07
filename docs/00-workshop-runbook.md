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
  - Agent runtime (OpenAI Agents SDK)
  - Twilio Agent Connect as middleware
  - Conversation Orchestrator for flow + webhooks
  - Conversation Memory for context and profile traits

### 00:12 to 00:20
- Live demo by facilitator:
  - Send SMS to bot
  - Show memory-backed personalization
  - Show optional voice call baseline

### 00:20 to 00:30
- Team setup sprint with checkpoints:
  - Checkpoint A: env file validated
  - Checkpoint B: local server starts
  - Checkpoint C: webhook test receives event

### 00:30 to 01:10
- Build sprint 1 (required):
  - Implement SMS bot behavior
  - Add memory retrieval and one profile trait in prompts
  - Add cost guardrails

### 01:10 to 01:30
- Build sprint 2 (optional stretch):
  - Add voice call path
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
- Uses Conversation Memory context
- Uses at least one profile trait
- Enforces configurable cost cap

## Optional tasks
- Voice channel demo
- Better retrieval strategy
- Better prompt safety and escalation

## Facilitator checklist during build
- Confirm every team reaches Checkpoint C by 00:35
- Ensure no team exceeds spend cap
- Offer fallback route if ngrok/webhook issues occur

## Deliverable at end
One live demo per team:
- SMS conversation with context-aware answer, or
- Voice call with at least one successful exchange
