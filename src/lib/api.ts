// API Service Layer - Centralized API Gateway
// This service acts as a gateway/aggregator for multiple public APIs

const API_BASE_URLS = {
  weather: 'https://api.open-meteo.com/v1',
  rickmorty: 'https://rickandmortyapi.com/api',
  countries: 'https://restcountries.com/v3.1',
  crypto: 'https://api.coingecko.com/api/v3',
  pokemon: 'https://pokeapi.co/api/v2',
  exchange: 'https://api.frankfurter.app',
  news: 'https://newsapi.org/v2',
  movies: 'https://api.themoviedb.org/3',
};

// API Keys (these should be configured via environment or secrets)
const NEWS_API_KEY = ''; // Get free key at https://newsapi.org
const TMDB_API_KEY = ''; // Get free key at https://www.themoviedb.org

// Types
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  location: string;
  time: string;
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: { name: string };
  location: { name: string };
  image: string;
  episode: string[];
}

export interface Country {
  name: { common: string; official: string };
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  flags: { svg: string; png: string };
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  area: number;
  cca3: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
}

// Error handling
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Network error occurred');
  }
}

// ==================== WEATHER API ====================
export const weatherApi = {
  // GET - Fetch current weather by coordinates
  async getCurrentWeather(lat: number, lon: number, location: string): Promise<WeatherData> {
    const url = `${API_BASE_URLS.weather}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    
    const data = await fetchWithErrorHandling<any>(url);
    
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      location,
      time: data.current.time,
    };
  },

  // POST - Search weather by city name (simulated - transforms query to coordinates)
  async searchByCity(cityName: string): Promise<WeatherData> {
    // Using geocoding API to get coordinates
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`;
    const geoData = await fetchWithErrorHandling<any>(geoUrl);
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new ApiError(404, 'City not found');
    }
    
    const { latitude, longitude, name } = geoData.results[0];
    return this.getCurrentWeather(latitude, longitude, name);
  },
};

