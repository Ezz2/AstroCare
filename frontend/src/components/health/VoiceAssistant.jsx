/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || ''

const STATUS_COPY = {
  idle: 'Tap the microphone to start speaking.',
  listening: 'Listening...',
  processing: 'Processing your voice...',
  completed: 'Measurements extracted successfully.',
  not_understood: "I couldn't understand your measurements. Please say that again.",
  permission_denied: 'Microphone permission was denied. Please check your browser settings.',
  backend_unavailable: 'Unable to connect to the voice assistant. Please try again.',
  recording_failed: 'The recording could not be completed. Please try again.',
}

const MEASUREMENT_KEYS = {
  heart_rate: 'heartRate',
  spo2: 'spo2',
  systolic_bp: 'systolic',
  diastolic_bp: 'diastolic',
  body_temperature: 'temperature',
  blood_glucose: 'glucose',
  sleep_duration: 'sleep',
}

function recordingMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
    .find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

export default function VoiceAssistant({
  onMeasurementsExtracted,
  onVoiceError,
  onStartListening,
  onStopListening,
}) {
  const [status, setStatus] = useState('idle')
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    mediaRecorderRef.current = null
  }

  const reportError = (nextStatus, message) => {
    setStatus(nextStatus)
    onVoiceError?.(message || STATUS_COPY[nextStatus])
  }

  const processRecording = async (blob) => {
    if (!API_BASE_URL) {
      reportError('backend_unavailable')
      return
    }

    const formData = new FormData()
    const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'mp4' : 'webm'
    formData.append('audio', blob, `astrocare-recording.${extension}`)

    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/v1/voice/parse`, {
        method: 'POST',
        body: formData,
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.detail || 'The voice assistant request failed.')
      }
      if (!result?.success || !result.measurements) {
        reportError('not_understood', result?.message)
        return
      }

      const extracted = Object.entries(result.measurements).reduce((mapped, [key, value]) => {
        const field = MEASUREMENT_KEYS[key]
        if (field && value !== null && value !== undefined) mapped[field] = String(value)
        return mapped
      }, {})
      onMeasurementsExtracted?.(extracted)
      setStatus('completed')
    } catch {
      reportError('backend_unavailable')
    }
  }

  const startListening = async () => {
    if (mediaRecorderRef.current || status === 'processing') return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      reportError('recording_failed')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = recordingMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      chunksRef.current = []
      streamRef.current = stream
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        releaseStream()
        reportError('recording_failed')
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' })
        chunksRef.current = []
        releaseStream()
        if (!blob.size) {
          reportError('recording_failed')
          return
        }
        setStatus('processing')
        await processRecording(blob)
      }
      recorder.start()
      setStatus('listening')
      onStartListening?.()
    } catch (error) {
      releaseStream()
      reportError(error.name === 'NotAllowedError' ? 'permission_denied' : 'recording_failed')
    }
  }

  const stopListening = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') return
    recorder.stop()
    onStopListening?.()
  }

  const toggleListening = () => {
    if (status === 'listening') {
      stopListening()
      return
    }
    if (status !== 'processing') startListening()
  }

  useEffect(() => () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop()
    releaseStream()
  }, [])

  const isListening = status === 'listening'
  const isProcessing = status === 'processing'
  const isMessage = !['idle', 'listening'].includes(status)

  return (
    <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-3 sm:p-4">
      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          aria-pressed={isListening}
          disabled={isProcessing}
          className={`relative mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
            isListening
              ? 'bg-cyan-400 text-space-950 shadow-lg shadow-cyan-400/30'
              : 'bg-space-800 text-cyan-300'
          } cursor-pointer transition duration-200 hover:scale-105 hover:border hover:border-cyan-300/60 hover:bg-space-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 disabled:cursor-wait disabled:opacity-70`}
        >
          {isListening && <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />}
          {isProcessing ? <Loader2 size={21} className="animate-spin" /> : <Mic size={21} />}
        </button>
        <p className={`text-sm font-medium ${isMessage ? 'text-amber-300' : 'text-ink-100'}`}>
          {STATUS_COPY[status]}
        </p>

        {isListening && (
          <div className="mt-2 flex h-6 items-center gap-1" aria-label="Voice waveform">
            {[3, 6, 10, 16, 11, 7, 13, 5, 9].map((height, index) => (
              <span
                key={index}
                className="w-1 rounded-full bg-cyan-300 animate-pulse"
                style={{ height: `${height * 1.5}px`, animationDelay: `${index * 60}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
