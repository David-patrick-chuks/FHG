import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Mail, BarChart3, ArrowRight, Play, Send, Target, Bot, Users, Shield, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-subtle-float"></div>
        <div
          className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-subtle-float"
          style={{ animationDelay: "4s" }}
        ></div>

        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <Badge
            variant="secondary"
            className="mb-6 px-6 py-2 text-sm font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Enterprise Email Marketing Platform
          </Badge>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight tracking-tight">
            Build Intelligent Email Campaigns <br />
            <span className="gradient-text">That Actually Convert</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto text-pretty leading-relaxed">
            Create AI-powered email bots that deliver personalized campaigns at scale. Automate outreach, optimize
            engagement, and drive measurable results with enterprise-grade email marketing automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              asChild
            >
              <a href="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 px-8 py-3 text-base font-semibold transition-all duration-300 group bg-transparent"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Users className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-xl font-bold text-foreground">50,000+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Mail className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-xl font-bold text-foreground">99.9%</div>
                <div className="text-sm text-muted-foreground">Deliverability</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Shield className="w-6 h-6 text-primary" />
              <div className="text-left">
                <div className="text-xl font-bold text-foreground">GDPR</div>
                <div className="text-sm text-muted-foreground">Compliant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-2 text-sm font-semibold border-primary/30 text-primary bg-primary/5"
            >
              Platform Features
            </Badge>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Everything You Need for <span className="gradient-text">Email Success</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered tools designed for marketing teams who demand results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">
                  AI Email Bot Builder
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Create intelligent email bots that learn from your campaigns and automatically optimize messaging,
                  timing, and personalization for maximum engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">
                  Smart Audience Targeting
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Advanced segmentation and behavioral targeting that identifies your highest-value prospects and
                  delivers personalized messages at the perfect moment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">
                  Automated Campaigns
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Build sophisticated drip campaigns and follow-up sequences that nurture leads automatically with
                  AI-powered timing optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">Advanced Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Real-time performance tracking with detailed insights into opens, clicks, conversions, and ROI across
                  all your campaigns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">
                  Deliverability Optimization
                </CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Enterprise-grade infrastructure with automatic spam testing and delivery optimization to ensure inbox
                  placement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-background">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold font-heading text-foreground">CRM Integrations</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  Seamless integrations with popular CRMs and marketing tools to sync data and create unified customer
                  experiences.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section id="automation" className="py-20 md:py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From setup to success in minutes. Our AI handles the complexity while you focus on results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-2xl font-bold text-primary-foreground">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-heading">Import Your Contacts</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your email lists or connect your CRM. Our AI automatically segments and analyzes your audience
                for optimal engagement.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-heading">Create AI Email Bots</h3>
              <p className="text-muted-foreground leading-relaxed">
                Design personalized email sequences with our drag-and-drop builder. AI suggests optimal content and
                timing for each recipient.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto shadow-sm">
                  <span className="text-2xl font-bold text-primary-foreground">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4 font-heading">Watch Results Grow</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor real-time analytics as campaigns automatically optimize. Track opens, clicks, conversions, and
                revenue growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 md:py-24 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Trusted by <span className="gradient-text">Marketing Leaders</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              See how businesses are transforming their email marketing with AI-powered automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border shadow-sm bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold"
                  >
                    300% ROI Increase
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "FHG AI transformed our email marketing completely. Open rates increased 150% and conversions tripled
                  within the first month. The AI personalization is incredible."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground font-heading">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Marketing Director, TechStart Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold"
                  >
                    99.2% Deliverability
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "The deliverability optimization is outstanding. We went from 70% inbox placement to 99.2%. The
                  automated A/B testing saves us hours while improving results."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground font-heading">Mike Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Growth Manager, E-commerce Plus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold"
                  >
                    20hrs/week Saved
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "What used to take our team 20 hours per week now runs automatically. The AI handles segmentation,
                  timing, and personalization better than we ever could manually."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground font-heading">Amanda Lee</p>
                    <p className="text-sm text-muted-foreground">CMO, Digital Agency Pro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="cta" className="py-20 md:py-24 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Ready to <span className="gradient-text">Transform</span> Your Email Marketing?
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses using AI-powered email automation to increase conversions, save time, and grow
            revenue. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <a href="/signup">Start Free Trial</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary/30 hover:bg-primary/5 hover:border-primary/50 px-8 py-3 text-base font-semibold transition-all duration-300 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing section remains unchanged */}
      <section id="pricing" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-chart-2/10"></div>
        <div className="container mx-auto max-w-5xl text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Email Marketing?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses using AI-powered email automation to increase conversions, save time, and grow
            revenue. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-xl"
              asChild
            >
              <a href="/signup">Start Free Trial</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/5 px-8 py-4 text-lg font-semibold bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-foreground">FHG AI Email Bot</span>
                  <div className="text-sm text-muted-foreground">Intelligent Email Marketing</div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Empowering businesses with AI-driven email marketing automation that delivers personalized experiences
                and measurable results at scale.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Email Automation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    AI Bot Builder
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Analytics Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    API Access
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog & Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FHG AI Email Bot. All rights reserved. Intelligent email marketing automation platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
