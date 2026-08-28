import { MaterialDemandView } from "../view";

export const dynamic = "force-dynamic";

export default function OutOfStockDemandPage() {
  return <MaterialDemandView filter="out_of_stock" />;
}
