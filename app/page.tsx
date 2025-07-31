import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Trophy, Users, Brain, Scissors, Library, Mic, MessageSquare, Target } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-xl">Debatica</div>
            <div className="text-white/80 text-xs uppercase tracking-wider">DEBATICA</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Revolutionize Your Debate Game
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          AI-powered tools to streamline prep, improve speeches and optimize round strategy. 
          Join thousands of debaters already winning with intelligent preparation.
        </p>
        <Link href="/auth/signin">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4">
            Join Now
          </Button>
        </Link>
      </section>

      {/* Feature Badges */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
          <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 px-6 py-3 text-base">
            <Zap className="w-5 h-5 mr-2" />
            10x Faster Prep
          </Badge>
          <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 px-6 py-3 text-base">
            <Trophy className="w-5 h-5 mr-2" />
            Strategic Advice
          </Badge>
          <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-white/20 px-6 py-3 text-base">
            <Users className="w-5 h-5 mr-2" />
            Innovative Features
          </Badge>
        </div>
      </section>

      {/* Powerful Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Powerful Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Rebuttal Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Generate strategic rebuttals based on round analysis
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Scissors className="w-5 h-5 mr-2" />
                Smart Card Cutter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Automatically extract and format evidence from sources
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Library className="w-5 h-5 mr-2" />
                Case Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Organize and strategize with intelligent case management
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Extemp Prep
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Real-time research and speech preparation assistance
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Speech Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Enhance clarity and persuasion for lay judges
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Flow Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Strategic round analysis and optimization
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center">
        <p className="text-white/60">
          © 2024 Debatica. All rights reserved.
        </p>
      </footer>
    </div>
  )
} 