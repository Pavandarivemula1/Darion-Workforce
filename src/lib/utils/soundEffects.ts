/**
 * High-fidelity Enterprise Audio Sound Effects Engine
 * Built using Web Audio API (Zero external assets required, zero latency, ultra-lightweight)
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null
  private ringInterval: any = null
  private isCurrentlyRinging = false
  private unlocked = false

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio()
        window.removeEventListener('click', unlock)
        window.removeEventListener('touchstart', unlock)
        window.removeEventListener('keydown', unlock)
      }
      window.addEventListener('click', unlock, { once: true })
      window.addEventListener('touchstart', unlock, { once: true })
      window.addEventListener('keydown', unlock, { once: true })
    }
  }

  public unlockAudio(): void {
    try {
      const ctx = this.getContext()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      this.unlocked = true
    } catch {
      // Ignored
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {})
      }
      return this.ctx
    } catch {
      return null
    }
  }

  /**
   * Check if sound is enabled by user preference
   */
  public isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return false
    const pref = localStorage.getItem('push_sound_enabled')
    return pref === null ? true : pref === 'true'
  }

  /**
   * Crisp, modern "Message Sent" pop/swoosh (like Apple iMessage & Telegram)
   */
  public playMessageSentSound(): void {
    if (!this.isSoundEnabled()) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime

      // 1. Subtle upward swoosh chirp
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.07)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.1)

      // 2. High sparkle click
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(1320, now + 0.04)
      gain2.gain.setValueAtTime(0.08, now + 0.04)
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.start(now + 0.04)
      osc2.stop(now + 0.12)
    } catch {
      // Ignored if audio blocked
    }
  }

  /**
   * Pleasant, crystal-clear Incoming Notification chime (Apple / Slack style chord)
   */
  public playNotificationSound(): void {
    if (!this.isSoundEnabled()) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(587.33, now)
      gain1.gain.setValueAtTime(0.2, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.22)

      // Note 2: A5 (880.00 Hz)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880.0, now + 0.09)
      gain2.gain.setValueAtTime(0.25, now + 0.09)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.09)
      osc2.stop(now + 0.38)

      // Note 3: D6 (1174.66 Hz) Harmonic overtone
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.type = 'sine'
      osc3.frequency.setValueAtTime(1174.66, now + 0.16)
      gain3.gain.setValueAtTime(0.18, now + 0.16)
      gain3.gain.exponentialRampToValueAtTime(0.0005, now + 0.5)
      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      osc3.start(now + 0.16)
      osc3.stop(now + 0.5)
    } catch {
      // Ignored if audio blocked
    }
  }

  /**
   * Meeting / Urgent Live Invite chime
   */
  public playMeetingAlertSound(): void {
    if (!this.isSoundEnabled()) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime
      const notes = [659.25, 783.99, 987.77, 1318.51] // E5 -> G5 -> B5 -> E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.07)
        gain.gain.setValueAtTime(0.22, now + i * 0.07)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.28)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.07)
        osc.stop(now + i * 0.07 + 0.28)
      })
    } catch {
      // Ignored
    }
  }

  /**
   * Play single burst of LOUD, rich enterprise incoming call ringtone
   */
  private playIncomingRingBurst(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime

      // Part A: First High-Clarity Polyphonic Ring (Double pulse)
      const ringChord = (startTime: number, duration: number) => {
        const freqs = [587.33, 880.0, 1174.66, 1760.0] // D5, A5, D6, A6 (Loud & resonant)
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
          osc.frequency.setValueAtTime(freq, startTime)

          // LOUD GAIN for ringing alert
          const targetVol = idx === 0 ? 0.35 : idx === 1 ? 0.45 : idx === 2 ? 0.3 : 0.15
          gain.gain.setValueAtTime(targetVol, startTime)
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.start(startTime)
          osc.stop(startTime + duration)
        })
      }

      // First ring burst (0.8s)
      ringChord(now, 0.75)
      // Second ring burst (0.8s) after 0.25s gap
      ringChord(now + 0.32, 0.85)
    } catch {
      // Ignored
    }
  }

  /**
   * Start looping Loud Incoming Call Ringtone
   */
  public startRingingIncoming(): void {
    if (!this.isSoundEnabled()) return
    this.stopRinging()
    this.isCurrentlyRinging = true
    this.unlockAudio()

    this.playIncomingRingBurst()
    this.ringInterval = setInterval(() => {
      if (this.isCurrentlyRinging) {
        this.playIncomingRingBurst()
      }
    }, 2200)
  }

  /**
   * Play single burst of outgoing ringback tone ("tuuuut...")
   */
  private playOutgoingRingbackBurst(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime
      const freqs = [440, 480] // Standard telecommunications tone
      freqs.forEach((f) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, now)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 1.3)
      })
    } catch {
      // Ignored
    }
  }

  /**
   * Start looping Outgoing Call Ringback Tone
   */
  public startRingingOutgoing(): void {
    if (!this.isSoundEnabled()) return
    this.stopRinging()
    this.isCurrentlyRinging = true
    this.unlockAudio()

    this.playOutgoingRingbackBurst()
    this.ringInterval = setInterval(() => {
      if (this.isCurrentlyRinging) {
        this.playOutgoingRingbackBurst()
      }
    }, 3000)
  }

  /**
   * Stop any active ringer loop
   */
  public stopRinging(): void {
    this.isCurrentlyRinging = false
    if (this.ringInterval) {
      clearInterval(this.ringInterval)
      this.ringInterval = null
    }
  }

  /**
   * Play Call Disconnected / Ended 3-pip tone
   */
  public playCallEndedSound(): void {
    this.stopRinging()
    if (!this.isSoundEnabled()) return
    const ctx = this.getContext()
    if (!ctx) return

    try {
      this.unlockAudio()
      const now = ctx.currentTime
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(480, now + i * 0.16)
        gain.gain.setValueAtTime(0.2, now + i * 0.16)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.16)
        osc.stop(now + i * 0.16 + 0.1)
      }
    } catch {
      // Ignored
    }
  }
}

export const soundEffects = new SoundEffectsEngine()
