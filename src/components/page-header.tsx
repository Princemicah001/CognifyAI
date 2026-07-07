import React from 'react';

type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        {typeof title === 'string' ? (
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        ) : (
          title
        )}
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      {children && <div className="flex shrink-0 gap-2">{children}</div>}
    </div>
  );
}
