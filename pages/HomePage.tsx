import React, { useState, useMemo } from 'react';
import { AnimeCard } from '../components/AnimeCard';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ALL_TAGS } from '../constants';
import { Tag, WatchStatus } from '../types';
import { Input } from '../components/ui/Input';
import { Slider } from '../components/ui/Slider';
import { Button } from '../components/ui/Button';
import { getRecommendations } from '../services/recommendationService';

const FilterPanel: React.FC<{
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    isUserLoggedIn: boolean;
}> = ({ filters, setFilters, isUserLoggedIn }) => {

    const handleTagToggle = (tag: Tag) => {
        setFilters((prev: any) => {
            const newTags = new Set(prev.tags);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            } else {
                newTags.add(tag);
            }
            return { ...prev, tags: Array.from(newTags) };
        });
    };

    return (
        <div className="bg-secondary p-4 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Filter */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Search by Title</label>
                    <Input 
                        type="text" 
                        placeholder="e.g., Attack on Titan"
                        value={filters.search}
                        onChange={(e) => setFilters((p: any) => ({...p, search: e.target.value}))}
                    />
                </div>
                {/* Rating Filter */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Min. Average Rating: <span className="font-bold text-primary">{filters.minRating}</span></label>
                     <Slider 
                        min="1" max="10" step="0.5"
                        value={filters.minRating}
                        onChange={(e) => setFilters((p: any) => ({...p, minRating: Number(e.target.value)}))}
                    />
                </div>
                {/* User specific filters */}
                {isUserLoggedIn && (
                    <div className="flex items-end space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                className="h-4 w-4 rounded bg-secondary border-gray-500 text-primary focus:ring-primary"
                                checked={filters.showRatedOnly}
                                onChange={(e) => setFilters((p: any) => ({...p, showRatedOnly: e.target.checked}))}
                            />
                            <span className="text-sm text-text-secondary">My Rated</span>
                        </label>
                         <select 
                            value={filters.watchStatus}
                            onChange={(e) => setFilters((p:any) => ({...p, watchStatus: e.target.value as any}))}
                            className="bg-secondary border border-gray-600 rounded-md text-text-main py-2 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Watch Status</option>
                            <option value={WatchStatus.Watched}>Watched</option>
                            <option value={WatchStatus.WantToWatch}>Want to Watch</option>
                        </select>
                    </div>
                )}
            </div>
             {/* Tag Filters */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">Filter by Tags</label>
                <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map(tag => (
                        <Button 
                            key={tag}
                            variant={filters.tags.includes(tag) ? 'primary' : 'secondary'}
                            onClick={() => handleTagToggle(tag)}
                            className="text-xs"
                        >
                            {tag}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HomePage: React.FC = () => {
  const { animeList, ratings, watchlists, isLoading } = useData();
  const { currentUser, users } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    minRating: 1,
    tags: [] as Tag[],
    showRatedOnly: false,
    watchStatus: 'all',
  });

  const recommendations = useMemo(() => {
    if (currentUser && users.length > 0 && ratings.length > 0 && animeList.length > 0) {
        return getRecommendations(currentUser, users, ratings, animeList);
    }
    return [];
  }, [currentUser, users, ratings, animeList]);

  const filteredAnime = useMemo(() => {
    const userRatings = currentUser ? ratings.filter(r => r.userId === currentUser.id) : [];
    const userRatedAnimeIds = new Set(userRatings.map(r => r.animeId));
    
    const userWatchlist = currentUser ? watchlists.filter(w => w.userId === currentUser.id) : [];

    return animeList.filter(anime => {
      // Search filter
      if (filters.search && !anime.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Rating filter
      const globalRatings = ratings.filter(r => r.animeId === anime.id);
      if (globalRatings.length > 0) {
        const avgScore = globalRatings.reduce((sum, r) => sum + r.score, 0) / globalRatings.length;
        if (avgScore < filters.minRating) {
          return false;
        }
      } else {
        // Hide unrated items if user is filtering by a rating > 1
        if (filters.minRating > 1) {
          return false;
        }
      }

      // Tag filter
      if (filters.tags.length > 0 && !filters.tags.every(tag => anime.tags.includes(tag))) {
        return false;
      }

      // Show rated only filter
      if (currentUser && filters.showRatedOnly && !userRatedAnimeIds.has(anime.id)) {
        return false;
      }
      
      // Watch status filter
      if (currentUser && filters.watchStatus !== 'all') {
          const status = userWatchlist.find(w => w.animeId === anime.id)?.status ?? WatchStatus.None;
          if (status !== parseInt(filters.watchStatus)) {
              return false;
          }
      }

      return true;
    });
  }, [animeList, ratings, watchlists, filters, currentUser]);

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p className="text-xl text-text-secondary">Loading your universe...</p>
          </div>
      )
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold mb-2 text-text-main">Discover Anime & Manga</h1>
        <p className="text-lg text-text-secondary mb-8">Rate, track, and get recommendations for your favorite series.</p>
        
        {recommendations.length > 0 && (
            <div className="mb-12 bg-secondary p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-primary mb-4">Recommended For You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {recommendations.map(anime => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            </div>
        )}

        <FilterPanel filters={filters} setFilters={setFilters} isUserLoggedIn={!!currentUser} />

      {filteredAnime.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAnime.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-text-main">No Results Found</h2>
            <p className="text-text-secondary mt-2">Try adjusting your filters to find more series.</p>
        </div>
      )}
    </main>
  );
};