import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Palette, 
  Type, 
  Image, 
  Smile, 
  Layers, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  Trash2, 
  Download, 
  Share2, 
  Save, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Eye, 
  EyeOff,
  Copy,
  Undo,
  Redo,
  Grid,
  Search,
  Filter,
  Star,
  Crown,
  Sparkles,
  Wand2,
  Camera,
  Upload,
  Scissors,
  PaintBucket,
  MousePointer,
  Square,
  Circle,
  Triangle,
  Heart,
  Zap,
  Music,
  Coffee,
  Gamepad2,
  Rocket,
  Target,
  Award,
  Gift,
  Lock,
  ShoppingCart
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    stickerPacks, 
    addSticker, 
    addStickerToPack, 
    updateUserPoints, 
    currentUser,
    purchaseStickerPack,
    updateStickerPack
  } = useStore();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'gallery' | 'create' | 'packs'>('gallery');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Enhanced creator state
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'emoji' | 'shape' | 'image'>('select');
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<StickerElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#transparent');
  
  // Text tool state
  const [textInput, setTextInput] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: '#FF6B9D',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    textAlign: 'center'
  });
  
  // Shape tool state
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'triangle' | 'heart' | 'star'>('rectangle');
  const [shapeStyle, setShapeStyle] = useState({
    fill: '#4ECDC4',
    stroke: '#ffffff',
    strokeWidth: 2,
    opacity: 1
  });
  
  // Sticker metadata
  const [stickerName, setStickerName] = useState('');
  const [stickerTags, setStickerTags] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState('pack-default');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Available emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
    'Food': ['🍎', '🍌', '🍓', '🍕', '🍔', '🌮', '🍩', '🍪', '🎂', '🍰', '☕', '🍺', '🍷', '🥤'],
    'Objects': ['⚽', '🏀', '🎮', '🎸', '🎨', '📱', '💻', '🚗', '✈️', '🚀', '⭐', '🌟', '💫', '🔮'],
    'Symbols': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔', '❣️']
  };
  
  // Predefined color palettes
  const colorPalettes = {
    'Vibrant': ['#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#9B59B6', '#E74C3C', '#2ECC71', '#3498DB'],
    'Pastel': ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1DC', '#E0BBE4', '#C7CEEA', '#FFDAB9'],
    'Dark': ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#1ABC9C', '#16A085'],
    'Neon': ['#FF073A', '#39FF14', '#00FFFF', '#FF1493', '#FFFF00', '#FF4500', '#9400D3', '#00FF7F']
  };
  
  // Font families
  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 
    'Georgia', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Palatino'
  ];
  
  // Categories for filtering
  const categories = ['all', 'custom', 'emoji', 'text', 'shapes', 'memes', 'reactions', 'objects'];
  
  // Add element to canvas
  const addElement = useCallback((type: StickerElement['type'], content: string, additionalProps = {}) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}-${Math.random()}`,
      type,
      content,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 25,
      width: type === 'text' ? 100 : 50,
      height: type === 'text' ? 50 : 50,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      ...additionalProps
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
  }, [elements, canvasSize]);
  
  // Save state to history for undo/redo
  const saveToHistory = useCallback((newElements: StickerElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Undo/Redo functions
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  }, [history, historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  }, [history, historyIndex]);
  
  // Handle text addition
  const handleAddText = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! 📝');
      return;
    }
    
    addElement('text', textInput, {
      style: { ...textStyle }
    });
    setTextInput('');
    setTool('select');
  };
  
  // Handle emoji addition
  const handleAddEmoji = (emoji: string) => {
    addElement('emoji', emoji, {
      style: { fontSize: 32 }
    });
    setTool('select');
  };
  
  // Handle shape addition
  const handleAddShape = () => {
    addElement('text', getShapeSymbol(shapeType), {
      style: {
        fontSize: 48,
        color: shapeStyle.fill
      }
    });
    setTool('select');
  };
  
  // Get shape symbol
  const getShapeSymbol = (type: string) => {
    switch (type) {
      case 'circle': return '●';
      case 'triangle': return '▲';
      case 'heart': return '♥';
      case 'star': return '★';
      default: return '■';
    }
  };
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image too large! Please use an image under 5MB 📸');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      addElement('image', file.name, {
        imageData,
        width: 100,
        height: 100
      });
      setTool('select');
    };
    reader.readAsDataURL(file);
  };
  
  // Update selected element
  const updateElement = useCallback((id: string, updates: Partial<StickerElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  }, [elements]);
  
  // Delete element
  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElement(null);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);
  
  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random()}`,
      x: element.x + 20,
      y: element.y + 20,
      layer: elements.length
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements);
  }, [elements, saveToHistory]);
  
  // Layer management
  const moveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const newLayer = direction === 'up' 
      ? Math.min(element.layer + 1, elements.length - 1)
      : Math.max(element.layer - 1, 0);
    
    updateElement(id, { layer: newLayer });
  }, [elements, updateElement]);
  
  // Save sticker
  const handleSaveSticker = async () => {
    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 🏷️');
      return;
    }
    
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }
    
    try {
      // Generate a preview image (in a real app, you'd render the canvas to an image)
      const previewUrl = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="${backgroundColor === '#transparent' ? 'white' : backgroundColor}"/>
          <text x="100" y="100" text-anchor="middle" font-size="48" fill="#FF6B9D">🎨</text>
        </svg>
      `)}`;
      
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName,
        imageUrl: previewUrl,
        tags: stickerTags,
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        packId: selectedPack,
        elementData: elements
      };
      
      addSticker(newSticker);
      addStickerToPack(newSticker, selectedPack);
      updateUserPoints(10);
      
      // Reset creator
      setElements([]);
      setSelectedElement(null);
      setStickerName('');
      setStickerTags([]);
      setHistory([]);
      setHistoryIndex(-1);
      setShowCreateModal(false);
      
      toast.success(`Sticker "${stickerName}" created! 🎨✨ (+10 CP)`);
    } catch (error) {
      toast.error('Failed to save sticker! Please try again 😅');
    }
  };
  
  // Filter stickers
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || sticker.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });
  
  // Get owned packs
  const ownedPacks = stickerPacks.filter(pack => pack.owned);
  const availablePacks = stickerPacks.filter(pack => !pack.owned);
  
  // Purchase pack
  const handlePurchasePack = (packId: string) => {
    const pack = stickerPacks.find(p => p.id === packId);
    if (!pack || !currentUser) return;
    
    if (currentUser.clownPoints < pack.price) {
      toast.error(`Not enough ClownPoints! Need ${pack.price} CP 💰`);
      return;
    }
    
    purchaseStickerPack(packId, currentUser.id);
    updateUserPoints(-pack.price);
    toast.success(`${pack.name} pack purchased! 🛍️✨`);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-purple-900/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🌟</div>
        
        {/* Floating art elements */}
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-secondary/5 rounded-full blur-lg animate-float" />
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-block bg-gradient-to-r from-secondary via-primary to-purple text-white px-6 py-3 rounded-full shadow-doodle sketch-border sticker-element"
            >
              <h2 className="text-xl font-bold font-sketch">🎨 STICKER LAB 🎨</h2>
              <div className="absolute -top-1 -right-1 text-sm opacity-70 animate-bounce-doodle">✨</div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'gallery', label: 'Gallery', icon: Grid },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'packs', label: 'Packs', icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search and Filters */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search stickers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                    
                    {/* View Mode */}
                    <div className="flex bg-dark-light rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400'}`}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400'}`}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Create Button */}
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-primary to-purple text-white rounded-2xl p-6 shadow-glow relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple/20 animate-pulse" />
                  <div className="relative flex items-center justify-center space-x-3">
                    <Plus size={24} />
                    <span className="text-lg font-bold">Create New Sticker</span>
                    <Sparkles size={24} />
                  </div>
                </motion.button>

                {/* Stickers Grid */}
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}>
                  {filteredStickers.map((sticker, index) => (
                    <motion.div
                      key={sticker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-dark-card rounded-xl border border-gray-800 overflow-hidden hover:border-primary/50 transition-all group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-4">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                <rect width="100" height="100" fill="#374151"/>
                                <text x="50" y="50" text-anchor="middle" font-size="32" fill="#9CA3AF">🎨</text>
                              </svg>
                            `)}`;
                          }}
                        />
                      </div>
                      
                      <div className="p-3">
                        <h3 className="text-white font-semibold text-sm mb-1 truncate">{sticker.name}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Used {sticker.usageCount} times</span>
                          <div className="flex space-x-1">
                            <button className="p-1 hover:text-white transition-colors">
                              <Download size={12} />
                            </button>
                            <button className="p-1 hover:text-white transition-colors">
                              <Share2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sticker.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {sticker.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{sticker.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredStickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No stickers found</p>
                    <p className="text-sm">Create your first sticker or adjust your filters!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4 animate-bounce-doodle">🎨</div>
                <h3 className="text-white font-bold text-xl mb-2">Advanced Sticker Creator</h3>
                <p className="text-gray-400 mb-6">Use our powerful editor to create amazing stickers!</p>
                
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-primary to-purple text-white rounded-xl px-8 py-4 font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Open Creator Studio
                </motion.button>
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Owned Packs */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <Crown size={20} className="text-accent" />
                    <span>Your Packs</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ownedPacks.map(pack => (
                      <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-2xl">
                            {pack.category === 'custom' ? '🎨' : 
                             pack.category === 'roast' ? '🔥' : 
                             pack.category === 'wholesome' ? '💖' : '😂'}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{pack.name}</h4>
                            <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-accent font-bold">Owned</span>
                          <button className="text-primary hover:text-white transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Packs */}
                <div>
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                    <ShoppingCart size={20} className="text-secondary" />
                    <span>Available Packs</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePacks.map(pack => (
                      <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="text-2xl">
                            {pack.category === 'roast' ? '🔥' : 
                             pack.category === 'wholesome' ? '💖' : 
                             pack.category === 'meme' ? '😂' : '🎨'}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{pack.name}</h4>
                            <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-accent">
                            <Crown size={16} />
                            <span className="font-bold">{pack.price} CP</span>
                          </div>
                          <button
                            onClick={() => handlePurchasePack(pack.id)}
                            disabled={!currentUser || currentUser.clownPoints < pack.price}
                            className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Buy Pack
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Creator Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Creator Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <Palette size={24} className="text-primary" />
                  <h2 className="text-xl font-bold text-white">Sticker Creator Studio</h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Undo/Redo */}
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Undo size={16} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Redo size={16} />
                  </button>
                  
                  <div className="w-px h-6 bg-gray-700" />
                  
                  {/* Save */}
                  <button
                    onClick={handleSaveSticker}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                  
                  {/* Close */}
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                <div className="w-64 bg-dark-light border-r border-gray-700 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {/* Tools */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Tools</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'select', icon: MousePointer, label: 'Select' },
                          { id: 'text', icon: Type, label: 'Text' },
                          { id: 'emoji', icon: Smile, label: 'Emoji' },
                          { id: 'shape', icon: Square, label: 'Shape' },
                          { id: 'image', icon: Image, label: 'Image' },
                        ].map(toolItem => (
                          <button
                            key={toolItem.id}
                            onClick={() => setTool(toolItem.id as any)}
                            className={`p-3 rounded-lg border transition-all ${
                              tool === toolItem.id
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                            }`}
                          >
                            <toolItem.icon size={16} className="mx-auto mb-1" />
                            <div className="text-xs">{toolItem.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tool-specific options */}
                    {tool === 'text' && (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Text Options</h4>
                        <input
                          type="text"
                          placeholder="Enter text..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          className="w-full bg-dark text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                        />
                        
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Font Size</label>
                          <input
                            type="range"
                            min="12"
                            max="72"
                            value={textStyle.fontSize}
                            onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{textStyle.fontSize}px</span>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Font Family</label>
                          <select
                            value={textStyle.fontFamily}
                            onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="w-full bg-dark text-white rounded-lg px-3 py-2 border border-gray-700"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Color</label>
                          <div className="grid grid-cols-4 gap-2">
                            {colorPalettes.Vibrant.map(color => (
                              <button
                                key={color}
                                onClick={() => setTextStyle(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded border-2 ${
                                  textStyle.color === color ? 'border-white' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleAddText}
                          disabled={!textInput.trim()}
                          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          Add Text
                        </button>
                      </div>
                    )}

                    {tool === 'emoji' && (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Emoji Library</h4>
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category}>
                            <h5 className="text-sm text-gray-400 mb-2">{category}</h5>
                            <div className="grid grid-cols-6 gap-1">
                              {emojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddEmoji(emoji)}
                                  className="p-2 text-lg hover:bg-gray-700 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tool === 'shape' && (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Shape Options</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'rectangle', icon: Square, symbol: '■' },
                            { id: 'circle', icon: Circle, symbol: '●' },
                            { id: 'triangle', icon: Triangle, symbol: '▲' },
                            { id: 'heart', icon: Heart, symbol: '♥' },
                            { id: 'star', icon: Star, symbol: '★' },
                          ].map(shape => (
                            <button
                              key={shape.id}
                              onClick={() => setShapeType(shape.id as any)}
                              className={`p-3 rounded-lg border transition-all ${
                                shapeType === shape.id
                                  ? 'border-primary bg-primary/20 text-primary'
                                  : 'border-gray-700 text-gray-400 hover:text-white'
                              }`}
                            >
                              <shape.icon size={16} className="mx-auto" />
                            </button>
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Fill Color</label>
                          <div className="grid grid-cols-4 gap-2">
                            {colorPalettes.Vibrant.map(color => (
                              <button
                                key={color}
                                onClick={() => setShapeStyle(prev => ({ ...prev, fill: color }))}
                                className={`w-8 h-8 rounded border-2 ${
                                  shapeStyle.fill === color ? 'border-white' : 'border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleAddShape}
                          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Add Shape
                        </button>
                      </div>
                    )}

                    {tool === 'image' && (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Image Upload</h4>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full bg-secondary text-white py-3 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Upload size={16} />
                          <span>Upload Image</span>
                        </button>
                        <p className="text-xs text-gray-400">Max 5MB • JPG, PNG, GIF</p>
                      </div>
                    )}

                    {/* Canvas Options */}
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">Canvas</h4>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowGrid(!showGrid)}
                          className={`p-2 rounded ${showGrid ? 'bg-primary text-white' : 'text-gray-400'}`}
                        >
                          <Grid size={16} />
                        </button>
                        <span className="text-sm text-gray-400">Show Grid</span>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Background</label>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => setBackgroundColor('#transparent')}
                            className={`w-8 h-8 rounded border-2 bg-gradient-to-br from-gray-300 to-gray-500 ${
                              backgroundColor === '#transparent' ? 'border-white' : 'border-gray-600'
                            }`}
                          />
                          {['#ffffff', '#000000', '#f3f4f6'].map(color => (
                            <button
                              key={color}
                              onClick={() => setBackgroundColor(color)}
                              className={`w-8 h-8 rounded border-2 ${
                                backgroundColor === color ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-gray-900 relative overflow-hidden">
                  <div className="absolute inset-4 bg-white rounded-lg shadow-lg overflow-hidden">
                    <div
                      ref={canvasRef}
                      className="relative w-full h-full"
                      style={{
                        backgroundColor: backgroundColor === '#transparent' ? 'transparent' : backgroundColor,
                        backgroundImage: showGrid ? 
                          'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)' : 
                          'none',
                        backgroundSize: showGrid ? '20px 20px' : 'auto'
                      }}
                    >
                      {/* Render elements */}
                      {elements
                        .sort((a, b) => a.layer - b.layer)
                        .map(element => (
                          <div
                            key={element.id}
                            className={`absolute cursor-move select-none ${
                              selectedElement === element.id ? 'ring-2 ring-primary' : ''
                            }`}
                            style={{
                              left: element.x,
                              top: element.y,
                              width: element.width,
                              height: element.height,
                              transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                              zIndex: element.layer
                            }}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            {element.type === 'text' && (
                              <div
                                style={{
                                  fontSize: element.style?.fontSize || 24,
                                  color: element.style?.color || '#000000',
                                  fontFamily: element.style?.fontFamily || 'Arial',
                                  fontWeight: element.style?.fontWeight || 'normal',
                                  textAlign: element.style?.textAlign as any || 'center',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'emoji' && (
                              <div
                                style={{
                                  fontSize: element.style?.fontSize || 32,
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'image' && element.imageData && (
                              <img
                                src={element.imageData}
                                alt={element.content}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Canvas Controls */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/50 rounded-lg p-2">
                    <button
                      onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                      className="p-2 text-white hover:bg-white/20 rounded"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                      className="p-2 text-white hover:bg-white/20 rounded"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>

                {/* Right Properties Panel */}
                <div className="w-64 bg-dark-light border-l border-gray-700 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {/* Sticker Info */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Sticker Info</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Name</label>
                          <input
                            type="text"
                            value={stickerName}
                            onChange={(e) => setStickerName(e.target.value)}
                            placeholder="My awesome sticker"
                            className="w-full bg-dark text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Pack</label>
                          <select
                            value={selectedPack}
                            onChange={(e) => setSelectedPack(e.target.value)}
                            className="w-full bg-dark text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          >
                            {ownedPacks.map(pack => (
                              <option key={pack.id} value={pack.id}>{pack.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {stickerTags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs flex items-center space-x-1"
                              >
                                <span>#{tag}</span>
                                <button
                                  onClick={() => setStickerTags(tags => tags.filter(t => t !== tag))}
                                  className="hover:text-white"
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Add tag..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = (e.target as HTMLInputElement).value.trim();
                                if (value && !stickerTags.includes(value)) {
                                  setStickerTags([...stickerTags, value]);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                            className="w-full bg-dark text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Element Properties */}
                    {selectedElement && (
                      <div>
                        <h3 className="text-white font-semibold mb-3">Element Properties</h3>
                        {(() => {
                          const element = elements.find(el => el.id === selectedElement);
                          if (!element) return null;
                          
                          return (
                            <div className="space-y-3">
                              {/* Position */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">X</label>
                                  <input
                                    type="number"
                                    value={Math.round(element.x)}
                                    onChange={(e) => updateElement(element.id, { x: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Y</label>
                                  <input
                                    type="number"
                                    value={Math.round(element.y)}
                                    onChange={(e) => updateElement(element.id, { y: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-700"
                                  />
                                </div>
                              </div>
                              
                              {/* Size */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Width</label>
                                  <input
                                    type="number"
                                    value={Math.round(element.width)}
                                    onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Height</label>
                                  <input
                                    type="number"
                                    value={Math.round(element.height)}
                                    onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-700"
                                  />
                                </div>
                              </div>
                              
                              {/* Rotation */}
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Rotation</label>
                                <input
                                  type="range"
                                  min="-180"
                                  max="180"
                                  value={element.rotation}
                                  onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) })}
                                  className="w-full"
                                />
                                <span className="text-xs text-gray-400">{element.rotation}°</span>
                              </div>
                              
                              {/* Actions */}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => updateElement(element.id, { flipX: !element.flipX })}
                                  className={`p-2 rounded text-sm ${element.flipX ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                                >
                                  <FlipHorizontal size={14} className="mx-auto" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { flipY: !element.flipY })}
                                  className={`p-2 rounded text-sm ${element.flipY ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                                >
                                  <FlipVertical size={14} className="mx-auto" />
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-1">
                                <button
                                  onClick={() => duplicateElement(element.id)}
                                  className="p-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600"
                                >
                                  <Copy size={14} className="mx-auto" />
                                </button>
                                <button
                                  onClick={() => moveLayer(element.id, 'up')}
                                  className="p-2 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600"
                                >
                                  ↑
                                </button>
                                <button
                                  onClick={() => deleteElement(element.id)}
                                  className="p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                  <Trash2 size={14} className="mx-auto" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Layers */}
                    <div>
                      <h3 className="text-white font-semibold mb-3">Layers</h3>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {elements
                          .sort((a, b) => b.layer - a.layer)
                          .map(element => (
                            <div
                              key={element.id}
                              onClick={() => setSelectedElement(element.id)}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedElement === element.id
                                  ? 'bg-primary/20 border border-primary'
                                  : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm truncate">
                                  {element.type === 'text' ? element.content : 
                                   element.type === 'emoji' ? element.content :
                                   element.type === 'image' ? element.content :
                                   `${element.type} ${element.layer + 1}`}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(element.id);
                                  }}
                                  className="text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};