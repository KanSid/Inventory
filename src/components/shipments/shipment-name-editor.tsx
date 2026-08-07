"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renameShipment } from "@/actions/shipment";

export function ShipmentNameEditor({
  shipmentId,
  name,
  canEdit,
}: {
  shipmentId: string;
  name: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (value.trim() === name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError("");
    const result = await renameShipment(shipmentId, value);
    if (result && "error" in result && result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setValue(name);
    setError("");
    setEditing(false);
  }

  if (!canEdit) {
    return <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">{name}</h1>;
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex items-center gap-2 text-left"
      >
        <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">{name}</h1>
        <Pencil size={16} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          autoFocus
          disabled={saving}
          className="h-10 max-w-xs font-serif text-2xl"
        />
        <Button size="icon" variant="outline" onClick={handleSave} disabled={saving}>
          <Check size={16} />
        </Button>
        <Button size="icon" variant="outline" onClick={handleCancel} disabled={saving}>
          <X size={16} />
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
