"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupplier, updateSupplier } from "@/actions/supplier";
import type { Supplier } from "@/types";

interface Props {
  supplier?: Supplier;
}

export function SupplierForm({ supplier }: Props) {
  const router = useRouter();
  const isEdit = !!supplier;

  const [name, setName] = useState(supplier?.name ?? "");
  const [contactPerson, setContactPerson] = useState(supplier?.contact_person ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [notes, setNotes] = useState(supplier?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = {
      name,
      contact_person: contactPerson || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      notes: notes || null,
    };

    const result = isEdit
      ? await updateSupplier(supplier!.id, data)
      : await createSupplier(data);

    if ("error" in result) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    router.push("/suppliers");
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Supplier" : "New Supplier"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
              {errors.name && <p className="text-xs text-red-500">{errors.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contact Person (optional)</Label>
              <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email (optional)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address (optional)</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
