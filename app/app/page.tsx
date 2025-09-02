'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { 
  Brain, 
  Scissors, 
  Library, 
  Mic, 
  MessageSquare, 
  Target,
  Settings,
  Plus,
  Search,
  Folder,
  User,
  Upload,
  FileText,
  Link,
  Chrome,
  Trash2,
  Loader2,
  Check
} from 'lucide-react'
// import { GoogleDrive } from '@/components/google-drive' // Temporarily disabled

const features = [
  {
    id: 'rebuttal',
    name: 'Rebuttal Maker',
    icon: Brain,
    description: 'Generate strategic rebuttals based on round analysis'
  },
  {
    id: 'card_cutter',
    name: 'Card Cutter',
    icon: Scissors,
    description: 'Automatically extract and format evidence from sources'
  },
  {
    id: 'case_library',
    name: 'Case Library',
    icon: Library,
    description: 'Organize and strategize with intelligent case management'
  },
  {
    id: 'extemp_prep',
    name: 'Extemp Prep',
    icon: Mic,
    description: 'Real-time research and speech preparation assistance'
  },
  {
    id: 'word_choice_lay',
    name: 'Word Choice for Lay',
    icon: MessageSquare,
    description: 'Enhance clarity and persuasion for lay judges'
  },
  {
    id: 'speech_critique',
    name: 'Speech Critique',
    icon: Target,
    description: 'Evaluate efficiency, pacing, and effectiveness'
  },
  {
    id: 'flow_optimizer',
    name: 'Flow Optimizer',
    icon: Target,
    description: 'Strategic round analysis and optimization'
  }
]

