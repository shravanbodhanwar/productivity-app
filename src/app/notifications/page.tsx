'use client'

import { useState } from 'react'
import { Bell, Trash2, Plus } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  const addNotification = () => {
    if (title && time && date) {
      setNotifications([
        ...notifications,
        { id: Date.now(), title, time, date, read: false },
      ])
      setTitle('')
      setTime('')
      setDate('')
    }
  }

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-2 text-yellow-700">Notifications</h1>
        <p className="text-gray-600 mb-8">
          {unread} unread • {notifications.length} total
        </p>

        {/* Add Notification Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Notification message..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={addNotification}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg shadow flex justify-between items-center hover:shadow-lg transition ${
                notif.read ? 'bg-white' : 'bg-yellow-100 border-l-4 border-yellow-500'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <Bell className={`w-5 h-5 ${notif.read ? 'text-gray-400' : 'text-yellow-600'}`} />
                <div>
                  <p className={`font-semibold ${notif.read ? 'text-gray-600' : 'text-gray-800'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-gray-500">{notif.date} at {notif.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No notifications yet. Create your first reminder!</p>
          </div>
        )}
      </div>
    </div>
  )
}
