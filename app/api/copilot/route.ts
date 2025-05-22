import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { supabase } from "../../../lib/supabase";

// @ts-nocheck

// 1. Vytvoř adaptér pro OpenAI
const adapter = new OpenAIAdapter();

// 2. Vytvoř runtime
const runtime = new CopilotRuntime();

// 3. Definuj akce
runtime.actions = [
  {
    name: "searchCars",
    description: "Najde auta podle dotazu uživatele",
    parameters: [],
    handler: async (args: any) => {
      try {
        console.log("Searching for cars with args:", args);
        
        // Extrahuj query z argumentů různými způsoby
        const query = args?.query || args?.input || args || "";
        const searchQuery = String(query).toLowerCase().trim();
        
        if (!searchQuery) {
          return { message: "Zadejte prosím vyhledávací dotaz pro auta" };
        }
        
        const { data, error } = await supabase
          .from("inzeraty_s_fotkou")
          .select("*")
          .ilike("display_name", `%${searchQuery}%`)
          .limit(5);
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Found cars:", data?.length);
        
        if (!data || data.length === 0) {
          return { 
            message: `Nenašel jsem žádná auta pro dotaz "${query}". Zkuste jiný vyhledávací termín.`,
            cars: []
          };
        }
        
        return {
          message: `Našel jsem ${data.length} aut pro dotaz "${searchQuery}":`,
          cars: data.map((car) => ({
            title: car.verze,
            subtitle: `VIN: ${car.vin}`,
            imageUrl: car.first_photo_url || "",
            price: car.cena || "Cena na dotaz",
            year: car.year || "",
            mileage: car.mileage || ""
          }))
        };
        
      } catch (error) {
        console.error("Error in searchCars handler:", error);
        return { 
          message: "Nastala chyba při hledání aut. Zkuste to prosím znovu.",
          error: error.message 
        };
      }
    },
  } as any,
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
