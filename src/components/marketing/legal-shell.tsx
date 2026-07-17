export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="page-kicker">Legal</p>
      <h1 className="page-title mt-2">{title}</h1>
      <div className="panel mt-8 p-6 text-sm text-[var(--text-muted)]">{children}</div>
    </div>
  );
}
