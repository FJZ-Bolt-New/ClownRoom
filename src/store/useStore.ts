import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Room, Roast, Sticker, Challenge, Memory, RoomMember, ChatMessage } from '../types';
import React from 'react';

interface StickerPack {
  id: string;
  name: string;
  description: string;
  stickers: Sticker[];
  category: 'wholesome' | 'cursed' | 'roast' | 'meme' | 'custom';
  count: number;
  owned: boolean;
  price: number;
  createdBy: string;
  createdAt: Date;
}

interface ThemeSettings {
  colorScheme: 'neon' | 'retro' | 'cyberpunk' | 'rainbow' | 'minimal' | 'nature' | 'ocean' | 'sunset';
  darkMode: boolean;
  animations: boolean;
  soundEffects: boolean;
}

interface NotificationSettings {
  roastNotifications: boolean;
  chatMessages: boolean;
  challengeInvites: boolean;
  memoryTags: boolean;
  soundNotifications: boolean;
  browserNotifications: boolean;
}

// Memory image storage interface
interface MemoryImageStorage {
  [memoryId: string]: string[]; // memoryId -> array of base64 image data
}

// FIXED: Sticker image storage interface for large images
interface StickerImageStorage {
  [stickerId: string]: string; // stickerId -> base64 image data
}

interface AppState {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserPoints: (points: number) => void;
  
  // Room state
  rooms: Room[];
  currentRoom: Room | null;
  setRooms: (rooms: Room[]) => void;
  setCurrentRoom: (room: Room | null) => void;
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  deleteRoom: (roomId: string) => void;
  joinRoom: (roomId: string, userId: string) => void;
  joinRoomByCode: (inviteCode: string, user: User) => boolean;
  
  // Chat state
  chatMessages: Record<string, ChatMessage[]>; // roomId -> messages
  setChatMessages: (roomId: string, messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteChatMessage: (messageId: string, roomId: string) => void;
  addMessageReaction: (messageId: string, roomId: string, emoji: string, userId: string) => void;
  removeMessageReaction: (messageId: string, roomId: string, emoji: string, userId: string) => void;
  getChatMessages: (roomId: string) => ChatMessage[];
  
  // Roasts state
  roasts: Roast[];
  setRoasts: (roasts: Roast[]) => void;
  addRoast: (roast: Roast) => void;
  voteOnRoast: (roastId: string, voteType: keyof Roast['votes'], userId: string) => void;
  likeRoast: (roastId: string, userId: string, remove?: boolean) => void;
  dislikeRoast: (roastId: string, userId: string, remove?: boolean) => void;
  userVotes: Record<string, keyof Roast['votes']>; // Track user votes to prevent multiple votes
  userLikes: Record<string, boolean>; // Track user likes
  userDislikes: Record<string, boolean>; // Track user dislikes
  
  // Stickers state
  stickers: Sticker[];
  setStickers: (stickers: Sticker[]) => void;
  addSticker: (sticker: Sticker) => void;
  updateStickerUsage: (stickerId: string) => void;
  stickerPacks: StickerPack[];
  setStickerPacks: (packs: StickerPack[]) => void;
  addStickerPack: (pack: StickerPack) => void;
  updateStickerPack: (packId: string, updates: Partial<StickerPack>) => void;
  addStickerToPack: (sticker: Sticker, packId: string) => void;
  purchaseStickerPack: (packId: string, userId: string) => void;
  getStickersByPack: (packId: string) => Sticker[];
  
  // FIXED: Sticker image storage
  stickerImages: StickerImageStorage;
  setStickerImage: (stickerId: string, imageData: string) => void;
  getStickerImage: (stickerId: string) => string | null;
  deleteStickerImage: (stickerId: string) => void;
  
  // Challenges state
  challenges: Challenge[];
  setChallenges: (challenges: Challenge[]) => void;
  addChallenge: (challenge: Challenge) => void;
  joinChallenge: (challengeId: string, userId: string) => void;
  updateChallenge: (challenge: Challenge) => void;
  
  // Memories state
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  deleteMemory: (memoryId: string) => void;
  addReaction: (memoryId: string, emoji: string, userId: string) => void;
  userReactions: Record<string, string[]>; // Track user reactions per memory
  
  // Memory like/dislike functionality
  likeMemory: (memoryId: string, userId: string, remove?: boolean) => void;
  dislikeMemory: (memoryId: string, userId: string, remove?: boolean) => void;
  userMemoryLikes: Record<string, boolean>; // Track user memory likes
  userMemoryDislikes: Record<string, boolean>; // Track user memory dislikes
  
  // Memory image storage
  memoryImages: MemoryImageStorage;
  setMemoryImages: (memoryId: string, images: string[]) => void;
  getMemoryImages: (memoryId: string) => string[];
  deleteMemoryImages: (memoryId: string) => void;
  
  // UI state
  activeView: 'rooms' | 'roasts' | 'chat' | 'stickers' | 'challenges' | 'memories' | 'profile';
  setActiveView: (view: AppState['activeView']) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  
  // Settings
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: Partial<ThemeSettings>) => void;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Session state
  lastActiveTime: number;
  setLastActiveTime: (time: number) => void;
}

