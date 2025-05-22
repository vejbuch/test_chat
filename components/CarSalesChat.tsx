"use client";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";

export function CarSalesChat() {
  // Definujeme akci pro vyhledávání aut
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
      // Zde bude vaše skutečná logika vyhledávání
      return `Vyhledávám Tesla vozidla pro: "${searchTerm}"`;
    },
  });

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Tesla Asistent</h1>
      
      <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden">
        <CopilotChat
          instructions={`Jste asistent na stránce kde lidi inzerují ojeté Tesly. Pomáháte lidem najít správné auto podle jejich požadavků. 
DŮLEŽITÉ: Když uživatel hledá auto, VŽDY použijte funkci "searchCars" s parametrem "searchTerm".
UPOZRNĚNÍ: Nedomlouvej žádné schůzky a drž se pouze toho, že jsi asistent vyhledávání aut na Teslist.cz, kde jsou inzeráty lidí na ojeté Tesly.
ZÁKAZY: Neřeš nic jiného než je zde popsáno, pokud nevíš, tak napiš že nevíš a NEVYMÝŠLEJ SI!`}
          
          labels={{
            title: "Tesla Asistent",
            initial: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
            placeholder: "Napište zprávu…"
          }}
          
          className="h-full"
        />
      </div>
    </div>
  );
}
