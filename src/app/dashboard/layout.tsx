"use client";

import { useAppStore } from "@/app/lib/store";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.push("/");
    }
  }, [currentUser, isLoaded, router]);

  if (!isLoaded || !currentUser) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
