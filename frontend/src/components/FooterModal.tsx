'use client';

interface FooterModalProps {
  open: boolean;
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function FooterModal({
  open,
  title,
  icon,
  children,
  onClose,
}: FooterModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="p-6 text-sm leading-7 text-[var(--muted)] space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}