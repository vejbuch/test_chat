import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// @ts-nocheck

const runtime = new CopilotRuntime();
const serviceAdapter = new OpenAIAdapter();

// Definuj akci pomocí registerAction
runtime.registerAction({
  name: "searchCars",
  description: "Najde Tesla auta podle uživatelova dotazu. Zavolej tuto funkci když uživatel hledá konkrétní auto.",
  parameters: {
    type: "object",
    properties: {
      searchTerm: {
        type: "string",
        description: "Vyhledávací termín (např. 'Model 3', 'červená Tesla', 'Long Range')"
      }
    },
    required: ["searchTerm"]
  },
  handler: async ({ searchTerm }) => {
    try {
      console.log("Backend searching for:", searchTerm, typeof searchTerm);
      
      // Zajisti, že searchTerm je string
      let queryString = "";
      if (typeof searchTerm === 'string') {
        queryString = searchTerm;
      } else if (searchTerm && typeof searchTerm === 'object') {
        queryString = JSON.stringify(searchTerm);
      } else {
        queryString = String(searchTerm || "");
      }
      
      queryString = queryString.toLowerCase().trim();
      
      if (!queryString || queryString === '{}' || queryString === 'null' || queryString === 'undefined') {
        return "Prosím zadejte konkrétní vyhledávací termín pro Tesla auta.";
      }
      
      console.log("Final query string:", queryString);
      
      const { data, error } = await supabase
        .from("inzeraty_s_fotkou")
        .select("*")
        .ilike("verze", `%${queryString}%`)
        .limit(5);
      
      if (error) {
        console.error("Supabase error:", error);
        return `Chyba při hledání aut: ${error.message}`;
      }
      
      console.log("Supabase returned:", data?.length, "cars");
      
      if (!data || data.length === 0) {
        return `Nenašel jsem žádná Tesla auta pro "${queryString}". Zkuste jiný termín jako "Model 3", "Model S", nebo "červená".`;
      }
      
      const results = data.map((car, index) => 
        `${index + 1}. ${car.verze} - ${car.cena || 'Cena na dotaz'} - VIN: ${car.vin}`
      ).join('\n');
      
      return `Našel jsem ${data.length} Tesla aut pro "${queryString}":\n\n${results}`;
      
    } catch (error) {
      console.error("Handler error:", error);
      return `Nastala chyba při hledání aut: ${error.message}`;
    }
  }
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });
  
  return handleRequest(req);
};
