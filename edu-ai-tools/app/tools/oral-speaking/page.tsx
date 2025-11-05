"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizonal, MessageSquare, Trash, Plus, Headset } from "lucide-react";

interface Message {
  id: number;
  role: "bot" | "user";
  content: string;
}

export default function OralSpeakingArea() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "bot", content: "Hello! Ready to start your oral speaking practice?" },
    { id: 2, role: "user", content: "Yes, let's begin!" },
  ]);

  const [histories, setHistories] = useState([
    { id: 1, title: "Practice 1 - Travel Topic" },
    { id: 2, title: "Practice 2 - Technology Topic" },
    { id: 3, title: "Practice 3 - Education Topic" },
  ]);

  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentConversation, setCurrentConversation] = useState<number>(1);

  const handleSubmit = () => {
    if (!input.trim() && !selectedFile) return;

    const newMessage: Message = {
      id: Date.now(),
      role: "user",
      content: selectedFile ? `📎 Attached file: ${selectedFile.name}` : input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSelectedFile(null);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "bot", content: "That's an interesting response! Let's continue." },
      ]);
    }, 1000);
  };

  const handleClear = () => {
    setInput("");
    setSelectedFile(null);
  };

  const handleSelectConversation = (id: number) => {
    setCurrentConversation(id);
    // Replace this with actual fetch logic later
    setMessages([
      { id: 1, role: "bot", content: `Loaded content for Practice ${id}. Let's start!` },
      { id: 2, role: "user", content: "Okay, I’m ready." },
    ]);
  };

  const startNewPractice = () => {
    const newId = histories.length + 1;
    const newHistory = { id: newId, title: `Practice ${newId} - New Topic` };
    setHistories([newHistory, ...histories]);
    setCurrentConversation(newId);
    setMessages([{ id: 1, role: "bot", content: "Welcome to your new speaking practice!" }]);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Headset className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Oral Speaking Area</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Practice your oral speaking skills through interactive conversation. You can chat, upload audio or text, and
          revisit past practices anytime.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side — Chat Window and History */}
        <div className="space-y-6">
          {/* Chat Window (Replaces Essay Settings) */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Practice Topic</CardTitle>
              <CardDescription>Conversation between tutor AI and you</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4 bg-muted/20 rounded-lg p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "bot"
                      ? "bg-primary/10 text-left self-start"
                      : "bg-green-600 text-white text-right self-end ml-auto"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Conversation History (Replaces Grammar Check) */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
              <CardDescription>Your previous oral speaking sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {histories.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectConversation(item.id)}
                  className={`cursor-pointer p-3 rounded border ${
                    currentConversation === item.id
                      ? "bg-primary text-white border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  } transition`}
                >
                  {item.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Side — Input & Buttons */}
        <div className="space-y-6">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Input Area</CardTitle>
              <CardDescription>Type your response or attach a file to reply</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 space-y-4">
              <Textarea
                placeholder="Type your answer or describe your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-h-[300px]"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer flex items-center space-x-2">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Attach file</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">📎 {selectedFile.name}</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleClear}>
                    <Trash className="h-4 w-4 mr-1" /> Clear All
                  </Button>
                  <Button onClick={handleSubmit}>
                    <SendHorizonal className="h-4 w-4 mr-1" /> Submit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Practice */}
          <Button onClick={startNewPractice} className="w-full" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Start New Practice
          </Button>
        </div>
      </div>
    </div>
  );
}