import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe2, Search, Users, MapPin, Building } from "lucide-react";
import { api, Country } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner, LoadingGrid } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatPopulation(pop: number): string {
  if (pop >= 1_000_000_000) return `${(pop / 1_000_000_000).toFixed(1)}B`;
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return pop.toString();
}

function CountryCard({ country }: { country: Country }) {
  const currencies = country.currencies ? Object.values(country.currencies) : [];
  const languages = country.languages ? Object.values(country.languages) : [];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl overflow-hidden api-card-countries border transition-all duration-300"
    >
      <div className="relative h-32 bg-gradient-to-br from-countries/20 to-transparent">
        <img
          src={country.flags.svg}
          alt={`${country.name.common} flag`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate text-lg">
          {country.name.common}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{country.name.official}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-4 h-4 text-countries" />
            <span className="text-muted-foreground">{country.capital?.[0] || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-countries" />
            <span className="text-muted-foreground">{country.region}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-countries" />
            <span className="text-muted-foreground">{formatPopulation(country.population)}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {currencies.slice(0, 1).map((curr, i) => (
            <span key={i} className="px-2 py-0.5 bg-countries/10 text-countries rounded-full text-xs">
              {curr.symbol} {curr.name}
            </span>
          ))}
          {languages.slice(0, 2).map((lang, i) => (
            <span key={i} className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function CountriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['countries'],
    queryFn: () => api.countries.getAllCountries(),
  });

  const filteredCountries = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.common.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.official.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Region filter
    if (regionFilter) {
      filtered = filtered.filter((c) => c.region === regionFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.common.localeCompare(b.name.common);
      if (sortBy === "population") return b.population - a.population;
      if (sortBy === "area") return b.area - a.area;
      return 0;
    });
    
    return filtered;
  }, [data, searchQuery, regionFilter, sortBy]);

  const regions = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((c) => c.region))].sort();
  }, [data]);

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
          <div className="w-10 h-10 rounded-xl bg-countries/20 flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-countries" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">API de Países</h1>
        </div>
        <p className="text-muted-foreground">
          Explora datos de la API REST Countries
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar países..."
            className="pl-10 bg-secondary/50 border-border"
          />
        </div>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[160px] bg-secondary/50">
            <SelectValue placeholder="Todas las regiones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las regiones</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px] bg-secondary/50">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="population">Población</SelectItem>
            <SelectItem value="area">Área</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats */}
      {data && (
        <motion.div variants={itemVariants} className="flex gap-4">
          <div className="glass-card rounded-lg px-4 py-2">
            <span className="text-2xl font-display font-bold text-countries">{filteredCountries.length}</span>
            <span className="text-sm text-muted-foreground ml-2">countries</span>
          </div>
          <div className="glass-card rounded-lg px-4 py-2">
            <span className="text-2xl font-display font-bold text-foreground">
              {formatPopulation(filteredCountries.reduce((sum, c) => sum + c.population, 0))}
            </span>
            <span className="text-sm text-muted-foreground ml-2">total population</span>
          </div>
        </motion.div>
      )}

      {/* Countries Grid */}
      {isLoading ? (
        <LoadingGrid count={12} />
      ) : error ? (
        <ErrorDisplay message="Failed to load countries" onRetry={() => refetch()} />
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredCountries.slice(0, 50).map((country) => (
            <CountryCard key={country.cca3} country={country} />
          ))}
        </motion.div>
      )}

      {filteredCountries.length > 50 && (
        <motion.p variants={itemVariants} className="text-center text-muted-foreground">
          Mostrando 50 de {filteredCountries.length} países. Usa los filtros para reducir los resultados.
        </motion.p>
      )}
    </motion.div>
  );
}
