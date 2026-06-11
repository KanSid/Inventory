import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PackageCheck } from "lucide-react";

export function ReceiveShipmentButton({ shipmentId }: { shipmentId: string }) {
  return (
    <Link href={`/shipments/${shipmentId}/receive`}>
      <Button className="bg-emerald-600 hover:bg-emerald-700">
        <PackageCheck size={16} className="mr-2" />
        Receive Shipment
      </Button>
    </Link>
  );
}
