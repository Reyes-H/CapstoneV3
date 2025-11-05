"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can later add your authentication logic
    alert(`Logging in as ${username}`);
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/background-image.jpg')`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-24 md:pt-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Capstone Project
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-1.5xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          This platform is designed for IELTS Writing and Speaking practice.
          </p>

          {/* Welcome Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8 border border-white/20">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">Hi, welcome to use!</h2>
            <p className="text-white/80 text-lg">
              Discover powerful AI tools designed to enhance your IELTS writing & speaking level
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white mb-1 text-left">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-1 text-left">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <Link href="/tools">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Login
            </Button>
          </Link>

          {/* Login Button */}
            {/* <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Login
            </button> */}
        </form>
        </div>

        {/* Features Preview */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-8 text-white/70">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl">✍️</span>
              </div>
              <p className="text-sm">Writing Practicing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl">🗣️</span>
              </div>
              <p className="text-sm">Oral Speaking</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl">🎯</span>
              </div>
              <p className="text-sm">Personal Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
