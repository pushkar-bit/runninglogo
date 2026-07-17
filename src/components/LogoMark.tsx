export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="76 100"
        strokeDashoffset={-6}
        transform="rotate(90 50 50)"
      />
    </svg>
  );
}
