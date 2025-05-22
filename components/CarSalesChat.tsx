"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCopilotAction, useCopilotChat } from "@copilotkit/react-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

export function CarSalesChat() {
  const [userInput, setUserInput] = useState("");
  // Všechny zprávy (včetně té úvodní) teď přicházejí z hooku:
  const { messages, appendMessage, isLoading } = useCopilotChat();

  // Registrace “funkce” pro vyhledání aut
  useCopilotAction({
    name: "searchCars",
    description: "Vyhledá Tesla auta podle zadaných kritérií",
    parameters: [
      {
        name: "searchTerm",
        type: "string",
        description: "Vyhledávací termín pro nalezení aut",
        required: true,
      },
    ],
    handler: async ({ searchTerm }) => {
      return `Vyhledávám Tesla vozidla pro: "${searchTerm}"`;
    },
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const text = userInput.trim();
    setUserInput("");

    // Vytvoříme správný TextMessage, který appendMessage akceptuje
    const userMsg = new TextMessage({
      content: text,
      role: Role.User,
    });

    // Odešleme zprávu – hook sám přidá uživatelskou i asistentovu odpověď do `messages`
    await appendMessage(userMsg);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Tesla Asistent</h1>

      <Card className="flex-1 overflow-y-auto space-y-2 p-4 bg-gray-50">
        <CardContent className="space-y-4">
          {/*
            Vykreslíme všechny textové zprávy,
            role zjistíme přes msg.role (Role.Assistant | Role.User)
          */}
          {messages
            .filter((msg) => msg.type === "text")
            .map((msg, idx) => (
              <div
                key={msg.id ?? idx}
                className={`max-w-[75%] p-3 rounded-xl text-sm ${
                  msg.role === Role.Assistant
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading}>
          {isLoading ? "..." : "Odeslat"}
        </Button>
      </div>

      {/* 
        Skrytý CopilotChat provider + instrukce, 
        aby engine věděl, jak má odpovídat a volat `searchCars`
      */}
      <div className="hidden">
        <CopilotChat
          instructions={`
Jste asistent na stránce kde lidi inzerují ojeté Tesly. Pomáháte lidem najít
správné auto podle jejich požadavků.

DŮLEŽITÉ: Když uživatel hledá auto, VŽDY použijte funkci "searchCars" s parametrem "searchTerm".
UPOZORNĚNÍ: Nedomlouvej žádné schůzky a drž se pouze toho, že jsi asistent vyhledávání aut na Teslist.cz.
ZÁKAZY: Neřeš nic jiného než je zde popsáno, pokud nevíš, tak napiš že nevíš a NEVYMÝŠLEJ SI!
          `}
          labels={{
            title: "Tesla Asistent",
            initial: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
          }}
        />
      </div>
    </div>
  );
}
