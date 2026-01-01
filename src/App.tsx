import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import WeatherPage from "./pages/WeatherPage";
import CharactersPage from "./pages/CharactersPage";
import CountriesPage from "./pages/CountriesPage";
import CryptoPage from "./pages/CryptoPage";
import PokemonPage from "./pages/PokemonPage";
import ExchangePage from "./pages/ExchangePage";
import NewsPage from "./pages/NewsPage";
import MoviesPage from "./pages/MoviesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weather" element={<WeatherPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/countries" element={<CountriesPage />} />
            <Route path="/crypto" element={<CryptoPage />} />
            <Route path="/pokemon" element={<PokemonPage />} />
            <Route path="/exchange" element={<ExchangePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
