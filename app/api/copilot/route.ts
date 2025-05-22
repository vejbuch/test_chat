import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { supabase } from "../../../lib/supabase";
import { NextRequest } from "next/server";

const copilotKit = new CopilotRuntime();

copilotKit.action(
  "searchCars",
  "Najde auta podle dotazu uživatele",
  async ({ input }: { input: string }) => {
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
  }
);

const adapter = new OpenAIAdapter({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4", // nebo "gpt-3.5-turbo"
});

export async function POST(req: NextRequest) {
  return copilotKit.streamHttpServerResponse(req, adapter);
}
