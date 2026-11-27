export function Handwritten({ children }: { children: string }) {
  return <span className="handwritten">
    <span data-ink="">{children}</span>
    <svg aria-hidden="true" viewBox="0 0 320 18" preserveAspectRatio="none">
      <path data-underline="" pathLength="1" d="M3 12C76 2 173 2 314 8M31 14C108 9 221 8 281 12" />
    </svg>
  </span>;
}
