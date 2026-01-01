import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bitcoin, Search, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { api, CryptoData } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { LoadingSpinner, LoadingGrid } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function MiniSparkline({ data }: { data?: number[] }) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const isPositive = data[data.length - 1] >= data[0];

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-12" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CryptoRow({ crypto, index }: { crypto: CryptoData; index: number }) {
  const isPositive = crypto.price_change_percentage_24h >= 0;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-4 api-card-crypto border transition-all duration-300 hover:border-crypto/60"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground w-6">#{index + 1}</span>
          <img src={crypto.image} alt={crypto.name} className="w-10 h-10" />
          <div>
            <h3 className="font-display font-semibold text-foreground">{crypto.name}</h3>
            <p className="text-sm text-muted-foreground uppercase">{crypto.symbol}</p>
          </div>
        </div>

        <div className="hidden md:block">
          <MiniSparkline data={crypto.sparkline_in_7d?.price} />
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-foreground">
            ${crypto.current_price.toLocaleString()}
          </p>
          <p className={cn(
            "text-sm flex items-center gap-1 justify-end",
            isPositive ? "text-accent" : "text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
          </p>
        </div>

        <div className="hidden lg:block text-right">
          <p className="text-sm text-muted-foreground">Market Cap</p>
          <p className="font-medium text-foreground">{formatCurrency(crypto.market_cap)}</p>
        </div>

        <div className="hidden xl:block text-right">
          <p className="text-sm text-muted-foreground">Volume 24h</p>
          <p className="font-medium text-foreground">{formatCurrency(crypto.total_volume)}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CryptoPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['crypto'],
    queryFn: () => api.crypto.getTopCryptos('usd', 50),
    refetchInterval: 60000, // Refresh every minute
  });

  const filteredCryptos = data?.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMarketCap = data?.reduce((sum, c) => sum + c.market_cap, 0) || 0;
  const totalVolume = data?.reduce((sum, c) => sum + c.total_volume, 0) || 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-crypto/20 flex items-center justify-center">
            <Bitcoin className="w-5 h-5 text-crypto" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Crypto API</h1>
        </div>
        <p className="text-muted-foreground">
          Real-time cryptocurrency data from CoinGecko API
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-crypto" />
            <span className="text-sm text-muted-foreground">Total Market Cap</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatCurrency(totalMarketCap)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-crypto" />
            <span className="text-sm text-muted-foreground">24h Volume</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {formatCurrency(totalVolume)}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5 text-crypto" />
            <span className="text-sm text-muted-foreground">Cryptocurrencies</span>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {data?.length || 0}
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar criptomonedas..."
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>
      </motion.div>

      {/* Crypto List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay message="Failed to load crypto data" onRetry={() => refetch()} />
      ) : (
        <motion.div variants={containerVariants} className="space-y-3">
          {filteredCryptos?.map((crypto, index) => (
            <CryptoRow key={crypto.id} crypto={crypto} index={index} />
          ))}
        </motion.div>
      )}

      {/* API Info */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">API Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-accent">GET</span> /api/v1/crypto
            </p>
            <p className="text-xs text-muted-foreground">Fetches top 50 cryptocurrencies by market cap</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-primary">POST</span> /api/v1/crypto/search
            </p>
            <p className="text-xs text-muted-foreground">Search cryptocurrencies by name or symbol</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          ⏱️ Data refreshes automatically every 60 seconds
        </p>
      </motion.div>
    </motion.div>
  );
}
