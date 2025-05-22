"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCopilotAction, useCopilotChat } from "@copilotkit/react-core";
// === Přidáno: správné typy z runtime-client-gql ===
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

type ChatHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export function CarSalesChat() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([
    {
      role: "assistant",
      content: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
    },
  ]);

  const { appendMessage } = useCopilotChat();

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
      // Zde byste ideálně volali API pro vyhledání aut.
      return `Vyhledávám Tesla vozidla pro: "${searchTerm}"`;
    },
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const text = userInput.trim();
    setUserInput("");

    // Přidáme zprávu uživatele do lokálního stavu
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    try {
      // Vytvoříme instanci TextMessage kompatibilní s CopilotKit
      const userMsg = new TextMessage({
        content: text,
        role: Role.User,
      });
      // Odešleme zprávu a počkáme na odpověď asistenta
      const assistantMsg = await appendMessage(userMsg);

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: assistantMsg.content },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Promiňte, momentálně nemohu odpovědět. Zkuste to prosím znovu.",
        },
      ]);
    }
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
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend}>Odeslat</Button>
      </div>

      {/* Skrytá komponenta CopilotChat pro zajištění běhu enginu */}
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
