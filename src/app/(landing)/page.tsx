"use client";

import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  Bell,
  Wallet,
  Shield,
  BarChart3,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  ChevronRight,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const { toast } = useToast();
  const { activeAddress, connectWallet, isConnecting } = useWallet();

  // Note: Redirect is handled by the parent page.tsx, not here
  // This prevents double-redirect loops

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected!",
        description: "Redirecting to dashboard...",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect wallet.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DhanSathi</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 mb-8 bg-secondary/50">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm text-muted-foreground">AI-Powered Financial Management</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-primary">Track Your Finances</span>
            <br />
            <span className="text-foreground">with AI-Powered Insights</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Smart budget tracking, real-time analytics, and automated alerts when you reach your limit.
            Secure your savings on the Algorand blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              {isConnecting ? "Connecting..." : "Get Started"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
            <p className="text-muted-foreground">
              Get personalized insights and recommendations powered by advanced AI algorithms
            </p>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your spending patterns and savings goals with real-time updates
            </p>
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6">
              <Bell className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Intelligent Alerts</h3>
            <p className="text-muted-foreground">
              Receive smart notifications about your financial health and opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Smart Analytics</h2>
          <p className="text-muted-foreground text-lg">Track your spending patterns with AI-powered insights</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Monthly Spending Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Monthly Spending</h3>
                <p className="text-sm text-muted-foreground">Last 30 days activity</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex items-end justify-between h-32 gap-1">
              {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, ${
                      i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#f472b6' : '#fbbf24'
                    }, ${
                      i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#ec4899' : '#f59e0b'
                    })`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Budget Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Budget Overview</h3>
                <p className="text-sm text-muted-foreground">Monthly budget tracking</p>
              </div>
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Shopping</span>
                  <span className="text-muted-foreground">₹450 / ₹600</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-3/4 rounded-full bg-blue-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Bills</span>
                  <span className="text-muted-foreground">₹850 / ₹1000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-[85%] rounded-full bg-green-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Entertainment</span>
                  <span className="text-muted-foreground">₹200 / ₹300</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-2/3 rounded-full bg-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Savings Goals Card */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Savings Goals</h3>
                <p className="text-sm text-muted-foreground">Progress tracking</p>
              </div>
              <TrendingUp className="h-5 w-5 text-pink-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Emergency Fund</span>
                  <span className="text-muted-foreground">₹8000 / ₹10000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-4/5 rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vacation</span>
                  <span className="text-muted-foreground">₹2500 / ₹5000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-1/2 rounded-full bg-amber-500" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New Laptop</span>
                  <span className="text-muted-foreground">₹15000 / ₹30000</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-full w-1/2 rounded-full bg-cyan-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold">₹12,580 <span className="text-sm text-primary">+8.2%</span></p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">₹2,420 <span className="text-sm text-red-400">-4.3%</span></p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Status</p>
                <p className="text-2xl font-bold">On Track <span className="text-sm text-primary">92%</span></p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">4/5 <span className="text-sm text-primary">+1</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">DhanSathi</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                Transform your financial journey with AI-powered insights and blockchain security.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#analytics" className="hover:text-foreground transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><a href="#about" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 DhanSathi. All rights reserved.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Powered by</span>
                <span className="text-sm font-semibold text-primary">Algorand</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
