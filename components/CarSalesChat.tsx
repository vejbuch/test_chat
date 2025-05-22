"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function CarSalesChat() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
    },
  ]);

  const handleSend = () => {
    if (!userInput.trim()) return;
    const newMessages = [
      ...chatHistory,
      { role: "user", content: userInput },
      {
        role: "assistant",
        content: `(${userInput}) → Tady by přišla odpověď od Copilota...`,
      },
    ];
    setChatHistory(newMessages);
    setUserInput("");
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-muted px-4 py-8">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col border shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="flex flex-col flex-1 p-6 space-y-4 overflow-y-auto">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 text-sm max-w-[75%] whitespace-pre-line ${
                msg.role === "assistant"
                  ? "bg-gray-100 text-left self-start"
                  : "bg-blue-600 text-white text-right self-end ml-auto"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </CardContent>

        <div className="border-t px-6 py-4 flex gap-2 bg-white">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Napište zprávu…"
            className="flex-1"
          />
          <Button onClick={handleSend}>Odeslat</Button>
        </div>
      </Card>

      {/* Skrytý CopilotChat */}
      <div className="hidden">
        <CopilotChat
          instructions={`Jste asistent na stránce kde lidi inzerují ojeté Tesly...`}
          labels={{
            title: "Tesla Asistent",
            initial: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
          }}
        />
      </div>
    </div>
  );
}
