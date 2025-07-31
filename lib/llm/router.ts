import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

export type LLMMode = 'light' | 'medium' | 'hard'

interface LLMRequest {
  mode: LLMMode
  systemPrompt: string
  userInput: string
  stream?: boolean
  temperature?: number
}

interface LLMResponse {
  content: string
  tokens?: number
  latency?: number
}

// Initialize clients
const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export async function runLLM(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now()
  
  try {
    switch (request.mode) {
      case 'light':
        return await runGemini(request, startTime)
      case 'medium':
        if (!openai) {
          throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY for Medium mode.')
        }
        return await runOpenAI(request, 'gpt-4o', startTime)
      case 'hard':
        if (!openai) {
          throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY for Hard mode.')
        }
        return await runOpenAI(request, 'gpt-4o-mini', startTime)
      default:
        throw new Error(`Unknown mode: ${request.mode}`)
    }
  } catch (error) {
    console.error('LLM Error:', error)
    throw error
  }
}

async function runGemini(request: LLMRequest, startTime: number): Promise<LLMResponse> {
  if (!genAI) {
    throw new Error('Google API key not configured. Please set GOOGLE_API_KEY in your environment variables.')
  }
  
  console.log('Running Gemini with mode:', request.mode)
  console.log('System prompt length:', request.systemPrompt.length)
  console.log('User input:', request.userInput)
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  
  const prompt = `${request.systemPrompt}\n\nUser Input: ${request.userInput}`
  
  if (request.stream) {
    try {
      const result = await model.generateContentStream(prompt)
      const response = await result.response
      const text = response.text()
      
      return {
        content: text,
        latency: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Gemini streaming error:', error)
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return {
        content: text,
        latency: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Gemini error:', error)
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

async function runOpenAI(request: LLMRequest, model: string, startTime: number): Promise<LLMResponse> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.')
  }
  
  const temperature = request.temperature ?? (request.mode === 'hard' ? 0.2 : 0.7)
  
  if (request.stream) {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userInput }
      ],
      temperature,
      stream: true,
    })
    
    let content = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        content += delta
      }
    }
    
    return {
      content,
      latency: Date.now() - startTime,
    }
  } else {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userInput }
      ],
      temperature,
    })
    
    return {
      content: completion.choices[0]?.message?.content || '',
      tokens: completion.usage?.total_tokens,
      latency: Date.now() - startTime,
    }
  }
}

export async function* streamLLM(request: LLMRequest): AsyncGenerator<string> {
  const startTime = Date.now()
  
  try {
    switch (request.mode) {
      case 'light':
        yield* streamGemini(request)
        break
      case 'medium':
        if (!openai) {
          throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY for Medium mode.')
        }
        yield* streamOpenAI(request, 'gpt-4o')
        break
      case 'hard':
        if (!openai) {
          throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY for Hard mode.')
        }
        yield* streamOpenAI(request, 'gpt-4o-mini')
        break
      default:
        throw new Error(`Unknown mode: ${request.mode}`)
    }
  } catch (error) {
    console.error('LLM Stream Error:', error)
    throw error
  }
}

async function* streamGemini(request: LLMRequest): AsyncGenerator<string> {
  if (!genAI) {
    throw new Error('Google API key not configured. Please set GOOGLE_API_KEY in your environment variables.')
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const prompt = `${request.systemPrompt}\n\nUser Input: ${request.userInput}`
  
  const result = await model.generateContentStream(prompt)
  
  for await (const chunk of result.stream) {
    const chunkText = chunk.text()
    if (chunkText) {
      yield chunkText
    }
  }
}

async function* streamOpenAI(request: LLMRequest, model: string): AsyncGenerator<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.')
  }
  
  const temperature = request.temperature ?? (request.mode === 'hard' ? 0.2 : 0.7)
  
  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userInput }
    ],
    temperature,
    stream: true,
  })
  
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      yield delta
    }
  }
} 