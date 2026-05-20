'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Loader } from 'lucide-react'
import { ToolPage } from '@/components/layout/ToolPage'

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userContext: {
            chatHistory: messages,
            mood: 3,
            pendingTopics: [],
          },
          mode: 'general',
        }),
      })

      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'AI request failed')
      }
      const assistantMessage = {
        role: 'assistant',
        content: data.reply ?? 'No response.',
        citations: data.citations,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to get response. Try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolPage title="AI Assistant" description="Scheduling advice, resources, and study help">
        <div className="flex h-[420px] flex-col rounded-lg border border-[rgba(55,53,47,0.09)] bg-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Ask me anything about your studies or schedule!</p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#37352f] text-white'
                      : 'bg-[rgba(55,53,47,0.06)] text-[#37352f]'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 text-xs">
                      {msg.citations.map((cite: any, i: number) => (
                        <a
                          key={i}
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block underline hover:opacity-80"
                        >
                          📚 {cite.source}: {cite.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                  <Loader className="w-4 h-4 animate-spin inline" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-[rgba(55,53,47,0.12)] px-4 py-2 text-sm outline-none focus:border-[#2383e2]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#37352f] p-2 text-white hover:bg-[#2f2d28] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: 'Smart Scheduling', prompt: 'Help me schedule my day optimally', desc: 'AI scheduling advice' },
            { label: 'Find Resources', prompt: 'Find resources to learn about …', desc: 'Reddit, YouTube & more' },
            { label: 'Create Flashcards', prompt: 'Generate flashcards from my notes', desc: 'From your notes' },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setInput(item.prompt)}
              className="rounded-lg border border-[rgba(55,53,47,0.09)] p-4 text-left transition-colors hover:bg-[rgba(55,53,47,0.04)]"
            >
              <p className="font-medium text-[#37352f]">{item.label}</p>
              <p className="mt-1 text-sm text-[rgba(55,53,47,0.55)]">{item.desc}</p>
            </button>
          ))}
        </div>
    </ToolPage>
  )
}
