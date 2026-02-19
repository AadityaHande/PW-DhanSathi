'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  Bell,
  Wallet,
  Shield,
  BarChart3,
  Github,
  Twitter,
  Linkedin,
  ChevronRight,
  Menu,
  Goal,
  Users,
  Database,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "@/components/layout/LanguageSelector";
import LanguageSelectorMobile from "@/components/layout/LanguageSelectorMobile";

// Placeholder for a chart component to make the UI more representative
const PlaceholderChart = ({ color, title }: { color: string, title: string }) => (
  <div className="rounded-2xl border border-border bg-card p-6 h-48 flex flex-col justify-between">
    <p className="font-semibold text-muted-foreground">{title}</p>
    <div className="flex items-end h-full w-full gap-2">
      <div style={{ backgroundColor: color }} className="w-1/4 h-[60%] rounded-t-sm"></div>
      <div style={{ backgroundColor: color, opacity: 0.8 }} className="w-1/4 h-[40%] rounded-t-sm"></div>
      <div style={{ backgroundColor: color, opacity: 0.6 }} className="w-1/4 h-[75%] rounded-t-sm"></div>
      <div style={{ backgroundColor: color, opacity: 0.4 }} className="w-1/4 h-[50%] rounded-t-sm"></div>
    </div>
  </div>
);

export default function LandingPage() {
  const { toast } = useToast();
  const { connectWallet, isConnecting } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = async () => {
    if (isMenuOpen) setIsMenuOpen(false);
    try {
      await connectWallet();
      toast({ title: "Wallet Connected!", description: "Redirecting to dashboard..." });
    } catch (error) {
      toast({ variant: "destructive", title: "Connection Failed", description: error instanceof Error ? error.message : "Could not connect wallet." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
              <span className="text-xl font-bold">DhanSathi</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            </nav>
            <div className="hidden md:flex items-center space-x-3">
              {mounted && <LanguageSelector />}
              <Button onClick={handleConnect} disabled={isConnecting} className="bg-primary hover:bg-primary/90">
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
            <div className="-mr-2 flex md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">Features</a>
              <a href="#analytics" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">Analytics</a>
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">About</a>
            </div>
            <div className="border-t border-border px-2 pt-4 pb-3 sm:px-3 space-y-3">
              <div className="px-1"><LanguageSelectorMobile /></div>
              <Button onClick={handleConnect} disabled={isConnecting} className="w-full flex items-center justify-center">
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 mb-8 bg-secondary/50">
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm text-muted-foreground">Discipline-as-a-Service on Algorand</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="text-primary">Achieve Your Savings Goals</span><br />
              <span className="text-foreground">with Smart Contracts</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
             DhanSathi transforms saving from a challenge into a commitment. Enforce your own savings rules with Algorand smart contracts and reach your goals without relying on willpower.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleConnect} disabled={isConnecting} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                {isConnecting ? "Connecting..." : "Get Started"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why DhanSathi?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Traditional savings methods fail because they lack structure. We provide the discipline required to succeed.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors text-center">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 mx-auto"><BarChart3 className="h-6 w-6 text-blue-400" /></div>
                    <h3 className="text-xl font-semibold mb-3">AI-Powered Analytics</h3>
                    <p className="text-muted-foreground">Get personalized insights and recommendations to optimize your savings strategy.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors text-center">
                    <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-6 mx-auto"><Shield className="h-6 w-6 text-pink-400" /></div>
                    <h3 className="text-xl font-semibold mb-3">Smart Contract Security</h3>
                    <p className="text-muted-foreground">Your funds are secured by Algorand smart contracts, enforcing your own savings rules.</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-colors text-center">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6 mx-auto"><Bell className="h-6 w-6 text-amber-400" /></div>
                    <h3 className="text-xl font-semibold mb-3">Intelligent Alerts</h3>
                    <p className="text-muted-foreground">Receive smart notifications to stay on track and celebrate milestones.</p>
                </div>
            </div>
          </div>
        </section>

        <section id="analytics" className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Visualize Your Progress</h2>
              <p className="text-muted-foreground text-lg">Track your spending patterns and watch your savings grow with AI-powered insights.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <PlaceholderChart title="Spending Breakdown" color="hsl(var(--chart-1))" />
              <PlaceholderChart title="Savings Growth" color="hsl(var(--chart-2))" />
              <PlaceholderChart title="Goal Progress" color="hsl(var(--chart-3))" />
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">About Us</h2>
             <p className="text-muted-foreground text-lg">
              DhanSathi was built to solve a simple problem: saving money is hard. We provide students and young professionals with a powerful commitment device to instill financial discipline. By leveraging the security and automation of the Algorand blockchain, we make it easier than ever to set, enforce, and achieve your financial goals. 
             </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto py-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><Sparkles className="h-5 w-5 text-primary-foreground" /></div>
                <span className="text-xl font-bold">DhanSathi</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 max-w-md">A decentralized application (DApp) that transforms a simple savings goal tracker into a powerful commitment device on the Algorand blockchain.</p>
              <div className="flex space-x-4">
                 <a href="#" className="text-muted-foreground hover:text-foreground"><Github className="h-6 w-6" /></a>
                 <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-6 w-6" /></a>
                 <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-6 w-6" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#analytics" className="text-muted-foreground hover:text-foreground">Analytics</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2024 DhanSathi. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <span className="text-sm font-semibold text-primary">Algorand</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
