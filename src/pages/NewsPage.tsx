import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi, NewsArticle } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { motion } from "framer-motion";
import { Newspaper, Search, Clock, ExternalLink, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const categories = [
  { id: "general", label: "General" },
  { id: "technology", label: "Tecnología" },
  { id: "business", label: "Negocios" },
  { id: "science", label: "Ciencia" },
  { id: "health", label: "Salud" },
  { id: "sports", label: "Deportes" },
  { id: "entertainment", label: "Entretenimiento" },
];

function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className="glass-card overflow-hidden group hover:border-news/50 transition-all duration-300 flex flex-col"
    >
      {article.urlToImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800';
            }}
          />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="px-2 py-0.5 bg-news/10 text-news rounded-full font-medium">
            {article.source.name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </span>
        </div>
        <h3 className="font-semibold text-foreground group-hover:text-news transition-colors line-clamp-2 mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {article.description}
        </p>
        <div className="mt-3 flex items-center text-sm text-news font-medium gap-1">
          Leer más <ExternalLink className="w-3 h-3" />
        </div>
      </div>
    </motion.a>
  );
}

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["news", activeCategory],
    queryFn: () => newsApi.getNewsByCategory(activeCategory),
  });

  const filteredArticles = data?.articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Newspaper className="w-10 h-10 text-news" />
            Titulares de Noticias
          </h1>
          <p className="text-muted-foreground mt-1">
            Últimas noticias del mundo
          </p>
        </div>
      </motion.div>

      {/* Search & Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className={activeCategory === cat.id ? "bg-news hover:bg-news/90" : ""}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles?.map((article, index) => (
          <NewsCard key={index} article={article} index={index} />
        ))}
      </div>

      {filteredArticles?.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron artículos</p>
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
          <Newspaper className="w-5 h-5 text-news" />
          Endpoints de NewsAPI
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-news">GET /v2/top-headlines?country=us</code>
            <p className="text-muted-foreground mt-1">Obtener titulares principales</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-news">GET /v2/everything?q=query</code>
            <p className="text-muted-foreground mt-1">Buscar en todos los artículos</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-news">GET /v2/top-headlines?category=tech</code>
            <p className="text-muted-foreground mt-1">Filtrar por categoría</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-news">GET /v2/sources</code>
            <p className="text-muted-foreground mt-1">Obtener fuentes de noticias</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