// ==================== RICK AND MORTY API ====================
export const rickMortyApi = {
  // GET - Fetch all characters with pagination
  async getCharacters(page: number = 1): Promise<{ results: Character[]; info: { count: number; pages: number } }> {
    const url = `${API_BASE_URLS.rickmorty}/character?page=${page}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch single character by ID
  async getCharacterById(id: number): Promise<Character> {
    const url = `${API_BASE_URLS.rickmorty}/character/${id}`;
    return fetchWithErrorHandling(url);
  },

  // POST-like - Filter characters (using query params as POST body simulation)
  async filterCharacters(filters: { name?: string; status?: string; species?: string }): Promise<{ results: Character[]; info: { count: number; pages: number } }> {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.status) params.append('status', filters.status);
    if (filters.species) params.append('species', filters.species);
    
    const url = `${API_BASE_URLS.rickmorty}/character?${params.toString()}`;
    return fetchWithErrorHandling(url);
  },
};

// ==================== COUNTRIES API ====================
export const countriesApi = {
  // GET - Fetch all countries
  async getAllCountries(): Promise<Country[]> {
    const url = `${API_BASE_URLS.countries}/all?fields=name,capital,region,subregion,population,flags,currencies,languages,area,cca3`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch country by code
  async getCountryByCode(code: string): Promise<Country[]> {
    const url = `${API_BASE_URLS.countries}/alpha/${code}?fields=name,capital,region,subregion,population,flags,currencies,languages,area,cca3`;
    return fetchWithErrorHandling(url);
  },

  // POST-like - Search countries by name
  async searchCountries(name: string): Promise<Country[]> {
    const url = `${API_BASE_URLS.countries}/name/${encodeURIComponent(name)}?fields=name,capital,region,subregion,population,flags,currencies,languages,area,cca3`;
    return fetchWithErrorHandling(url);
  },

  // POST-like - Filter by region
  async getCountriesByRegion(region: string): Promise<Country[]> {
    const url = `${API_BASE_URLS.countries}/region/${encodeURIComponent(region)}?fields=name,capital,region,subregion,population,flags,currencies,languages,area,cca3`;
    return fetchWithErrorHandling(url);
  },
};

// ==================== CRYPTO API ====================
export const cryptoApi = {
  // GET - Fetch top cryptocurrencies
  async getTopCryptos(currency: string = 'usd', perPage: number = 20): Promise<CryptoData[]> {
    const url = `${API_BASE_URLS.crypto}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch single cryptocurrency
  async getCryptoById(id: string): Promise<any> {
    const url = `${API_BASE_URLS.crypto}/coins/${id}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch price history
  async getPriceHistory(id: string, days: number = 7): Promise<{ prices: [number, number][] }> {
    const url = `${API_BASE_URLS.crypto}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    return fetchWithErrorHandling(url);
  },

  // POST-like - Search cryptocurrencies
  async searchCryptos(query: string): Promise<{ coins: { id: string; name: string; symbol: string }[] }> {
    const url = `${API_BASE_URLS.crypto}/search?query=${encodeURIComponent(query)}`;
    return fetchWithErrorHandling(url);
  },
};

// ==================== POKEMON API ====================
export const pokemonApi = {
  // GET - Fetch paginated pokemon list
  async getPokemonList(limit: number = 20, offset: number = 0): Promise<{ results: { name: string; url: string }[]; count: number }> {
    const url = `${API_BASE_URLS.pokemon}/pokemon?limit=${limit}&offset=${offset}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch single pokemon by name or id
  async getPokemonById(idOrName: string | number): Promise<Pokemon> {
    const url = `${API_BASE_URLS.pokemon}/pokemon/${idOrName}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch pokemon species (for more details)
  async getPokemonSpecies(idOrName: string | number): Promise<any> {
    const url = `${API_BASE_URLS.pokemon}/pokemon-species/${idOrName}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch all types
  async getTypes(): Promise<{ results: { name: string; url: string }[] }> {
    const url = `${API_BASE_URLS.pokemon}/type`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch pokemon by type
  async getPokemonByType(type: string): Promise<{ pokemon: { pokemon: { name: string; url: string } }[] }> {
    const url = `${API_BASE_URLS.pokemon}/type/${type}`;
    return fetchWithErrorHandling(url);
  },

  // Helper - Get multiple pokemon details
  async getPokemonDetails(names: string[]): Promise<Pokemon[]> {
    const promises = names.map(name => this.getPokemonById(name));
    const results = await Promise.allSettled(promises);
    return results
      .filter((r): r is PromiseFulfilledResult<Pokemon> => r.status === 'fulfilled')
      .map(r => r.value);
  },
};

// ==================== EXCHANGE RATE API ====================
export interface ExchangeRate {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyConversion {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const exchangeApi = {
  // GET - Fetch latest exchange rates
  async getLatestRates(base: string = 'USD'): Promise<ExchangeRate> {
    const url = `${API_BASE_URLS.exchange}/latest?from=${base}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch available currencies
  async getCurrencies(): Promise<Record<string, string>> {
    const url = `${API_BASE_URLS.exchange}/currencies`;
    return fetchWithErrorHandling(url);
  },

  // POST-like - Convert amount between currencies
  async convert(amount: number, from: string, to: string): Promise<CurrencyConversion> {
    const url = `${API_BASE_URLS.exchange}/latest?amount=${amount}&from=${from}&to=${to}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch historical rates
  async getHistoricalRates(date: string, base: string = 'USD'): Promise<ExchangeRate> {
    const url = `${API_BASE_URLS.exchange}/${date}?from=${base}`;
    return fetchWithErrorHandling(url);
  },

  // GET - Fetch time series data
  async getTimeSeries(startDate: string, endDate: string, base: string = 'USD'): Promise<{ rates: Record<string, Record<string, number>> }> {
    const url = `${API_BASE_URLS.exchange}/${startDate}..${endDate}?from=${base}`;
    return fetchWithErrorHandling(url);
  },
};

// ==================== NEWS API ====================
export interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

// Mock news data for demo (NewsAPI requires API key and has CORS restrictions)
const mockNewsData: NewsArticle[] = [
  {
    source: { id: 'bbc-news', name: 'BBC News' },
    author: 'BBC News',
    title: 'Breaking: Major Technology Advances in AI Development',
    description: 'Scientists announce breakthrough in artificial intelligence that could revolutionize multiple industries.',
    url: 'https://example.com/news/1',
    urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    publishedAt: new Date().toISOString(),
    content: 'Full article content here...',
  },
  {
    source: { id: 'cnn', name: 'CNN' },
    author: 'John Smith',
    title: 'Global Markets Rally on Economic Optimism',
    description: 'Stock markets around the world see significant gains as investors respond to positive economic indicators.',
    url: 'https://example.com/news/2',
    urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    content: 'Full article content here...',
  },
  {
    source: { id: 'techcrunch', name: 'TechCrunch' },
    author: 'Jane Doe',
    title: 'New Startup Raises $100M for Green Energy Innovation',
    description: 'Clean energy startup secures major funding round to expand sustainable technology solutions.',
    url: 'https://example.com/news/3',
    urlToImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    content: 'Full article content here...',
  },
  {
    source: { id: 'reuters', name: 'Reuters' },
    author: 'Reuters Staff',
    title: 'Space Agency Announces New Mars Mission Timeline',
    description: 'International space agency reveals updated schedule for upcoming Mars exploration missions.',
    url: 'https://example.com/news/4',
    urlToImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    content: 'Full article content here...',
  },
  {
    source: { id: 'the-verge', name: 'The Verge' },
    author: 'Tech Reporter',
    title: 'Next-Gen Smartphones Set to Transform Mobile Experience',
    description: 'Industry experts preview upcoming smartphone technologies that will change how we interact with devices.',
    url: 'https://example.com/news/5',
    urlToImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    content: 'Full article content here...',
  },
  {
    source: { id: 'wired', name: 'Wired' },
    author: 'Science Writer',
    title: 'Climate Scientists Develop New Carbon Capture Method',
    description: 'Revolutionary technique could significantly reduce atmospheric carbon dioxide levels.',
    url: 'https://example.com/news/6',
    urlToImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f31?w=800',
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    content: 'Full article content here...',
  },
];

export const newsApi = {
  // GET - Fetch top headlines (tries proxy, falls back to mock data)
  async getTopHeadlines(category: string = 'general', country: string = 'us'): Promise<NewsResponse> {
    const proxyBase = (import.meta.env.VITE_NEWS_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/news/top-headlines?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore and fallback to mock
    }

    return {
      status: 'ok',
      totalResults: mockNewsData.length,
      articles: mockNewsData,
    };
  },

  // POST-like - Search news articles (tries proxy, falls back to mock filtering)
  async searchNews(query: string): Promise<NewsResponse> {
    const proxyBase = (import.meta.env.VITE_NEWS_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/news/search?q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // ignore and fallback
    }

    const filteredNews = mockNewsData.filter(
      article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description?.toLowerCase().includes(query.toLowerCase())
    );

    return {
      status: 'ok',
      totalResults: filteredNews.length,
      articles: filteredNews,
    };
  },

  // GET - Get news by category (delegates to top headlines)
  async getNewsByCategory(category: string): Promise<NewsResponse> {
    return this.getTopHeadlines(category, 'us');
  },
};

// ==================== TMDB (Movies) API ====================
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

// Mock movie data for demo (TMDB requires API key)
const mockMovieData: Movie[] = [
  {
    id: 1,
    title: 'The Matrix',
    overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    backdrop_path: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    release_date: '1999-03-30',
    vote_average: 8.2,
    vote_count: 24000,
    genre_ids: [28, 878],
    popularity: 89.5,
    adult: false,
    original_language: 'en',
  },
  {
    id: 2,
    title: 'Inception',
    overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg',
    backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [28, 878, 12],
    popularity: 95.2,
    adult: false,
    original_language: 'en',
  },
  {
    id: 3,
    title: 'Interstellar',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 32000,
    genre_ids: [12, 18, 878],
    popularity: 92.8,
    adult: false,
    original_language: 'en',
  },
  {
    id: 4,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime with the help of allies to dismantle the remaining criminal organizations.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 30000,
    genre_ids: [28, 80, 18],
    popularity: 88.7,
    adult: false,
    original_language: 'en',
  },
  {
    id: 5,
    title: 'Pulp Fiction',
    overview: 'The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption.',
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    backdrop_path: '/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg',
    release_date: '1994-09-10',
    vote_average: 8.5,
    vote_count: 26000,
    genre_ids: [80, 53],
    popularity: 78.4,
    adult: false,
    original_language: 'en',
  },
  {
    id: 6,
    title: 'Fight Club',
    overview: 'An insomniac office worker and a soap salesman build a global organization to help vent male aggression.',
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdrop_path: '/52AfXWuXCHn3UjD17rBruA9f5qb.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 27000,
    genre_ids: [18],
    popularity: 85.3,
    adult: false,
    original_language: 'en',
  },
];

const movieGenres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const moviesApi = {
  // GET - Fetch popular movies (tries proxy/TMDB, falls back to mock data)
  async getPopularMovies(page: number = 1): Promise<MovieResponse> {
    const proxyBase = (import.meta.env.VITE_TMDB_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/movies/popular?page=${page}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore and fallback
    }

    return {
      page,
      results: mockMovieData,
      total_pages: 1,
      total_results: mockMovieData.length,
    };
  },

  // GET - Fetch movie by ID (tries proxy/TMDB, falls back to mock)
  async getMovieById(id: number): Promise<Movie | undefined> {
    const proxyBase = (import.meta.env.VITE_TMDB_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/movies/${id}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore and fallback
    }

    return mockMovieData.find(m => m.id === id);
  },

  // POST-like - Search movies (tries proxy/TMDB, falls back to mock)
  async searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    const proxyBase = (import.meta.env.VITE_TMDB_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/movies/search?q=${encodeURIComponent(query)}&page=${page}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore and fallback
    }

    const filtered = mockMovieData.filter(
      movie => movie.title.toLowerCase().includes(query.toLowerCase())
    );
    return {
      page: 1,
      results: filtered,
      total_pages: 1,
      total_results: filtered.length,
    };
  },

  // GET - Fetch genres (tries TMDB API via proxy, falls back)
  async getGenres(): Promise<{ genres: Genre[] }> {
    const proxyBase = (import.meta.env.VITE_TMDB_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/movies/genres`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore and fallback
    }

    return { genres: movieGenres };
  },

  // GET - Fetch movies by genre (tries proxy/TMDB, falls back to mock)
  async getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieResponse> {
    const proxyBase = (import.meta.env.VITE_TMDB_PROXY_URL as string) ?? '';
    const url = `${proxyBase}/api/movies/genre/${genreId}?page=${page}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore and fallback
    }

    const filtered = mockMovieData.filter(m => m.genre_ids.includes(genreId));
    return {
      page: 1,
      results: filtered,
      total_pages: 1,
      total_results: filtered.length,
    };
  },

  // Helper - Get poster URL
  getPosterUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
};

// ==================== AGGREGATED DASHBOARD API ====================
export const dashboardApi = {
  // GET - Fetch dashboard overview (aggregates multiple APIs)
  async getDashboardData() {
    const [weather, characters, countries, cryptos, pokemon, exchangeRates, news, movies] = await Promise.allSettled([
      weatherApi.searchByCity('New York'),
      rickMortyApi.getCharacters(1),
      countriesApi.getAllCountries(),
      cryptoApi.getTopCryptos('usd', 5),
      pokemonApi.getPokemonList(5, 0),
      exchangeApi.getLatestRates('USD'),
      newsApi.getTopHeadlines(),
      moviesApi.getPopularMovies(),
    ]);

    return {
      weather: weather.status === 'fulfilled' ? weather.value : null,
      characters: characters.status === 'fulfilled' ? characters.value : null,
      countries: countries.status === 'fulfilled' ? countries.value : null,
      cryptos: cryptos.status === 'fulfilled' ? cryptos.value : null,
      pokemon: pokemon.status === 'fulfilled' ? pokemon.value : null,
      exchangeRates: exchangeRates.status === 'fulfilled' ? exchangeRates.value : null,
      news: news.status === 'fulfilled' ? news.value : null,
      movies: movies.status === 'fulfilled' ? movies.value : null,
    };
  },
};

// Export all APIs
export const api = {
  weather: weatherApi,
  rickMorty: rickMortyApi,
  countries: countriesApi,
  crypto: cryptoApi,
  pokemon: pokemonApi,
  exchange: exchangeApi,
  news: newsApi,
  movies: moviesApi,
  dashboard: dashboardApi,
};
