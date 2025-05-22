"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";

export function CarSalesChat() {
  // Registrace akce na frontendu
  useCopilotAction({
    name: "searchCars",
    description: "Najde auta podle dotazu uživatele",
    parameters: [
      {
        name: "query",
        type: "string", 
        description: "Vyhledávací dotaz pro auta"
      }
    ],
    handler: async ({ query }) => {
      // Tato funkce se volá automaticky CopilotKit
      console.log("Frontend: searching for", query);
      return { message: "Hledám auta..." };
    }
  });

  return (
    <div className="h-full">
      <CopilotChat
        instructions="Jste asistent pro prodej aut Tesla. Pomáháte lidem najít správné auto podle jejich požadavků. Když uživatel hledá auto, použijte funkci searchCars s jejich dotazem."
        labels={{
          title: "Tesla Asistent",
          initial: "Ahoj! Jak vám mohu pomoci najít perfektní Tesla?",
        }}
      />
    </div>
  );
}
