import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Cloud, 
  Users, 
  Globe2, 
  Bitcoin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  DollarSign,
  Newspaper,
  Film
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/", label: "Panel", icon: LayoutDashboard, color: "text-primary" },
  { path: "/weather", label: "Clima", icon: Cloud, color: "text-weather" },
  { path: "/characters", label: "Rick y Morty", icon: Users, color: "text-rickmorty" },
  { path: "/countries", label: "Países", icon: Globe2, color: "text-countries" },
  { path: "/crypto", label: "Cripto", icon: Bitcoin, color: "text-crypto" },
  { path: "/pokemon", label: "Pokémon", icon: Sparkles, color: "text-pokemon" },
  { path: "/exchange", label: "Cambio", icon: DollarSign, color: "text-exchange" },
  { path: "/news", label: "Noticias", icon: Newspaper, color: "text-news" },
  { path: "/movies", label: "Películas", icon: Film, color: "text-movies" },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-card border-r border-border z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display font-bold text-lg text-foreground">
                Panel API
              </h1>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-secondary/50",
                isActive && "bg-secondary"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? item.color : "text-muted-foreground")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "font-medium text-sm",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Contraer</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
