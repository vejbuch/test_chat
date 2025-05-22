import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

const runtime = new CopilotRuntime();
const serviceAdapter = new OpenAIAdapter();

runtime.actions = [
  {
    name: "searchCars",
    description:
      "Najde Tesla auta podle uživatelova dotazu - prohledává typ auta, barvu, verzi, popis, typ nabíjecího portu a další údaje",
    parameters: [] as const, // nutné pro správné předání inputu
    handler: async ({ input }: { input: string }) => {
      try {
        let searchQuery = input?.toLowerCase().trim() || "";

        if (
          !searchQuery ||
          searchQuery === "{}" ||
          searchQuery === "[object object]"
        ) {
          return `Prosím zadejte konkrétní vyhledávací termín pro Tesla auta (např. "Model 3", "červená", "Performance", "CCS2").`;
        }

        let query = supabase.from("inzeraty_s_fotkou").select("*");

        const searchWords = searchQuery
          .split(/\s+/)
          .filter((word) => word.length > 2);

        if (searchWords.length > 0) {
          const orConditions = searchWords.map(
            (word) =>
              `car_type.ilike.%${word}%,exterior_color.ilike.%${word}%,car_version.ilike.%${word}%,verze.ilike.%${word}%,popis.ilike.%${word}%,charge_port_type.ilike.%${word}%`
          );

          query = query.or(orConditions.join(","));
        } else {
          query = query.or(
            `car_type.ilike.%${searchQuery}%,exterior_color.ilike.%${searchQuery}%,car_version.ilike.%${searchQuery}%,verze.ilike.%${searchQuery}%,popis.ilike.%${searchQuery}%,charge_port_type.ilike.%${searchQuery}%`
          );
        }

        const { data, error } = await query.limit(15);

        if (error) {
          console.error("Supabase error:", error);
          return `Chyba při hledání aut: ${error.message}`;
        }

        if (!data || data.length === 0) {
          return `Nenašel jsem žádná Tesla auta pro "${searchQuery}". Zkuste jiný termín jako "Model 3", "Performance", "červená", "CCS2", "Long Range", atd.`;
        }

        const results = data
          .map((car, index) => {
            const parts = [];

            parts.push(`${index + 1}. ${car.car_type || car.verze || "Tesla"}`);
            if (car.exterior_color) parts.push(`${car.exterior_color}`);
            if (car.car_version) parts.push(`${car.car_version}`);

            const details = [];
            if (car.cena) details.push(`${car.cena} ${car.mena || "Kč"}`);
            if (car.year) details.push(`rok ${car.year}`);
            if (car.odometer) details.push(`${car.odometer} km`);
            if (car.soh || car.tessie_soh) {
              const sohValue = car.tessie_soh || car.soh;
              details.push(`SOH ${sohValue}%`);
            }
            if (car.charge_port_type)
              details.push(`${car.charge_port_type} port`);

            let result =
              parts.join(" ") +
              (details.length > 0 ? ` - ${details.join(", ")}` : "");

            if (car.popis) {
              const shortDesc =
                car.popis.length > 100
                  ? car.popis.substring(0, 100) + "..."
                  : car.popis;
              result += `\n   📝 ${shortDesc}`;
            }

            return result;
          })
          .join("\n\n");

        return `Našel jsem ${data.length} Tesla aut pro "${searchQuery}":\n\n${results}`;
      } catch (error: any) {
        console.error("Handler error:", error);
        return `Nastala chyba: ${error.message}`;
      }
    },
  },
];

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
};
