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

    // Enhance user input with file content if available
    let enhancedUserInput = userInput
    if (extra?.connectedFiles && extra.connectedFiles.length > 0) {
      const fileContents = extra.connectedFiles.map((file: any) => {
        if (file.content && file.content !== 'No content available') {
          return `\n\n--- FILE: ${file.name} ---\n${file.content}\n--- END FILE ---`
        }
        return `\n\n--- FILE: ${file.name} ---\n[File content could not be extracted]\n--- END FILE ---`
      }).join('\n')
      
      enhancedUserInput = `${userInput}\n\n${fileContents}`
      console.log(`Enhanced user input with ${extra.connectedFiles.length} file(s), total length: ${enhancedUserInput.length}`)
    }

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
      mode = 'light' // Default to light mode for now
    }

    // For now, skip database operations to avoid foreign key issues
    // TODO: Implement proper user management and database operations
    let conversationId = null

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          
          for await (const chunk of streamLLM({
            mode,
            systemPrompt,
            userInput: enhancedUserInput,
            stream: true,
          })) {
            fullResponse += chunk
            controller.enqueue(new TextEncoder().encode(chunk))
          }

          // Add assistant message (skipped for now due to database issues)
          // await prisma.message.create({
          //   data: {
          //     conversationId: conversation.id,
          //     role: 'assistant',
          //     content: fullResponse,
          //   }
          // })

          // Create feature note if caseId is provided (skipped for now)
          // if (caseId) {
          //   await prisma.featureNote.create({
          //     data: {
          //       caseId,
          //       feature,
          //       input: { userInput, extra },
          //       result: { response: fullResponse },
          //       modelUsed: mode,
          //     }
          //   })
          // }

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
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('PrismaClient')) {
        errorMessage = 'Database error - please check configuration'
      } else if (error.message.includes('API key')) {
        errorMessage = 'API key configuration error'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 