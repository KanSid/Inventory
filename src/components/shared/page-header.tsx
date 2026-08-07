interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
      <div className="space-y-1">
        {typeof title === "string" ? (
          <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">{title}</h1>
        ) : (
          title
        )}
        {description && (
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
