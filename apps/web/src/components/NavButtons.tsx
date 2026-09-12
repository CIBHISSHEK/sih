export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="btn-pill text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm mb-4">
      <span aria-hidden>←</span> {label}
    </button>
  );
}

export function LogoutButton({ onClick, dark = false }: { onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={
        dark
          ? "btn-pill text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur"
          : "btn-pill text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
      }
    >
      Log out
    </button>
  );
}
