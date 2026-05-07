"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 🚀 App always opens at: /login
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-pulse text-gray-400 font-medium">Redirecting...</div>
    </div>
  );
}
