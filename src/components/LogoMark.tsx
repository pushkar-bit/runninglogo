export default function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={className}
      role="img"
      aria-label="Ichor"
      style={{
        display: "inline-block",
        backgroundColor: "currentColor",
        WebkitMaskImage: "url(/images/logo-mark.png)",
        maskImage: "url(/images/logo-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
