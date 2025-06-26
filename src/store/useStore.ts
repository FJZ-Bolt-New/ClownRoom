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
  joinRoomByCode: (inviteCode: string, user: User) => boolean; // NEW: Join room by invite code
  
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
  addReaction: (memoryId: string, emoji: string, userId: string) => void;
  userReactions: Record<string, string[]>; // Track user reactions per memory
  
  // UI state - NOW PERSISTED
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
  
  // Session state - tracks current session
  lastActiveTime: number;
  setLastActiveTime: (time: number) => void;
}

// Enhanced date reviver function
const dateReviver = (key: string, value: any): any => {
  // Handle Date objects
  if (typeof value === 'string') {
    // ISO date string pattern
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (isoDatePattern.test(value)) {
      return new Date(value);
    }
  }
  
  // Handle arrays and objects recursively
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
  // Dark mode themes (vibrant)
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
  // Light mode themes (elegant and soft)
  minimal: {
    primary: '#6366f1',    // Soft indigo
    secondary: '#10b981',  // Emerald green
    accent: '#f59e0b',     // Amber
    orange: '#f97316',     // Orange
    purple: '#8b5cf6',     // Violet
  },
  nature: {
    primary: '#059669',    // Forest green
    secondary: '#0d9488',  // Teal
    accent: '#ca8a04',     // Golden yellow
    orange: '#ea580c',     // Warm orange
    purple: '#7c3aed',     // Deep purple
  },
  ocean: {
    primary: '#0ea5e9',    // Sky blue
    secondary: '#06b6d4',  // Cyan
    accent: '#0891b2',     // Light blue
    orange: '#f97316',     // Coral orange
    purple: '#8b5cf6',     // Lavender
  },
  sunset: {
    primary: '#dc2626',    // Warm red
    secondary: '#ea580c',  // Orange
    accent: '#d97706',     // Amber
    orange: '#f59e0b',     // Golden
    purple: '#be185d',     // Rose
  },
};

