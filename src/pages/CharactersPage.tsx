import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { api, Character } from "@/lib/api";
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

function CharacterCard({ character }: { character: Character }) {
  const statusColor = {
    Alive: "bg-accent",
    Dead: "bg-destructive",
    unknown: "bg-muted-foreground",
  }[character.status] || "bg-muted-foreground";

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl overflow-hidden api-card-rickmorty border transition-all duration-300"
    >
      <div className="relative">
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-48 object-cover"
        />
        <div className={cn("absolute top-3 right-3 w-3 h-3 rounded-full", statusColor)} />
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground truncate">{character.name}</h3>
        <p className="text-sm text-muted-foreground">{character.species}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-0.5 bg-rickmorty/10 text-rickmorty rounded-full">
            {character.status}
          </span>
          <span className="px-2 py-0.5 bg-secondary rounded-full">
            {character.gender}
          </span>
        </div>
        <p className="mt-3 text-xs text-muted-foreground truncate">
          📍 {character.location.name}
        </p>
      </div>
    </motion.div>
  );
}

export default function CharactersPage() {
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['characters', page, searchQuery, statusFilter],
    queryFn: () => {
      if (searchQuery || statusFilter) {
        return api.rickMorty.filterCharacters({
          name: searchQuery || undefined,
          status: statusFilter || undefined,
        });
      }
      return api.rickMorty.getCharacters(page);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchName);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchName("");
    setSearchQuery("");
    setStatusFilter("");
    setPage(1);
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
          <div className="w-10 h-10 rounded-xl bg-rickmorty/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-rickmorty" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">API de Rick y Morty</h1>
        </div>
        <p className="text-muted-foreground">
          Explora personajes del universo de Rick y Morty
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Buscar personajes..."
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button type="submit" className="bg-rickmorty text-primary-foreground hover:bg-rickmorty/90">
            Buscar
          </Button>
        </form>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] bg-secondary/50">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="alive">Vivo</SelectItem>
            <SelectItem value="dead">Muerto</SelectItem>
            <SelectItem value="unknown">Desconocido</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || statusFilter) && (
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </motion.div>

      {/* Results Info */}
      {data && (
        <motion.p variants={itemVariants} className="text-sm text-muted-foreground">
          Mostrando {data.results?.length || 0} de {data.info?.count || 0} personajes
        </motion.p>
      )}

      {/* Characters Grid */}
      {isLoading ? (
        <LoadingGrid count={8} />
      ) : error ? (
        <ErrorDisplay 
          message="No se encontraron personajes que coincidan con tu búsqueda" 
          onRetry={() => refetch()} 
        />
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {data?.results?.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {data?.info && !searchQuery && !statusFilter && (
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {data.info.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.info.pages, p + 1))}
            disabled={page === data.info.pages}
            className="gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
