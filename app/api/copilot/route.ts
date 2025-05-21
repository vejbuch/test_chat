import { createCopilotAction } from "@copilotkit/backend";
import { supabase } from "../../../lib/supabase";

export const GET = createCopilotAction({
  actions: {
    async searchCars({ input }) {
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
});
