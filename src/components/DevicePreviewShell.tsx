import React from 'react';

export type PreviewDevice = 'web' | 'iphone' | 'android';

export function DevicePreviewShell({
  device,
  children
}: {
  device: PreviewDevice;
  children: React.ReactNode;
}) {
  if (device === 'web') {
    return <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6">{children}</div>;
  }

  const frameClass =
    device === 'iphone'
      ? 'w-[393px] h-[852px] rounded-[50px] border-[8px] border-zinc-900/90 shadow-2xl'
      : 'w-[412px] h-[915px] rounded-[34px] border-[6px] border-zinc-800/90 shadow-2xl';

  return (
    <div className="flex justify-center py-4">
      <div
        className={`relative overflow-y-auto overflow-x-hidden px-3 py-2 ${frameClass}`}
        style={{ background: 'var(--lg-bg-canvas)' }}
      >
        {children}
      </div>
    </div>
  );
}
