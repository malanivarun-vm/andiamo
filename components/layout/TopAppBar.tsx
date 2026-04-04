import Link from "next/link";

interface TopAppBarProps {
  backHref?: string;
  title?: string;
  showProfile?: boolean;
}

export function TopAppBar({ backHref, title, showProfile = true }: TopAppBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4"
      style={{ background: "rgba(251,249,246,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-4">
        {backHref ? (
          <Link href={backHref}>
            <span className="material-symbols-outlined text-primary p-2 rounded-full hover:bg-surface-container transition-colors">
              arrow_back
            </span>
          </Link>
        ) : (
          <span className="material-symbols-outlined text-primary p-2 rounded-full">menu</span>
        )}
        {title ? (
          <h1 className="font-sans text-lg font-semibold text-on-surface">{title}</h1>
        ) : (
          <Link href="/">
            <h1 className="font-headline text-3xl font-light text-primary italic">Andiamo</h1>
          </Link>
        )}
      </div>
      {showProfile && (
        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
        </div>
      )}
    </header>
  );
}
