import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";

export default function ReportsPage() {
  const reports = [
    {
      title: "Inventory Snapshot",
      description: "Current stock levels across all products and rolls",
      href: "/reports/inventory",
    },
    {
      title: "Stock Usage Report",
      description: "Material consumption by product, bride, or date range",
      href: "/reports/usage",
    },
    {
      title: "Shipment History",
      description: "All received and pending shipments with supplier details",
      href: "/reports/shipments",
    },
    {
      title: "Adjustments Log",
      description: "All manual corrections, damage records, and additions",
      href: "/reports/adjustments",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Generate and export inventory reports"
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report, i) => (
          <Link key={report.href} href={report.href} className="group block">
            <div className="rounded-lg bg-card shadow-sm p-6 h-full flex flex-col justify-between gap-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
                  Report {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-serif text-xl text-foreground leading-snug">{report.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-px flex-1 bg-border/40" />
                <span className="ml-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 group-hover:text-primary transition-colors">
                  Open →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
