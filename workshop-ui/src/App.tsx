import confetti from 'canvas-confetti'
import { useEffect, useRef, useState } from 'react'
import {
  FiActivity,
  FiBookOpen,
  FiCheck,
  FiCheckSquare,
  FiCode,
  FiCommand,
  FiExternalLink,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiList,
  FiPlayCircle,
  FiZap,
} from 'react-icons/fi'
import {
  WORKSHOP_TWILIO_ACCOUNT_SID,
  WORKSHOP_TWILIO_ACCOUNT_SID_PLACEHOLDER,
} from './config'
import './App.css'

function App() {
  const [selectedTrack, setSelectedTrack] = useState<'python' | 'typescript'>('python')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [copiedDetailKey, setCopiedDetailKey] = useState<string | null>(null)
  const [copiedPromptStarter, setCopiedPromptStarter] = useState(false)
  const [runtimeFlowSvg, setRuntimeFlowSvg] = useState<string>('')
  const [runtimeFlowError, setRuntimeFlowError] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('overview')
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [activeVideo, setActiveVideo] = useState<{ title: string; embedUrl: string } | null>(null)
  const hasCelebratedCompletion = useRef(false)

  const trackFolder = selectedTrack === 'python' ? 'python' : 'typescript'
  const startCommand = selectedTrack === 'python'
    ? 'cd starter/python && python3 app.py'
    : 'cd starter/typescript && npm run dev'

  const twilioConsoleLink = (page: string) => {
    const sid = WORKSHOP_TWILIO_ACCOUNT_SID.trim()
    if (!sid || sid === WORKSHOP_TWILIO_ACCOUNT_SID_PLACEHOLDER) {
      return 'https://console.twilio.com/'
    }
    return `https://1console.twilio.com/account/${encodeURIComponent(sid)}/${page}`
  }

  type ChecklistDetail = {
    text: string
    command?: string
    chips?: string[]
    linkLabel?: string
    linkHref?: string
  }

  type ChecklistItem = {
    id: string
    label: string
    headerChips?: string[]
    details: ChecklistDetail[]
  }

  const checklist: ChecklistItem[] = [
    {
      id: 'german-number',
      label: 'German mobile number provisioned in Twilio Console',
      details: [
        {
          text: 'Find your team\'s German mobile number',
          linkLabel: 'Twilio Console -> Phone Numbers',
          linkHref: twilioConsoleLink('us1/senders-hub/list/phone-numbers/inventory'),
        },
        { text: 'Confirm the number appears under Active numbers before continuing.' },
      ],
    },
    {
      id: 'env',
      label: 'Environment variables configured',
      details: [
        { text: `Copy starter/${trackFolder}/.env.example to starter/${trackFolder}/.env.` },

        {
          text: 'Get these values from',
          chips: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
          linkLabel: 'Twilio Console -> Account info',
          linkHref: twilioConsoleLink('settings/us1/api-keys/auth-tokens'),
        },
        {
          text: 'Get these values from',
          chips: ['TWILIO_API_KEY', 'TWILIO_API_SECRET'],
          linkLabel: 'Twilio Console -> API Keys & Tokens',
          linkHref: twilioConsoleLink('settings/us1/api-keys/list'),
        },
        {
          text: 'Get this value (team-specific) from',
          chips: ['TWILIO_PHONE_NUMBER'],
          linkLabel: 'Twilio Console -> Phone Numbers -> Active numbers',
          linkHref: twilioConsoleLink('phone-numbers/manage/incoming'),
        },
        {
          text: 'Get this value when you create a new configuration (ONE CONFIGURATION PER TEAM) at',
          chips: ['TWILIO_CONVERSATION_CONFIGURATION_ID'],
          linkLabel: 'Twilio Conversation Orchestrator',
          linkHref: twilioConsoleLink('us1/conversation-orchestrator/overview'),
        },
        {
          text: 'Get this value when you run ngrok in a later step. It is the host/domain portion of the forwarding URL, without the https://',
          chips: ['TWILIO_VOICE_PUBLIC_DOMAIN'],
          // linkLabel: 'your ngrok forwarding URL host/domain (without https://)',
          // linkHref: 'https://example.com/docs/ngrok-forwarding-url',
        },
        {
          text: 'Facilitator-defined workshop values',
          chips: ['TEAM_ID', 'WORKSHOP_SPEND_CAP_USD', 'OPENAI_API_KEY'],
        },
        { text: 'Save and restart the starter if you changed values while it was running.' },
      ],
    },
    {
      id: 'ngrok',
      label: 'Public ngrok URL created and copied',
      headerChips: ['Prereq: ngrok installed'],
      details: [
        { text: 'Open a dedicated terminal for ngrok.' },
        { text: 'Run ngrok in that terminal:', command: 'ngrok http 8000' },
        { text: 'Copy the HTTPS forwarding URL (for example: https://abc123.ngrok-free.app).' },
        {
          text: 'Add the forwarding URL without the https:// to .env',
          chips: ['TWILIO_VOICE_PUBLIC_DOMAIN'],
          // linkLabel: 'your ngrok forwarding URL host/domain (without https://)',
          // linkHref: 'https://example.com/docs/ngrok-forwarding-url',
        },
      ],
    },
    {
      id: 'webhook',
      label: 'Twilio webhook routes set to /webhook and /twiml',
      details: [
        {
          text: 'Open your Conversation Configuration in the Twilio Console.',
          linkLabel: 'Twilio Console -> Conversation Orchestrator',
          linkHref: twilioConsoleLink('us1/conversation-orchestrator/overview'),
        },
        { text: 'Set the webhook on the Conversation Configuration to <NGROK_URL>/webhook.' },
        { text: 'Map the workshop phone number to that Conversation Configuration.' },
        {
          text: 'Open your new phone number in the Twilio Console.',
          linkLabel: 'Twilio Console -> Phone Numbers -> Active numbers',
          linkHref: twilioConsoleLink('phone-numbers/manage/incoming'),
        },
        { text: 'Set Voice webhook to <NGROK_URL>/twiml on the phone number when voice is enabled.' },
      ],
    },
    {
      id: 'legacy',
      label: 'Legacy number-level SMS handlers removed',
      details: [
        {
          text: 'Open your new phone number in the Twilio Console.',
          linkLabel: 'Twilio Console -> Phone Numbers -> Active numbers',
          linkHref: twilioConsoleLink('phone-numbers/manage/incoming'),
        },
        { text: 'Delete the demo webhook from the messaging config' },

      ],
    },
    {
      id: 'smoke',
      label: 'Smoke test message returned one response',
      details: [
        { text: 'Start the selected track:', command: startCommand },
        { text: 'Send an SMS like "hello" to the workshop Twilio number.' },
        { text: 'Confirm exactly one response is received and starter logs show one webhook event.' },
      ],
    },
  ]

  const doneCount = completedSteps.size
  const totalSteps = checklist.length
  const progress = Math.round((doneCount / totalSteps) * 100)

  const navItems = [
    { id: 'overview', label: 'Overview', icon: FiHome },
    // { id: 'account', label: 'Account SID', icon: FiCode },
    // { id: 'repo', label: 'Repository', icon: FiCode },

    { id: 'tracks', label: 'Tracks', icon: FiList },
    { id: 'checklist', label: 'Checklist', icon: FiCheckSquare },
    { id: 'runtime-flow', label: 'Runtime Flow', icon: FiActivity },
    { id: 'modules', label: 'Docs', icon: FiBookOpen },
    { id: 'prompt-starter', label: 'Prompt Starter', icon: FiFileText },
    { id: 'playbook', label: 'Common Issues', icon: FiHelpCircle },
    { id: 'judging', label: 'Judging Criteria', icon: FiZap },
  ]

  type WorkshopModule = {
    name: string
    description: string
    href: string
    whenToUse?: string
    video?: {
      title: string
      embedUrl: string
    }
  }

  const requiredModules: WorkshopModule[] = [
    {
      name: 'Twilio Agent Connect (TAC)',
      description: 'The core runtime for agent experiences in Conversations, including your callback flow in this starter.',
      href: 'https://www.twilio.com/docs/conversations/agent-connect',
      video: {
        title: 'Twilio Agent Connect overview',
        embedUrl: 'https://www.youtube.com/embed/xTQU-Y-Btso',
      },
    },
    {
      name: 'Conversation Orchestrator',
      description: 'Flow control layer for designing and routing conversation steps across channels and services.',
      href: 'https://www.twilio.com/docs/conversations/orchestrator',
      video: {
        title: 'Conversation Orchestrator overview',
        embedUrl: 'https://www.youtube.com/embed/xZcIuobmgkg',
      },
    },
  ]

  const optionalModules: WorkshopModule[] = [
    {
      name: 'Conversation Relay',
      description: 'Extend voice interactions with ConversationRelay for real-time conversational experiences.',
      whenToUse: 'Use when teams want to add voice conversations beyond messaging-only workflows.',
      href: 'https://www.twilio.com/docs/voice/conversationrelay',
    },
    {
      name: 'Conversation Intelligence',
      description: 'Add analysis signals and insights to improve routing, quality checks, and automation.',
      whenToUse: 'Use when teams want measurable quality signals and smarter decisioning.',
      href: 'https://www.twilio.com/docs/conversations/intelligence',
      video: {
        title: 'Conversation Intelligence overview',
        embedUrl: 'https://www.youtube.com/embed/qzhWLKIOTAg',
      },
    },

    {
      name: 'Conversation Memory',
      description: 'Persist contextual state so assistants can retain relevant information across interactions.',
      whenToUse: 'Use when participants need continuity across turns or returning users.',
      href: 'https://www.twilio.com/docs/conversations/memory',
      video: {
        title: 'Conversation Memory overview',
        embedUrl: 'https://www.youtube.com/embed/DPeFiBht0jc',
      },
    },
    {
      name: 'Enterprise Knowledge',
      description: 'Ground responses with connected enterprise knowledge sources for higher-quality answers.',
      whenToUse: 'Use when teams need trusted answers sourced from approved documents or systems.',
      href: 'https://www.twilio.com/docs/conversations/knowledge',
    },
  ]

  const codeEditPointers = selectedTrack === 'python'
    ? [
      {
        title: 'Core response logic',
        path: 'starter/python/app.py',
        target: 'handle_message_ready',
      },
      {
        title: 'Personality / system instructions',
        path: 'starter/python/app.py',
        target: 'Build your prompt before returning response_text in handle_message_ready',
      },
      {
        title: 'End-of-conversation persistence',
        path: 'starter/python/app.py',
        target: 'handle_conversation_ended',
      },
    ]
    : [
      {
        title: 'Core response logic',
        path: 'starter/typescript/src/server.ts',
        target: 'tac.onMessageReady',
      },
      {
        title: 'Personality / system instructions',
        path: 'starter/typescript/src/server.ts',
        target: 'Build your prompt before returning response in tac.onMessageReady',
      },
      {
        title: 'End-of-conversation persistence',
        path: 'starter/typescript/src/server.ts',
        target: 'tac.onConversationEnded',
      },
    ]

  const runtimeFlowMermaid = `flowchart TD
    A[User sends SMS or Voice input] --> B[Twilio routes request to TAC server endpoints]
    B --> C[TAC runtime receives event]

    C --> D{Channel type}
    D -->|SMS| E[SMSChannel memoryMode always]
    D -->|Voice enabled via TWILIO_VOICE_PUBLIC_DOMAIN| F[VoiceChannel memoryMode always]

    E --> G[onMessageReady callback]
    F --> G

    G --> H[Read conversation session and profile traits]
    H --> I[Read and use Conversation Memory response]
    I --> J[Build prompt and call AI runtime]
    J --> K[Generate response text]

    K --> L[Estimate usage cost and update usage_by_conversation]
    L --> M{Spend cap exceeded?}
    M -->|Yes| N[Return spend cap reached message]
    M -->|No| O[Return model response to TAC]

    N --> P[Twilio sends response to end user]
    O --> P

    C --> Q[onConversationEnded callback]
    Q --> R[Persist transcript and scoring]
    R --> S[Clear in-memory usage state]

    T[GET /health] --> U[Return ok teamId spendCap activeConversations tacSdk]

    class A,B,P ext;
    class C,D,E,F,G,H,K,L,M,N,O,Q,S,T,U done;
    class I,J,R todo;

    classDef done fill:#e9f8ef,stroke:#1f8f53,color:#0f4e2d,stroke-width:1.2px;
    classDef todo fill:#fff4de,stroke:#b27400,color:#6d4600,stroke-width:1.2px;
    classDef ext fill:#edf3ff,stroke:#2f6df6,color:#183c8f,stroke-width:1.2px;`

  const promptStarterTemplate = `SYSTEM
You are the Twilio + IU workshop assistant for TEAM_ID={{TEAM_ID}}.

Personality and tone
- Friendly, concise, and practical.
- Explain trade-offs clearly and avoid jargon unless asked.

Behavior rules
- Ask one clarifying question if user intent is ambiguous.
- Never invent account-specific facts.
- If confidence is low, say what is missing and suggest a next action.

Conversation context to use
- Profile traits: firstName, preferredLanguage, customerTier.
- Conversation Memory summary from previous turns.

Escalation policy
- Escalate to a human for billing disputes, security concerns, or repeated failed attempts.

Response format
- Keep replies under 5 sentences by default.
- End with one actionable next step.`

  const troubleshootingPlaybook = [
    {
      issue: 'No inbound webhook events are hitting your local app',
      fix: 'Confirm ngrok is running, the HTTPS forwarding URL is current, and Messaging webhook on Conversation Configuration points to <NGROK_URL>/webhook.',
    },
    {
      issue: 'Messages arrive twice or duplicate responses are sent',
      fix: 'Remove legacy number-level messaging webhooks and keep only Conversation Configuration routing for messaging.',
    },
    {
      issue: 'Voice path fails while SMS works',
      fix: 'Set TWILIO_VOICE_PUBLIC_DOMAIN from ngrok host (without https://) and verify voice webhook points to <NGROK_URL>/twiml.',
    },
    {
      issue: 'Starter runs but behavior stays TODO-like',
      fix: 'Implement AI runtime logic in onMessageReady/handle_message_ready and add your prompt/personality instructions before returning response text.',
    },
  ]

  const judgingRubric = [
    {
      section: '1) Functional baseline',
      totalPoints: 30,
      criteria: [
        { item: 'SMS bot responds reliably', points: 10 },
        { item: 'Correct webhook/event handling', points: 10 },
        { item: 'End-to-end working demo', points: 10 },
      ],
    },
    {
      section: '2) Memory and profile use',
      totalPoints: 25,
      criteria: [
        { item: 'Uses Conversation Memory retrieval', points: 10 },
        { item: 'Uses profile trait in response logic', points: 10 },
        { item: 'Context quality and relevance', points: 5 },
      ],
    },
    {
      section: '3) Voice stretch goal',
      totalPoints: 15,
      criteria: [
        { item: 'Voice call path works', points: 10 },
        { item: 'First-call voice response quality', points: 5 },
      ],
    },
    {
      section: '4) Safety and spend controls',
      totalPoints: 20,
      criteria: [
        { item: 'Configurable spend cap implemented', points: 10 },
        { item: 'Prompt safety or escalation behavior', points: 10 },
      ],
    },
    {
      section: '5) Developer quality',
      totalPoints: 10,
      criteria: [
        { item: 'Clear code structure and logs', points: 5 },
        { item: 'Clear explanation during demo', points: 5 },
      ],
    },
  ]

  const tieBreakers = [
    'Better user experience',
    'Better resilience handling',
    'Better observability',
  ]

  const toggleStep = (id: string) => {
    setCompletedSteps((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const copyCommand = async (command: string, detailKey: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedDetailKey(detailKey)
      window.setTimeout(() => {
        setCopiedDetailKey((previous) => (previous === detailKey ? null : previous))
      }, 1500)
    } catch {
      setCopiedDetailKey(null)
    }
  }

  const copyPromptStarter = async () => {
    try {
      await navigator.clipboard.writeText(promptStarterTemplate)
      setCopiedPromptStarter(true)
      window.setTimeout(() => setCopiedPromptStarter(false), 1500)
    } catch {
      setCopiedPromptStarter(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const renderRuntimeFlow = async () => {
      try {
        const mermaidModule = await import('mermaid')
        const mermaid = mermaidModule.default

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
        })

        const { svg } = await mermaid.render(`runtime-flow-${Date.now()}`, runtimeFlowMermaid)
        if (!cancelled) {
          setRuntimeFlowSvg(svg)
          setRuntimeFlowError(null)
        }
      } catch {
        if (!cancelled) {
          setRuntimeFlowSvg('')
          setRuntimeFlowError('Unable to render Mermaid SVG in-browser. You can still copy the source below.')
        }
      }
    }

    void renderRuntimeFlow()

    return () => {
      cancelled = true
    }
  }, [runtimeFlowMermaid])

  useEffect(() => {
    if (progress === 100 && !hasCelebratedCompletion.current) {
      hasCelebratedCompletion.current = true

      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { y: 0.62 },
      })

      window.setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 95,
          startVelocity: 38,
          origin: { x: 0.2, y: 0.58 },
        })
        confetti({
          particleCount: 80,
          spread: 95,
          startVelocity: 38,
          origin: { x: 0.8, y: 0.58 },
        })
      }, 240)

      setShowCompletionModal(true)
    }

    if (progress < 100) {
      hasCelebratedCompletion.current = false
    }
  }, [progress])

  useEffect(() => {
    if (!showCompletionModal) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCompletionModal(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showCompletionModal])

  useEffect(() => {
    if (!activeVideo) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideo(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeVideo])

  const openDocsNext = () => {
    setActiveNav('modules')
    setShowCompletionModal(false)

    window.requestAnimationFrame(() => {
      const modulesSection = document.getElementById('modules')
      modulesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', '#modules')
    })
  }

  return (
    <div className="forge-shell">
      <aside className="forge-nav" aria-label="Workshop sections">
        <div className="forge-brand">
          <span className="twilio-badge" aria-hidden="true">
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Twilio logo">
              <path d="M20.8145 15.0292C20.8145 12.7348 22.7061 10.8066 24.9634 10.8066C27.2207 10.8066 29.1124 12.7348 29.1124 15.0292C29.1124 17.3236 27.2859 19.1516 24.9634 19.1516C22.6409 19.1516 20.8145 17.2902 20.8145 15.0292Z" fill="currentColor" />
              <path d="M20.8145 24.9712C20.8145 22.6433 22.7061 20.8154 24.9634 20.8154C27.2207 20.8154 29.1124 22.6449 29.1124 24.9712C29.1124 27.2975 27.2859 29.1269 24.9634 29.1269C22.6409 29.1269 20.8145 27.2656 20.8145 24.9712Z" fill="currentColor" />
              <path d="M10.8555 15.0292C10.8555 12.7348 12.6804 10.8066 15.0044 10.8066C17.3285 10.8066 19.1868 12.7348 19.1868 15.0292C19.1868 17.3236 17.2951 19.1516 15.0044 19.1516C12.7138 19.1516 10.8555 17.2902 10.8555 15.0292Z" fill="currentColor" />
              <path d="M10.8555 24.9712C10.8555 22.6433 12.6804 20.8154 15.0044 20.8154C17.3285 20.8154 19.1868 22.6449 19.1868 24.9712C19.1868 27.2975 17.2951 29.1269 15.0044 29.1269C12.7138 29.1269 10.8555 27.2656 10.8555 24.9712Z" fill="currentColor" />
              <path d="M20.0166 0C31.0374 0 39.9998 8.87803 40 19.9502C40 31.0226 31.0709 40 20.0166 40C8.96233 39.9999 0 30.9891 0 19.9502C0.000229308 8.91149 8.96247 5.88049e-05 20.0166 0ZM20.0186 5.2207C11.8846 5.2207 5.24632 11.8045 5.24609 19.9502C5.24609 28.0642 11.886 34.7471 20.0186 34.7471C28.151 34.7469 34.7236 28.096 34.7236 19.9502C34.7234 11.8046 28.1524 5.22087 20.0186 5.2207Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-plus" aria-hidden="true">+</span>
          <span className="iu-badge">
            <img src="https://www.iu.org/logos/intl-logo.svg" alt="IU International University logo" />
          </span>
        </div>

        <nav className="forge-menu" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`menu-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <Icon />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* <div className="nav-callout">
          <FiShield />
          <p>Avoid duplicate replies by removing legacy number-level SMS handlers.</p>
        </div> */}
      </aside>

      <main className="forge-main">
        <header className="forge-topbar">
          <div>
            <p className="eyebrow">IU Tech Summit</p>
            <h2>Workshop Control Center</h2>
          </div>
        </header>

        <section id="overview" className="hero-panel">
          <div className="hero-copy">
            <h3>Build an AI agent that works across channels.</h3>
            <p>
              In this workshop, participants build a production-style AI agent that can handle customer interactions across messaging and voice channels.
              Teams launch a working starter, wire core callbacks, validate end-to-end flows, and then extend the same agent with intelligence,
              memory, and orchestration patterns.
            </p>
            <div className="hero-tags">
              <span>2-hour workshop</span>
              <span>Cross-channel agent</span>
              <span>Messaging + Voice</span>
            </div>
          </div>
          <div className="progress-card">
            <p>Workshop readiness</p>
            <strong>{progress}%</strong>
            <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{doneCount} of {totalSteps} checks complete</span>
          </div>
        </section>

        <section className="meta-grid">
          <section id="repo" className="surface repo-section">
            <div className="surface-head">
              <h3>Workshop Repository</h3>
            </div>
            <p className="repo-text">
              Fork this repo to get started
            </p>
            <a
              className="repo-link"
              href="https://github.com/mangoshindig/twilio-iu-tech-summit-forge"
              target="_blank"
              rel="noreferrer"
              title="Opens in a new tab"
              aria-label="Fork the workshop repository (opens in a new tab)"
            >
              Fork this repo
              <FiExternalLink />
              <span className="link-meta">https://github.com/mangoshindig/twilio-iu-tech-summit-forge</span>
            </a>
          </section>

          <section id="account" className="surface account-section">
            <div className="surface-head">
              <h3>Twilio Account SID</h3>
            </div>

            <p className="repo-text"><strong>Current SID:</strong> {WORKSHOP_TWILIO_ACCOUNT_SID}</p>
          </section>
        </section>

        <section className="content-grid">
          <section id="tracks" className="surface span-two">
            <div className="surface-head">
              <h3>Track selector</h3>
            </div>
            <p className="module-intro">Choose the language your team wants to develop in for the workshop implementation.</p>
            <div className="track-switcher">
              <button className={selectedTrack === 'python' ? 'selected' : ''} type="button" onClick={() => setSelectedTrack('python')}>
                <FiCommand /> Python
              </button>
              <button className={selectedTrack === 'typescript' ? 'selected' : ''} type="button" onClick={() => setSelectedTrack('typescript')}>
                <FiCode /> TypeScript
              </button>
            </div>
            <div className="track-details">
              {selectedTrack === 'python' ? (
                <>
                  <h4>FastAPI starter</h4>
                  <p>Use TACFastAPIServer callbacks and focus only on bot behavior in TODO stubs.</p>
                </>
              ) : (
                <>
                  <h4>Node starter</h4>
                  <p>Use TACServer callbacks and evolve message handlers into workshop-specific experiences.</p>
                </>
              )}
            </div>
            <div className="status-chips">
              <span className="chip good">Webhook online</span>
              <span className="chip good">Twiml route online</span>
              <span className="chip warn">AI logic pending</span>
            </div>

            {/* <div className="command-deck-block">
              <div className="surface-head">
                <h3>Workshop command deck</h3>
              </div>
              <div className="command-grid">
                {commandDeck.map((item) => (
                  <div key={item.label} className="command-card">
                    <p>{item.label}</p>
                    <code>{item.command}</code>
                  </div>
                ))}
              </div>
            </div> */}
          </section>

          <section id="checklist" className="surface checklist-surface span-two">
            <div className="surface-head">
              <h3>Setup checklist</h3>
              <span>{doneCount}/{totalSteps}</span>
            </div>
            <p className="module-intro">
              Once you have forked the workshop repository, follow this checklist to complete setup and get your team ready to build.
            </p>
            <div className="checklist">
              {checklist.map((item) => {
                const done = completedSteps.has(item.id)
                return (
                  <div key={item.id} className={`check-row ${done ? 'done' : ''}`}>
                    <div className="check-main">
                      <div className="check-title-row">
                        <span className="check-icon" aria-hidden="true">{done ? <FiCheckCircleIcon /> : <FiCircleIcon />}</span>
                        <span className="check-title">{item.label}</span>
                        {item.headerChips?.map((chip) => (
                          <span key={chip} className="check-title-chip">{chip}</span>
                        ))}
                      </div>
                      <ul className="check-details">
                        {item.details.map((detail, index) => {
                          const detailKey = `${item.id}-${index}`
                          const command = detail.command
                          return (
                          <li key={detailKey}>
                            {detail.chips && (
                              <span className="inline-env-chips" aria-label="Environment variables">
                                {detail.chips.map((chip) => (
                                  <span key={chip} className="env-chip">{chip}</span>
                                ))}
                              </span>
                            )}
                            <span>{detail.text} </span>
                            {detail.linkHref && detail.linkLabel ? (
                              <a
                                href={detail.linkHref}
                                target="_blank"
                                rel="noreferrer"
                                className="check-link"
                                title="Opens in a new tab"
                              >
                                {detail.linkLabel}
                              </a>
                            ) : null}
                            {command ? (
                              <div className="check-command-block">
                                <code>{command}</code>
                                <button
                                  type="button"
                                  className="copy-command-btn"
                                  onClick={() => copyCommand(command, detailKey)}
                                >
                                  {copiedDetailKey === detailKey ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            ) : null}
                          </li>
                        )})}
                      </ul>
                    </div>
                    <button
                      className={`check-toggle ${done ? 'done' : ''}`}
                      type="button"
                      onClick={() => toggleStep(item.id)}
                    >
                      {done ? 'Completed' : 'Mark done'}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section id="runtime-flow" className="surface span-two narrative">
            <div className="surface-head">
              <h3>Starter runtime flow</h3>
            </div>
            <p className="module-intro">
              Status map for current starter implementation.
              <span className="flow-legend-chip done">Done</span>
              <span className="flow-legend-chip todo">TODO</span>
              <span className="flow-legend-chip ext">External</span>
            </p>
            <div className="flow-svg-wrap" aria-live="polite">
              {runtimeFlowError ? (
                <p className="flow-render-note">{runtimeFlowError}</p>
              ) : runtimeFlowSvg ? (
                <div className="flow-svg" dangerouslySetInnerHTML={{ __html: runtimeFlowSvg }} />
              ) : (
                <p className="flow-render-note">Rendering diagram...</p>
              )}
            </div>
          </section>

          <section id="modules" className="surface span-two narrative">
            <div className="surface-head">
              <h3>Twilio Conversations modules</h3>
            </div>
            <p className="module-intro">
              Required modules are already wired in the starter tracks. Optional modules can be layered in by teams to extend functionality.
            </p>

            <h4 className="module-group-title">Required (Base implementation)</h4>
            <div className="module-grid">
              {requiredModules.map((module) => (
                <article key={module.name} className="module-card required">
                  <div className="module-head">
                    <h5>{module.name}</h5>
                    <span className="module-badge required">Required</span>
                  </div>
                  <p>{module.description}</p>
                  {module.video ? (
                    <button
                      type="button"
                      className="module-video-btn"
                      onClick={() => setActiveVideo(module.video ?? null)}
                    >
                      <FiPlayCircle /> Watch video
                    </button>
                  ) : null}
                  <a
                    href={module.href}
                    target="_blank"
                    rel="noreferrer"
                    className="module-link"
                    title="Opens in a new tab"
                    aria-label={`${module.name} docs (opens in a new tab)`}
                  >
                    Open docs <FiExternalLink />
                    <span className="link-meta">opens in new tab</span>
                  </a>
                </article>
              ))}
            </div>

            <h4 className="module-group-title">Optional (Extension ideas)</h4>
            <div className="module-grid">
              {optionalModules.map((module) => (
                <article key={module.name} className="module-card optional">
                  <div className="module-head">
                    <h5>{module.name}</h5>
                    <span className="module-badge optional">Optional</span>
                  </div>
                  <p>{module.description}</p>
                  <p className="when-use">When to use: {module.whenToUse}</p>
                  {module.video ? (
                    <button
                      type="button"
                      className="module-video-btn"
                      onClick={() => setActiveVideo(module.video ?? null)}
                    >
                      <FiPlayCircle /> Watch video
                    </button>
                  ) : null}
                  <a
                    href={module.href}
                    target="_blank"
                    rel="noreferrer"
                    className="module-link"
                    title="Opens in a new tab"
                    aria-label={`${module.name} docs (opens in a new tab)`}
                  >
                    Open docs <FiExternalLink />
                    <span className="link-meta">opens in new tab</span>
                  </a>
                </article>
              ))}
            </div>

          </section>

          <section id="prompt-starter" className="surface span-two narrative">
            <div className="surface-head">
              <h3>Prompt and personality starter</h3>
            </div>
            <p className="module-intro">
              Unsure of where to start with giving your agent a personality? Use this template as your system prompt or instruction layer, then tailor it for your team use case.
            </p>
            <div className="prompt-starter-block">
              <pre>{promptStarterTemplate}</pre>
              <button type="button" className="copy-command-btn" onClick={copyPromptStarter}>
                {copiedPromptStarter ? 'Copied' : 'Copy prompt starter'}
              </button>
            </div>
          </section>

          <section id="playbook" className="surface span-two narrative">
            <div className="surface-head">
              <h3>Common issues</h3>
            </div>
            <p className="module-intro">Fast troubleshooting for the issues that most often block teams during build time.</p>
            <div className="playbook-grid">
              {troubleshootingPlaybook.map((item) => (
                <article key={item.issue} className="playbook-card">
                  <h4>{item.issue}</h4>
                  <p>{item.fix}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="judging" className="surface span-two">
            <div className="surface-head">
              <h3>Judging criteria</h3>
            </div>
            <p className="module-intro">Total score: 100 points</p>
            <div className="rubric-sections" aria-label="Judging rubric sections">
              {judgingRubric.map((section) => (
                <article key={section.section} className="rubric-section-card">
                  <div className="rubric-section-head">
                    <h4>{section.section}</h4>
                    <span>{section.totalPoints} points</span>
                  </div>
                  <ul className="rubric-criteria-list">
                    {section.criteria.map((criterion) => (
                      <li key={criterion.item}>
                        <span>{criterion.item}</span>
                        <strong>{criterion.points}</strong>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <div className="rubric-tiebreakers" aria-label="Tie-breakers">
              <h4>Tie-breakers</h4>
              <ul>
                {tieBreakers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </section>
      </main>

      {showCompletionModal ? (
        <div className="completion-modal-backdrop" role="presentation" onClick={() => setShowCompletionModal(false)}>
          <section
            className="completion-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="completion-kicker">Checklist complete</p>
            <h3 id="completion-title">Nice work. Your workshop environment is ready.</h3>
            <p>
              Next, start shaping how your agent responds and how it should behave.
            </p>
            <ul className="completion-next-list">
              <li>Build out richer response logic in the agent handlers beyond the starter defaults.</li>
              <li>Add a clear personality and tone for the agent using your system prompt or instruction layer.</li>
              <li>Test a few user intents end-to-end and refine prompts and responses until they feel consistent.</li>
              <li>Expand further by adding voice interactions, conversation memory, and an intelligence service for deeper insights.</li>
            </ul>
            <div className="completion-code-pointers" aria-label="Where to edit in code">
              <h4>Where to edit in code ({selectedTrack === 'python' ? 'Python' : 'TypeScript'} track)</h4>
              <ul>
                {codeEditPointers.map((pointer) => (
                  <li key={pointer.title}>
                    <strong>{pointer.title}:</strong>
                    <span className="code-pointer-path">{pointer.path}</span>
                    <span className="code-pointer-target">{pointer.target}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="completion-actions">
              <button type="button" className="modal-btn secondary" onClick={() => setShowCompletionModal(false)}>
                Stay on checklist
              </button>
              <button type="button" className="modal-btn primary" onClick={openDocsNext}>
                Open docs next
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {activeVideo ? (
        <div className="video-modal-backdrop" role="presentation" onClick={() => setActiveVideo(null)}>
          <section
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="video-modal-head">
              <h3 id="video-modal-title">{activeVideo.title}</h3>
              <button type="button" className="video-modal-close" onClick={() => setActiveVideo(null)} aria-label="Close video">
                Close
              </button>
            </div>
            <div className="video-frame-wrap">
              <iframe
                src={activeVideo.embedUrl}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function FiCheckCircleIcon() {
  return <span className="glyph done"><FiCheck /></span>
}

function FiCircleIcon() {
  return <span className="glyph" />
}

export default App