// Enhanced date reviver function
const dateReviver = (key: string, value: any): any => {
  if (typeof value === 'string') {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDatePattern.test(value)) {
      return new Date(value);
    }
  }
  
  if (Array.isArray(value)) {
    return value.map(item => dateReviver('', item));
  }
  
  if (value && typeof value === 'object') {
    const result: any = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = dateReviver(k, v);
    }
    return result;
  }
  
  return value;
};

// Generate a 6-character invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Enhanced theme color mappings with light mode themes
const themeColors = {
  neon: {
    primary: '#FF6B9D',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
    orange: '#FF8A5B',
    purple: '#9B59B6',
  },
  retro: {
    primary: '#FF8A5B',
    secondary: '#F1C40F',
    accent: '#E74C3C',
    orange: '#FF6B35',
    purple: '#8E44AD',
  },
  cyberpunk: {
    primary: '#00FFFF',
    secondary: '#9B59B6',
    accent: '#FF1493',
    orange: '#FF4500',
    purple: '#8A2BE2',
  },
  rainbow: {
    primary: '#E74C3C',
    secondary: '#2ECC71',
    accent: '#F1C40F',
    orange: '#FF8C00',
    purple: '#9932CC',
  },
  minimal: {
    primary: '#6366f1',
    secondary: '#10b981',
    accent: '#f59e0b',
    orange: '#f97316',
    purple: '#8b5cf6',
  },
  nature: {
    primary: '#059669',
    secondary: '#0d9488',
    accent: '#ca8a04',
    orange: '#ea580c',
    purple: '#7c3aed',
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#0891b2',
    orange: '#f97316',
    purple: '#8b5cf6',
  },
  sunset: {
    primary: '#dc2626',
    secondary: '#ea580c',
    accent: '#d97706',
    orange: '#f59e0b',
    purple: '#be185d',
  },
};

