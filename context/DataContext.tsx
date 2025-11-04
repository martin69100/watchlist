import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Anime, Rating, WatchlistItem, WatchStatus, User } from '../types';

interface DataContextType {
  animeList: Anime[];
  ratings: Rating[];
  watchlists: WatchlistItem[];
  users: User[];
  addAnime: (anime: Omit<Anime, 'id'>) => Promise<void>;
  rateAnime: (userId: string, animeId: string, score: number) => Promise<void>;
  updateWatchStatus: (userId: string, animeId: string, status: WatchStatus) => Promise<void>;
  getRating: (userId: string, animeId: string) => Rating | undefined;
  getWatchStatus: (userId: string, animeId: string) => WatchStatus;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/data`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { anime, ratings, watchlists, users } = await response.json();
        setAnimeList(anime);
        setRatings(ratings);
        setWatchlists(watchlists);
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch data from backend", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const addAnime = async (animeData: Omit<Anime, 'id'>) => {
    try {
      const response = await fetch(`/api/anime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animeData),
      });
      const newAnime = await response.json();
      setAnimeList(prev => [...prev, newAnime]);
    } catch (error) {
      console.error("Failed to add anime:", error);
    }
  };

  const rateAnime = async (userId: string, animeId: string, score: number) => {
     try {
      const response = await fetch(`/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, animeId, score }),
      });
      const updatedRating = await response.json();
      setRatings(prevRatings => {
        const existingRatingIndex = prevRatings.findIndex(r => r.userId === userId && r.animeId === animeId);
        if (existingRatingIndex > -1) {
          const updatedRatings = [...prevRatings];
          updatedRatings[existingRatingIndex] = updatedRating;
          return updatedRatings;
        }
        return [...prevRatings, updatedRating];
      });
    } catch (error) {
      console.error("Failed to rate anime:", error);
    }
  };

  const updateWatchStatus = async (userId: string, animeId: string, status: WatchStatus) => {
    try {
      const response = await fetch(`/api/watchlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, animeId, status }),
      });
      const updatedItem = await response.json();
      
      setWatchlists(prev => {
        const existingIndex = prev.findIndex(item => item.userId === userId && item.animeId === animeId);
        if (existingIndex > -1) {
          if (status === WatchStatus.None) {
            return prev.filter((_, index) => index !== existingIndex);
          }
          const updated = [...prev];
          updated[existingIndex] = updatedItem;
          return updated;
        }
        if (status !== WatchStatus.None) {
          return [...prev, updatedItem];
        }
        return prev;
      });
    } catch (error) {
       console.error("Failed to update watch status:", error);
    }
  };

  const getRating = (userId: string, animeId: string) => {
    return ratings.find(r => r.userId === userId && r.animeId === animeId);
  };

  const getWatchStatus = (userId: string, animeId: string) => {
    return watchlists.find(item => item.userId === userId && item.animeId === animeId)?.status ?? WatchStatus.None;
  };

  return (
    <DataContext.Provider value={{ animeList, ratings, watchlists, users, addAnime, rateAnime, updateWatchStatus, getRating, getWatchStatus, isLoading }}>
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