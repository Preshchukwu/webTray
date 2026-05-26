import React from "react";
import { BarChart3, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotificationPage() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100">

      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <h1 className="text-3xl font-bold text-[#111827] mb-3 tracking-tight">
          Notification Page soon!
        </h1>

        <Link href="/dashboard">
          <Button className="rounded-full bg-[#111827] hover:bg-slate-800 text-white px-8 h-11 shadow-sm transition-all">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}