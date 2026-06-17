type Props = {
  className?: string;
};

export function Logo({ className = "h-9 w-auto" }: Props) {
  return (
    <svg
      viewBox="0 0 440 90"
      className={className}
      aria-label="qaroadmap.dev"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .logo-road { fill: #ffffff; }
        .logo-tagline { fill: #ffffff; fill-opacity: 0.45; }
        .light .logo-road { fill: #09090b; }
        .light .logo-tagline { fill: #09090b; fill-opacity: 0.6; }
      `}</style>
      <text
        x="0"
        y="58"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight={700}
        fontSize={52}
        letterSpacing={-1}
      >
        <tspan fill="#AFA9EC">qa</tspan>
        <tspan className="logo-road">road</tspan>
        <tspan fill="#00FF94">map</tspan>
        <tspan fontSize={28} fontWeight={400} fill="#BF5FFF" letterSpacing={1}>.dev</tspan>
      </text>
      <text
        x="2"
        y="80"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontWeight={400}
        fontSize={12}
        letterSpacing={2.8}
        className="logo-tagline"
      >
        YOUR PATH IN QA ENGINEERING
      </text>
    </svg>
  );
}
