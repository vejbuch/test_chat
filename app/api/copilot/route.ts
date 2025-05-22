import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// 1. Vytvoř OpenAI instanci
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 2. Vytvoř adaptér s OpenAI instancí
const adapter = new OpenAIAdapter({
  openai,
});

// 3. Vytvoř runtime
const runtime = new CopilotRuntime();

// 4. Definuj akce
runtime.actions = [
  {
    name: "searchCars",
    description: "Najde auta podle dotazu uživatele",
    parameters: [] as any,
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
];

// 5. Vrať správný handler
export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: adapter,
    endpoint: "/api/copilot",
  });
  
  return handleRequest(req);
}
