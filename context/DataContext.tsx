import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Anime, Rating, WatchlistItem, WatchStatus, Tag } from '../types';
import { MOCK_ANIME } from '../constants';

interface DataContextType {
  animeList: Anime[];
  ratings: Rating[];
  watchlists: WatchlistItem[];
  addAnime: (anime: Omit<Anime, 'id'>) => void;
  rateAnime: (userId: string, animeId: string, score: number) => void;
  updateWatchStatus: (userId: string, animeId: string, status: WatchStatus) => void;
  getRating: (userId: string, animeId: string) => Rating | undefined;
  getWatchStatus: (userId: string, animeId: string) => WatchStatus;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animeList, setAnimeList] = useLocalStorage<Anime[]>('animeList', MOCK_ANIME);
  const [ratings, setRatings] = useLocalStorage<Rating[]>('ratings', []);
  const [watchlists, setWatchlists] = useLocalStorage<WatchlistItem[]>('watchlists', []);

  const addAnime = (animeData: Omit<Anime, 'id'>) => {
    const newAnime: Anime = {
      ...animeData,
      id: `anime-${Date.now()}`,
    };
    setAnimeList([...animeList, newAnime]);
  };

  const rateAnime = (userId: string, animeId: string, score: number) => {
    setRatings(prevRatings => {
      const existingRatingIndex = prevRatings.findIndex(r => r.userId === userId && r.animeId === animeId);
      if (existingRatingIndex > -1) {
        const updatedRatings = [...prevRatings];
        updatedRatings[existingRatingIndex] = { ...updatedRatings[existingRatingIndex], score };
        return updatedRatings;
      }
      return [...prevRatings, { userId, animeId, score }];
    });
  };

  const updateWatchStatus = (userId: string, animeId: string, status: WatchStatus) => {
    setWatchlists(prev => {
      const existingIndex = prev.findIndex(item => item.userId === userId && item.animeId === animeId);
      if (existingIndex > -1) {
        if (status === WatchStatus.None) {
          return prev.filter((_, index) => index !== existingIndex);
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], status };
        return updated;
      }
      if (status !== WatchStatus.None) {
        return [...prev, { userId, animeId, status }];
      }
      return prev;
    });
  };

  const getRating = (userId: string, animeId: string) => {
    return ratings.find(r => r.userId === userId && r.animeId === animeId);
  };

  const getWatchStatus = (userId: string, animeId: string) => {
    return watchlists.find(item => item.userId === userId && item.animeId === animeId)?.status ?? WatchStatus.None;
  };

  return (
    <DataContext.Provider value={{ animeList, ratings, watchlists, addAnime, rateAnime, updateWatchStatus, getRating, getWatchStatus }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