// Apply theme colors to CSS variables and handle light/dark mode
const applyTheme = (colorScheme: keyof typeof themeColors, darkMode: boolean = true) => {
  const colors = themeColors[colorScheme];
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-orange', colors.orange);
  root.style.setProperty('--color-purple', colors.purple);
  
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${colorScheme}`);
  
  if (darkMode) {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    root.style.setProperty('--bg-dark', '#1a1a2e');
    root.style.setProperty('--bg-dark-light', '#16213e');
    root.style.setProperty('--bg-dark-card', '#0f3460');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e5e7eb');
    root.style.setProperty('--border-color', '#374151');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    root.style.setProperty('--bg-dark', '#f8fafc');
    root.style.setProperty('--bg-dark-light', '#f1f5f9');
    root.style.setProperty('--bg-dark-card', '#ffffff');
    root.style.setProperty('--text-primary', '#1f2937');
    root.style.setProperty('--text-secondary', '#4b5563');
    root.style.setProperty('--border-color', '#d1d5db');
  }
};

// Storage keys
const MEMORY_IMAGES_KEY = 'clownroom-memory-images';
const STICKER_IMAGES_KEY = 'clownroom-sticker-images';

// Helper functions for memory image storage
const saveMemoryImagesToStorage = (memoryImages: MemoryImageStorage) => {
  try {
    localStorage.setItem(MEMORY_IMAGES_KEY, JSON.stringify(memoryImages));
  } catch (error) {
    console.warn('Failed to save memory images to localStorage:', error);
    try {
      const keys = Object.keys(localStorage);
      const imageKeys = keys.filter(key => key.startsWith(MEMORY_IMAGES_KEY));
      
      if (imageKeys.length > 50) {
        const keysToRemove = imageKeys.slice(0, imageKeys.length - 50);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      
      localStorage.setItem(MEMORY_IMAGES_KEY, JSON.stringify(memoryImages));
    } catch (cleanupError) {
      console.error('Failed to save memory images even after cleanup:', cleanupError);
    }
  }
};

const loadMemoryImagesFromStorage = (): MemoryImageStorage => {
  try {
    const stored = localStorage.getItem(MEMORY_IMAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load memory images from localStorage:', error);
    return {};
  }
};

// COMPLETELY REWRITTEN: Sticker image storage with better compression and chunking
const saveStickerImagesToStorage = (stickerImages: StickerImageStorage) => {
  try {
    // Clear old sticker image entries first
    const keys = Object.keys(localStorage);
    const oldStickerKeys = keys.filter(key => key.startsWith(STICKER_IMAGES_KEY));
    oldStickerKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore errors when removing old keys
      }
    });

    // Save each sticker image separately with chunking for large images
    Object.entries(stickerImages).forEach(([stickerId, imageData]) => {
      try {
        const maxChunkSize = 100000; // 100KB chunks
        
        if (imageData.length > maxChunkSize) {
          // Split large images into chunks
          const numChunks = Math.ceil(imageData.length / maxChunkSize);
          
          // Save metadata
          localStorage.setItem(`${STICKER_IMAGES_KEY}-${stickerId}-meta`, JSON.stringify({
            chunks: numChunks,
            totalSize: imageData.length
          }));
          
          // Save chunks
          for (let i = 0; i < numChunks; i++) {
            const chunk = imageData.slice(i * maxChunkSize, (i + 1) * maxChunkSize);
            localStorage.setItem(`${STICKER_IMAGES_KEY}-${stickerId}-chunk-${i}`, chunk);
          }
        } else {
          // Save small images directly
          localStorage.setItem(`${STICKER_IMAGES_KEY}-${stickerId}`, imageData);
        }
      } catch (error) {
        console.warn(`Failed to save sticker image ${stickerId}:`, error);
        // Try to save a compressed version
        try {
          const compressedData = imageData.slice(0, 50000); // Truncate if too large
          localStorage.setItem(`${STICKER_IMAGES_KEY}-${stickerId}-compressed`, compressedData);
        } catch (compressError) {
          console.error(`Failed to save even compressed sticker image ${stickerId}:`, compressError);
        }
      }
    });
    
  } catch (error) {
    console.warn('Failed to save sticker images to localStorage:', error);
  }
};

const loadStickerImagesFromStorage = (): StickerImageStorage => {
  try {
    const stickerImages: StickerImageStorage = {};
    const keys = Object.keys(localStorage);
    const stickerKeys = keys.filter(key => key.startsWith(STICKER_IMAGES_KEY));
    
    // Group keys by sticker ID
    const stickerGroups: Record<string, string[]> = {};
    stickerKeys.forEach(key => {
      const keyParts = key.replace(STICKER_IMAGES_KEY + '-', '');
      const stickerId = keyParts.split('-')[0];
      
      if (!stickerGroups[stickerId]) {
        stickerGroups[stickerId] = [];
      }
      stickerGroups[stickerId].push(key);
    });
    
    // Reconstruct images
    Object.entries(stickerGroups).forEach(([stickerId, keys]) => {
      try {
        const metaKey = keys.find(k => k.includes('-meta'));
        const directKey = keys.find(k => k === `${STICKER_IMAGES_KEY}-${stickerId}`);
        const compressedKey = keys.find(k => k.includes('-compressed'));
        
        if (metaKey) {
          // Reconstruct chunked image
          try {
            const meta = JSON.parse(localStorage.getItem(metaKey) || '{}');
            const chunks: string[] = [];
            
            for (let i = 0; i < meta.chunks; i++) {
              const chunkKey = `${STICKER_IMAGES_KEY}-${stickerId}-chunk-${i}`;
              const chunk = localStorage.getItem(chunkKey);
              if (chunk) {
                chunks.push(chunk);
              }
            }
            
            if (chunks.length === meta.chunks) {
              stickerImages[stickerId] = chunks.join('');
            }
          } catch (error) {
            console.warn(`Failed to reconstruct chunked sticker image ${stickerId}:`, error);
          }
        } else if (directKey) {
          // Load direct image
          const imageData = localStorage.getItem(directKey);
          if (imageData) {
            stickerImages[stickerId] = imageData;
          }
        } else if (compressedKey) {
          // Load compressed fallback
          const imageData = localStorage.getItem(compressedKey);
          if (imageData) {
            stickerImages[stickerId] = imageData;
          }
        }
      } catch (error) {
        console.warn(`Failed to load sticker image ${stickerId}:`, error);
      }
    });
    
    return stickerImages;
  } catch (error) {
    console.warn('Failed to load sticker images from localStorage:', error);
    return {};
  }
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      currentUser: {
        id: 'user-1',
        username: 'ClownMaster',
        avatar: '🤡',
        clownPoints: 1337,
        level: 7,
        title: 'Supreme Jester',
        joinedAt: new Date('2024-01-01'),
        stats: {
          roastsGiven: 42,
          roastsReceived: 38,
          challengesWon: 15,
          stickersCreated: 23,
          memesShared: 156,
        },
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      updateUser: (updates) => set((state) => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
      })),
      updateUserPoints: (points) => set((state) => ({
        currentUser: state.currentUser ? {
          ...state.currentUser,
          clownPoints: Math.max(0, state.currentUser.clownPoints + points)
        } : null
      })),
      
      // Room state
      rooms: [
        {
          id: 'room-1',
          name: 'The Chaos Den',
          description: 'Where sanity goes to die 💀',
          theme: 'neon',
          avatar: '🔥',
          members: [
            {
              id: 'user-1',
              username: 'ClownMaster',
              avatar: '🤡',
              role: 'owner',
              joinedAt: new Date('2024-01-15'),
            },
            {
              id: 'user-2',
              username: 'MemeLord42',
              avatar: '😈',
              role: 'admin',
              joinedAt: new Date('2024-01-16'),
            },
            {
              id: 'user-3',
              username: 'ChaosQueen',
              avatar: '👑',
              role: 'member',
              joinedAt: new Date('2024-01-17'),
            },
          ],
          createdBy: 'user-1',
          createdAt: new Date('2024-01-15'),
          isPrivate: true,
          inviteCode: 'CHAOS1',
        },
        {
          id: 'room-2',
          name: 'Meme Lords',
          description: 'Elite meme warfare zone 🧠',
          theme: 'cyberpunk',
          avatar: '🧠',
          members: [
            {
              id: 'user-1',
              username: 'ClownMaster',
              avatar: '🤡',
              role: 'owner',
              joinedAt: new Date('2024-02-01'),
            },
          ],
          createdBy: 'user-1',
          createdAt: new Date('2024-02-01'),
          isPrivate: true,
          inviteCode: 'MEMES1',
        },
      ],
      currentRoom: null,
      setRooms: (rooms) => set({ rooms }),
      setCurrentRoom: (room) => set({ 
        currentRoom: room,
        lastActiveTime: Date.now()
      }),
      addRoom: (room) => set((state) => ({ 
        rooms: [...state.rooms, { ...room, inviteCode: room.inviteCode || generateInviteCode() }] 
      })),
      updateRoom: (updatedRoom) => set((state) => ({
        rooms: state.rooms.map(room => 
          room.id === updatedRoom.id ? updatedRoom : room
        ),
        currentRoom: state.currentRoom?.id === updatedRoom.id ? updatedRoom : state.currentRoom
      })),
      deleteRoom: (roomId) => set((state) => {
        const roomToDelete = state.rooms.find(room => room.id === roomId);
        
        if (!roomToDelete) {
          return state;
        }
        
        if (roomToDelete.createdBy !== state.currentUser?.id) {
          return state;
        }
        
        const updatedRooms = state.rooms.filter(room => room.id !== roomId);
        const updatedCurrentRoom = state.currentRoom?.id === roomId ? null : state.currentRoom;
        const updatedChatMessages = { ...state.chatMessages };
        delete updatedChatMessages[roomId];
        const updatedRoasts = state.roasts.filter(roast => roast.roomId !== roomId);
        const updatedMemories = state.memories.filter(memory => memory.roomId !== roomId);
        const updatedActiveView = state.currentRoom?.id === roomId ? 'rooms' : state.activeView;
        
        return {
          ...state,
          rooms: updatedRooms,
          currentRoom: updatedCurrentRoom,
          chatMessages: updatedChatMessages,
          roasts: updatedRoasts,
          memories: updatedMemories,
          activeView: updatedActiveView,
          lastActiveTime: Date.now()
        };
      }),
      joinRoom: (roomId, userId) => set((state) => ({
        rooms: state.rooms.map(room => 
          room.id === roomId 
            ? { ...room, members: [...room.members.filter(m => m.id !== userId)] }
            : room
        )
      })),
      
      joinRoomByCode: (inviteCode, user) => {
        const state = get();
        
        const room = state.rooms.find(r => 
          r.inviteCode.toLowerCase() === inviteCode.toLowerCase()
        );
        
        if (!room) {
          return false;
        }
        
        const isAlreadyMember = room.members.some(member => member.id === user.id);
        
        if (isAlreadyMember) {
          set({ 
            currentRoom: room,
            lastActiveTime: Date.now()
          });
          return true;
        }
        
        const newMember: RoomMember = {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          role: 'member',
          joinedAt: new Date(),
        };
        
        const updatedRoom = {
          ...room,
          members: [...room.members, newMember]
        };
        
        set((state) => ({
          rooms: state.rooms.map(r => 
            r.id === room.id ? updatedRoom : r
          ),
          currentRoom: updatedRoom,
          lastActiveTime: Date.now()
        }));
        
        return true;
      },
      
      // Chat state
      chatMessages: {},
      setChatMessages: (roomId, messages) => set((state) => ({
        chatMessages: { ...state.chatMessages, [roomId]: messages }
      })),
      addChatMessage: (message) => set((state) => {
        const roomMessages = state.chatMessages[message.roomId] || [];
        return {
          chatMessages: {
            ...state.chatMessages,
            [message.roomId]: [...roomMessages, message]
          },
          lastActiveTime: Date.now()
        };
      }),
      updateChatMessage: (messageId, updates) => set((state) => {
        const newChatMessages = { ...state.chatMessages };
        Object.keys(newChatMessages).forEach(roomId => {
          newChatMessages[roomId] = newChatMessages[roomId].map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          );
        });
        return { 
          chatMessages: newChatMessages,
          lastActiveTime: Date.now()
        };
      }),
      deleteChatMessage: (messageId, roomId) => set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [roomId]: (state.chatMessages[roomId] || []).filter(msg => msg.id !== messageId)
        },
        lastActiveTime: Date.now()
      })),
      addMessageReaction: (messageId, roomId, emoji, userId) => set((state) => {
        const roomMessages = state.chatMessages[roomId] || [];
        const updatedMessages = roomMessages.map(msg => {
          if (msg.id === messageId) {
            const currentReactions = msg.reactions[emoji] || [];
            if (!currentReactions.includes(userId)) {
              return {
                ...msg,
                reactions: {
                  ...msg.reactions,
                  [emoji]: [...currentReactions, userId]
                }
              };
            }
          }
          return msg;
        });
        
        return {
          chatMessages: {
            ...state.chatMessages,
            [roomId]: updatedMessages
          },
          lastActiveTime: Date.now()
        };
      }),
      removeMessageReaction: (messageId, roomId, emoji, userId) => set((state) => {
        const roomMessages = state.chatMessages[roomId] || [];
        const updatedMessages = roomMessages.map(msg => {
          if (msg.id === messageId) {
            const currentReactions = msg.reactions[emoji] || [];
            return {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: currentReactions.filter(id => id !== userId)
              }
            };
          }
          return msg;
        });
        
        return {
          chatMessages: {
            ...state.chatMessages,
            [roomId]: updatedMessages
          },
          lastActiveTime: Date.now()
        };
      }),
      getChatMessages: (roomId) => {
        const state = get();
        return state.chatMessages[roomId] || [];
      },
      
      // Roasts state
      roasts: [],
      setRoasts: (roasts) => set({ roasts }),
      addRoast: (roast) => set((state) => ({ 
        roasts: [...state.roasts, roast],
        lastActiveTime: Date.now()
      })),
      voteOnRoast: (roastId, voteType, userId) => set((state) => {
        if (state.userVotes[roastId]) {
          return state;
        }
        
        return {
          roasts: state.roasts.map(roast =>
            roast.id === roastId
              ? { ...roast, votes: { ...roast.votes, [voteType]: roast.votes[voteType] + 1 } }
              : roast
          ),
          userVotes: { ...state.userVotes, [roastId]: voteType },
          lastActiveTime: Date.now()
        };
      }),
      likeRoast: (roastId, userId, remove = false) => set((state) => {
        if (remove) {
          return {
            roasts: state.roasts.map(roast =>
              roast.id === roastId
                ? { ...roast, likes: Math.max((roast.likes || 0) - 1, 0) }
                : roast
            ),
            userLikes: { ...state.userLikes, [roastId]: false },
            lastActiveTime: Date.now()
          };
        } else {
          return {
            roasts: state.roasts.map(roast =>
              roast.id === roastId
                ? { ...roast, likes: (roast.likes || 0) + 1 }
                : roast
            ),
            userLikes: { ...state.userLikes, [roastId]: true },
            lastActiveTime: Date.now()
          };
        }
      }),
      dislikeRoast: (roastId, userId, remove = false) => set((state) => {
        if (remove) {
          return {
            roasts: state.roasts.map(roast =>
              roast.id === roastId
                ? { ...roast, dislikes: Math.max((roast.dislikes || 0) - 1, 0) }
                : roast
            ),
            userDislikes: { ...state.userDislikes, [roastId]: false },
            lastActiveTime: Date.now()
          };
        } else {
          return {
            roasts: state.roasts.map(roast =>
              roast.id === roastId
                ? { ...roast, dislikes: (roast.dislikes || 0) + 1 }
                : roast
            ),
            userDislikes: { ...state.userDislikes, [roastId]: true },
            lastActiveTime: Date.now()
          };
        }
      }),
      userVotes: {},
      userLikes: {},
      userDislikes: {},
      
      // Stickers state
      stickers: [],
      setStickers: (stickers) => set({ stickers }),
      addSticker: (sticker) => set((state) => ({ 
        stickers: [...state.stickers, sticker],
        lastActiveTime: Date.now()
      })),
      updateStickerUsage: (stickerId) => set((state) => {
        // Update usage in both stickers array and sticker packs
        const updatedStickers = state.stickers.map(sticker =>
          sticker.id === stickerId
            ? { ...sticker, usageCount: sticker.usageCount + 1 }
            : sticker
        );
        
        const updatedStickerPacks = state.stickerPacks.map(pack => ({
          ...pack,
          stickers: pack.stickers.map(sticker =>
            sticker.id === stickerId
              ? { ...sticker, usageCount: sticker.usageCount + 1 }
              : sticker
          )
        }));
        
        return {
          stickers: updatedStickers,
          stickerPacks: updatedStickerPacks,
          lastActiveTime: Date.now()
        };
      }),
      stickerPacks: [
        {
          id: 'pack-default',
          name: 'My Stickers',
          description: 'Your custom sticker collection',
          stickers: [],
          category: 'custom',
          count: 0,
          owned: true,
          price: 0,
          createdBy: 'user-1',
          createdAt: new Date(),
        },
        {
          id: 'pack-roast',
          name: 'Roast Masters',
          description: 'For the ultimate roasters',
          stickers: [],
          category: 'roast',
          count: 0,
          owned: false,
          price: 500,
          createdBy: 'system',
          createdAt: new Date(),
        },
        {
          id: 'pack-wholesome',
          name: 'Wholesome Vibes',
          description: 'Spread the good energy',
          stickers: [],
          category: 'wholesome',
          count: 0,
          owned: false,
          price: 300,
          createdBy: 'system',
          createdAt: new Date(),
        },
      ],
      setStickerPacks: (packs) => set({ stickerPacks: packs }),
      addStickerPack: (pack) => set((state) => ({ 
        stickerPacks: [...state.stickerPacks, pack],
        lastActiveTime: Date.now()
      })),
      updateStickerPack: (packId, updates) => set((state) => ({
        stickerPacks: state.stickerPacks.map(pack =>
          pack.id === packId ? { ...pack, ...updates } : pack
        ),
        lastActiveTime: Date.now()
      })),
      addStickerToPack: (sticker, packId) => set((state) => {
        console.log('Adding sticker to pack:', { sticker, packId });
        
        const newStickers = [...state.stickers, sticker];
        
        const updatedPacks = state.stickerPacks.map(pack => {
          if (pack.id === packId) {
            const updatedPack = {
              ...pack,
              stickers: [...pack.stickers, sticker],
              count: pack.count + 1
            };
            console.log('Updated pack:', updatedPack);
            return updatedPack;
          }
          return pack;
        });
        
        console.log('Final state update:', { stickers: newStickers, stickerPacks: updatedPacks });
        
        return {
          stickers: newStickers,
          stickerPacks: updatedPacks,
          lastActiveTime: Date.now()
        };
      }),
      purchaseStickerPack: (packId, userId) => set((state) => {
        const pack = state.stickerPacks.find(p => p.id === packId);
        if (!pack || pack.owned || !state.currentUser) return state;
        
        if (state.currentUser.clownPoints < pack.price) return state;
        
        return {
          stickerPacks: state.stickerPacks.map(p =>
            p.id === packId ? { ...p, owned: true } : p
          ),
          currentUser: {
            ...state.currentUser,
            clownPoints: state.currentUser.clownPoints - pack.price
          },
          lastActiveTime: Date.now()
        };
      }),
      getStickersByPack: (packId) => {
        const state = get();
        const pack = state.stickerPacks.find(p => p.id === packId);
        return pack ? pack.stickers : [];
      },
      
      // FIXED: Sticker image storage functions
      stickerImages: loadStickerImagesFromStorage(),
      setStickerImage: (stickerId, imageData) => set((state) => {
        console.log('Setting sticker image:', stickerId, 'Size:', imageData.length);
        const newStickerImages = { ...state.stickerImages, [stickerId]: imageData };
        
        // Save to localStorage immediately
        try {
          saveStickerImagesToStorage(newStickerImages);
          console.log('Sticker image saved successfully');
        } catch (error) {
          console.error('Failed to save sticker image:', error);
        }
        
        return { stickerImages: newStickerImages };
      }),
      getStickerImage: (stickerId) => {
        const state = get();
        const image = state.stickerImages[stickerId];
        console.log('Getting sticker image:', stickerId, 'Found:', !!image);
        return image || null;
      },
      deleteStickerImage: (stickerId) => set((state) => {
        console.log('Deleting sticker image:', stickerId);
        const newStickerImages = { ...state.stickerImages };
        delete newStickerImages[stickerId];
        
        // Clean up localStorage
        try {
          const keys = Object.keys(localStorage);
          const stickerKeys = keys.filter(key => key.startsWith(`${STICKER_IMAGES_KEY}-${stickerId}`));
          stickerKeys.forEach(key => {
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn('Failed to remove localStorage key:', key);
            }
          });
          
          saveStickerImagesToStorage(newStickerImages);
          console.log('Sticker image deleted successfully');
        } catch (error) {
          console.error('Failed to delete sticker image:', error);
        }
        
        return { stickerImages: newStickerImages };
      }),
      
      // Challenges state
      challenges: [],
      setChallenges: (challenges) => set({ challenges }),
      addChallenge: (challenge) => set((state) => ({ 
        challenges: [...state.challenges, challenge],
        lastActiveTime: Date.now()
      })),
      joinChallenge: (challengeId, userId) => set((state) => ({
        challenges: state.challenges.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, participants: [...challenge.participants, userId] }
            : challenge
        ),
        lastActiveTime: Date.now()
      })),
      updateChallenge: (updatedChallenge) => set((state) => ({
        challenges: state.challenges.map(challenge =>
          challenge.id === updatedChallenge.id ? updatedChallenge : challenge
        ),
        lastActiveTime: Date.now()
      })),
      
      // Memories state
      memories: [],
      setMemories: (memories) => set({ memories }),
      addMemory: (memory) => set((state) => {
        if (memory.mediaUrls && memory.mediaUrls.some(url => url.startsWith('data:'))) {
          const images = memory.mediaUrls.filter(url => url.startsWith('data:'));
          const nonDataUrls = memory.mediaUrls.filter(url => !url.startsWith('data:'));
          
          const newMemoryImages = { ...state.memoryImages };
          newMemoryImages[memory.id] = images;
          saveMemoryImagesToStorage(newMemoryImages);
          
          const memoryWithPlaceholders = {
            ...memory,
            mediaUrls: [
              ...nonDataUrls,
              ...images.map((_, index) => `stored-image-${memory.id}-${index}`)
            ]
          };
          
          return {
            memories: [...state.memories, memoryWithPlaceholders],
            memoryImages: newMemoryImages,
            lastActiveTime: Date.now()
          };
        } else {
          return {
            memories: [...state.memories, memory],
            lastActiveTime: Date.now()
          };
        }
      }),
      deleteMemory: (memoryId) => set((state) => {
        const newMemoryImages = { ...state.memoryImages };
        delete newMemoryImages[memoryId];
        saveMemoryImagesToStorage(newMemoryImages);
        
        return {
          memories: state.memories.filter(memory => memory.id !== memoryId),
          memoryImages: newMemoryImages,
          lastActiveTime: Date.now()
        };
      }),
      addReaction: (memoryId, emoji, userId) => set((state) => {
        const userMemoryReactions = state.userReactions[memoryId] || [];
        if (userMemoryReactions.includes(emoji)) {
          return state;
        }
        
        return {
          memories: state.memories.map(memory =>
            memory.id === memoryId
              ? {
                  ...memory,
                  reactions: {
                    ...memory.reactions,
                    [emoji]: memory.reactions[emoji] 
                      ? [...memory.reactions[emoji], userId]
                      : [userId]
                  }
                }
              : memory
          ),
          userReactions: {
            ...state.userReactions,
            [memoryId]: [...userMemoryReactions, emoji]
          },
          lastActiveTime: Date.now()
        };
      }),
      userReactions: {},
      
      likeMemory: (memoryId, userId, remove = false) => set((state) => {
        if (remove) {
          return {
            memories: state.memories.map(memory =>
              memory.id === memoryId
                ? { ...memory, likes: Math.max((memory.likes || 0) - 1, 0) }
                : memory
            ),
            userMemoryLikes: { ...state.userMemoryLikes, [memoryId]: false },
            lastActiveTime: Date.now()
          };
        } else {
          return {
            memories: state.memories.map(memory =>
              memory.id === memoryId
                ? { ...memory, likes: (memory.likes || 0) + 1 }
                : memory
            ),
            userMemoryLikes: { ...state.userMemoryLikes, [memoryId]: true },
            lastActiveTime: Date.now()
          };
        }
      }),
      dislikeMemory: (memoryId, userId, remove = false) => set((state) => {
        if (remove) {
          return {
            memories: state.memories.map(memory =>
              memory.id === memoryId
                ? { ...memory, dislikes: Math.max((memory.dislikes || 0) - 1, 0) }
                : memory
            ),
            userMemoryDislikes: { ...state.userMemoryDislikes, [memoryId]: false },
            lastActiveTime: Date.now()
          };
        } else {
          return {
            memories: state.memories.map(memory =>
              memory.id === memoryId
                ? { ...memory, dislikes: (memory.dislikes || 0) + 1 }
                : memory
            ),
            userMemoryDislikes: { ...state.userMemoryDislikes, [memoryId]: true },
            lastActiveTime: Date.now()
          };
        }
      }),
      userMemoryLikes: {},
      userMemoryDislikes: {},
      
      // Memory image storage functions
      memoryImages: loadMemoryImagesFromStorage(),
      setMemoryImages: (memoryId, images) => set((state) => {
        const newMemoryImages = { ...state.memoryImages, [memoryId]: images };
        saveMemoryImagesToStorage(newMemoryImages);
        return { memoryImages: newMemoryImages };
      }),
      getMemoryImages: (memoryId) => {
        const state = get();
        return state.memoryImages[memoryId] || [];
      },
      deleteMemoryImages: (memoryId) => set((state) => {
        const newMemoryImages = { ...state.memoryImages };
        delete newMemoryImages[memoryId];
        saveMemoryImagesToStorage(newMemoryImages);
        return { memoryImages: newMemoryImages };
      }),
      
      // UI state
      activeView: 'rooms',
      setActiveView: (view) => set({ 
        activeView: view,
        lastActiveTime: Date.now()
      }),
      showSidebar: false,
      setShowSidebar: (show) => set({ showSidebar: show }),
      
      // Settings
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      themeSettings: {
        colorScheme: 'neon',
        darkMode: true,
        animations: true,
        soundEffects: true,
      },
      setThemeSettings: (settings) => set((state) => {
        const newThemeSettings = { ...state.themeSettings, ...settings };
        
        if (settings.colorScheme || settings.darkMode !== undefined) {
          applyTheme(
            settings.colorScheme || newThemeSettings.colorScheme,
            settings.darkMode !== undefined ? settings.darkMode : newThemeSettings.darkMode
          );
        }
        
        if (settings.animations !== undefined) {
          document.body.style.setProperty('--animation-duration', settings.animations ? '1s' : '0s');
        }
        
        return { themeSettings: newThemeSettings };
      }),
      notificationSettings: {
        roastNotifications: true,
        chatMessages: true,
        challengeInvites: true,
        memoryTags: true,
        soundNotifications: true,
        browserNotifications: false,
      },
      setNotificationSettings: (settings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings }
      })),
      
      // Session state
      lastActiveTime: Date.now(),
      setLastActiveTime: (time) => set({ lastActiveTime: time }),
    }),
    {
      name: 'clownroom-storage',
      version: 7, // FIXED: Increment version for new storage system
      partialize: (state) => ({
        // FIXED: Exclude large data from main storage to prevent quota issues
        chatMessages: state.chatMessages,
        currentUser: state.currentUser,
        rooms: state.rooms,
        currentRoom: state.currentRoom,
        roasts: state.roasts,
        // FIXED: Store stickers without large image data
        stickers: state.stickers.map(sticker => ({
          ...sticker,
          elementData: sticker.elementData?.map(el => ({
            ...el,
            imageData: el.imageData ? 'stored-separately' : undefined
          }))
        })),
        stickerPacks: state.stickerPacks.map(pack => ({
          ...pack,
          stickers: pack.stickers.map(sticker => ({
            ...sticker,
            elementData: sticker.elementData?.map(el => ({
              ...el,
              imageData: el.imageData ? 'stored-separately' : undefined
            }))
          }))
        })),
        challenges: state.challenges,
        memories: state.memories,
        userVotes: state.userVotes,
        userLikes: state.userLikes,
        userDislikes: state.userDislikes,
        userReactions: state.userReactions,
        userMemoryLikes: state.userMemoryLikes,
        userMemoryDislikes: state.userMemoryDislikes,
        activeView: state.activeView,
        lastActiveTime: state.lastActiveTime,
        themeSettings: state.themeSettings,
        notificationSettings: state.notificationSettings,
        // NOTE: stickerImages and memoryImages are stored separately
      }),
      serialize: (state) => {
        try {
          return JSON.stringify(state);
        } catch (error) {
          console.error('Failed to serialize state:', error);
          return '{}';
        }
      },
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str, dateReviver);
          
          if (!parsed.lastActiveTime) {
            parsed.lastActiveTime = Date.now();
          }
          
          const validViews = ['rooms', 'roasts', 'chat', 'stickers', 'challenges', 'memories', 'profile'];
          if (!validViews.includes(parsed.activeView)) {
            parsed.activeView = 'rooms';
          }
          
          if (!parsed.themeSettings) {
            parsed.themeSettings = {
              colorScheme: 'neon',
              darkMode: true,
              animations: true,
              soundEffects: true,
            };
          }
          
          if (!parsed.notificationSettings) {
            parsed.notificationSettings = {
              roastNotifications: true,
              chatMessages: true,
              challengeInvites: true,
              memoryTags: true,
              soundNotifications: true,
              browserNotifications: false,
            };
          }
          
          if (!parsed.userMemoryLikes) {
            parsed.userMemoryLikes = {};
          }
          if (!parsed.userMemoryDislikes) {
            parsed.userMemoryDislikes = {};
          }
          
          return parsed;
        } catch (error) {
          console.error('Failed to deserialize state:', error);
          return {};
        }
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setLastActiveTime(Date.now());
          
          // Load images from separate storage
          state.memoryImages = loadMemoryImagesFromStorage();
          state.stickerImages = loadStickerImagesFromStorage();
          
          console.log('Loaded sticker images:', Object.keys(state.stickerImages).length);
          
          applyTheme(state.themeSettings.colorScheme, state.themeSettings.darkMode);
          document.body.style.setProperty('--animation-duration', state.themeSettings.animations ? '1s' : '0s');
          
          if (state.currentRoom && state.activeView === 'rooms') {
            state.setActiveView('roasts');
          }
        }
      },
    }
  )
);

// Enhanced hook to check if store has been hydrated
export const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return hasHydrated;
};

// Hook to handle browser visibility changes and maintain state
export const useVisibilityHandler = () => {
  const setLastActiveTime = useStore(state => state.setLastActiveTime);
  
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setLastActiveTime(Date.now());
      }
    };
    
    const handleFocus = () => {
      setLastActiveTime(Date.now());
    };
    
    const handleBeforeUnload = () => {
      setLastActiveTime(Date.now());
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [setLastActiveTime]);
};