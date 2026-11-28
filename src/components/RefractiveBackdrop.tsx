export function RefractiveBackdrop({ isDark }: { isDark: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: isDark ? '#070913' : '#EEF2F8' }}
    >
      <div
        className="orb-drift-a absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(99,102,241,0.34) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56,189,248,0.42) 0%, transparent 70%)'
        }}
      />
      <div
        className="orb-drift-b absolute top-1/3 -right-24 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(16,185,129,0.24) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 70%)'
        }}
      />
      <div
        className="orb-drift-a absolute -bottom-28 left-1/3 h-[380px] w-[380px] rounded-full blur-3xl"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(59,130,246,0.26) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(52,211,153,0.32) 0%, transparent 70%)'
        }}
      />
    </div>
  );
}
