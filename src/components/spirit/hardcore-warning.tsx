"use client";

import { useState } from "react";

export function HardcoreWarning({ petPublicId }: { petPublicId: string }) {
  const [checkbox, setCheckbox] = useState(false);
  const [ack, setAck] = useState(false);
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  const submit = async (enable: boolean) => {
    setMessage(null);
    const res = await fetch(`/api/pets/${petPublicId}/hardcore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enable,
        checkboxAccepted: checkbox,
        warningAcknowledged: ack,
        typedConfirm: typed,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? json.error ?? "Hardcore change failed.");
      return;
    }
    setEnabled(Boolean(json.hardcore?.enabled));
    setMessage(enable ? "Hardcore enabled — permanent loss possible." : "Hardcore disabled.");
  };

  return (
    <section
      className="rounded-xl border border-red-700/60 bg-red-950/40 p-4"
      role="alertdialog"
      aria-labelledby="hardcore-title"
    >
      <h3 id="hardcore-title" className="text-lg font-semibold text-red-200">
        Hardcore mode (optional)
      </h3>
      <p className="mt-2 text-sm text-red-100/90">
        This Riftling may be permanently lost. Normal play never permanently kills Riftlings.
        Hardcore is opt-in only.
      </p>
      <label className="mt-3 flex items-start gap-2 text-sm text-red-100">
        <input
          type="checkbox"
          checked={ack}
          onChange={(e) => setAck(e.target.checked)}
          className="mt-1"
        />
        I have read the red warning.
      </label>
      <label className="mt-2 flex items-start gap-2 text-sm text-red-100">
        <input
          type="checkbox"
          checked={checkbox}
          onChange={(e) => setCheckbox(e.target.checked)}
          className="mt-1"
        />
        I understand this Riftling may be permanently lost.
      </label>
      <label className="mt-2 block text-xs text-red-200/80">
        Type HARDCORE to confirm
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="mt-1 w-full rounded border border-red-700/50 bg-transparent px-2 py-1 text-red-50"
          autoComplete="off"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void submit(true)}
          className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600"
        >
          Enable Hardcore
        </button>
        <button
          type="button"
          onClick={() => void submit(false)}
          className="rounded border border-red-700/50 px-3 py-1.5 text-sm text-red-100"
        >
          Disable
        </button>
      </div>
      {message && (
        <p className="mt-2 text-sm text-red-100" role="status">
          {message}
          {enabled ? " (active)" : ""}
        </p>
      )}
    </section>
  );
}
