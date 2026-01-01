import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Zap, Heart, Shield, Swords } from "lucide-react";
import { api, Pokemon } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-stone-500",
  ghost: "bg-purple-700",
  dragon: "bg-violet-600",
  dark: "bg-gray-700",
  steel: "bg-slate-400",
  fairy: "bg-pink-300",
};

function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const mainType = pokemon.types[0]?.type.name || "normal";
  const artwork = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -5 }}
      className="glass-card rounded-xl overflow-hidden api-card-pokemon border transition-all duration-300"
    >
      <div className="relative h-40 bg-gradient-to-br from-pokemon/20 to-transparent flex items-center justify-center">
        <img
          src={artwork}
          alt={pokemon.name}
          className="w-32 h-32 object-contain drop-shadow-lg"
        />
        <span className="absolute top-3 right-3 text-xs text-muted-foreground font-mono">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground capitalize text-lg mb-2">
          {pokemon.name}
        </h3>
        
        <div className="flex gap-1.5 mb-3">
          {pokemon.types.map((t) => (
            <span
              key={t.type.name}
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize",
                typeColors[t.type.name] || "bg-gray-500"
              )}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span>HP: {pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Swords className="w-3.5 h-3.5 text-orange-400" />
            <span>ATK: {pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>DEF: {pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>SPD: {pokemon.stats.find(s => s.stat.name === 'speed')?.base_stat}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PokemonPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon[]>([]);
  const limit = 20;

  // Fetch pokemon list
  const { data: pokemonList, isLoading: listLoading } = useQuery({
    queryKey: ['pokemon-list', page],
    queryFn: () => api.pokemon.getPokemonList(limit, page * limit),
    enabled: !searchQuery && !typeFilter,
  });

  // Fetch single pokemon by search
  const { data: searchedPokemon, isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['pokemon-search', searchQuery],
    queryFn: () => api.pokemon.getPokemonById(searchQuery.toLowerCase()),
    enabled: !!searchQuery,
  });

  // Fetch types
  const { data: types } = useQuery({
    queryKey: ['pokemon-types'],
    queryFn: () => api.pokemon.getTypes(),
  });

  // Fetch pokemon by type
  const { data: typeData, isLoading: typeLoading } = useQuery({
    queryKey: ['pokemon-by-type', typeFilter],
    queryFn: () => api.pokemon.getPokemonByType(typeFilter),
    enabled: !!typeFilter,
  });

  // Fetch details for list items
  useEffect(() => {
    async function fetchDetails() {
      if (pokemonList?.results) {
        const names = pokemonList.results.map(p => p.name);
        const details = await api.pokemon.getPokemonDetails(names);
        setPokemonDetails(details);
      }
    }
    if (!searchQuery && !typeFilter) {
      fetchDetails();
    }
  }, [pokemonList, searchQuery, typeFilter]);

  // Fetch details for type-filtered pokemon
  useEffect(() => {
    async function fetchTypeDetails() {
      if (typeData?.pokemon) {
        const names = typeData.pokemon.slice(0, 20).map(p => p.pokemon.name);
        const details = await api.pokemon.getPokemonDetails(names);
        setPokemonDetails(details);
      }
    }
    if (typeFilter && typeData) {
      fetchTypeDetails();
    }
  }, [typeData, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setTypeFilter("");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setTypeFilter("");
    setPage(0);
  };

  const isLoading = listLoading || searchLoading || typeLoading;
  const totalPages = pokemonList ? Math.ceil(pokemonList.count / limit) : 0;

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
          <div className="w-10 h-10 rounded-xl bg-pokemon/20 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Pokémon API</h1>
        </div>
        <p className="text-muted-foreground">
          Explora datos de Pokémon desde PokéAPI
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o ID..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button type="submit" className="bg-pokemon text-primary-foreground hover:bg-pokemon/90">
            Buscar
          </Button>
        </form>

        <Select value={typeFilter} onValueChange={(val) => {
          setTypeFilter(val === "all" ? "" : val);
          setSearchQuery("");
          setSearchInput("");
        }}>
          <SelectTrigger className="w-[160px] bg-secondary/50">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {types?.results
              .filter(t => t.name !== "unknown" && t.name !== "shadow")
              .map((type) => (
                <SelectItem key={type.name} value={type.name} className="capitalize">
                  {type.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {(searchQuery || typeFilter) && (
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      {pokemonList && !searchQuery && !typeFilter && (
        <motion.div variants={itemVariants} className="flex gap-4">
          <div className="glass-card rounded-lg px-4 py-2">
            <span className="text-2xl font-display font-bold text-pokemon">{pokemonList.count}</span>
            <span className="text-sm text-muted-foreground ml-2">Pokémon totales</span>
          </div>
        </motion.div>
      )}

      {/* Pokemon Grid */}
      {isLoading && pokemonDetails.length === 0 ? (
        <LoadingGrid count={8} />
      ) : searchError ? (
        <ErrorDisplay 
          message="Pokémon no encontrado" 
          onRetry={clearFilters} 
        />
      ) : searchQuery && searchedPokemon ? (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <PokemonCard pokemon={searchedPokemon} />
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {pokemonDetails.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!searchQuery && !typeFilter && totalPages > 0 && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* API Info */}
      <motion.div variants={itemVariants} className="glass-card rounded-xl p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Endpoints de la API</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-accent">GET</span> /api/v1/pokemon
            </p>
            <p className="text-xs text-muted-foreground">Lista paginada de Pokémon</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-accent">GET</span> /api/v1/pokemon/:id
            </p>
            <p className="text-xs text-muted-foreground">Detalles de un Pokémon específico</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-primary">POST</span> /api/v1/pokemon/filter
            </p>
            <p className="text-xs text-muted-foreground">Filtrar por tipo, habilidad, etc.</p>
          </div>
          <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">
              <span className="text-accent">GET</span> /api/v1/pokemon/types
            </p>
            <p className="text-xs text-muted-foreground">Lista de todos los tipos</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
