import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { runLLM, streamLLM } from '@/lib/llm/router'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { feature, mode, projectId, caseId, userInput, extra } = await request.json()

    // Load the appropriate prompt file
    const promptPath = path.join(process.cwd(), 'prompts', `${feature}.md`)
    let systemPrompt: string
    
    try {
      console.log('Loading prompt file:', promptPath)
      systemPrompt = await fs.readFile(promptPath, 'utf-8')
      console.log('Prompt loaded successfully, length:', systemPrompt.length)
    } catch (error) {
      console.error('Error loading prompt file:', error)
      return NextResponse.json({ error: `Prompt file not found: ${promptPath}` }, { status: 404 })
    }

    // Get user's default mode if not specified
    if (!mode) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { settings: true }
      })
      const defaultMode = user?.settings?.defaultModel || 'light'
      mode = defaultMode
    }

    // Create conversation record
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        projectId,
        feature,
        mode,
      }
    })

    // Add user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: userInput,
      }
    })

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          
          for await (const chunk of streamLLM({
            mode,
            systemPrompt,
            userInput,
            stream: true,
          })) {
            fullResponse += chunk
            controller.enqueue(new TextEncoder().encode(chunk))
          }

          // Add assistant message
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              role: 'assistant',
              content: fullResponse,
            }
          })

          // Create feature note if caseId is provided
          if (caseId) {
            await prisma.featureNote.create({
              data: {
                caseId,
                feature,
                input: { userInput, extra },
                result: { response: fullResponse },
                modelUsed: mode,
              }
            })
          }

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('LLM API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 