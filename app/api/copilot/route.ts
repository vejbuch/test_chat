import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// 1. Vytvoř runtime s adapterem
const runtime = new CopilotRuntime({
  adapter: new OpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4",
  }),
});

// 2. Definuj akce přímo při inicializaci runtime
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

// 3. Vytvoř handler pro Next.js API route
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilot",
  });

  return handleRequest(req);
};
