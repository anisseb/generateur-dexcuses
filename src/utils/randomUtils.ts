import subtitlesData from '../data/subtitles.json';

/**
 * Retourne une phrase aléatoire depuis le fichier de sous-titres
 */
export const getRandomSubtitle = (): string => {
  const subtitles = subtitlesData.subtitles;
  const randomIndex = Math.floor(Math.random() * subtitles.length);
  return subtitles[randomIndex];
};

/**
 * Retourne un élément aléatoire d'un tableau
 */
export const getRandomElement = <T>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

/**
 * Retourne un nombre aléatoire entre min et max (inclus)
 */
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Mélange un tableau de manière aléatoire
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 