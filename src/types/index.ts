export interface User {
  id: string;
  username: string;
  avatar: string;
  clownPoints: number;
  level: number;
  title: string;
  joinedAt: Date;
  stats: {
    roastsGiven: number;
    roastsReceived: number;
    challengesWon: number;
    stickersCreated: number;
    memesShared: number;
  };
}

export interface RoomMember {
  id: string;
  username: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  theme: 'neon' | 'retro' | 'dark' | 'rainbow' | 'cyberpunk' | 'minimal' | 'nature' | 'ocean' | 'sunset';
  avatar: string;
  members: RoomMember[];
  createdBy: string;
  createdAt: Date;
  isPrivate: boolean;
  inviteCode: string;
}

export interface Roast {
  id: string;
  content: string;
  targetId: string;
  authorId: string;
  roomId: string;
  votes: {
    fire: number;
    brutal: number;
    wholesome: number;
  };
  likes?: number; // New field for likes
  dislikes?: number; // New field for dislikes
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'text' | 'sticker' | 'emoji';
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  roomId: string;
  timestamp: Date;
  reactions: Record<string, string[]>; // emoji -> user IDs
  stickerData?: {
    name: string;
    imageUrl: string;
    packId: string;
    stickerId?: string; // NEW: Store sticker ID for tracking and preview
  };
  editedAt?: Date;
  isEdited?: boolean;
}

export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  createdBy: string;
  usageCount: number;
  packId?: string;
  elementData?: StickerElement[]; // NEW: Store element data for editing
}

export interface StickerElement {
  id: string;
  type: 'text' | 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  layer: number;
  style?: {
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
  };
  imageData?: string; // Base64 image data
}

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  stickers: Sticker[];
  category: 'wholesome' | 'cursed' | 'roast' | 'meme' | 'custom';
  createdBy: string;
  price: number; // in ClownPoints
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'caption' | 'roast' | 'meme' | 'voice' | 'photo' | 'slap';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  reward: number;
  timeLimit: number; // in minutes
  participants: string[];
  submissions: ChallengeSubmission[];
  createdAt: Date;
  expiresAt: Date;
  gameState?: {
    phase: 'lobby' | 'active' | 'voting' | 'results';
    currentRound: number;
    maxRounds: number;
    scores: Record<string, number>;
    actions: ChallengeAction[];
  };
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  votes: number;
  submittedAt: Date;
}

export interface ChallengeAction {
  id: string;
  type: 'slap' | 'guess' | 'vote' | 'submit';
  userId: string;
  targetId?: string;
  data: any;
  timestamp: Date;
  round: number;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
  tags: string[];
  roomId: string;
  createdBy: string;
  reactions: Record<string, string[]>; // emoji -> user IDs
  likes?: number; // NEW: Add likes field like roasts
  dislikes?: number; // NEW: Add dislikes field like roasts
  createdAt: Date;
}

// Voice Integration Types
export interface VoiceSettings {
  voiceId: string;
  model: string;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

// Challenge Game Types
export interface SlapGameState {
  slapper: string;
  victim: string;
  guess?: string;
  correctGuess: boolean;
  roundComplete: boolean;
  scores: Record<string, number>;
}

export interface ChallengeParticipant {
  id: string;
  username: string;
  avatar: string;
  isCurrentUser: boolean;
  score: number;
  status: 'waiting' | 'active' | 'eliminated';
}