"use client";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";

export function CarSalesChat() {
  useCopilotAction({
    name: "searchCars",
    description: "Najde dostupné inzeráty podle dotazu uživatele",
    parameters: [
      {
        name: "input",
        type: "string",
        description: "Např. Model 3, červená, Long Range"
      }
    ]
  });

  return (
    <CopilotSidebar
      instructions="Pomáhej lidem najít dostupná auta z databáze."
      defaultOpen
    />
  );
}
