import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { category, answers } = await req.json()

  if (!category || !Array.isArray(answers) || answers.length !== 4) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const [situation, task, action, result] = answers

  const prompt = `You are helping a student structure a personal experience for scholarship applications using the STAR method.

Category: ${category}

Here are their raw answers:
1. Situation (overview): ${situation}
2. Task (their role): ${task}
3. Action (what they did): ${action}
4. Result (outcome): ${result}

Return a JSON object with exactly these fields:
- title: a concise 5-8 word title for this experience
- situation: a clean 2-3 sentence version of the situation
- task: a clean 1-2 sentence description of their specific role/responsibility
- action: a clean 2-4 sentence description of the concrete actions they took
- result: a clean 1-3 sentence description of outcomes, including any numbers/metrics mentioned
- tags: an array of 4-8 short keyword tags (e.g. "Leadership", "Teamwork", "Communication", "Problem Solving", "STEM", "Community Impact")

Respond with ONLY the raw JSON object, no markdown, no explanation.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    // Strip markdown code fences if present
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      parsed = JSON.parse(match[1].trim())
    } else {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  }

  return NextResponse.json(parsed)
}
