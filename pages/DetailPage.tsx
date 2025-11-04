import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { RatingHistogram } from '../components/RatingHistogram';
import { Card } from '../components/ui/Card';
import { APP_ROUTES } from '../constants';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { animeList, ratings } = useData();

  const anime = animeList.find(a => a.id === id);
  const animeRatings = ratings.filter(r => r.animeId === id);
  
  const averageScore = animeRatings.length > 0
    ? (animeRatings.reduce((acc, r) => acc + r.score, 0) / animeRatings.length).toFixed(1)
    : 'N/A';
    
  if (!anime) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Not Found</h1>
            <p className="text-lg text-text-secondary mb-8">The anime you're looking for doesn't exist.</p>
            <Link to={APP_ROUTES.HOME} className="text-primary hover:underline">
                &larr; Back to Home
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <img src={anime.imageUrl} alt={anime.title} className="w-full h-auto object-cover rounded-t-lg" />
            <div className="p-6">
                 <h1 className="text-3xl font-bold text-text-main">{anime.title}</h1>
                 <div className="flex items-center space-x-2 mt-2 text-yellow-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-2xl font-bold text-text-main">{averageScore}</span>
                    <span className="text-text-secondary">({animeRatings.length} ratings)</span>
                 </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card className="p-6 h-full">
                <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">Description</h2>
                <p className="text-text-secondary leading-relaxed">{anime.description}</p>
                
                <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mt-8 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                {anime.tags.map(tag => (
                    <span key={tag} className="text-sm bg-secondary text-text-main px-3 py-1 rounded-full">
                    {tag}
                    </span>
                ))}
                </div>

                <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mt-8 mb-4">Rating Distribution</h2>
                <RatingHistogram ratings={animeRatings} />
            </Card>
        </div>
      </div>
    </div>
  );
};
