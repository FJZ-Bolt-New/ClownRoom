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
  MoreVertical
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
    removeMessageReaction
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

  // Send sticker
  const sendSticker = (sticker: any) => {
    if (!currentUser || !currentRoom) return;

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
      },
    };

    addChatMessage(newMessage);
    setShowStickerPicker(false);
    updateUserPoints(5);
    toast.success(`Sticker sent! 🎨 (+5 CP)`);
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
        allStickers = [...allStickers, ...pack.stickers];
      }
    });

    if (stickerSearchTerm) {
      allStickers = allStickers.filter(sticker => 
        sticker.name.toLowerCase().includes(stickerSearchTerm.toLowerCase())
      );
    }

    if (selectedStickerPack) {
      const pack = ownedPacks.find(p => p.id === selectedStickerPack);
      allStickers = pack?.stickers || [];
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

  // Sticker display component
  const StickerDisplay = ({ sticker, size = 'md' }: { sticker: any, size?: 'sm' | 'md' | 'lg' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16'
    };

    return (
      <div className={`${sizeClasses[size]} relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center`}>
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
            src={sticker.imageUrl}
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
                        
                        {message.type === 'sticker' && message.stickerData && (
                          <div className="text-center">
                            <StickerDisplay sticker={message.stickerData} size="lg" />
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

      {/* FIXED: Sticker Picker - WhatsApp Style Positioning */}
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
                <button
                  key={sticker.id}
                  onClick={() => sendSticker(sticker)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                  title={sticker.name}
                >
                  <StickerDisplay sticker={sticker} size="md" />
                </button>
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
    </div>
  );
};