/**
 * WebRTC Configuration and Peer Connection Helpers
 * Pure browser-native WebRTC mesh implementation
 */

export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
}

export interface PeerConnectionHandlers {
  onTrack: (event: RTCTrackEvent, peerId: string) => void
  onIceCandidate: (candidate: RTCIceCandidate, peerId: string) => void
  onConnectionStateChange?: (state: RTCPeerConnectionState, peerId: string) => void
}

/**
 * Creates a configured RTCPeerConnection instance
 */
export function createPeerConnection(
  peerId: string,
  handlers: PeerConnectionHandlers
): RTCPeerConnection {
  const pc = new RTCPeerConnection(ICE_SERVERS)

  pc.ontrack = (event) => {
    handlers.onTrack(event, peerId)
  }

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      handlers.onIceCandidate(event.candidate, peerId)
    }
  }

  pc.onconnectionstatechange = () => {
    handlers.onConnectionStateChange?.(pc.connectionState, peerId)
  }

  return pc
}

/**
 * Creates an audio level detector for active speaker visualization
 */
export function createAudioLevelDetector(
  stream: MediaStream,
  onLevelChange: (level: number) => void
): () => void {
  try {
    const audioTrack = stream.getAudioTracks()[0]
    if (!audioTrack) return () => {}

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioContextClass()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.4

    const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]))
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    let animationFrameId: number
    let isStopped = false

    const checkVolume = () => {
      if (isStopped) return
      analyser.getByteFrequencyData(dataArray)
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length
      // Normalize from 0-100
      const normalizedLevel = Math.min(100, Math.round((average / 128) * 100))
      onLevelChange(normalizedLevel)

      animationFrameId = requestAnimationFrame(checkVolume)
    }

    checkVolume()

    return () => {
      isStopped = true
      cancelAnimationFrame(animationFrameId)
      source.disconnect()
      analyser.disconnect()
      if (audioCtx.state !== 'closed') {
        audioCtx.close()
      }
    }
  } catch (err) {
    console.warn('Audio level detector init failed:', err)
    return () => {}
  }
}

/**
 * Replace outgoing video track (e.g. switching between webcam and screen share)
 * Uses replaceTrack() which doesn't require SDP renegotiation.
 * Falls back to addTransceiver() when no video transceiver exists yet.
 */
export async function replaceVideoTrack(
  pc: RTCPeerConnection,
  newTrack: MediaStreamTrack | null,
  stream?: MediaStream | null
): Promise<{ success: boolean; renegotiateNeeded: boolean }> {
  try {
    // Find existing video transceiver
    const transceivers = typeof pc.getTransceivers === 'function' ? pc.getTransceivers() : []
    const videoTransceiver = transceivers.find(
      (t) =>
        t.sender.track?.kind === 'video' ||
        t.currentDirection === 'sendonly' ||
        t.currentDirection === 'sendrecv' ||
        (t.sender.track === null && t.direction.includes('send'))
    ) || transceivers.find(
      (t) => t.receiver.track?.kind === 'video'
    )

    if (videoTransceiver) {
      // Ensure transceiver is set to send
      if (videoTransceiver.direction !== 'sendrecv' && videoTransceiver.direction !== 'sendonly') {
        videoTransceiver.direction = 'sendrecv'
      }
      // replaceTrack swaps frames without SDP renegotiation - works when transceiver already exists
      await videoTransceiver.sender.replaceTrack(newTrack)
      return { success: true, renegotiateNeeded: false }
    }

    // No video transceiver - need to add one and renegotiate
    if (newTrack) {
      pc.addTransceiver(newTrack, {
        direction: 'sendrecv',
        streams: stream ? [stream] : [],
      })
      return { success: true, renegotiateNeeded: true }
    }

    return { success: false, renegotiateNeeded: false }
  } catch (err) {
    console.warn('replaceVideoTrack failed:', err)
    return { success: false, renegotiateNeeded: false }
  }
}

