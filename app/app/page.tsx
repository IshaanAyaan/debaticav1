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
  Loader2
} from 'lucide-react'

const features = [
  {
    id: 'rebuttal',
    name: 'Rebuttal Maker',
    icon: Brain,
    description: 'Generate strategic rebuttals based on round analysis'
  },
  {
    id: 'cardCutter',
    name: 'Card Cutter',
    icon: Scissors,
    description: 'Automatically extract and format evidence from sources'
  },
  {
    id: 'caseLibrary',
    name: 'Case Library',
    icon: Library,
    description: 'Organize and strategize with intelligent case management'
  },
  {
    id: 'extemp',
    name: 'Extemp Prep',
    icon: Mic,
    description: 'Real-time research and speech preparation assistance'
  },
  {
    id: 'wordChoice',
    name: 'Word Choice for Lay',
    icon: MessageSquare,
    description: 'Enhance clarity and persuasion for lay judges'
  },
  {
    id: 'speechCritique',
    name: 'Speech Critique',
    icon: Target,
    description: 'Evaluate efficiency, pacing, and effectiveness'
  },
  {
    id: 'flowOpt',
    name: 'Flow Optimizer',
    icon: Target,
    description: 'Strategic round analysis and optimization'
  }
]

export default function AppPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('rebuttal')
  const [modelMode, setModelMode] = useState<'light' | 'medium' | 'hard'>('light')
  const [connectedFiles, setConnectedFiles] = useState<{[key: string]: Array<{name: string, type: 'file' | 'google', url?: string}>}>({})
  const [additionalPrompts, setAdditionalPrompts] = useState<{[key: string]: string}>({})
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [responses, setResponses] = useState<{[key: string]: string}>({})
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({})
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
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      const newFiles = files.map(file => ({ name: file.name, type: 'file' as const }))
      setConnectedFiles(prev => ({
        ...prev,
        [featureId]: [...(prev[featureId] || []), ...newFiles]
      }))
    }
    input.click()
  }

  const handleGoogleConnect = () => {
    // This would integrate with Google OAuth
    setIsGoogleConnected(true)
  }

  const handleGoogleDocLink = (featureId: string) => {
    const url = prompt('Enter Google Docs/Sheets URL:')
    if (url) {
      setConnectedFiles(prev => ({
        ...prev,
        [featureId]: [...(prev[featureId] || []), { name: 'Google Doc', type: 'google', url }]
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
            connectedFiles: connectedFiles[featureId] || []
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
              className="border-white/30 text-white hover:bg-white/10"
              onClick={handleGoogleConnect}
            >
              <Chrome className="w-4 h-4 mr-2" />
              {isGoogleConnected ? 'Connected' : 'Connect Google'}
            </Button>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
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
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" size="sm">
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
                <div className="flex items-center space-x-2 text-sm text-white/80 hover:bg-white/10 p-2 rounded cursor-pointer">
                  <Folder className="w-4 h-4" />
                  <span>Policy Debate</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-white/80 hover:bg-white/10 p-2 rounded cursor-pointer">
                  <Folder className="w-4 h-4" />
                  <span>Lincoln-Douglas</span>
                </div>
              </div>
            </div>

            {/* Model Mode Selector */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-white">Model Mode</div>
              <div className="space-y-1">
                {[
                  { id: 'light', name: 'Light', desc: 'Gemini 2.5 Flash', available: true },
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
        <div className="flex-1 flex flex-col">
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
              <TabsContent key={feature.id} value={feature.id} className="flex-1 p-6">
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
                    
                    {/* Connected Files Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">Connected Files & Context</h4>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/30 text-white hover:bg-white/10 bg-white/10"
                            onClick={() => handleFileUpload(feature.id)}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Upload Files
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-white/30 text-white hover:bg-white/10 bg-white/10"
                            onClick={() => handleGoogleDocLink(feature.id)}
                          >
                            <Link className="w-3 h-3 mr-1" />
                            Add Google Doc
                          </Button>
                        </div>
                      </div>
                      
                      {/* File List */}
                      <div className="space-y-2">
                        {connectedFiles[feature.id]?.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                            <div className="flex items-center space-x-2">
                              {file.type === 'google' ? (
                                <Chrome className="w-4 h-4 text-green-400" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-400" />
                              )}
                              <span className="text-sm text-white/80">{file.name}</span>
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
                        {(!connectedFiles[feature.id] || connectedFiles[feature.id].length === 0) && (
                          <p className="text-sm text-white/50 italic">No files connected. Add files or Google Docs for context.</p>
                        )}
                      </div>
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
                         className={`border rounded-md p-4 min-h-[200px] max-h-[600px] overflow-y-auto transition-all duration-300 ${
                           responses[feature.id] 
                             ? 'border-green-500/40 bg-green-500/10 shadow-lg shadow-green-500/10' 
                             : 'border-white/20 bg-white/5'
                         }`}
                       >
                         {loadingStates[feature.id] ? (
                           <div className="flex items-center justify-center h-32">
                             <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                           </div>
                         ) : responses[feature.id] ? (
                           <div className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                             {responses[feature.id]}
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
              <div className="text-sm text-white/60 p-2 bg-white/5 rounded border border-white/10">
                Recent conversation will appear here...
              </div>
            </div>
            
            <div className="text-sm font-medium text-white">Version Saves</div>
            <div className="space-y-2">
              <div className="text-sm text-white/60 p-2 bg-white/5 rounded border border-white/10">
                Saved versions will appear here...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 