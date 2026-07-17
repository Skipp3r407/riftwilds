export const metadata = { title: "Maintenance" };

export default function MaintenancePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-xs uppercase tracking-[0.24em] text-[var(--amber)]">
        Maintenance
      </p>
      <h1 className="font-display mt-3 text-3xl text-white">Riftwilds is briefly offline</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        We are applying updates. Please check back shortly. Your pets are safe.
      </p>
    </main>
  );
}
