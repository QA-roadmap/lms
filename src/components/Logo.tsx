type Props = {
  className?: string;
};

export function Logo({ className = "h-9 w-auto" }: Props) {
  return <img src="/logo.svg" alt="qaroadmap.dev" className={className} />;
}
