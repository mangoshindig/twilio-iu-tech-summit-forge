import confetti from 'canvas-confetti'
import { useEffect, useRef, useState } from 'react'
import {
  FiBookOpen,
  FiCheck,
  FiCheckSquare,
  FiCode,
  FiCommand,
  FiExternalLink,
  FiHome,
  FiList,
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
  const [activeNav, setActiveNav] = useState('overview')
  const [showCompletionModal, setShowCompletionModal] = useState(false)
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
          text: 'Buy a German mobile number',
          linkLabel: 'Twilio Console -> Buy a number',
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
          text: 'Get this value from',
          chips: ['TWILIO_PHONE_NUMBER'],
          linkLabel: 'Twilio Console -> Phone Numbers -> Active numbers',
          linkHref: twilioConsoleLink('phone-numbers/manage/incoming'),
        },
        {
          text: 'Get this value when you create a new configuration at',
          chips: ['TWILIO_CONVERSATION_CONFIGURATION_ID'],
          linkLabel: 'Twilio Conversations Agent Connect setup',
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
          linkLabel: 'Twilio Console -> Conversations Agent Connect setup',
          linkHref: twilioConsoleLink('us1/conversation-orchestrator/overview'),
        },
        { text: 'Set the Messaging webhook on the Conversation Configuration to <NGROK_URL>/webhook.' },
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
    { id: 'modules', label: 'Docs', icon: FiBookOpen },
  ]

  const requiredModules = [
    {
      name: 'Twilio Agent Connect (TAC)',
      description: 'The core runtime for agent experiences in Conversations, including your callback flow in this starter.',
      href: 'https://www.twilio.com/docs/conversations/agent-connect',
    },
    {
      name: 'Conversation Orchestrator',
      description: 'Flow control layer for designing and routing conversation steps across channels and services.',
      href: 'https://www.twilio.com/docs/conversations/orchestrator',
    },
  ]

  const optionalModules = [
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
    },

    {
      name: 'Conversation Memory',
      description: 'Persist contextual state so assistants can retain relevant information across interactions.',
      whenToUse: 'Use when participants need continuity across turns or returning users.',
      href: 'https://www.twilio.com/docs/conversations/memory',
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

        <section id="repo" className="surface repo-section">
          <div className="surface-head">
            <h3>Workshop Repository</h3>
          </div>
          <p className="repo-text">
            Start by forking the workshop repository into your own GitHub account so each team can iterate independently.
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

        <section className="content-grid">
          <section id="tracks" className="surface span-two">
            <div className="surface-head">
              <h3>Track selector</h3>
            </div>
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
