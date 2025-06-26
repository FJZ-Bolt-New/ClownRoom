import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Heart, Camera, Plus, Tag, Calendar, Download, Share2, Play, Film, Palette, Move, Type, Sticker } from 'lucide-react';
import { Memory } from '../../types';
import toast from 'react-hot-toast';

export const MemoriesView = () => {
  const { memories, addMemory, addReaction, updateUserPoints, userReactions } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'memory' | 'board'>('memory');
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    tags: [] as string[],
  });
  
  // Vision board state
  const [boardElements, setBoardElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  const mockMemories: Memory[] = [
    {
      id: 'memory-1',
      title: 'Epic Roast Battle',
      description: 'When MemeLord42 got absolutely destroyed 💀',
      mediaUrls: ['📸', '🎥'],
      tags: ['roast', 'legendary', 'brutal'],
      roomId: 'room-1',
      createdBy: 'user-1',
      reactions: {
        '😂': ['user-1', 'user-2'],
        '🔥': ['user-3'],
        '💀': ['user-1', 'user-2', 'user-3'],
      },
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'memory-2',
      title: 'Sticker Creation Madness',
      description: 'The day we turned everyone into clowns',
      mediaUrls: ['🎨', '🤡'],
      tags: ['stickers', 'chaos', 'art'],
      roomId: 'room-1',
      createdBy: 'user-2',
      reactions: {
        '🎭': ['user-1'],
        '😈': ['user-2', 'user-3'],
      },
      createdAt: new Date('2024-01-20'),
    },
  ];

  const allTags = ['roast', 'legendary', 'brutal', 'stickers', 'chaos', 'art', 'wholesome', 'cursed', 'meme', 'epic', 'funny', 'friendship', 'goals'];

  const boardElements_templates = [
    { type: 'text', content: 'GOALS', style: { fontSize: '24px', color: '#FF6B9D', fontWeight: 'bold' } },
    { type: 'text', content: 'DREAMS', style: { fontSize: '20px', color: '#4ECDC4', fontWeight: 'bold' } },
    { type: 'text', content: 'VIBES', style: { fontSize: '18px', color: '#FFE66D', fontWeight: 'bold' } },
    { type: 'emoji', content: '✨', style: { fontSize: '32px' } },
    { type: 'emoji', content: '🌟', style: { fontSize: '28px' } },
    { type: 'emoji', content: '💫', style: { fontSize: '24px' } },
    { type: 'emoji', content: '🎯', style: { fontSize: '30px' } },
    { type: 'emoji', content: '🚀', style: { fontSize: '26px' } },
    { type: 'shape', content: 'circle', style: { width: '60px', height: '60px', backgroundColor: '#FF6B9D', opacity: 0.3 } },
    { type: 'shape', content: 'square', style: { width: '50px', height: '50px', backgroundColor: '#4ECDC4', opacity: 0.3 } },
  ];

  const handleCreateMemory = () => {
    if (!newMemory.title.trim()) {
      toast.error('Give your memory a title! 📝');
      return;
    }

    const memory: Memory = {
      id: `memory-${Date.now()}`,
      ...newMemory,
      mediaUrls: creationMode === 'board' ? ['🎨'] : ['📸'],
      roomId: 'room-1',
      createdBy: 'user-1',
      reactions: {},
      createdAt: new Date(),
    };

    addMemory(memory);
    updateUserPoints(15);
    setShowCreateModal(false);
    setNewMemory({ title: '', description: '', tags: [] });
    setBoardElements([]);
    toast.success(`${creationMode === 'board' ? 'Vision board' : 'Memory'} created! 📸✨ (+15 CP)`);
  };

  const toggleTag = (tag: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddReaction = (memoryId: string, emoji: string) => {
    const memoryReactions = userReactions[memoryId] || [];
    if (memoryReactions.includes(emoji)) {
      toast.error('You already reacted with this emoji! 😅');
      return;
    }
    
    addReaction(memoryId, emoji, 'user-1');
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

  const addElementToBoard = (element: any) => {
    const newElement = {
      id: Date.now(),
      ...element,
      x: Math.random() * 200,
      y: Math.random() * 200,
    };
    setBoardElements([...boardElements, newElement]);
    setSelectedElement(newElement.id);
  };

  const downloadMemory = (memory: Memory) => {
    toast.success(`${memory.title} downloaded! 💾`);
  };

  const shareMemory = (memory: Memory) => {
    navigator.clipboard.writeText(`Check out this memory: ${memory.title}`);
    toast.success('Memory link copied! 📋');
  };

  const viewFullMemory = (memory: Memory) => {
    toast.success(`Viewing ${memory.title} in full screen! 🖼️`);
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
            {[...mockMemories, ...memories].map((memory, index) => (
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
                  <div className="flex justify-center space-x-4 text-4xl mb-2">
                    {memory.mediaUrls.map((media, i) => (
                      <motion.span 
                        key={i}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      >
                        {media}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm">Tap to view full memory</p>
                  <div className="mt-2">
                    <Play size={20} className="mx-auto text-white/60" />
                  </div>
                </div>

                {/* Memory Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-lg">{memory.title}</h3>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Calendar size={16} />
                      <span className="text-xs">
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </span>
                    </div>
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

                  {/* Reactions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {Object.entries(memory.reactions).map(([emoji, users]) => {
                        const hasReacted = userReactions[memory.id]?.includes(emoji);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(memory.id, emoji)}
                            disabled={hasReacted}
                            className={`flex items-center space-x-1 transition-colors ${
                              hasReacted 
                                ? 'text-white cursor-not-allowed' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <span className="text-lg">{emoji}</span>
                            <span className="text-sm">{users.length}</span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleAddReaction(memory.id, '❤️')}
                        disabled={userReactions[memory.id]?.includes('❤️')}
                        className="text-gray-400 hover:text-red-400 transition-colors disabled:text-red-400 disabled:cursor-not-allowed"
                      >
                        <Heart size={18} />
                      </button>
                      <button
                        onClick={() => handleAddReaction(memory.id, '🔥')}
                        disabled={userReactions[memory.id]?.includes('🔥')}
                        className="text-gray-400 hover:text-orange transition-colors disabled:text-orange disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">🔥</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => downloadMemory(memory)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => shareMemory(memory)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {[...mockMemories, ...memories].length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Camera size={48} className="mx-auto mb-4 opacity-50" />
                <p>No memories yet. Create your first one! 📸</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Memory Modal */}
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
              <h2 className="text-xl font-bold text-white mb-4">Create Memory</h2>

              {/* Creation Mode Toggle */}
              <div className="flex bg-dark-light rounded-lg p-1 mb-4">
                <button
                  onClick={() => setCreationMode('memory')}
                  className={`flex-1 py-2 px-3 rounded-md transition-all text-sm ${
                    creationMode === 'memory'
                      ? 'bg-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📸 Memory
                </button>
                <button
                  onClick={() => setCreationMode('board')}
                  className={`flex-1 py-2 px-3 rounded-md transition-all text-sm ${
                    creationMode === 'board'
                      ? 'bg-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🎨 Vision Board
                </button>
              </div>

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
                    placeholder={creationMode === 'board' ? "My Vision Board" : "Epic moment title..."}
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
                    placeholder={creationMode === 'board' ? "Describe your vision..." : "What made this moment special?"}
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

                {/* Vision Board Creator */}
                {creationMode === 'board' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Design Your Board
                    </label>
                    
                    {/* Board Canvas */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 h-48 relative bg-gradient-to-br from-purple-900/10 to-pink-900/10 mb-3">
                      {boardElements.map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move ${
                            selectedElement === element.id ? 'ring-2 ring-purple' : ''
                          }`}
                          style={{
                            left: element.x,
                            top: element.y,
                            ...element.style,
                          }}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          {element.type === 'text' && element.content}
                          {element.type === 'emoji' && element.content}
                          {element.type === 'shape' && (
                            <div 
                              style={{
                                ...element.style,
                                borderRadius: element.content === 'circle' ? '50%' : '0',
                              }}
                            />
                          )}
                        </div>
                      ))}
                      
                      {boardElements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          Add elements to create your vision board
                        </div>
                      )}
                    </div>
                    
                    {/* Element Palette */}
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {boardElements_templates.map((element, index) => (
                        <button
                          key={index}
                          onClick={() => addElementToBoard(element)}
                          className="p-2 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors text-center"
                        >
                          {element.type === 'text' && (
                            <span className="text-xs" style={{ color: element.style.color }}>
                              {element.content}
                            </span>
                          )}
                          {element.type === 'emoji' && (
                            <span className="text-lg">{element.content}</span>
                          )}
                          {element.type === 'shape' && (
                            <div 
                              className="w-4 h-4 mx-auto"
                              style={{
                                backgroundColor: element.style.backgroundColor,
                                borderRadius: element.content === 'circle' ? '50%' : '0',
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Element Controls */}
                    {selectedElement && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setBoardElements(elements => 
                              elements.filter(el => el.id !== selectedElement)
                            );
                            setSelectedElement(null);
                          }}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Regular Memory Upload */}
                {creationMode === 'memory' && (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Add photos/videos</p>
                    <button className="mt-2 px-4 py-1 bg-purple/20 text-purple rounded text-sm hover:bg-purple/30 transition-colors">
                      Upload Media
                    </button>
                  </div>
                )}
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
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};