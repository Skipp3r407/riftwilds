"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070b16",
          color: "#e8f0ff",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Critical rift failure</h1>
          <p style={{ opacity: 0.7, marginBottom: 20 }}>
            The application shell crashed. Please reload.
          </p>
          {error.digest ? (
            <p style={{ opacity: 0.5, fontSize: 12, marginBottom: 20 }}>Ref: {error.digest}</p>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#3de7ff",
              color: "#070b16",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
