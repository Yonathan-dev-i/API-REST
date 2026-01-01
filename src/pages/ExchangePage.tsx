import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { exchangeApi, ExchangeRate } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp, RefreshCw, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const popularCurrencies = ["EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL"];

export default function ExchangePage() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [amount, setAmount] = useState(1);
  const [targetCurrency, setTargetCurrency] = useState("EUR");

  const { data: rates, isLoading, error, refetch } = useQuery({
    queryKey: ["exchange-rates", baseCurrency],
    queryFn: () => exchangeApi.getLatestRates(baseCurrency),
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => exchangeApi.getCurrencies(),
  });

  const { data: conversion } = useQuery({
    queryKey: ["conversion", amount, baseCurrency, targetCurrency],
    queryFn: () => exchangeApi.convert(amount, baseCurrency, targetCurrency),
    enabled: amount > 0,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  const currencyList = currencies ? Object.entries(currencies) : [];

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
            <DollarSign className="w-10 h-10 text-exchange" />
            Tasas de cambio
          </h1>
          <p className="text-muted-foreground mt-1">
            Tipos de cambio en tiempo real proporcionados por la API Frankfurter
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar tasas
        </Button>
      </motion.div>

      {/* Currency Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-exchange" />
          Convertidor de divisas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground mb-2 block">Cantidad</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
              className="bg-secondary/50"
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground mb-2 block">Desde</label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-secondary/50 px-3 text-foreground"
            >
              {currencyList.map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground mb-2 block">A</label>
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="w-full h-10 rounded-md border border-border bg-secondary/50 px-3 text-foreground"
            >
              {currencyList.map(([code, name]) => (
                <option key={code} value={code}>
                  {code} - {name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="text-sm text-muted-foreground mb-2 block">Resultado</label>
            <div className="h-10 rounded-md border border-exchange/30 bg-exchange/10 px-3 flex items-center font-semibold text-exchange">
              {conversion?.rates[targetCurrency]
                ? `${conversion.rates[targetCurrency].toFixed(4)} ${targetCurrency}`
                : "—"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Popular Rates */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-exchange" />
          {baseCurrency} - Tasas de cambio
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {rates && popularCurrencies.map((currency, index) => {
            const rate = rates.rates[currency];
            if (!rate) return null;
            
            return (
              <motion.div
                key={currency}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card p-4 text-center hover:border-exchange/50 transition-colors cursor-pointer"
                onClick={() => setTargetCurrency(currency)}
              >
                <p className="text-2xl font-bold text-foreground">{currency}</p>
                <p className="text-lg font-semibold text-exchange">{rate.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">
                  {currencies?.[currency]}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* All Rates Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Todas las tasas de cambio</h2>
          <p className="text-sm text-muted-foreground">
            Última actualización: {rates?.date}
          </p> 
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 sticky top-0">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Moneda</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nombre</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {rates && Object.entries(rates.rates).map(([code, rate]) => (
                <tr
                  key={code}
                  className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => setTargetCurrency(code)}
                >
                  <td className="p-3 font-semibold">{code}</td>
                  <td className="p-3 text-muted-foreground">{currencies?.[code] || code}</td>
                  <td className="p-3 text-right font-mono text-exchange">{rate.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* API Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-exchange" />
          API Endpoints
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-exchange">GET /latest?from=USD</code>
            <p className="text-muted-foreground mt-1">Obtener últimas tasas de cambio</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-exchange">GET /currencies</code>
            <p className="text-muted-foreground mt-1">Obtener monedas disponibles</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-exchange">GET /latest?amount=100&from=USD&to=EUR</code>
            <p className="text-muted-foreground mt-1">Convertir entre monedas</p>
          </div>
          <div className="p-3 bg-secondary/50 rounded-lg">
            <code className="text-exchange">GET /2024-01-01?from=USD</code>
            <p className="text-muted-foreground mt-1">Obtener tasas históricas</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
