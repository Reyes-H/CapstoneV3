"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PenTool,
  Home,
  Menu,
  X,
  Headset,
  CircleGauge,
} from "lucide-react";

const tools = [
  {
    name: "Writing Practicing Area",
    href: "/tools/writing-practicing",
    icon: PenTool,
    description: "For IELTS Writing Section",
  },
  {
    name: "Oral Speaking Area",
    href: "/tools/oral-speaking",
    icon: Headset,
    description: "For IELTS Speaking Section",
  },
  {
    name: "Personal Dashboard",
    href: "/tools/personal-dashboard",
    icon: CircleGauge,
    description: "History & Personal Ability",
  },
];

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Handle Logout
  const handleLogout = () => {
    // remove username from localStorage
    localStorage.removeItem("username");
    // redirect to home (login) page
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-semibold">Log Out</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                Available Tools
              </h3>
            </div>

            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname === tool.href;

              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{tool.name}</div>
                    <div
                      className={cn(
                        "text-xs truncate",
                        isActive
                          ? "text-sidebar-primary-foreground/80"
                          : "text-sidebar-foreground/60",
                      )}
                    >
                      {tool.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">
              HKU Capstone Project
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}