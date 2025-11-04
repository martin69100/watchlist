import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Anime, WatchStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Slider } from './ui/Slider';

interface AnimeCardProps {
  anime: Anime;
}

const WatchStatusIcon: React.FC<{ status: WatchStatus }> = ({ status }) => {
    if (status === WatchStatus.None) return null;
    const styles = "absolute top-2 right-2 text-xs font-bold text-white px-2 py-1 rounded-full";
    if (status === WatchStatus.Watched) {
        return <span className={`${styles} bg-green-600`}>Watched</span>;
    }
    if (status === WatchStatus.WantToWatch) {
        return <span className={`${styles} bg-blue-600`}>Want to Watch</span>;
    }
    return null;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const { currentUser } = useAuth();
  const { rateAnime, getRating, updateWatchStatus, getWatchStatus, ratings } = useData();

  const userRating = currentUser ? getRating(currentUser.id, anime.id) : undefined;
  const userWatchStatus = currentUser ? getWatchStatus(currentUser.id, anime.id) : WatchStatus.None;

  const [currentScore, setCurrentScore] = useState(userRating?.score || 5);
  const [showRating, setShowRating] = useState(false);

  const globalRatings = ratings.filter(r => r.animeId === anime.id);
  const averageScore = globalRatings.length > 0
    ? (globalRatings.reduce((acc, r) => acc + r.score, 0) / globalRatings.length).toFixed(1)
    : 'N/A';

  useEffect(() => {
    setCurrentScore(userRating?.score || 5);
  }, [userRating]);

  const handleRatingChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentScore(Number(e.target.value));
  }, []);

  const submitRating = () => {
    if (currentUser) {
      rateAnime(currentUser.id, anime.id, currentScore);
      setShowRating(false);
    }
  };
  
  const handleWatchlist = (status: WatchStatus) => {
      if (currentUser) {
          const newStatus = userWatchStatus === status ? WatchStatus.None : status;
          updateWatchStatus(currentUser.id, anime.id, newStatus);
      }
  }

  return (
    <Card className="flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
      <div className="relative">
        <Link to={`/anime/${anime.id}`}>
          <img src={anime.imageUrl} alt={anime.title} className="w-full h-96 object-cover" />
        </Link>
        <WatchStatusIcon status={userWatchStatus} />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-text-main flex-1 pr-2">
                <Link to={`/anime/${anime.id}`} className="hover:text-primary transition-colors">{anime.title}</Link>
            </h3>
            <div className="flex items-center space-x-1 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="font-bold text-text-main">{averageScore}</span>
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-secondary text-text-secondary px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="mt-auto pt-4">
        {currentUser && (
          showRating ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-secondary">Your Rating: </label>
                <span className="text-lg font-bold text-primary">{currentScore}</span>
              </div>
              <Slider
                min="1"
                max="10"
                step="1"
                value={currentScore}
                onChange={handleRatingChange}
              />
              <div className="flex space-x-2">
                <Button onClick={submitRating} className="w-full">
                  {userRating ? 'Update' : 'Rate'}
                </Button>
                <Button onClick={() => setShowRating(false)} variant="secondary" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Button onClick={() => setShowRating(true)} className="w-full">
                {userRating ? `Your Rating: ${userRating.score}` : 'Rate this'}
              </Button>
              <div className="flex space-x-2">
                  <Button onClick={() => handleWatchlist(WatchStatus.WantToWatch)} variant={userWatchStatus === WatchStatus.WantToWatch ? 'primary': 'secondary'} className="w-full text-sm">Want to Watch</Button>
                  <Button onClick={() => handleWatchlist(WatchStatus.Watched)} variant={userWatchStatus === WatchStatus.Watched ? 'primary': 'secondary'} className="w-full text-sm">Watched</Button>
              </div>
            </div>
          )
        )}
        {!currentUser && (
             <p className="text-center text-sm text-text-secondary">Login to rate and track.</p>
        )}
        </div>
      </div>
    </Card>
  );
};
