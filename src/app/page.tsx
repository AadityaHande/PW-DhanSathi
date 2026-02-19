"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import { Loader2 } from "lucide-react";
import LandingContent from "./(landing)/page";

// Root page - shows landing if not connected, redirects to dashboard if connected
export default function Home() {
  const router = useRouter();
  const { activeAddress, isConnecting } = useWallet();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isConnecting && activeAddress && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/dashboard");
    }
  }, [activeAddress, isConnecting, router]);

  // Show loading while checking wallet
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If connected, show loading while redirecting
  if (activeAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not connected, show landing page
  return <LandingContent />;
}
