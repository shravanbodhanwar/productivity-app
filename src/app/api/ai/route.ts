import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

type ChatMessage = { role?: string; content?: string; parts?: { text: string }[] }

function toGeminiHistory(messages: ChatMessage[] = []) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
    .map((m) => {
      const text =
        m.content ??
        (Array.isArray(m.parts) ? m.parts.map((p) => p.text).join('') : '')
      if (!text) return null
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      }
    })
    .filter(Boolean) as { role: string; parts: { text: string }[] }[]
}

export async function POST(req: Request) {
  if (!genAI) {
    return Response.json(
      {
        error:
          'AI is not configured. Add GEMINI_API_KEY in Vercel/Render environment variables.',
      },
      { status: 500 }
    )
  }

  try {
    const { message, userContext, mode } = await req.json()

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(userContext, mode),
    })

    const history = toGeminiHistory(userContext?.chatHistory ?? [])
    const chat = model.startChat({ history })

    const result = await chat.sendMessage(message)
    const text = result.response.text()

    return Response.json({ reply: text, citations: [] })
  } catch (error: unknown) {
    console.error('Gemini API error:', error)
    const err = error as { status?: number; message?: string }

    if (err.status === 429) {
      return Response.json(
        { error: 'Rate limit reached. Try again in a moment.' },
        { status: 429 }
      )
    }

    return Response.json(
      { error: err.message || 'AI service unavailable' },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(userContext: Record<string, unknown> | undefined, mode: string): string {
  const basePrompt = `You are StudyFlow AI, a personal study and productivity assistant. Be concise and helpful.`

  if (mode === 'schedule') {
    return `${basePrompt}
Help the user schedule study sessions optimally.
Peak hours: ${userContext?.peakHours || 'not specified'}
Mood: ${userContext?.mood || 'neutral'}/5
Pending topics: ${(userContext?.pendingTopics as string[])?.join(', ') || 'none'}`
  }

  if (mode === 'flashcard') {
    return `${basePrompt}
Generate flashcards from study notes.
Return ONLY valid JSON:
{"flashcards":[{"question":"...","answer":"...","difficulty":1}]}`
  }

  if (mode === 'search') {
    return `${basePrompt}
Recommend learning resources (YouTube, articles, courses). Cite sources when possible.`
  }

  return `${basePrompt}
Context:
- Last note: "${userContext?.lastNote || 'none'}"
- Mood: ${userContext?.mood || 'neutral'}/5`
}
