'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Bot,
  LogOut,
  Menu,
  Sun,
  Moon,
  TrendingUp,
  X,
  Users,
  Trophy,
} from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";
import LanguageSelectorMobile from "./LanguageSelectorMobile";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals/new", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/advisor", label: "AI Advisor", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();
  const { activeAddress, disconnectWallet } = useWallet();
  const { theme, setTheme } = useTheme();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isActive = (href: string) => {
    if (href === "/goals/new") return pathname.startsWith("/goals") && !pathname.startsWith("/groups");
    if (href === "/groups") return pathname.startsWith("/groups");
    return pathname === href;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = async () => {
    await disconnectWallet();
    setShowDisconnectDialog(false);
  };

  if (!activeAddress) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DhanSathi</span>
          </Link>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <LanguageSelector />
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-9 w-9">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <Button onClick={() => setShowDisconnectDialog(true)} variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary-foreground" /></div>
            <span className="text-lg font-bold">DhanSathi</span>
          </Link>

          <div className="flex items-center space-x-1">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="h-8 w-8">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Menu className="h-5 w-5" /></Button></SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className="font-semibold">Menu</span>
                    <SheetClose asChild><Button variant="ghost" size="icon" className="h-8 w-8"><X className="h-4 w-4" /></Button></SheetClose>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link href={item.href} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors", isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border space-y-3">
                    <div className="p-2 border rounded-md"><LanguageSelectorMobile /></div>
                    <Button onClick={() => { setShowDisconnectDialog(true); }} variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect Wallet
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden safe-area-pb">
        <div className="max-w-7xl mx-auto grid grid-cols-6 h-16">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center gap-0.5 text-xs transition-colors", isActive(item.href) ? "text-primary" : "text-muted-foreground")}>
              <item.icon className={cn("h-4 w-4", isActive(item.href) && "text-primary")} />
              <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      </nav>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle><AlertDialogDescription>Are you sure you want to disconnect? You will need to reconnect to access your data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
