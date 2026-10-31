import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4 text-center">
      <p className="stamp text-6xl">ERR 404</p>
      <p className="font-display text-2xl text-phosphor">NO IMAGE ON MEMORY CARD</p>
      <Link to="/" className="btn">
        ◀ Back home
      </Link>
    </div>
  );
}
