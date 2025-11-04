import { User, Rating, Anime } from '../types';

export const getRecommendations = (
  currentUser: User,
  allUsers: User[],
  allRatings: Rating[],
  allAnime: Anime[]
): Anime[] => {
  const currentUserRatings = allRatings.filter(r => r.userId === currentUser.id);

  if (currentUserRatings.length < 10) {
    return [];
  }

  const currentUserRatedAnimeIds = new Set(currentUserRatings.map(r => r.animeId));

  const otherUsers = allUsers.filter(u => u.id !== currentUser.id);
  const userSimilarityScores: { userId: string; score: number }[] = [];

  otherUsers.forEach(otherUser => {
    const otherUserRatings = allRatings.filter(r => r.userId === otherUser.id);
    let commonRatingsCount = 0;
    let totalDifference = 0;

    currentUserRatings.forEach(currentUserRating => {
      const otherUserCommonRating = otherUserRatings.find(
        r => r.animeId === currentUserRating.animeId
      );
      if (otherUserCommonRating) {
        commonRatingsCount++;
        totalDifference += Math.abs(currentUserRating.score - otherUserCommonRating.score);
      }
    });

    if (commonRatingsCount > 2) { // Require at least 3 common ratings for similarity
      const similarityScore = totalDifference / commonRatingsCount;
      userSimilarityScores.push({ userId: otherUser.id, score: similarityScore });
    }
  });

  // Sort by similarity (lower score is better)
  userSimilarityScores.sort((a, b) => a.score - b.score);
  
  const similarUsers = userSimilarityScores.slice(0, 5).map(s => s.userId);
  
  const recommendedAnimeIds = new Map<string, { totalScore: number; count: number }>();

  allRatings.forEach(rating => {
    // If a similar user rated an anime highly, and the current user hasn't seen it
    if (
      similarUsers.includes(rating.userId) &&
      rating.score >= 8 &&
      !currentUserRatedAnimeIds.has(rating.animeId)
    ) {
      if (!recommendedAnimeIds.has(rating.animeId)) {
        recommendedAnimeIds.set(rating.animeId, { totalScore: 0, count: 0 });
      }
      const current = recommendedAnimeIds.get(rating.animeId)!;
      current.totalScore += rating.score;
      current.count++;
    }
  });

  const recommendations = Array.from(recommendedAnimeIds.entries())
    .map(([animeId, data]) => ({
      animeId,
      avgScore: data.totalScore / data.count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)
    .map(rec => allAnime.find(a => a.id === rec.animeId))
    .filter((a): a is Anime => !!a);

  return recommendations;
};
