import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Cloud, 
  Users, 
  Globe2, 
  Bitcoin,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Wind,
  Droplets,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, WeatherData, Character, Country, CryptoData } from "@/lib/api";
import { LoadingSpinner, LoadingCard } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function WeatherWidget({ data }: { data: WeatherData | null }) {
  if (!data) return <LoadingCard />;

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    return "⛈️";
  };

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 api-card-weather transition-all duration-300 border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-weather" />
          <h3 className="font-display font-semibold text-foreground">Clima</h3>
        </div>
        <Link 
          to="/weather" 
          className="text-xs text-weather hover:underline flex items-center gap-1"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{getWeatherIcon(data.weatherCode)}</span>
        <div>
          <p className="text-3xl font-display font-bold text-foreground">
            {Math.round(data.temperature)}°C
          </p>
          <p className="text-sm text-muted-foreground">{data.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-weather" />
          <span className="text-xs text-muted-foreground">{data.temperature}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-weather" />
          <span className="text-xs text-muted-foreground">{data.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-weather" />
          <span className="text-xs text-muted-foreground">{data.windSpeed} km/h</span>
        </div>
      </div>
    </motion.div>
  );
}

function CharactersWidget({ data }: { data: { results: Character[]; info: { count: number } } | null }) {
  if (!data) return <LoadingCard />;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 api-card-rickmorty transition-all duration-300 border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-rickmorty" />
          <h3 className="font-display font-semibold text-foreground">Rick y Morty</h3>
        </div>
        <Link 
          to="/characters" 
          className="text-xs text-rickmorty hover:underline flex items-center gap-1"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-3xl font-display font-bold text-foreground mb-1">
        {data.info.count}
      </p>
      <p className="text-sm text-muted-foreground mb-4">Total de personajes</p>

      <div className="flex -space-x-2">
        {data.results.slice(0, 5).map((char) => (
          <img
            key={char.id}
            src={char.image}
            alt={char.name}
            className="w-10 h-10 rounded-full border-2 border-card object-cover"
          />
        ))}
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground border-2 border-card">
          +{data.info.count - 5}
        </div>
      </div>
    </motion.div>
  );
}

