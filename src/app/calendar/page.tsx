'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ToolPage } from '@/components/layout/ToolPage'

export default function CalendarPage() {
  const [events, setEvents] = useState<{ id: number; title: string; date: string; time: string }[]>([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const addEvent = () => {
    if (title && date && time) {
      setEvents([...events, { id: Date.now(), title, date, time }])
      setTitle('')
      setDate('')
      setTime('')
    }
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
  )

  const inputClass =
    'rounded-md border border-[rgba(55,53,47,0.12)] px-3 py-2 text-sm outline-none focus:border-[#2383e2]'

  return (
    <ToolPage title="Calendar" description="Schedule study sessions, exams, and deadlines">
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-[rgba(55,53,47,0.09)] bg-[#f7f6f3] p-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Event title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
        <button
          type="button"
          onClick={addEvent}
          className="flex items-center justify-center gap-2 rounded-md bg-[#37352f] px-4 py-2 text-sm text-white hover:bg-[#2f2d28]"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-lg border border-[rgba(55,53,47,0.09)] px-4 py-3 hover:bg-[rgba(55,53,47,0.02)]"
          >
            <div>
              <h3 className="font-medium text-[#37352f]">{event.title}</h3>
              <p className="text-sm text-[rgba(55,53,47,0.55)]">
                {event.date} at {event.time}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEvents(events.filter((e) => e.id !== event.id))}
              className="text-[rgba(55,53,47,0.4)] hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <p className="py-12 text-center text-sm text-[rgba(55,53,47,0.45)]">
          No events yet. Add your first study session above.
        </p>
      )}
    </ToolPage>
  )
}
