# Facilitator Guide and Troubleshooting

## Fast setup strategy
- Pre-provision Twilio resources before event
- Generate per-team env files in advance
- Test one reference environment on macOS and Windows
- Keep one fallback team account ready

## Suggested facilitation model
- One lead facilitator
- One floating helper for setup issues
- One helper for Twilio Console and webhooks

## Troubleshooting matrix

Issue: Team cannot receive webhook events
- Check ngrok is running
- Check webhook URL path and HTTP method
- Check local server route and port
- Use manual curl test to local endpoint

Issue: Team can receive but not respond
- Check API keys and auth token values
- Check runtime logs for model/provider errors
- Verify outbound internet access

Issue: Memory not retrieved
- Confirm Conversation Memory configuration is linked
- Confirm profile identifier is present
- Confirm retrieval is enabled for the channel
- Set TWILIO_LOG_LEVEL=DEBUG and check memory retrieval logs

Issue: Voice fails but SMS works
- Confirm voice webhook path
- Confirm Twilio number voice configuration
- Confirm voice webhook is POST to /twiml
- Reduce complexity to first call baseline

Issue: Duplicate voice messages after human handoff
- Check whether Voice captureRules are enabled in Conversation Configuration
- Remove Voice captureRules when using TAC Conversation Relay handoff

Issue: Team approaching cost cap too quickly
- Lower model tier
- Lower max output tokens
- Increase caching and prompt brevity
- Reduce retry counts

## Fallback protocol
If a team is blocked longer than 10 minutes:
1. Move to known-good starter branch or copy
2. Validate with canned webhook payload
3. Defer voice and finish SMS requirement first

## Demo management
- Request teams queue in demo order by 01:35
- Hard cap each demo to 2.5 minutes
- Require one live interaction, not screenshots only