function CountriesWidget({ data }: { data: Country[] | null }) {
  if (!data) return <LoadingCard />;

  const regions = [...new Set(data.map((c) => c.region))];

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 api-card-countries transition-all duration-300 border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-countries" />
          <h3 className="font-display font-semibold text-foreground">Países</h3>
        </div>
        <Link 
          to="/countries" 
          className="text-xs text-countries hover:underline flex items-center gap-1"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-3xl font-display font-bold text-foreground mb-1">
        {data.length}
      </p>
      <p className="text-sm text-muted-foreground mb-4">Países disponibles</p>

      <div className="flex flex-wrap gap-1.5">
        {regions.slice(0, 5).map((region) => (
          <span
            key={region}
            className="px-2 py-1 bg-countries/10 text-countries rounded-full text-xs"
          >
            {region}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function CryptoWidget({ data }: { data: CryptoData[] | null }) {
  if (!data) return <LoadingCard />;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 api-card-crypto transition-all duration-300 border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-crypto" />
          <h3 className="font-display font-semibold text-foreground">Cripto</h3>
        </div>
        <Link 
          to="/crypto" 
          className="text-xs text-crypto hover:underline flex items-center gap-1"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {data.slice(0, 3).map((crypto) => (
          <div key={crypto.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
              <span className="text-sm font-medium text-foreground">{crypto.symbol.toUpperCase()}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                ${crypto.current_price.toLocaleString()}
              </p>
              <p className={cn(
                "text-xs flex items-center gap-1",
                crypto.price_change_percentage_24h >= 0 ? "text-accent" : "text-destructive"
              )}>
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PokemonWidget({ data }: { data: { results: { name: string; url: string }[]; count: number } | null }) {
  if (!data) return <LoadingCard />;

  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 api-card-pokemon transition-all duration-300 border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pokemon" />
          <h3 className="font-display font-semibold text-foreground">Pokémon</h3>
        </div>
        <Link 
          to="/pokemon" 
          className="text-xs text-pokemon hover:underline flex items-center gap-1"
        >
          Ver todo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <p className="text-3xl font-display font-bold text-foreground mb-1">
        {data.count}
      </p>
      <p className="text-sm text-muted-foreground mb-4">Total de Pokémon</p>

      <div className="flex flex-wrap gap-1.5">
        {data.results.slice(0, 5).map((pokemon) => (
          <span
            key={pokemon.name}
            className="px-2 py-1 bg-pokemon/10 text-pokemon rounded-full text-xs capitalize"
          >
            {pokemon.name}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function ArchitectureDiagram() {
  return (
    <motion.div
      variants={itemVariants}
      className="glass-card rounded-xl p-6 col-span-full"
    >
      <h3 className="font-display font-semibold text-foreground mb-6 text-lg">
        API Gateway Architecture
      </h3>
      
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
        {/* Frontend */}
        <div className="flex flex-col items-center min-w-[120px]">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-2">
            <span className="text-2xl">🖥️</span>
          </div>
          <p className="text-sm font-medium text-foreground">Frontend</p>
          <p className="text-xs text-muted-foreground">React App</p>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-primary to-accent" />
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>

        {/* API Gateway */}
        <div className="flex flex-col items-center min-w-[120px]">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-2">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm font-medium text-foreground">API Gateway</p>
          <p className="text-xs text-muted-foreground">REST /api/v1</p>
        </div>

        {/* Arrow */}
        <div className="flex-1 flex items-center">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-accent to-muted-foreground" />
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* External APIs */}
        <div className="flex flex-col items-center min-w-[200px]">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-weather/20 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-weather" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-rickmorty/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-rickmorty" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-countries/20 flex items-center justify-center">
              <Globe2 className="w-4 h-4 text-countries" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-crypto/20 flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-crypto" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-pokemon/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pokemon" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">External APIs</p>
          <p className="text-xs text-muted-foreground">5 Public Data Sources</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.dashboard.getDashboardData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        message="Failed to load dashboard data" 
        onRetry={() => refetch()} 
      />
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Panel de API Gateway
        </h1>
        <p className="text-muted-foreground">
          Plataforma centralizada que agrega múltiples APIs públicas
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <WeatherWidget data={data?.weather ?? null} />
        <CharactersWidget data={data?.characters ?? null} />
        <CountriesWidget data={data?.countries ?? null} />
        <CryptoWidget data={data?.cryptos ?? null} />
        <PokemonWidget data={data?.pokemon ?? null} />
      </div>

      {/* Architecture Diagram */}
      <ArchitectureDiagram />

      {/* API Endpoints Info */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">
            Endpoints disponibles
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
              <span className="text-muted-foreground">/api/v1/weather</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">POST</span>
              <span className="text-muted-foreground">/api/v1/weather/search</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
              <span className="text-muted-foreground">/api/v1/characters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
              <span className="text-muted-foreground">/api/v1/countries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
              <span className="text-muted-foreground">/api/v1/crypto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">GET</span>
              <span className="text-muted-foreground">/api/v1/pokemon</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">
            HTTP Methods Used
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs font-mono">GET</span>
                <span className="text-sm text-foreground">Data Retrieval</span>
              </div>
              <span className="text-muted-foreground text-sm">15 endpoints</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-mono">POST</span>
                <span className="text-sm text-foreground">Search & Filters</span>
              </div>
              <span className="text-muted-foreground text-sm">6 endpoints</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-countries/20 text-countries rounded text-xs font-mono">PUT</span>
                <span className="text-sm text-foreground">Config Updates</span>
              </div>
              <span className="text-muted-foreground text-sm">2 endpoints</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-destructive/20 text-destructive rounded text-xs font-mono">DELETE</span>
                <span className="text-sm text-foreground">Cache Clear</span>
              </div>
              <span className="text-muted-foreground text-sm">3 endpoints</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
