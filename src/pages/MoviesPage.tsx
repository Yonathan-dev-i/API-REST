import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { moviesApi, Movie, Genre } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { motion } from "framer-motion";
import { Film, Search, Star, Calendar, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function MovieCard({ movie, index, genres }: { movie: Movie; index: number; genres: Genre[] }) {
  const movieGenres = genres.filter((g) => movie.genre_ids.includes(g.id));
  const posterUrl = moviesApi.getPosterUrl(movie.poster_path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="glass-card overflow-hidden group hover:border-movies/50 transition-all duration-300"
    >
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-movies transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <Calendar className="w-3 h-3" />
          {new Date(movie.release_date).getFullYear()}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {movieGenres.slice(0, 2).map((genre) => (
            <span
              key={genre.id}
              className="px-2 py-0.5 text-xs bg-movies/10 text-movies rounded-full"
            >
              {genre.name}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {movie.overview}
        </p>
      </div>
    </motion.div>
  );
}

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  const { data: moviesData, isLoading, error, refetch } = useQuery({
    queryKey: ["movies", activeGenre],
    queryFn: () =>
      activeGenre
        ? moviesApi.getMoviesByGenre(activeGenre)
        : moviesApi.getPopularMovies(),
  });

  const { data: genresData } = useQuery({
    queryKey: ["movie-genres"],
    queryFn: () => moviesApi.getGenres(),
  });

  const genres = genresData?.genres || [];

  const filteredMovies = moviesData?.results.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground flex items-center gap-3">
            <Film className="w-10 h-10 text-movies" />
            Base de datos de películas
          </h1>
          <p className="text-muted-foreground mt-1">
            Descubre películas populares proporcionadas por TMDB
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-movies">{moviesData?.total_results}</span>
          películas encontradas
        </div>
      </motion.div>

      {/* Search & Genres */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar películas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeGenre === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveGenre(null)}
            className={activeGenre === null ? "bg-movies hover:bg-movies/90" : ""}
          >
            Todos
          </Button>
          {genres.slice(0, 10).map((genre) => (
            <Button
              key={genre.id}
              variant={activeGenre === genre.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveGenre(genre.id)}
              className={activeGenre === genre.id ? "bg-movies hover:bg-movies/90" : ""}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMovies?.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} index={index} genres={genres} />
        ))}
      </div>

      {filteredMovies?.length === 0 && (
        <div className="text-center py-12">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron películas</p>
        </div>
      )}

      {/* API Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Film className="w-5 h-5 text-movies" />
          TMDB API Endpoints
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-movies">GET /3/movie/popular</code>
            <p className="text-muted-foreground mt-1">Obtener películas populares</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-movies">GET /3/movie/{"{id}"}</code>
            <p className="text-muted-foreground mt-1">Obtener detalles de la película</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-movies">GET /3/search/movie?query=query</code>
            <p className="text-muted-foreground mt-1">Buscar películas</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-movies">GET /3/genre/movie/list</code>
            <p className="text-muted-foreground mt-1">Obtener géneros de películas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
