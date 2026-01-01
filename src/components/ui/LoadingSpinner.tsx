import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "primary" | "weather" | "rickmorty" | "countries" | "crypto";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

const colorClasses = {
  primary: "border-primary",
  weather: "border-weather",
  rickmorty: "border-rickmorty",
  countries: "border-countries",
  crypto: "border-crypto",
};

export function LoadingSpinner({ size = "md", className, color = "primary" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-lg p-6 animate-pulse", className)}>
      <div className="h-4 bg-muted rounded w-3/4 mb-4" />
      <div className="h-8 bg-muted rounded w-1/2 mb-2" />
      <div className="h-4 bg-muted rounded w-full" />
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
