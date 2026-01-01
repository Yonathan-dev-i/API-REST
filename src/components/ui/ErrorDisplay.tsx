import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  message,
  error,
  onRetry,
  className 
}: ErrorDisplayProps) {
  const displayMessage = message || error?.message || "Algo salió mal";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 glass-card rounded-lg",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-2">
        Error
      </h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        {displayMessage}
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
