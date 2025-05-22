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

runtime.actions = [
  {
    name: "searchCars",
    description: "Najde Tesla auta podle uživatelova dotazu - prohledává typ auta, barvu, verzi, popis, typ nabíjecího portu a další údaje",
    parameters: [],
    handler: async (...args: any[]) => {
      try {
        console.log("=== HANDLER DEBUG ===");
        console.log("Number of arguments:", args.length);
        console.log("All arguments:", JSON.stringify(args, null, 2));
        
        let searchQuery = "";
        
        if (args.length > 0) {
          const firstArg = args[0];
          console.log("First arg type:", typeof firstArg);
          console.log("First arg:", firstArg);
          
          if (typeof firstArg === 'string') {
            searchQuery = firstArg;
          } else if (firstArg && typeof firstArg === 'object') {
            searchQuery = firstArg.query || firstArg.input || firstArg.searchTerm || firstArg.term || "";
            console.log("Extracted from object:", searchQuery);
          }
        }
        
        if (!searchQuery) {
          searchQuery = String(args[0] || "");
        }
        
        searchQuery = searchQuery.toLowerCase().trim();
        console.log("Final search query:", searchQuery);
        
        if (!searchQuery || searchQuery === '{}' || searchQuery === '[object object]') {
          return "Prosím zadejte konkrétní vyhledávací termín pro Tesla auta (např. 'Model 3', 'červená', 'Performance', 'CCS2').";
        }
        
        // Pokročilé vyhledávání přes více sloupců
        let query = supabase
          .from("inzeraty_s_fotkou")
          .select("*");
        
        // Rozdělí dotaz na slova a hledá každé slovo v různých sloupcích
        const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 2);
        
        if (searchWords.length > 0) {
          // Vytvoří OR podmínky pro každé slovo přes všechny relevantní sloupce
          const orConditions = searchWords.map(word => 
            `car_type.ilike.%${word}%,exterior_color.ilike.%${word}%,car_version.ilike.%${word}%,verze.ilike.%${word}%,popis.ilike.%${word}%,charge_port_type.ilike.%${word}%`
          );
          
          // Spojí všechny podmínky
          query = query.or(orConditions.join(','));
        } else {
          // Fallback - hledá celý výraz
          query = query.or(`car_type.ilike.%${searchQuery}%,exterior_color.ilike.%${searchQuery}%,car_version.ilike.%${searchQuery}%,verze.ilike.%${searchQuery}%,popis.ilike.%${searchQuery}%,charge_port_type.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query.limit(15);
        
        if (error) {
          console.error("Supabase error:", error);
          return `Chyba při hledání aut: ${error.message}`;
        }
        
        console.log("Supabase returned:", data?.length, "cars");
        
        if (!data || data.length === 0) {
          return `Nenašel jsem žádná Tesla auta pro "${searchQuery}". Zkuste jiný termín jako "Model 3", "Performance", "červená", "CCS2", "Long Range", atd.`;
        }
        
        // Detailnější výsledky s vašimi sloupci
        const results = data.map((car, index) => {
          const parts = [];
          
          // Základní info
          parts.push(`${index + 1}. ${car.car_type || car.verze || 'Tesla'}`);
          
          if (car.exterior_color) parts.push(`${car.exterior_color}`);
          if (car.car_version) parts.push(`${car.car_version}`);
          
          const details = [];
          if (car.cena) details.push(`${car.cena} ${car.mena || 'Kč'}`);
          if (car.year) details.push(`rok ${car.year}`);
          if (car.odometer) details.push(`${car.odometer} km`);
          if (car.soh || car.tessie_soh) {
            const sohValue = car.tessie_soh || car.soh;
            details.push(`SOH ${sohValue}%`);
          }
          if (car.charge_port_type) details.push(`${car.charge_port_type} port`);
          
          // Přidat URL fotky pokud je k dispozici
          let result = parts.join(' ') + (details.length > 0 ? ` - ${details.join(', ')}` : '');
          
          if (car.popis) {
            const shortDesc = car.popis.length > 100 ? 
              car.popis.substring(0, 100) + '...' : 
              car.popis;
            result += `\n   📝 ${shortDesc}`;
          }
          
          return result;
        }).join('\n\n');
        
        return `Našel jsem ${data.length} Tesla aut pro "${searchQuery}":\n\n${results}`;
        
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
