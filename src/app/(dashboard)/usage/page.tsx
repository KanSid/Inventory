import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { formatDate, formatQuantity } from "@/lib/utils";

export default async function UsagePage() {
  const supabase = await createClient();

  const { data: usage } = await supabase
    .from("stock_usage")
    .select("*, brides(name), rolls(roll_number, products(item_code, description, categories(unit))), piece_batches(batch_number, products(item_code, description, categories(unit))), profiles:logged_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Usage"
        description="Material consumption log"
        action={
          canEdit ? (
            <Link href="/usage/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Log Usage
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bride</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Logged By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!usage || usage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No usage logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                usage.map((u) => {
                  const bride = u.brides as { name: string } | null;
                  const roll = u.rolls as { roll_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const batch = u.piece_batches as { batch_number: string; products: { item_code: string; description: string; categories: { unit: string } | null } } | null;
                  const logger = u.profiles as { full_name: string } | null;
                  const isRoll = !!roll;
                  const stockUnit = (isRoll ? roll?.products?.categories?.unit : batch?.products?.categories?.unit) ?? "roll";
                  const product = isRoll ? roll?.products : batch?.products;
                  const entryNum = isRoll ? roll?.roll_number : batch?.batch_number;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(u.usage_date)}</TableCell>
                      <TableCell className="font-serif">{bride?.name ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                          <span className="font-serif">{product?.item_code} — {product?.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{entryNum ?? "—"}</TableCell>
                      <TableCell className="text-right font-serif">{formatQuantity(u.quantity_used, stockUnit as "roll" | "pieces")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{logger?.full_name ?? "—"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
