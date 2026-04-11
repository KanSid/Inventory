"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { receiveShipment } from "@/actions/shipment";
import { PackageCheck } from "lucide-react";

export function ReceiveShipmentButton({ shipmentId }: { shipmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReceive() {
    if (!confirm("Mark this shipment as received? This will create rolls for all items.")) return;
    setLoading(true);
    const result = await receiveShipment(shipmentId);
    if ("error" in result) {
      alert(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleReceive} disabled={loading}>
      <PackageCheck size={16} className="mr-2" />
      {loading ? "Receiving..." : "Receive Shipment"}
    </Button>
  );
}
