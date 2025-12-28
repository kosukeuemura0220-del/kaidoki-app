"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Product = {
  name: string;
  price: number;
  image: string;
  url: string;
  category?: string;
  new_price?: number;
  used_price?: number;
};

interface WatchListContextType {
  watchList: Product[];
  addToWatchList: (product: Product) => void;
  removeFromWatchList: (name: string) => void;
}

const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

export function WatchListProvider({ children }: { children: ReactNode }) {
  const [watchList, setWatchList] = useState<Product[]>([]);

  const addToWatchList = (product: Product) => {
    setWatchList((prev) => {
      if (prev.find((item) => item.name === product.name)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWatchList = (name: string) => {
    setWatchList((prev) => prev.filter((item) => item.name !== name));
  };

  return (
    <WatchListContext.Provider value={{ watchList, addToWatchList, removeFromWatchList }}>
      {children}
    </WatchListContext.Provider>
  );
}

export const useWatchList = () => {
  const context = useContext(WatchListContext);
  if (!context) throw new Error("useWatchList must be used within WatchListProvider");
  return context;
};
