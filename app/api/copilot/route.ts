import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// 1. Vytvoř adaptér pro OpenAI
const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4",
});

// 2. Vytvoř runtime s akcemi
const runtime = new CopilotRuntime();

// 3. Přidej akce pomocí addAction metody (pokud existuje)
runtime.actions = [
  {
    name: "searchCars",
    description: "Najde auta podle dotazu uživatele",
    // Schema pro parametry
    parametersSchema: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "Např. Model 3, červená, Long Range",
        },
      },
      required: ["input"],
    },
    handler: async ({ input }: { input: string }) => {
      const query = input.toLowerCase();
      const { data, error } = await supabase
        .from("inzeraty_s_fotkou")
        .select("*")
        .ilike("display_name", `%${query}%`)
        .limit(5);
      
      if (error) throw error;
      
      return data.map((car) => ({
        title: car.display_name,
        subtitle: `VIN: ${car.vin}`,
        imageUrl: car.photo_url || "",
      }));
    },
  } as any, // Přidat as any pokud TypeScript stále protestuje
];

// 4. Vrať správný handler
export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: adapter,
    endpoint: "/api/copilot",
  });
  
  return handleRequest(req);
}
