import { CopilotKit } from "@copilotkit/react-core";
import { CarSalesChat } from "../components/CarSalesChat";

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilot">
      <main className="flex h-screen">
        <div className="w-2/3 p-6">
          <h1 className="text-2xl font-bold">Vítejte na Teslist.cz</h1>
        </div>
        <div className="w-1/3 border-l">
          <CarSalesChat />
        </div>
      </main>
    </CopilotKit>
  );
}
