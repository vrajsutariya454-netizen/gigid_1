export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full opacity-60 blur-3xl animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.6 0.24 290 / 0.6), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl animate-float-slower"
        style={{
          background:
            "radial-gradient(circle, oklch(0.68 0.18 200 / 0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[440px] w-[440px] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{
          background:
            "radial-gradient(circle, oklch(0.62 0.22 330 / 0.5), transparent 70%)",
        }}
      />
    </div>
  );
}