export default function AppPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('rebuttal')
  const [modelMode, setModelMode] = useState<'light' | 'medium' | 'hard'>('light')
  const [connectedFiles, setConnectedFiles] = useState<{[key: string]: Array<{name: string, type: 'file' | 'google', url?: string, content?: string, size?: number}>}>({})
  const [additionalPrompts, setAdditionalPrompts] = useState<{[key: string]: string}>({})
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [responses, setResponses] = useState<{[key: string]: string}>({})
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({})
  const [fileProcessingStates, setFileProcessingStates] = useState<{[key: string]: boolean}>({})
  const [selectedProject, setSelectedProject] = useState<string>('policy')
  const outputRefs = useRef<{[key: string]: HTMLDivElement | null}>({})

  // Auto-scroll to bottom when response updates
  useEffect(() => {
    Object.keys(responses).forEach(featureId => {
      const ref = outputRefs.current[featureId]
      if (ref && responses[featureId]) {
        ref.scrollTop = ref.scrollHeight
      }
    })
  }, [responses])

  if (status === 'loading') {
    return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  const handleFileUpload = (featureId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.pdf,.txt,.doc,.docx'
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      
      // Show loading state for file processing
      setFileProcessingStates(prev => ({ ...prev, [featureId]: true }))
      
      try {
        // Process each file to extract content
        const processedFiles = await Promise.all(
          files.map(async (file) => {
            if (file.type === 'application/pdf') {
              try {
                const text = await extractTextFromPDF(file)
                return { 
                  name: file.name, 
                  type: 'file' as const, 
                  content: text,
                  size: file.size
                }
              } catch (error) {
                console.error('Error reading PDF:', error)
                return { 
                  name: file.name, 
                  type: 'file' as const, 
                  content: 'Error reading PDF file',
                  size: file.size
                }
              }
            } else if (file.type === 'text/plain') {
              try {
                const text = await file.text()
                return { 
                  name: file.name, 
                  type: 'file' as const, 
                  content: text,
                  size: file.size
                }
              } catch (error) {
                console.error('Error reading text file:', error)
                return { 
                  name: file.name, 
                  type: 'file' as const, 
                  content: 'Error reading text file',
                  size: file.size
                }
              }
            } else {
              return { 
                name: file.name, 
                type: 'file' as const, 
                content: `File type ${file.type} not supported for text extraction`,
                size: file.size
              }
            }
          })
        )
        
        setConnectedFiles(prev => ({
          ...prev,
          [featureId]: [...(prev[featureId] || []), ...processedFiles]
        }))
        
        // Show success message
        const successCount = processedFiles.filter(f => f.content && f.content !== 'No content available').length
        if (successCount > 0) {
          console.log(`Successfully processed ${successCount} file(s) for ${featureId}`)
        }
      } finally {
        setFileProcessingStates(prev => ({ ...prev, [featureId]: false }))
      }
    }
    input.click()
  }

  // Function to extract text from PDF files
  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          // Send file to server for PDF parsing
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch('/api/parse-pdf', {
            method: 'POST',
            body: formData
          })
          
          if (response.ok) {
            const result = await response.json()
            resolve(result.text || 'No text extracted from PDF')
          } else {
            resolve('Failed to parse PDF on server')
          }
        } catch (error) {
          console.error('PDF parsing error:', error)
          resolve('Error processing PDF file')
        }
      }
      reader.onerror = (error) => {
        console.error('File reading error:', error)
        resolve('Failed to read PDF file')
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const handleGoogleConnect = () => {
    // Google OAuth integration
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your_client_id'}&` +
      `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/callback/google')}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/spreadsheets.readonly')}&` +
      `response_type=code&` +
      `access_type=offline`
    
    window.open(googleAuthUrl, '_blank', 'width=500,height=600')
    setIsGoogleConnected(true)
  }

  const handleGoogleDocLink = (featureId: string) => {
    const url = prompt('Enter Google Docs/Sheets/Slides URL:')
    if (url) {
      let fileName = 'Google Doc'
      if (url.includes('/spreadsheets/')) {
        fileName = 'Google Sheet'
      } else if (url.includes('/presentation/')) {
        fileName = 'Google Slides'
      } else if (url.includes('/document/')) {
        fileName = 'Google Doc'
      }
      
      setConnectedFiles(prev => ({
        ...prev,
        [featureId]: [...(prev[featureId] || []), { name: fileName, type: 'google', url }]
      }))
    }
  }

  const removeFile = (featureId: string, index: number) => {
    setConnectedFiles(prev => ({
      ...prev,
      [featureId]: prev[featureId]?.filter((_, i) => i !== index) || []
    }))
  }

  const handleRunFeature = async (featureId: string) => {
    setLoadingStates(prev => ({ ...prev, [featureId]: true }))
    setResponses(prev => ({ ...prev, [featureId]: '' }))

    try {
      // Prepare file content for the AI
      const filesForAI = (connectedFiles[featureId] || []).map(file => ({
        name: file.name,
        type: file.type,
        content: file.content || 'No content available',
        size: file.size
      }))

      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature: featureId,
          mode: modelMode,
          userInput: additionalPrompts[featureId] || 'Please provide a comprehensive analysis.',
          extra: {
            connectedFiles: filesForAI
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let fullResponse = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        fullResponse += chunk
        setResponses(prev => ({ ...prev, [featureId]: fullResponse }))
      }
    } catch (error) {
      console.error('Error running feature:', error)
      let errorMessage = 'Error: Failed to get response. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Error: Please check your API keys configuration in the .env file.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Error: Unable to connect to the server. Please check your internet connection.'
        } else if (error.message.includes('API key not configured')) {
          errorMessage = 'Error: Google API key not configured. Please set GOOGLE_API_KEY in your .env file for Gemini (Light mode).'
        } else if (error.message.includes('OpenAI API key not configured')) {
          errorMessage = 'Error: OpenAI API key not configured. Please use "Light" mode (Gemini) or add OPENAI_API_KEY to your .env file.'
        }
      }
      
      setResponses(prev => ({ 
        ...prev, 
        [featureId]: errorMessage 
      }))
    } finally {
      setLoadingStates(prev => ({ ...prev, [featureId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
              {/* Top Bar */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-white" />
                <span className="font-bold text-xl text-white">Debatica</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Workspace</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md font-medium"
                onClick={handleGoogleConnect}
              >
                <Chrome className="w-4 h-4 mr-2" />
                {isGoogleConnected ? 'Connected' : 'Connect Google Drive'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/30 border-white/40 text-white hover:bg-white/40 backdrop-blur-md font-medium"
                onClick={() => handleFileUpload('general')}
                disabled={fileProcessingStates['general']}
              >
                {fileProcessingStates['general'] ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </>
                )}
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium">
                Save
              </Button>
            </div>
          </div>
        </div>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Sidebar */}
        <div className="w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-4">
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">{session.user?.name}</div>
                <div className="text-sm text-white/70">{session.user?.email}</div>
              </div>
            </div>

            {/* New Project */}
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
              size="sm"
              onClick={() => {
                const projectName = prompt('Enter project name:')
                if (projectName) {
                  console.log('Creating new project:', projectName)
                  // Here you would typically call an API to create the project
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white placeholder-white/50 backdrop-blur-md"
              />
            </div>

            {/* Folders */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">Projects</div>
              <div className="space-y-1">
                {[
                  { name: 'Policy Debate', id: 'policy' },
                  { name: 'Lincoln-Douglas', id: 'ld' }
                ].map((project) => (
                  <div 
                    key={project.id}
                    className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer transition-colors ${
                      selectedProject === project.id 
                        ? 'bg-white/20 text-white border border-white/30' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <Folder className="w-4 h-4" />
                    <span>{project.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Mode Selector */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">Model Mode</div>
              <div className="space-y-1">
                {[
                  { id: 'light', name: 'Light', desc: 'Gemini 2.0 Flash', available: true },
                  { id: 'medium', name: 'Medium', desc: 'GPT-4o', available: false },
                  { id: 'hard', name: 'Hard', desc: 'GPT-4o-mini', available: false }
                ].map((mode) => (
                  <div
                    key={mode.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm ${
                      modelMode === mode.id 
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-white/30' 
                        : mode.available 
                          ? 'text-white/80 hover:bg-white/10' 
                          : 'text-white/40 cursor-not-allowed'
                    }`}
                    onClick={() => mode.available && setModelMode(mode.id as any)}
                  >
                    <span>{mode.name}</span>
                    <span className="text-xs opacity-75">{mode.desc}</span>
                    {!mode.available && <span className="text-xs text-red-400">(OpenAI Required)</span>}
                  </div>
                ))}
              </div>
              <div className="text-xs text-white/60 italic">
                Only Light mode (Gemini) is available for testing
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto main-content-scrollable">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-white/20 px-6 py-4">
              <TabsList className="grid w-full grid-cols-7 bg-white/10 border border-white/20 h-auto p-1 gap-1">
                {features.map((feature) => (
                  <TabsTrigger 
                    key={feature.id} 
                    value={feature.id} 
                    className="flex flex-col items-center space-y-1 text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20 py-3 px-2 text-xs min-h-[60px]"
                  >
                    <feature.icon className="w-4 h-4" />
                    <span className="text-center leading-tight">{feature.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="p-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <feature.icon className="w-5 h-5" />
                      <span>{feature.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4">{feature.description}</p>
                    
                    {/* Additional Prompt Section */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-white mb-2">
                        Additional Prompt (Optional)
                      </label>
                      <textarea
                        placeholder="Add any specific instructions or context for this feature..."
                        value={additionalPrompts[feature.id] || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdditionalPrompts(prev => ({
                          ...prev,
                          [feature.id]: e.target.value
                        }))}
                        className="w-full bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-md resize-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                        rows={3}
                      />
                    </div>
                    
                    {/* File Upload Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white">Upload Files</h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md"
                          onClick={() => handleFileUpload(feature.id)}
                          disabled={fileProcessingStates[feature.id]}
                        >
                          {fileProcessingStates[feature.id] ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-1" />
                              Upload Files
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {/* Connected Files Display */}
                      {connectedFiles[feature.id] && connectedFiles[feature.id].length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-white/70">Connected Files:</h5>
                          {connectedFiles[feature.id].map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-white/80">{file.name}</span>
                                {file.size && (
                                  <span className="text-xs text-white/50">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/60 hover:text-white hover:bg-white/10"
                                onClick={() => removeFile(feature.id, index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          Mode: {modelMode}
                        </Badge>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          onClick={() => handleRunFeature(feature.id)}
                          disabled={loadingStates[feature.id]}
                        >
                          {loadingStates[feature.id] ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            `Run ${feature.name}`
                          )}
                        </Button>
                        {responses[feature.id] && !loadingStates[feature.id] && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                            onClick={() => setResponses(prev => ({ ...prev, [feature.id]: '' }))}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                                                                    <div 
                         ref={(el) => {
                           outputRefs.current[feature.id] = el
                         }}
                         className={`border rounded-md p-4 min-h-[600px] max-h-[80vh] overflow-y-auto transition-all duration-300 ${
                           responses[feature.id] 
                             ? 'border-green-500/40 bg-green-500/10 shadow-lg shadow-green-500/10' 
                             : 'border-white/20 bg-white/5'
                         }`}
                         style={{
                           scrollbarWidth: 'thin',
                           scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
                         }}
                       >
                         {loadingStates[feature.id] ? (
                           <div className="flex items-center justify-center h-32">
                             <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                           </div>
                         ) : responses[feature.id] ? (
                           <div className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed leading-6 space-y-4">
                             {responses[feature.id].split('\n').map((line, index) => (
                               <div key={index} className="mb-2">
                                 {line}
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-white/60 text-sm">
                             {feature.name} interface will be implemented here...
                           </p>
                         )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white/10 backdrop-blur-md border-l border-white/20 p-4">
          <div className="space-y-4">
            <div className="text-sm font-medium text-white">Conversation History</div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
              >
                Recent conversations will appear here...
              </Button>
            </div>
            
            <div className="text-sm font-medium text-white">Version Saves</div>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white"
              >
                Saved versions will appear here...
              </Button>
            </div>
            
            <div className="text-sm font-medium text-white">Current Project</div>
            <div className="p-3 bg-white/5 rounded border border-white/20">
              <div className="text-sm text-white font-medium">
                {selectedProject === 'policy' ? 'Policy Debate' : 'Lincoln-Douglas'}
              </div>
              <div className="text-xs text-white/60 mt-1">
                Active project for all features
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}