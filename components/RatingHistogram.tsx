import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rating } from '../types';

interface RatingHistogramProps {
  ratings: Rating[];
}

interface ChartData {
  name: string;
  count: number;
}

export const RatingHistogram: React.FC<RatingHistogramProps> = ({ ratings }) => {
  const data: ChartData[] = Array.from({ length: 10 }, (_, i) => ({
    name: `${i + 1}`,
    count: 0,
  }));

  ratings.forEach(rating => {
    if (rating.score >= 1 && rating.score <= 10) {
      data[rating.score - 1].count++;
    }
  });

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9ca3af" />
          <YAxis allowDecimals={false} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
            cursor={{ fill: 'rgba(99, 102, 241, 0.2)' }}
          />
          <Bar dataKey="count" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