// Apply theme colors to CSS variables and handle light/dark mode
const applyTheme = (colorScheme: keyof typeof themeColors, darkMode: boolean = true) => {
  const colors = themeColors[colorScheme];
  const root = document.documentElement;
  
  // Update CSS custom properties
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-orange', colors.orange);
  root.style.setProperty('--color-purple', colors.purple);
  
  // Update Tailwind CSS variables by adding a class to body
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  document.body.classList.add(`theme-${colorScheme}`);
  
  // Apply light/dark mode
  if (darkMode) {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    // Set dark mode CSS variables
    root.style.setProperty('--bg-dark', '#1a1a2e');
    root.style.setProperty('--bg-dark-light', '#16213e');
    root.style.setProperty('--bg-dark-card', '#0f3460');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e5e7eb');
    root.style.setProperty('--border-color', '#374151');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    // Set light mode CSS variables
    root.style.setProperty('--bg-dark', '#f8fafc');
    root.style.setProperty('--bg-dark-light', '#f1f5f9');
    root.style.setProperty('--bg-dark-card', '#ffffff');
    root.style.setProperty('--text-primary', '#1f2937');
    root.style.setProperty('--text-secondary', '#4b5563');
    root.style.setProperty('--border-color', '#d1d5db');
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
        lastActiveTime: Date.now() // Update activity time when changing rooms
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
          return state; // Room doesn't exist
        }
        
        // Check if current user is the owner
        if (roomToDelete.createdBy !== state.currentUser?.id) {
          return state; // Only owner can delete
        }
        
        // Remove the room from rooms array
        const updatedRooms = state.rooms.filter(room => room.id !== roomId);
        
        // Clear current room if it's the one being deleted
        const updatedCurrentRoom = state.currentRoom?.id === roomId ? null : state.currentRoom;
        
        // Clear chat messages for this room
        const updatedChatMessages = { ...state.chatMessages };
        delete updatedChatMessages[roomId];
        
        // Filter out roasts from this room
        const updatedRoasts = state.roasts.filter(roast => roast.roomId !== roomId);
        
        // Filter out memories from this room
        const updatedMemories = state.memories.filter(memory => memory.roomId !== roomId);
        
        // If we deleted the current room, go back to rooms view
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
      
      // NEW: Enhanced room joining by invite code
      joinRoomByCode: (inviteCode, user) => {
        const state = get();
        
        // Find room by invite code (case insensitive)
        const room = state.rooms.find(r => 
          r.inviteCode.toLowerCase() === inviteCode.toLowerCase()
        );
        
        if (!room) {
          return false; // Room not found
        }
        
        // Check if user is already a member
        const isAlreadyMember = room.members.some(member => member.id === user.id);
        
        if (isAlreadyMember) {
          // User is already a member, just set as current room
          set({ 
            currentRoom: room,
            lastActiveTime: Date.now()
          });
          return true;
        }
        
        // Add user as a new member
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
        
        // Update the room in the rooms array and set as current room
        set((state) => ({
          rooms: state.rooms.map(r => 
            r.id === room.id ? updatedRoom : r
          ),
          currentRoom: updatedRoom,
          lastActiveTime: Date.now()
        }));
        
        return true; // Successfully joined
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
          lastActiveTime: Date.now() // Update activity time
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
      updateStickerUsage: (stickerId) => set((state) => ({
        stickers: state.stickers.map(sticker =>
          sticker.id === stickerId
            ? { ...sticker, usageCount: sticker.usageCount + 1 }
            : sticker
        ),
        lastActiveTime: Date.now()
      })),
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
        const newStickers = [...state.stickers, sticker];
        
        const updatedPacks = state.stickerPacks.map(pack => {
          if (pack.id === packId) {
            return {
              ...pack,
              stickers: [...pack.stickers, sticker],
              count: pack.count + 1
            };
          }
          return pack;
        });
        
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
      addMemory: (memory) => set((state) => ({ 
        memories: [...state.memories, memory],
        lastActiveTime: Date.now()
      })),
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
      
      // UI state - NOW PERSISTED
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
        
        // Apply theme immediately if colorScheme or darkMode changed
        if (settings.colorScheme || settings.darkMode !== undefined) {
          applyTheme(
            settings.colorScheme || newThemeSettings.colorScheme,
            settings.darkMode !== undefined ? settings.darkMode : newThemeSettings.darkMode
          );
        }
        
        // Apply animation settings
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
      version: 3, // Increment version to handle migration
      partialize: (state) => ({
        // Persist ALL important data including UI state
        chatMessages: state.chatMessages,
        currentUser: state.currentUser,
        rooms: state.rooms,
        currentRoom: state.currentRoom, // PERSIST CURRENT ROOM
        roasts: state.roasts,
        stickers: state.stickers,
        stickerPacks: state.stickerPacks,
        challenges: state.challenges,
        memories: state.memories,
        userVotes: state.userVotes,
        userLikes: state.userLikes,
        userDislikes: state.userDislikes,
        userReactions: state.userReactions,
        activeView: state.activeView, // PERSIST ACTIVE VIEW
        lastActiveTime: state.lastActiveTime, // PERSIST ACTIVITY TIME
        themeSettings: state.themeSettings, // PERSIST THEME SETTINGS
        notificationSettings: state.notificationSettings, // PERSIST NOTIFICATION SETTINGS
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
          
          // Migration logic for version updates
          if (!parsed.lastActiveTime) {
            parsed.lastActiveTime = Date.now();
          }
          
          // Ensure activeView is valid
          const validViews = ['rooms', 'roasts', 'chat', 'stickers', 'challenges', 'memories', 'profile'];
          if (!validViews.includes(parsed.activeView)) {
            parsed.activeView = 'rooms';
          }
          
          // Ensure theme settings exist
          if (!parsed.themeSettings) {
            parsed.themeSettings = {
              colorScheme: 'neon',
              darkMode: true,
              animations: true,
              soundEffects: true,
            };
          }
          
          // Ensure notification settings exist
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
          
          return parsed;
        } catch (error) {
          console.error('Failed to deserialize state:', error);
          return {};
        }
      },
      // Add storage event listener to sync across tabs
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Update last active time on rehydration
          state.setLastActiveTime(Date.now());
          
          // Apply saved theme with dark mode setting
          applyTheme(state.themeSettings.colorScheme, state.themeSettings.darkMode);
          
          // Apply animation settings
          document.body.style.setProperty('--animation-duration', state.themeSettings.animations ? '1s' : '0s');
          
          // If we have a current room but no active view set, go to roasts
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
    // Set hydrated to true after a short delay to ensure store is ready
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
        // Browser became visible again, update activity time
        setLastActiveTime(Date.now());
      }
    };
    
    const handleFocus = () => {
      setLastActiveTime(Date.now());
    };
    
    const handleBeforeUnload = () => {
      setLastActiveTime(Date.now());
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [setLastActiveTime]);
};