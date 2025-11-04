import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ALL_TAGS } from '../constants';
import { Tag } from '../types';
import { APP_ROUTES } from '../constants';

export const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addAnime } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<Set<Tag>>(new Set());
  const [feedback, setFeedback] = useState('');

  if (!currentUser?.isAdmin) {
    return <Navigate to={APP_ROUTES.HOME} replace />;
  }

  const handleTagToggle = (tag: Tag) => {
    setTags(prevTags => {
      const newTags = new Set(prevTags);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description && imageUrl && tags.size > 0) {
      addAnime({ title, description, imageUrl, tags: Array.from(tags) });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setTags(new Set());
      setFeedback('Anime added successfully!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
        setFeedback('Please fill out all fields and select at least one tag.');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-text-main mb-8">Admin Panel</h1>
      <Card className="p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Add New Anime/Manga</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Title</label>
            <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full mt-1 px-3 py-2 bg-secondary border border-gray-600 rounded-md text-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary">Image URL</label>
            <Input id="imageUrl" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required className="mt-1" placeholder="e.g., https://picsum.photos/seed/new/400/600"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(tag => (
                    <Button 
                        type="button"
                        key={tag}
                        variant={tags.has(tag) ? 'primary' : 'secondary'}
                        onClick={() => handleTagToggle(tag)}
                        className="text-xs"
                    >
                        {tag}
                    </Button>
                ))}
            </div>
          </div>
          {feedback && <p className="text-green-400 text-sm text-center">{feedback}</p>}
          <Button type="submit" className="w-full">Add Anime</Button>
        </form>
      </Card>
    </div>
  );
};
