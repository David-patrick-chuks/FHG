"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Brain,
  Users,
  BarChart3,
  TrendingUp,
  Search,
  Bell,
  Settings,
  LogOut,
  Plus,
  Filter,
  Eye,
  Target,
  Award,
  Database,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("fhg_auth_token")
    const userData = localStorage.getItem("fhg_user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("fhg_auth_token")
    localStorage.removeItem("fhg_user")
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading intelligence platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">FHG AI Scouting</span>
              <div className="text-xs text-muted-foreground font-medium">Intelligence Hub</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hover:bg-primary/5">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-primary/5">
              <Settings className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden md:block">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-chart-2/10 rounded-2xl p-8 border border-border/50">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Welcome to Intelligence Command, {user.username}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your comprehensive sports intelligence dashboard for elite talent discovery and analysis.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <span>Active Intelligence Session</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-chart-2" />
                <span>Real-time Data Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-accent" />
                <span>AI Analytics Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Active Intelligence Agents</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">247</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-chart-2 font-semibold">+12%</span> network expansion
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Intelligence Reports</CardTitle>
              <BarChart3 className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">1,429</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-chart-2 font-semibold">+8%</span> analysis volume
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Elite Prospects</CardTitle>
              <Award className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">89</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-chart-2 font-semibold">+23%</span> identification rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Prediction Accuracy</CardTitle>
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">97.8%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-chart-2 font-semibold">+2.1%</span> model improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Intelligence Reports */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Latest Intelligence Reports</CardTitle>
                    <CardDescription className="text-base">
                      AI-powered talent assessments and predictive analytics
                    </CardDescription>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Marcus Rodriguez",
                      position: "Point Guard",
                      rating: 94,
                      status: "Elite Prospect",
                      team: "UCLA Bruins",
                      trend: "Rising",
                    },
                    {
                      name: "Elena Chen",
                      position: "Forward",
                      rating: 91,
                      status: "High Priority",
                      team: "Stanford Cardinal",
                      trend: "Stable",
                    },
                    {
                      name: "James Thompson",
                      position: "Center",
                      rating: 88,
                      status: "Under Analysis",
                      team: "Duke Blue Devils",
                      trend: "Emerging",
                    },
                    {
                      name: "Sarah Williams",
                      position: "Guard",
                      rating: 92,
                      status: "Elite Prospect",
                      team: "UConn Huskies",
                      trend: "Rising",
                    },
                  ].map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 border border-border/50 rounded-xl bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{player.name}</p>
                          <p className="text-muted-foreground">
                            {player.position} • {player.team}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="font-bold text-foreground text-lg">{player.rating}/100</p>
                          <Badge
                            variant={player.status === "Elite Prospect" ? "default" : "secondary"}
                            className={
                              player.status === "Elite Prospect"
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent/10 text-accent"
                            }
                          >
                            {player.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="hover:bg-primary/5">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Operations */}
          <div className="space-y-6">
            {/* Command Center */}
            <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Intelligence Operations</CardTitle>
                <CardDescription>Strategic analysis and discovery tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Advanced Talent Search
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Add Intelligence Target
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  <Filter className="w-4 h-4 mr-3" />
                  Filter Analysis Results
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent border-primary/20 hover:bg-primary/5"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Predictive Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Elite Rankings */}
            <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Elite Performance Rankings</CardTitle>
                <CardDescription>Top-rated prospects this intelligence cycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Alex Rodriguez", rating: 96, change: "+3", rank: 1 },
                    { name: "Maria Santos", rating: 94, change: "+1", rank: 2 },
                    { name: "Kevin Park", rating: 92, change: "+5", rank: 3 },
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{player.rank}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{player.name}</p>
                          <p className="text-sm text-muted-foreground">Intelligence Rating: {player.rating}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                        {player.change}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
