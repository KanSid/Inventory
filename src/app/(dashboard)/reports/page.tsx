import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BarChart3, Package, Truck, Wrench } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      title: "Inventory Snapshot",
      description: "Current stock levels across all products and rolls",
      icon: Package,
      href: "/reports/inventory",
      color: "text-blue-600",
    },
    {
      title: "Stock Usage Report",
      description: "Material consumption by product, bride, or date range",
      icon: BarChart3,
      href: "/reports/usage",
      color: "text-rose-600",
    },
    {
      title: "Shipment History",
      description: "All received and pending shipments with supplier details",
      icon: Truck,
      href: "/reports/shipments",
      color: "text-emerald-600",
    },
    {
      title: "Adjustments Log",
      description: "All manual corrections, damage records, and additions",
      icon: Wrench,
      href: "/reports/adjustments",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export inventory reports"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <report.icon size={20} className={report.color} />
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  Open Report →
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
