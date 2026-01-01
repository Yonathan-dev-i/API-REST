import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Cloud, 
  Search, 
  Thermometer, 
  Droplets, 
  Wind,
  MapPin
} from "lucide-react";
import { api, WeatherData } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { cn } from "@/lib/utils";

const popularCities = [
  "New York", "London", "Tokyo", "Paris", "Sydney", 
  "Dubai", "Singapore", "Berlin", "Toronto", "Mumbai"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getWeatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  return "⛈️";
}

function getWeatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  return "Stormy";
}

function WeatherCard({ data, isLoading }: { data?: WeatherData; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8 api-card-weather border flex items-center justify-center min-h-[300px]">
        <LoadingSpinner size="lg" color="weather" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card rounded-xl p-8 api-card-weather border flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Cloud className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Search for a city to see weather data</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-8 api-card-weather border"
    >
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-weather" />
        <h2 className="text-2xl font-display font-bold text-foreground">{data.location}</h2>
      </div>

      <div className="flex items-center gap-8 mb-8">
        <span className="text-8xl">{getWeatherIcon(data.weatherCode)}</span>
        <div>
          <p className="text-6xl font-display font-bold text-foreground">
            {Math.round(data.temperature)}°
          </p>
          <p className="text-xl text-muted-foreground">{getWeatherDescription(data.weatherCode)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-5 h-5 text-weather" />
            <span className="text-sm text-muted-foreground">Temperature</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{data.temperature}°C</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-weather" />
            <span className="text-sm text-muted-foreground">Humidity</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{data.humidity}%</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-5 h-5 text-weather" />
            <span className="text-sm text-muted-foreground">Wind Speed</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{data.windSpeed} km/h</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function WeatherPage() {
  const [searchCity, setSearchCity] = useState("");
  const [activeCity, setActiveCity] = useState("New York");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['weather', activeCity],
    queryFn: () => api.weather.searchByCity(activeCity),
    enabled: !!activeCity,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setActiveCity(searchCity.trim());
      setSearchCity("");
    }
  };

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
          <div className="w-10 h-10 rounded-xl bg-weather/20 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-weather" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">API de Clima</h1>
        </div>
        <p className="text-muted-foreground">
          Datos meteorológicos en tiempo real de Open-Meteo
        </p>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Buscar ciudad..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button type="submit" className="bg-weather text-primary-foreground hover:bg-weather/90">
            Buscar
          </Button>
        </form>
      </motion.div>

      {/* Popular Cities */}
      <motion.div variants={itemVariants}>
        <p className="text-sm text-muted-foreground mb-3">Ciudades populares:</p>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all",
                activeCity === city
                  ? "bg-weather text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Weather Display */}
      <motion.div variants={itemVariants}>
        {error ? (
          <ErrorDisplay 
            message="Ciudad no encontrada o error en la API" 
            onRetry={() => refetch()} 
          />
        ) : (
          <WeatherCard data={data} isLoading={isLoading} />
        )}
      </motion.div>

      {/* API Info */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Endpoint de API</h3>
        <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
          <p className="text-muted-foreground">
            <span className="text-accent">GET</span> /api/v1/weather?city={activeCity}
          </p>
          <p className="text-muted-foreground mt-2">
            <span className="text-primary">POST</span> /api/v1/weather/search
          </p>
          <p className="text-xs text-muted-foreground mt-1">Body: {`{ "city": "${activeCity}" }`}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
