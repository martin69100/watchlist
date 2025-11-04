import React, { useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Tag } from '../types';
import { APP_ROUTES } from '../constants';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="p-4 text-center">
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
    </Card>
);

const AnimeStatCard: React.FC<{ title: string; animeId: string | null }> = ({ title, animeId }) => {
    const { animeList } = useData();
    const anime = animeId ? animeList.find(a => a.id === animeId) : null;

    return (
        <Card className="p-4 flex flex-col items-center">
            <h3 className="text-sm text-text-secondary mb-2">{title}</h3>
            {anime ? (
                 <Link to={`/anime/${anime.id}`} className="text-center group">
                    <img src={anime.imageUrl} alt={anime.title} className="w-24 h-36 object-cover rounded-md mx-auto mb-2 transition-transform group-hover:scale-105" />
                    <p className="font-semibold text-text-main group-hover:text-primary transition-colors">{anime.title}</p>
                 </Link>
            ) : (
                <p className="text-text-secondary mt-8">Not enough data</p>
            )}
        </Card>
    );
};


export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { ratings, animeList } = useData();

  const userStats = useMemo(() => {
    if (!currentUser) return null;

    const userRatings = ratings.filter(r => r.userId === currentUser.id);
    if (userRatings.length === 0) {
      return {
        totalRated: 0,
        averageScore: 'N/A',
        topTags: [],
        highestRated: null,
        lowestRated: null,
      };
    }

    const averageScore = (userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length).toFixed(2);
    
    const tagCounts = userRatings.reduce((acc, rating) => {
        const anime = animeList.find(a => a.id === rating.animeId);
        if (anime) {
            anime.tags.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<Tag, number>);

    const topTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag);

    userRatings.sort((a, b) => b.score - a.score);
    const highestRated = userRatings[0]?.animeId || null;
    const lowestRated = userRatings[userRatings.length - 1]?.animeId || null;

    return {
      totalRated: userRatings.length,
      averageScore,
      topTags,
      highestRated,
      lowestRated,
    };
  }, [currentUser, ratings, animeList]);

  if (!currentUser) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (!userStats) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-text-main mb-8">My Profile: <span className="text-primary">{currentUser.username}</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Series Rated" value={userStats.totalRated} />
        <StatCard title="My Average Score" value={userStats.averageScore} />
        <Card className="p-4 text-center">
            <p className="text-sm text-text-secondary">Top 3 Genres</p>
            {userStats.topTags.length > 0 ? (
                <div className="flex justify-center space-x-2 mt-2">
                    {userStats.topTags.map(tag => (
                        <span key={tag} className="text-xs bg-secondary text-text-main px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            ) : <p className="text-lg font-bold text-primary mt-1">Rate more to see!</p>}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimeStatCard title="Highest Rated" animeId={userStats.highestRated} />
        <AnimeStatCard title="Lowest Rated" animeId={userStats.lowestRated} />
      </div>
    </div>
  );
};
