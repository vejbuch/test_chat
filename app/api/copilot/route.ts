import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// 1. Vytvoř runtime (bez parametrů!)
const runtime = new CopilotRuntime();

// 2. Definuj akce
runtime.defineActions([
  {
    name: "searchCars",
    description: "Najde auta podle dotazu uživatele",
    parameters: [
      {
        name: "input",
        type: "string",
        description: "Např. Model 3, červená, Long Range",
      },
    ],
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
  },
]);

// 3. Vytvoř adaptér pro OpenAI
const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4", // nebo "gpt-3.5-turbo"
});

// 4. Vrať správný handler
export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: adapter,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
}
