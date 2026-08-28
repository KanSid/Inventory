import { MaterialDemandView } from "../view";

export const dynamic = "force-dynamic";

export default function LowStockDemandPage() {
  return <MaterialDemandView filter="low_stock" />;
}
