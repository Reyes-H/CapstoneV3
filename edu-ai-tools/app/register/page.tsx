"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (password1 !== password2) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: password1 }),
      });

      const data = await response.json();

      if (data.state === 200) {
        setIsError(false);
        setMessage("🎉 Registration successful! Redirecting to login...");
        // redirect after short delay
        setTimeout(() => router.push("/"), 1500);
      } else {
        setIsError(true);
        setMessage(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setIsError(true);
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 px-4">
    
        {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/background-image.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-lg w-full max-w-md shadow-xl border border-white/30">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create New Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-white mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1 text-left">
              Confirm Password
            </label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re‑enter password"
              required
            />
          </div>

          {message && (
            <p
              className={`text-center mt-2 ${
                isError ? "text-red-400" : "text-green-300"
              }`}
            >
              {message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Register
          </Button>

          {/* Back to login */}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full bg-white/30 text-white hover:bg-white/50 mt-3"
          >
            Back to Login Page
          </Button>
        </form>
      </div>
    </div>
  );
}