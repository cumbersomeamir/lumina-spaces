
import { DesignStyle } from './types';

export const DESIGN_STYLES: DesignStyle[] = [
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    description: 'Clean lines, minimalism, and functionality without sacrificing beauty.',
    prompt: 'Transform this room into a Scandinavian style interior. Use light woods, white walls, neutral textiles, and minimalist furniture. Ensure plenty of natural light and cozy "hygge" elements.',
    previewUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'mid-century',
    name: 'Mid-Century Modern',
    description: 'A balance of organic shapes and clean lines from the 1950s and 60s.',
    prompt: 'Redesign this room in Mid-Century Modern style. Use warm wood tones (teak, walnut), tapered legs on furniture, geometric patterns, and pops of mustard yellow or teal.',
    previewUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Raw materials, exposed architectural elements, and edgy aesthetics.',
    prompt: 'Give this room an Industrial makeover. Incorporate exposed brick, metal piping, weathered wood, leather accents, and a dark, moody color palette with large Edison bulb fixtures.',
    previewUrl: 'https://images.unsplash.com/photo-1512918766671-ed6a99807145?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    description: 'Free-spirited, eclectic, and full of life, culture, and interesting items.',
    prompt: 'Reimagine this space as a Bohemian sanctuary. Use vibrant colors, layered rugs, plenty of indoor plants, rattan furniture, and woven wall hangings.',
    previewUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'japandi',
    name: 'Japandi',
    description: 'The perfect blend of Japanese artistic minimalism and Scandinavian comfort.',
    prompt: 'Apply Japandi design to this room. Combine Scandinavian functionality with Japanese rustic minimalism. Use low furniture, organic shapes, and a muted earth-toned palette.',
    previewUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=400'
  }
];

export const APP_MODELS = {
  IMAGE: 'gemini-2.5-flash-image',
  TEXT: 'gemini-3-pro-preview'
};
