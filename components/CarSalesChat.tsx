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
        description: "Dotaz uživatele jako např. 'Model 3 červená'",
      },
    ],
  });

  return (
    <CopilotSidebar
      instructions="Pomáhej najít auta z databáze."
      defaultOpen
    />
  );
}
