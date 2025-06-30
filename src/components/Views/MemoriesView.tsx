import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Heart, Camera, Plus, Tag, Calendar, Download, Share2, Play, Film, ThumbsDown, X, Trash2, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { Memory } from '../../types';
import toast from 'react-hot-toast';

export const MemoriesView = () => {
  const { 
    memories, 
    addMemory, 
    deleteMemory,
    updateUserPoints, 
    userReactions,
    likeMemory,
    dislikeMemory,
    userMemoryLikes,
    userMemoryDislikes,
    currentUser,
    currentRoom,
    addChatMessage,
    getMemoryImages // NEW: Get stored images
  } = useStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);
  
  // Gallery state
  const [showGallery, setShowGallery] = useState(false);
  const [galleryMemory, setGalleryMemory] = useState<Memory | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // NEW: File upload state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const mockMemories: Memory[] = [
    {
      id: 'memory-1',
      title: 'Epic Roast Battle',
      description: 'When MemeLord42 got absolutely destroyed 💀',
      mediaUrls: [
        'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      tags: ['roast', 'legendary', 'brutal'],
      roomId: 'room-1',
      createdBy: 'user-2',
      reactions: {
        '😂': ['user-1', 'user-2'],
        '🔥': ['user-3'],
        '💀': ['user-1', 'user-2', 'user-3'],
      },
      likes: 5,
      dislikes: 1,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'memory-2',
      title: 'Sticker Creation Madness',
      description: 'The day we turned everyone into clowns',
      mediaUrls: [
        'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      tags: ['stickers', 'chaos', 'art'],
      roomId: 'room-1',
      createdBy: 'user-3',
      reactions: {
        '🎭': ['user-1'],
        '😈': ['user-2', 'user-3'],
      },
      likes: 8,
      dislikes: 0,
      createdAt: new Date('2024-01-20'),
    },
  ];

  const allTags = ['roast', 'legendary', 'brutal', 'stickers', 'chaos', 'art', 'wholesome', 'cursed', 'meme', 'epic', 'funny', 'friendship', 'goals'];

  // NEW: Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Please select only image files (JPEG, PNG, GIF, WebP)! 📸');
      return;
    }

    // Validate file sizes (5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB! 📏');
      return;
    }

    setIsUploading(true);

    // Process files and create previews
    const newFiles = [...uploadedFiles, ...files];
    const newPreviews = [...uploadPreviews];

    let processedCount = 0;
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newPreviews.push(dataUrl);
        processedCount++;
        
        if (processedCount === files.length) {
          setUploadedFiles(newFiles);
          setUploadPreviews(newPreviews);
          setIsUploading(false);
          toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded! 📸`);
        }
      };
      reader.onerror = () => {
        processedCount++;
        toast.error(`Failed to process ${file.name}! 😞`);
        
        if (processedCount === files.length) {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    event.target.value = '';
  };

  // NEW: Remove uploaded file
  const removeUploadedFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = uploadPreviews.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setUploadPreviews(newPreviews);
    toast.success('Image removed! 🗑️');
  };

  // NEW: Clear all uploaded files
  const clearAllFiles = () => {
    setUploadedFiles([]);
    setUploadPreviews([]);
    toast.success('All images cleared! ✨');
  };

  const handleCreateMemory = () => {
    if (!newMemory.title.trim()) {
      toast.error('Give your memory a title! 📝');
      return;
    }

    // Use uploaded files as media URLs (base64 data URLs)
    const mediaUrls = uploadPreviews;

    if (mediaUrls.length === 0) {
      toast.error('Please upload at least one image for your memory! 📸');
      return;
    }

    const memory: Memory = {
      id: `memory-${Date.now()}`,
      ...newMemory,
      mediaUrls,
      roomId: currentRoom?.id || 'room-1',
      createdBy: currentUser?.id || 'user-1',
      reactions: {},
      likes: 0,
      dislikes: 0,
      createdAt: new Date(), // FIXED: Always use current date when creating
    };

    addMemory(memory);
    updateUserPoints(15);
    setShowCreateModal(false);
    setNewMemory({ title: '', description: '', tags: [] });
    
    // Clear uploaded files
    setUploadedFiles([]);
    setUploadPreviews([]);
    
    toast.success('Memory created! 📸✨ (+15 CP)');
  };

  const toggleTag = (tag: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // FIXED: Handle like memory - works for all memories including mock ones
  const handleLikeMemory = (memoryId: string) => {
    const hasLiked = userMemoryLikes[memoryId];
    
    if (hasLiked) {
      // Remove like
      likeMemory(memoryId, currentUser?.id || 'user-1', true);
      toast.success('Like removed! 💔');
    } else {
      // Add like (remove dislike if exists)
      if (userMemoryDislikes[memoryId]) {
        dislikeMemory(memoryId, currentUser?.id || 'user-1', true);
      }
      likeMemory(memoryId, currentUser?.id || 'user-1');
      toast.success('Memory liked! ❤️ (+1 CP)');
      updateUserPoints(1);
    }
  };

  // FIXED: Handle dislike memory - works for all memories including mock ones
  const handleDislikeMemory = (memoryId: string) => {
    const hasDisliked = userMemoryDislikes[memoryId];
    
    if (hasDisliked) {
      // Remove dislike
      dislikeMemory(memoryId, currentUser?.id || 'user-1', true);
      toast.success('Dislike removed! 😌');
    } else {
      // Add dislike (remove like if exists)
      if (userMemoryLikes[memoryId]) {
        likeMemory(memoryId, currentUser?.id || 'user-1', true);
      }
      dislikeMemory(memoryId, currentUser?.id || 'user-1');
      toast.success('Memory disliked! 👎');
    }
  };

  const handleAddReaction = (memoryId: string, emoji: string) => {
    const memoryReactions = userReactions[memoryId] || [];
    if (memoryReactions.includes(emoji)) {
      toast.error('You already reacted with this emoji! 😅');
      return;
    }
    
    // addReaction(memoryId, emoji, currentUser?.id || 'user-1');
    updateUserPoints(1);
    toast.success(`Reacted with ${emoji}! 💫 (+1 CP)`);
  };

  const generateRecap = () => {
    toast.success('Generating memory recap reel... 🎬');
    updateUserPoints(50);
    setTimeout(() => {
      toast.success('Memory recap ready! 🎥 (+50 CP)');
    }, 3000);
  };

  // Enhanced download function that works with device
  const downloadMemory = async (memory: Memory) => {
    try {
      // NEW: Get stored images for this memory
      const storedImages = getMemoryImages(memory.id);
      const allMediaUrls = [...memory.mediaUrls];
      
      // Replace placeholder URLs with actual stored images
      storedImages.forEach((imageData, index) => {
        const placeholderIndex = allMediaUrls.findIndex(url => url === `stored-image-${memory.id}-${index}`);
        if (placeholderIndex !== -1) {
          allMediaUrls[placeholderIndex] = imageData;
        }
      });

      if (!allMediaUrls || allMediaUrls.length === 0) {
        toast.error('No media to download! 📭');
        return;
      }

      toast.success('Starting download... 💾');

      for (let i = 0; i < allMediaUrls.length; i++) {
        const mediaUrl = allMediaUrls[i];
        
        try {
          let blob: Blob;
          let filename: string;

          if (mediaUrl.startsWith('data:')) {
            // Handle base64 data URLs
            const response = await fetch(mediaUrl);
            blob = await response.blob();
            filename = `${memory.title.replace(/[^a-z0-9]/gi, '_')}_${i + 1}.${blob.type.split('/')[1] || 'jpg'}`;
          } else {
            // Handle external URLs
            try {
              const response = await fetch(mediaUrl, { mode: 'cors' });
              blob = await response.blob();
              const urlParts = mediaUrl.split('/');
              const originalFilename = urlParts[urlParts.length - 1];
              filename = `${memory.title.replace(/[^a-z0-9]/gi, '_')}_${originalFilename}`;
            } catch (corsError) {
              // Fallback for CORS issues - open in new tab
              window.open(mediaUrl, '_blank');
              toast.success(`Image ${i + 1} opened in new tab (CORS restriction)! 🌐`);
              continue;
            }
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Add delay between downloads
          if (i < allMediaUrls.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error downloading image ${i + 1}:`, error);
          toast.error(`Failed to download image ${i + 1}! 😞`);
        }
      }

      toast.success(`${memory.title} downloaded to your device! 💾✨`);
    } catch (error) {
      console.error('Error downloading memory:', error);
      toast.error('Download failed! Please try again. 😞');
    }
  };

  // Share memory to chat
  const shareMemory = (memory: Memory) => {
    if (!currentRoom || !currentUser) {
      toast.error('Cannot share - not in a room! 🚫');
      return;
    }

    const shareMessage = {
      id: `msg-${Date.now()}`,
      type: 'text' as const,
      content: `📸 Shared memory: "${memory.title}" - ${memory.description}`,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      roomId: currentRoom.id,
      timestamp: new Date(),
      reactions: {},
    };

    addChatMessage(shareMessage);
    toast.success('Memory shared to chat! 💬');
  };

  // NEW: Get complete media URLs for a memory (including stored images)
  const getCompleteMediaUrls = (memory: Memory): string[] => {
    const storedImages = getMemoryImages(memory.id);
    const completeUrls = [...memory.mediaUrls];
    
    // Replace placeholder URLs with actual stored images
    storedImages.forEach((imageData, index) => {
      const placeholderIndex = completeUrls.findIndex(url => url === `stored-image-${memory.id}-${index}`);
      if (placeholderIndex !== -1) {
        completeUrls[placeholderIndex] = imageData;
      }
    });
    
    return completeUrls;
  };

  const viewFullMemory = (memory: Memory) => {
    setGalleryMemory(memory);
    setCurrentImageIndex(0);
    setShowGallery(true);
  };

  // Delete memory with confirmation
  const handleDeleteMemory = (memoryId: string) => {
    setMemoryToDelete(memoryId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMemory = () => {
    if (memoryToDelete) {
      deleteMemory(memoryToDelete);
      setShowDeleteModal(false);
      setMemoryToDelete(null);
      toast.success('Memory deleted! 🗑️');
    }
  };

  const cancelDeleteMemory = () => {
    setShowDeleteModal(false);
    setMemoryToDelete(null);
  };

  // Get author name
  const getAuthorName = (authorId: string) => {
    if (authorId === currentUser?.id) return 'You';
    
    // Mock user data for demo
    const users: Record<string, string> = {
      'user-1': 'ClownMaster',
      'user-2': 'MemeLord42',
      'user-3': 'ChaosQueen',
      'user-4': 'RoastKing',
    };
    
    return users[authorId] || 'Unknown User';
  };

  // Gallery navigation
  const nextImage = () => {
    if (galleryMemory) {
      const completeUrls = getCompleteMediaUrls(galleryMemory);
      if (currentImageIndex < completeUrls.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // FIXED: Get current like/dislike counts for any memory (including mock ones)
  const getCurrentLikeCount = (memory: Memory): number => {
    // For user-created memories, get from store
    const storeMemory = memories.find(m => m.id === memory.id);
    if (storeMemory) {
      return storeMemory.likes || 0;
    }
    // For mock memories, use the base count and add user interactions
    let count = memory.likes || 0;
    if (userMemoryLikes[memory.id]) {
      count += 1;
    }
    return count;
  };

  const getCurrentDislikeCount = (memory: Memory): number => {
    // For user-created memories, get from store
    const storeMemory = memories.find(m => m.id === memory.id);
    if (storeMemory) {
      return storeMemory.dislikes || 0;
    }
    // For mock memories, use the base count and add user interactions
    let count = memory.dislikes || 0;
    if (userMemoryDislikes[memory.id]) {
      count += 1;
    }
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-purple-900/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">📸</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">💫</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🎨</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">✨</div>
        
        {/* Memory fragments */}
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-purple/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-pink-500/5 rounded-full blur-lg animate-float" />
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-purple to-pink-500 text-white rounded-2xl p-4 shadow-glow relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
              <div className="relative flex items-center justify-center space-x-3">
                <Plus size={24} />
                <span className="text-lg font-bold">Capture Memory</span>
                <Camera size={24} />
              </div>
            </motion.button>

            <motion.button
              onClick={generateRecap}
              className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-xl p-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <Film size={20} />
                <span className="font-semibold">Generate Memory Recap</span>
              </div>
            </motion.button>
          </div>

          {/* Memories Feed */}
          <div className="space-y-4">
            {[...mockMemories, ...memories].map((memory, index) => {
              const hasLiked = userMemoryLikes[memory.id];
              const hasDisliked = userMemoryDislikes[memory.id];
              const isOwnMemory = memory.createdBy === currentUser?.id;
              const completeMediaUrls = getCompleteMediaUrls(memory);
              
              // FIXED: Get current counts that update properly
              const currentLikes = getCurrentLikeCount(memory);
              const currentDislikes = getCurrentDislikeCount(memory);
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden relative"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 text-xs opacity-20">💫</div>
                  <div className="absolute bottom-2 left-2 text-xs opacity-15">✨</div>
                  
                  {/* Media Preview */}
                  <div 
                    className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-8 text-center cursor-pointer hover:from-purple-600/30 hover:to-pink-600/30 transition-all relative"
                    onClick={() => viewFullMemory(memory)}
                  >
                    {completeMediaUrls && completeMediaUrls.length > 0 ? (
                      <div className="relative">
                        <img
                          src={completeMediaUrls[0]}
                          alt={memory.title}
                          className="w-full h-48 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            // Fallback for broken images
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        {completeMediaUrls.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                            +{completeMediaUrls.length - 1} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-4 text-4xl mb-2">
                        <motion.span 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          📸
                        </motion.span>
                      </div>
                    )}
                    <p className="text-gray-300 text-sm">Tap to view full memory</p>
                    <div className="mt-2">
                      <Play size={20} className="mx-auto text-white/60" />
                    </div>
                  </div>

                  {/* Memory Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{memory.title}</h3>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                          <span>by {getAuthorName(memory.createdBy)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Delete button for own memories */}
                      {isOwnMemory && (
                        <button
                          onClick={() => handleDeleteMemory(memory.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Memory"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{memory.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {memory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Reactions and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Like Button */}
                        <motion.button
                          onClick={() => handleLikeMemory(memory.id)}
                          className={`flex items-center space-x-2 transition-all ${
                            hasLiked 
                              ? 'text-pink-500' 
                              : 'text-gray-400 hover:text-pink-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={hasLiked ? { 
                              scale: [1, 1.3, 1],
                              rotate: [0, 15, -15, 0]
                            } : {}}
                            transition={{ duration: 0.6 }}
                          >
                            <Heart 
                              size={18} 
                              fill={hasLiked ? 'currentColor' : 'none'}
                            />
                          </motion.div>
                          <span className="text-sm">{currentLikes}</span>
                        </motion.button>

                        {/* Dislike Button */}
                        <motion.button
                          onClick={() => handleDislikeMemory(memory.id)}
                          className={`flex items-center space-x-2 transition-all ${
                            hasDisliked 
                              ? 'text-red-500' 
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={hasDisliked ? { 
                              scale: [1, 1.2, 1],
                              rotate: [0, -10, 10, 0]
                            } : {}}
                            transition={{ duration: 0.8 }}
                          >
                            <ThumbsDown 
                              size={18} 
                              fill={hasDisliked ? 'currentColor' : 'none'}
                            />
                          </motion.div>
                          <span className="text-sm">{currentDislikes}</span>
                        </motion.button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => downloadMemory(memory)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => shareMemory(memory)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                          title="Share to Chat"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {[...mockMemories, ...memories].length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p>No memories yet. Create your first one! 📸</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FIXED: Create Memory Modal - Removed Vision Board Option */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Memory 📸</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newMemory.title}
                    onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple focus:outline-none"
                    placeholder="Epic moment title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMemory.description}
                    onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-purple focus:outline-none h-20 resize-none"
                    placeholder="What made this moment special?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          newMemory.tags.includes(tag)
                            ? 'bg-purple text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Memory Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload Images
                  </label>
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="memory-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="memory-upload"
                      className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-400 text-sm">
                        {isUploading ? 'Processing images...' : 'Click to upload images'}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        JPEG, PNG, GIF, WebP • Max 5MB each
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadPreviews.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">
                          {uploadPreviews.length} image{uploadPreviews.length > 1 ? 's' : ''} uploaded
                        </span>
                        <button
                          onClick={clearAllFiles}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                        {uploadPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-16 object-cover rounded border border-gray-700"
                            />
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMemory}
                  className="flex-1 py-2 bg-purple text-white rounded-lg font-semibold hover:bg-purple/90 transition-colors"
                >
                  Create Memory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
            onClick={cancelDeleteMemory}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm sketch-card paper-texture relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">🗑️</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">⚠️</div>
              
              {/* Modal Content */}
              <div className="text-center">
                {/* Animated Warning Icon */}
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ 
                    rotate: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  🗑️
                </motion.div>
                
                <h2 className="text-xl font-bold text-white mb-2 font-sketch crayon-text">
                  Delete Memory? 📸
                </h2>
                
                <p className="text-gray-300 mb-6 font-hand text-sm leading-relaxed">
                  Are you sure you want to delete this memory?<br/>
                  <span className="text-red-400 font-semibold">This action cannot be undone!</span>
                </p>
                
                {/* Warning Box */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-red-400 font-semibold mb-2 text-sm font-hand">⚠️ What will be deleted:</h3>
                  <div className="space-y-1 text-xs text-gray-300 font-hand">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">✗</span>
                      <span>Memory title and description</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">✗</span>
                      <span>All uploaded images</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">✗</span>
                      <span>All likes, dislikes, and reactions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-400">✗</span>
                      <span>Memory will be permanently removed</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={cancelDeleteMemory}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Keep Memory 📸
                  </motion.button>
                  
                  <motion.button
                    onClick={confirmDeleteMemory}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all doodle-btn sketch-border font-hand flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 size={16} />
                    <span>Delete Forever</span>
                  </motion.button>
                </div>
                
                {/* Fun Footer */}
                <p className="text-gray-500 text-xs mt-4 font-hand">
                  Think twice before deleting memories! 💭✨
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && galleryMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowGallery(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>

              {/* Image Display */}
              <div className="relative">
                {(() => {
                  const completeUrls = getCompleteMediaUrls(galleryMemory);
                  return (
                    <>
                      <img
                        src={completeUrls[currentImageIndex]}
                        alt={`${galleryMemory.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                      />

                      {/* Navigation Arrows */}
                      {completeUrls.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            disabled={currentImageIndex === 0}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={nextImage}
                            disabled={currentImageIndex === completeUrls.length - 1}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {completeUrls.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {completeUrls.length}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Memory Info */}
              <div className="mt-4 bg-dark-card rounded-lg p-4">
                <h3 className="text-white font-bold text-lg mb-2">{galleryMemory.title}</h3>
                <p className="text-gray-300 text-sm mb-2">{galleryMemory.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>by {getAuthorName(galleryMemory.createdBy)}</span>
                  <span>{new Date(galleryMemory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};