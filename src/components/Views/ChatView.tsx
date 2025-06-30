import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Send, 
  Smile, 
  Sticker as StickerIcon, 
  Image, 
  X, 
  Heart, 
  ThumbsUp, 
  Laugh,
  Search,
  Grid,
  ArrowLeft,
  Edit2,
  Trash2,
  MoreVertical,
  ZoomIn,
  Download,
  User,
  Package
} from 'lucide-react';
import { ChatMessage } from '../../types';
import toast from 'react-hot-toast';

export const ChatView = () => {
  const { 
    currentRoom, 
    currentUser, 
    stickerPacks, 
    updateUserPoints,
    getChatMessages,
    addChatMessage,
    updateChatMessage,
    deleteChatMessage,
    addMessageReaction,
    removeMessageReaction,
    updateStickerUsage,
    getStickerImage,
    stickers
  } = useStore();
  
  // Chat state
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [selectedStickerPack, setSelectedStickerPack] = useState<string>('');
  const [stickerSearchTerm, setStickerSearchTerm] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  
  // NEW: Sticker preview state
  const [showStickerPreview, setShowStickerPreview] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<any>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const stickerButtonRef = useRef<HTMLButtonElement>(null);
  
  // Get messages for current room
  const messages = currentRoom ? getChatMessages(currentRoom.id) : [];
  
  // Mock users for demo
  const mockUsers = [
    { id: 'user-1', name: 'ClownMaster', avatar: '🤡' },
    { id: 'user-2', name: 'MemeLord42', avatar: '😈' },
    { id: 'user-3', name: 'ChaosQueen', avatar: '👑' },
    { id: 'user-4', name: 'RoastKing', avatar: '🔥' },
  ];

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😂', '😭', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Hands': ['👍', '👎', '👏', '🙌', '🤝', '✋', '👋', '🤘', '✌️', '🤞'],
    'Hearts': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤'],
    'Objects': ['🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'],
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close message menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMessageMenu(null);
    };

    if (showMessageMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMessageMenu]);

  // Load demo messages for the current room if none exist
  useEffect(() => {
    if (currentRoom && messages.length === 0) {
      const demoMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          type: 'text',
          content: 'Welcome to the chaos! 🎪',
          authorId: 'user-2',
          authorName: 'MemeLord42',
          authorAvatar: '😈',
          roomId: currentRoom.id,
          timestamp: new Date(Date.now() - 300000),
          reactions: { '🔥': ['user-1'], '😂': ['user-3', 'user-4'] },
        },
        {
          id: 'msg-2',
          type: 'text',
          content: 'Ready for some epic roasts? 💀',
          authorId: 'user-3',
          authorName: 'ChaosQueen',
          authorAvatar: '👑',
          roomId: currentRoom.id,
          timestamp: new Date(Date.now() - 240000),
          reactions: { '💯': ['user-1', 'user-2'] },
        },
        {
          id: 'msg-3',
          type: 'emoji',
          content: '🎨',
          authorId: 'user-4',
          authorName: 'RoastKing',
          authorAvatar: '🔥',
          roomId: currentRoom.id,
          timestamp: new Date(Date.now() - 180000),
          reactions: {},
        },
      ];
      
      demoMessages.forEach(msg => addChatMessage(msg));
    }
  }, [currentRoom, messages.length, addChatMessage]);

  // Send text message
  const sendMessage = () => {
    if (!messageText.trim() || !currentUser || !currentRoom) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      content: messageText.trim(),
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      roomId: currentRoom.id,
      timestamp: new Date(),
      reactions: {},
    };

    addChatMessage(newMessage);
    setMessageText('');
    updateUserPoints(2);
    toast.success('Message sent! 💬 (+2 CP)');
  };

  // Send emoji
  const sendEmoji = (emoji: string) => {
    if (!currentUser || !currentRoom) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      roomId: currentRoom.id,
      timestamp: new Date(),
      reactions: {},
    };

    addChatMessage(newMessage);
    setShowEmojiPicker(false);
    updateUserPoints(1);
    toast.success(`${emoji} sent! (+1 CP)`);
  };

  // ENHANCED: Send sticker with usage tracking
  const sendSticker = (sticker: any) => {
    if (!currentUser || !currentRoom) return;

    // FIXED: Update sticker usage count
    updateStickerUsage(sticker.id);

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'sticker',
      content: sticker.name,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      roomId: currentRoom.id,
      timestamp: new Date(),
      reactions: {},
      stickerData: {
        name: sticker.name,
        imageUrl: sticker.imageUrl,
        packId: sticker.packId || 'custom',
        stickerId: sticker.id, // NEW: Store sticker ID for tracking
      },
    };

    addChatMessage(newMessage);
    setShowStickerPicker(false);
    updateUserPoints(5);
    toast.success(`Sticker sent! 🎨 (+5 CP)`);
  };

  // NEW: Handle sticker click in chat
  const handleStickerClick = (stickerData: any) => {
    // Find the full sticker data
    const fullSticker = stickers.find(s => s.id === stickerData.stickerId);
    if (!fullSticker) {
      toast.error('Sticker not found! 😞');
      return;
    }

    // Find the pack this sticker belongs to
    const pack = stickerPacks.find(p => 
      p.stickers.some(s => s.id === fullSticker.id)
    );

    setPreviewSticker({
      ...fullSticker,
      packName: pack?.name || 'Unknown Pack',
      packId: pack?.id || 'unknown'
    });
    setShowStickerPreview(true);
  };

  // NEW: Get sticker display URL with fallbacks
  const getStickerDisplayUrl = (sticker: any): string => {
    // 1. Try separate storage first
    const storedImage = getStickerImage(sticker.id);
    if (storedImage) return storedImage;
    
    // 2. Fallback to original URL if valid
    if (sticker.imageUrl && sticker.imageUrl !== 'stored-separately') {
      return sticker.imageUrl;
    }
    
    // 3. Generate placeholder SVG
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#f3f4f6"/>
        <text x="50" y="45" font-family="Arial" font-size="12" text-anchor="middle" fill="#6b7280">🎨</text>
        <text x="50" y="65" font-family="Arial" font-size="8" text-anchor="middle" fill="#6b7280">${sticker.name}</text>
      </svg>
    `)}`;
  };

  // NEW: Download sticker from preview
  const downloadStickerFromPreview = () => {
    if (!previewSticker) return;

    try {
      const imageUrl = getStickerDisplayUrl(previewSticker);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${previewSticker.name.replace(/[^a-z0-9]/gi, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${previewSticker.name} downloaded! 💾`);
    } catch (error) {
      console.error('Error downloading sticker:', error);
      toast.error('Download failed! 😞');
    }
  };

  // Add reaction to message
  const addReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !currentRoom) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const currentReactions = message.reactions[emoji] || [];
    const hasReacted = currentReactions.includes(currentUser.id);
    
    if (hasReacted) {
      // Remove reaction
      removeMessageReaction(messageId, currentRoom.id, emoji, currentUser.id);
      toast.success(`Removed ${emoji} reaction!`);
    } else {
      // Add reaction
      addMessageReaction(messageId, currentRoom.id, emoji, currentUser.id);
      updateUserPoints(1);
      toast.success(`Reacted with ${emoji}! (+1 CP)`);
    }
  };

  // Edit message functions
  const startEditMessage = (message: ChatMessage) => {
    if (message.authorId !== currentUser?.id) {
      toast.error("You can only edit your own messages! 🚫");
      return;
    }
    
    if (message.type !== 'text') {
      toast.error("You can only edit text messages! 📝");
      return;
    }

    setEditingMessage(message.id);
    setEditText(message.content);
    setShowMessageMenu(null);
    
    // Focus the edit input after a short delay
    setTimeout(() => {
      const editInput = document.querySelector(`input[data-edit-id="${message.id}"]`) as HTMLInputElement;
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    }, 100);
  };

  const saveEditMessage = () => {
    if (!editText.trim() || !editingMessage || !currentRoom) return;

    updateChatMessage(editingMessage, {
      content: editText.trim(),
      editedAt: new Date(),
      isEdited: true,
    });

    setEditingMessage(null);
    setEditText('');
    toast.success('Message updated! ✏️');
  };

  const cancelEditMessage = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Delete message
  const deleteMessage = (messageId: string) => {
    if (!currentRoom) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (message.authorId !== currentUser?.id) {
      toast.error("You can only delete your own messages! 🚫");
      return;
    }
    
    deleteChatMessage(messageId, currentRoom.id);
    setShowMessageMenu(null);
    toast.success('Message deleted! 🗑️');
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        saveEditMessage();
      } else {
        sendMessage();
      }
    } else if (e.key === 'Escape' && editingMessage) {
      cancelEditMessage();
    }
  };

  // Handle edit input key press
  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEditMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditMessage();
    }
  };

  // Get available stickers for picker
  const getAvailableStickers = () => {
    const ownedPacks = stickerPacks.filter(pack => pack.owned);
    let allStickers: any[] = [];
    
    ownedPacks.forEach(pack => {
      if (pack.stickers) {
        allStickers = [...allStickers, ...pack.stickers.map(sticker => ({
          ...sticker,
          packId: pack.id,
          packName: pack.name
        }))];
      }
    });

    if (stickerSearchTerm) {
      allStickers = allStickers.filter(sticker => 
        sticker.name.toLowerCase().includes(stickerSearchTerm.toLowerCase())
      );
    }

    if (selectedStickerPack) {
      const pack = ownedPacks.find(p => p.id === selectedStickerPack);
      allStickers = pack?.stickers.map(sticker => ({
        ...sticker,
        packId: pack.id,
        packName: pack.name
      })) || [];
    }

    return allStickers;
  };

  // FIXED: Get popup position relative to button
  const getPopupPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!buttonRef.current) return { bottom: '100px', left: '20px' };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const popupHeight = 300; // Estimated popup height
    
    // Calculate if there's enough space above the button
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    
    if (spaceAbove >= popupHeight) {
      // Position above the button (WhatsApp style)
      return {
        bottom: `${viewportHeight - rect.top + 10}px`,
        left: `${rect.left}px`
      };
    } else {
      // Fallback: position below if not enough space above
      return {
        top: `${rect.bottom + 10}px`,
        left: `${rect.left}px`
      };
    }
  };

  // ENHANCED: Sticker display component with click handler
  const StickerDisplay = ({ 
    sticker, 
    size = 'md', 
    clickable = false,
    onClick 
  }: { 
    sticker: any, 
    size?: 'sm' | 'md' | 'lg',
    clickable?: boolean,
    onClick?: () => void
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    const displayUrl = getStickerDisplayUrl(sticker);

    return (
      <div 
        className={`${sizeClasses[size]} relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center ${
          clickable ? 'cursor-pointer hover:border-primary hover:scale-105 transition-all group' : ''
        }`}
        onClick={clickable ? onClick : undefined}
        title={clickable ? `Click to view ${sticker.name}` : sticker.name}
      >
        {/* Hover overlay for clickable stickers */}
        {clickable && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
            <ZoomIn size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-white" />
          </div>
        )}

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {imageError ? (
          <div className="text-center">
            <div className="text-sm opacity-50">🎨</div>
          </div>
        ) : (
          <img
            src={displayUrl}
            alt={sticker.name}
            className="w-full h-full object-cover"
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        )}
      </div>
    );
  };

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-doodle">💬</div>
          <p className="font-hand text-lg">Select a room to start chatting! 🎪</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-3xl opacity-15 animate-bounce-doodle">💬</div>
        <div className="absolute top-20 right-20 text-2xl opacity-20 animate-wiggle">✨</div>
        <div className="absolute bottom-20 left-16 text-2xl opacity-15 animate-float">🎭</div>
        <div className="absolute bottom-40 right-10 text-3xl opacity-10 animate-pulse">🎪</div>
      </div>

      <div className="relative z-10 h-screen flex flex-col pl-28">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-secondary via-doodle-cyan to-blue-500 p-4 paper-texture relative overflow-hidden">
          <div className="absolute top-2 left-4 text-lg opacity-30 animate-bounce-doodle">💬</div>
          <div className="absolute top-1 right-8 text-sm opacity-40 animate-wiggle">🎨</div>
          
          <div className="flex items-center justify-between max-w-4xl mx-auto relative z-10">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white font-sketch scribble-underline">
                💬 Chat Room
              </h1>
              <div className="text-2xl sticker-element">{currentRoom.avatar}</div>
              <span className="text-white font-hand">{currentRoom.name}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-white/80">
              <div className="flex -space-x-2">
                {mockUsers.slice(0, 3).map((user, i) => (
                  <div key={user.id} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm border-2 border-white/30">
                    {user.avatar}
                  </div>
                ))}
              </div>
              <span className="text-sm font-hand">{mockUsers.length} online</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message, index) => {
            const isOwnMessage = message.authorId === currentUser?.id;
            const isEditing = editingMessage === message.id;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
              >
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'} relative`}>
                  {/* Author info */}
                  {!isOwnMessage && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{message.authorAvatar}</span>
                      <span className="text-sm font-semibold text-gray-300 font-hand">
                        {message.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div
                    className={`relative p-3 rounded-2xl sketch-card ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-primary to-purple text-white'
                        : 'bg-dark-card text-white border border-gray-700'
                    } ${message.type === 'emoji' ? 'text-center' : ''}`}
                  >
                    {/* Message menu button for own messages */}
                    {isOwnMessage && !isEditing && message.type === 'text' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMessageMenu(showMessageMenu === message.id ? null : message.id);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-600"
                      >
                        <MoreVertical size={12} />
                      </button>
                    )}

                    {/* Message menu */}
                    {showMessageMenu === message.id && isOwnMessage && (
                      <div className="absolute top-6 right-0 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-20 min-w-32">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditMessage(message);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                    
                    {/* Message content */}
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={handleEditKeyPress}
                          data-edit-id={message.id}
                          className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-600 focus:border-primary focus:outline-none"
                          placeholder="Edit your message..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEditMessage}
                            disabled={!editText.trim()}
                            className="px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditMessage}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {message.type === 'text' && (
                          <div>
                            <p className="font-hand">{message.content}</p>
                            {message.isEdited && (
                              <span className="text-xs text-gray-400 italic">(edited)</span>
                            )}
                          </div>
                        )}
                        
                        {message.type === 'emoji' && (
                          <div className="text-4xl animate-bounce-doodle">{message.content}</div>
                        )}
                        
                        {/* ENHANCED: Sticker display with click functionality */}
                        {message.type === 'sticker' && message.stickerData && (
                          <div className="text-center">
                            <StickerDisplay 
                              sticker={{
                                id: message.stickerData.stickerId,
                                name: message.stickerData.name,
                                imageUrl: message.stickerData.imageUrl,
                                packId: message.stickerData.packId
                              }}
                              size="lg" 
                              clickable={true}
                              onClick={() => handleStickerClick(message.stickerData)}
                            />
                            <p className="text-xs text-gray-400 mt-1 font-hand">{message.stickerData.name}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Timestamp for own messages */}
                    {isOwnMessage && !isEditing && (
                      <div className="text-xs text-white/60 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString()}
                        {message.isEdited && <span className="ml-1">(edited)</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Reactions */}
                  {Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(message.reactions).map(([emoji, userIds]) => {
                        if (userIds.length === 0) return null;
                        const hasReacted = userIds.includes(currentUser?.id || '');
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all doodle-btn ${
                              hasReacted
                                ? 'bg-primary/30 text-primary border border-primary'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{userIds.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Quick reactions */}
                  {!isEditing && (
                    <div className="flex space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {['❤️', '😂', '👍', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="p-1 text-sm hover:bg-gray-700 rounded transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-dark-card border-t border-gray-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              {/* Emoji Picker Button */}
              <button
                ref={emojiButtonRef}
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowStickerPicker(false);
                }}
                className={`p-3 rounded-lg transition-colors doodle-btn ${
                  showEmojiPicker ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Smile size={20} className="hand-drawn-icon" />
              </button>

              {/* Sticker Picker Button */}
              <button
                ref={stickerButtonRef}
                onClick={() => {
                  setShowStickerPicker(!showStickerPicker);
                  setShowEmojiPicker(false);
                }}
                className={`p-3 rounded-lg transition-colors doodle-btn ${
                  showStickerPicker ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <StickerIcon size={20} className="hand-drawn-icon" />
              </button>

              {/* Message Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message... 💬"
                  className="w-full bg-dark-light text-white rounded-lg px-4 py-3 pr-12 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                  maxLength={500}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {messageText.length}/500
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!messageText.trim()}
                className="p-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed doodle-btn"
              >
                <Send size={20} className="hand-drawn-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showEmojiPicker || showStickerPicker) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowEmojiPicker(false);
            setShowStickerPicker(false);
          }}
        />
      )}

      {/* FIXED: Emoji Picker - WhatsApp Style Positioning */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bg-dark-card rounded-xl p-4 border border-gray-700 shadow-doodle z-50 sketch-card"
            style={getPopupPosition(emojiButtonRef)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold font-sketch">😀 Emojis</h3>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category}>
                  <h4 className="text-xs text-gray-400 font-hand mb-2">{category}</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendEmoji(emoji)}
                        className="p-2 text-2xl hover:bg-gray-700 rounded-lg transition-colors doodle-btn"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENHANCED: Sticker Picker with usage tracking */}
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bg-dark-card rounded-xl p-4 border border-gray-700 shadow-doodle z-50 sketch-card w-80"
            style={getPopupPosition(stickerButtonRef)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold font-sketch">🎨 Stickers</h3>
              <button
                onClick={() => setShowStickerPicker(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Search and Pack Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stickers..."
                  value={stickerSearchTerm}
                  onChange={(e) => setStickerSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none text-sm font-hand"
                />
              </div>
              
              <select
                value={selectedStickerPack}
                onChange={(e) => setSelectedStickerPack(e.target.value)}
                className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none text-sm font-hand"
              >
                <option value="">All Packs</option>
                {stickerPacks.filter(pack => pack.owned).map((pack) => (
                  <option key={pack.id} value={pack.id}>
                    {pack.name} ({pack.count})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Stickers Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {getAvailableStickers().map((sticker, index) => (
                <div key={sticker.id} className="relative group">
                  <button
                    onClick={() => sendSticker(sticker)}
                    className="w-full p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                    title={`${sticker.name} (Used ${sticker.usageCount} times)`}
                  >
                    <StickerDisplay sticker={sticker} size="md" />
                  </button>
                  
                  {/* Usage count badge */}
                  {sticker.usageCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {sticker.usageCount}
                    </div>
                  )}
                </div>
              ))}
              
              {getAvailableStickers().length === 0 && (
                <div className="col-span-4 text-center py-6 text-gray-400">
                  <StickerIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-hand">
                    {stickerSearchTerm ? 'No stickers found' : 'No stickers available'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-hand">
                    Create some stickers first!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Sticker Preview Modal */}
      <AnimatePresence>
        {showStickerPreview && previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowStickerPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-lg sketch-card paper-texture relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowStickerPreview(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Sticker Preview */}
              <div className="text-center mb-6">
                <div className="bg-white rounded-xl p-8 mb-4 flex items-center justify-center" style={{ minHeight: '200px' }}>
                  <img
                    src={getStickerDisplayUrl(previewSticker)}
                    alt={previewSticker.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxWidth: '150px', maxHeight: '150px' }}
                  />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-2 font-sketch">
                  {previewSticker.name}
                </h2>
              </div>

              {/* Sticker Details */}
              <div className="bg-dark-light rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <div className="text-gray-400">Creator</div>
                      <div className="text-white font-semibold">
                        {previewSticker.createdBy === currentUser?.id ? 'You' : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-gray-400" />
                    <div>
                      <div className="text-gray-400">Pack</div>
                      <div className="text-white font-semibold">{previewSticker.packName}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StickerIcon size={16} className="text-gray-400" />
                    <div>
                      <div className="text-gray-400">Usage</div>
                      <div className="text-white font-semibold">{previewSticker.usageCount} times</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Grid size={16} className="text-gray-400" />
                    <div>
                      <div className="text-gray-400">Tags</div>
                      <div className="text-white font-semibold">{previewSticker.tags?.length || 0}</div>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                {previewSticker.tags && previewSticker.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="text-gray-400 text-sm mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-2">
                      {previewSticker.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setShowStickerPreview(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
                
                <motion.button
                  onClick={downloadStickerFromPreview}
                  className="flex-1 py-3 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all doodle-btn sketch-border font-hand flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={16} />
                  <span>Download</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};