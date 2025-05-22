"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Tesla Asistent</h1>

      <Card className="flex-1 overflow-y-auto space-y-2 p-4 bg-gray-50">
        <CardContent className="space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] p-3 rounded-xl text-sm ${
                msg.role === "assistant"
                  ? "bg-gray-100 text-left self-start"
                  : "bg-blue-100 text-right self-end ml-auto"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-4">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Napište zprávu…"
          className="flex-1"
        />
        <Button onClick={handleSend}>Odeslat</Button>
      </div>

      {/* Neviditelný CopilotChat pro funkčnost */}
      <div className="hidden">
        <CopilotChat
          instructions={`Jste asistent na stránce kde lidi inzerují ojeté Tesly. Pomáháte lidem najít správné auto podle jejich požadavků.

DŮLEŽITÉ: Když uživatel hledá auto, VŽDY použijte funkci "searchCars" s parametrem "searchTerm".

UPOZRNĚNÍ: Nedomlouvej žádné schůzky a drž se pouze toho, že jsi asistent vyhledávání aut na Teslist.cz, kde jsou inzeráty lidí na ojeté Tesly.

ZÁKAZY: Neřeš nic jiného než je zde popsáno, pokud nevíš, tak napiš že nevíš a NEVYMÝŠLEJ SI!

Příklady použití:
- Pokud uživatel řekne "hledám Model 3" → zavolejte searchCars s searchTerm: "Model 3"
- Pokud uživatel řekne "chci červenou Tesla" → zavolejte searchCars s searchTerm: "červená"
- Pokud uživatel řekne "Model S Long Range" → zavolejte searchCars s searchTerm: "Model S Long Range"

Vždy zavolejte tuto funkci při jakémkoliv dotazu na konkrétní auta.`}
          labels={{
            title: "Tesla Asistent",
            initial: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
          }}
        />
      </div>
    </div>
  );
}
