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

// Definuj akce pomocí runtime.actions
runtime.actions = [
  {
    name: "searchCars",
    description: "Najde Tesla auta podle uživatelova dotazu",
    parameters: [],
    handler: async (...args: any[]) => {
      try {
        console.log("=== HANDLER DEBUG ===");
        console.log("Number of arguments:", args.length);
        console.log("All arguments:", JSON.stringify(args, null, 2));
        
        // Zkus různé způsoby extrakce dat
        let searchQuery = "";
        
        if (args.length > 0) {
          const firstArg = args[0];
          console.log("First arg type:", typeof firstArg);
          console.log("First arg:", firstArg);
          
          if (typeof firstArg === 'string') {
            searchQuery = firstArg;
          } else if (firstArg && typeof firstArg === 'object') {
            // Zkus různé property names
            searchQuery = firstArg.query || firstArg.input || firstArg.searchTerm || firstArg.term || "";
            console.log("Extracted from object:", searchQuery);
          }
        }
        
        // Fallback - zkus celý args jako string
        if (!searchQuery) {
          searchQuery = String(args[0] || "");
        }
        
        searchQuery = searchQuery.toLowerCase().trim();
        console.log("Final search query:", searchQuery);
        
        if (!searchQuery || searchQuery === '{}' || searchQuery === '[object object]') {
          return "Prosím zadejte konkrétní vyhledávací termín pro Tesla auta.";
        }
        
        const { data, error } = await supabase
          .from("inzeraty_s_fotkou")
          .select("*")
          .ilike("verze", `%${searchQuery}%`)
          .limit(5);
        
        if (error) {
          console.error("Supabase error:", error);
          return `Chyba při hledání aut: ${error.message}`;
        }
        
        console.log("Supabase returned:", data?.length, "cars");
        
        if (!data || data.length === 0) {
          return `Nenašel jsem žádná Tesla auta pro "${searchQuery}". Zkuste jiný termín.`;
        }
        
        const results = data.map((car, index) => 
          `${index + 1}. ${car.verze} - ${car.cena || 'Cena na dotaz'}`
        ).join('\n');
        
        return `Našel jsem ${data.length} Tesla aut:\n\n${results}`;
        
      } catch (error) {
        console.error("Handler error:", error);
        return `Nastala chyba: ${error.message}`;
      }
    }
  } as any
];

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilot",
  });
  
  return handleRequest(req);
};
