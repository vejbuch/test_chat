"use client";

import { CopilotChat } from "@copilotkit/react-ui";

export function CarSalesChat() {
  return (
    <div className="h-full">
      <CopilotChat
        instructions={`Jste asistent pro prodej Tesla aut. Pomáháte lidem najít správné auto podle jejich požadavků. 

DŮLEŽITÉ: Když uživatel hledá auto, VŽDY použijte funkci "searchCars" s parametrem "searchTerm".

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
  );
}
