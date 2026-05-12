'use client';

interface FooterModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function FooterModal({
  open,
  title,
  children,
  onClose,
}: FooterModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ×
          </button>
        </div>

        <div className="p-6 text-sm leading-7 text-[var(--muted)] space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}