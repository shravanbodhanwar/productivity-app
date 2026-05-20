'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { ToolPage } from '@/components/layout/ToolPage'

export default function TimerPage() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [totalTime, setTotalTime] = useState(25)
  const modeRef = useRef(mode)
  const sessionsRef = useRef(sessions)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])
  useEffect(() => {
    sessionsRef.current = sessions
  }, [sessions])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1
        setMinutes((m) => {
          if (m > 0) return m - 1
          setIsRunning(false)
          if (modeRef.current === 'work') {
            setMode('break')
            setTotalTime(5)
            return 5
          }
          setMode('work')
          setTotalTime(25)
          setSessions(sessionsRef.current + 1)
          return 25
        })
        return 59
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const resetTimer = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setMinutes(25)
      setTotalTime(25)
    } else {
      setMinutes(5)
      setTotalTime(5)
    }
    setSeconds(0)
  }

  const progressPercent = ((totalTime * 60 - (minutes * 60 + seconds)) / (totalTime * 60)) * 100
  const strokeColor = mode === 'work' ? '#37352f' : '#2383e2'

  return (
    <ToolPage title="Focus Timer" description="Pomodoro sessions to stay in the zone">
      <div className="flex flex-col items-center">
        <p className="mb-6 text-sm text-[rgba(55,53,47,0.55)]">
          {mode === 'work' ? 'Work session' : 'Break'} · Completed: {sessions}
        </p>

        <div className="relative mb-8 h-56 w-56">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(55,53,47,0.08)" strokeWidth="2" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray={`${(progressPercent / 100) * 282.6} 282.6`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-5xl font-light tabular-nums text-[#37352f]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 rounded-md bg-[#37352f] px-6 py-2.5 text-sm text-white hover:bg-[#2f2d28]"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="flex items-center gap-2 rounded-md border border-[rgba(55,53,47,0.12)] px-6 py-2.5 text-sm hover:bg-[rgba(55,53,47,0.04)]"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMinutes(25)
              setSeconds(0)
              setTotalTime(25)
              setMode('work')
              setIsRunning(false)
            }}
            className="rounded-md px-4 py-2 text-sm hover:bg-[rgba(55,53,47,0.06)]"
          >
            Work (25m)
          </button>
          <button
            type="button"
            onClick={() => {
              setMinutes(5)
              setSeconds(0)
              setTotalTime(5)
              setMode('break')
              setIsRunning(false)
            }}
            className="rounded-md px-4 py-2 text-sm hover:bg-[rgba(55,53,47,0.06)]"
          >
            Break (5m)
          </button>
        </div>
      </div>
    </ToolPage>
  )
}
