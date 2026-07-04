"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PackageCheck, Pencil, Trash2 } from "lucide-react";
import { deleteShipment } from "@/actions/shipment";

export function ShipmentPendingActions({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("Delete this pending shipment? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    const result = await deleteShipment(shipmentId);
    if (result && "error" in result && result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }
    router.push("/shipments");
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <Link href={`/shipments/${shipmentId}/receive`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <PackageCheck size={16} className="mr-2" />
            Receive
          </Button>
        </Link>
        <Link href={`/shipments/${shipmentId}/edit`}>
          <Button variant="outline">
            <Pencil size={16} className="mr-2" />
            Edit
          </Button>
        </Link>
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={16} className="mr-2" />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
