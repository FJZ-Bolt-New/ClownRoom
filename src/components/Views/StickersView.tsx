import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Save, 
  Undo, 
  Redo, 
  X, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Filter,
  ShoppingBag,
  Star,
  Crown,
  Package,
  Grid,
  Search,
  Heart,
  Users
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

interface CanvasElement extends StickerElement {
  isSelected: boolean;
  isVisible: boolean;
}

interface HistoryState {
  elements: CanvasElement[];
  selectedElement: string | null;
}

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateUserPoints, 
    stickerPacks, 
    addStickerToPack, 
    updateStickerPack,
    addStickerPack,
    purchaseStickerPack,
    currentUser 
  } = useStore();
  
  // Main view state
  const [activeTab, setActiveTab] = useState<'my-stickers' | 'my-packs' | 'explore-packs' | 'create'>('my-stickers');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Canvas state
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Layer management
  const [layerFilter, setLayerFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [], selectedElement: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Available tags
  const availableTags = ['funny', 'cute', 'cool', 'epic', 'meme', 'reaction', 'emoji', 'text', 'custom'];
  
  // Get user's owned sticker packs
  const myPacks = stickerPacks.filter(pack => pack.createdBy === currentUser?.id || pack.owned);
  const explorePacks = stickerPacks.filter(pack => pack.createdBy !== currentUser?.id && !pack.owned);
  
  // Get user's created stickers
  const myStickers = stickers.filter(sticker => sticker.createdBy === currentUser?.id);

  // FIXED: Enhanced layer navigation with proper bounds checking
  const getMaxLayer = () => {
    return Math.max(1, ...elements.map(el => el.layer));
  };

  const getMinLayer = () => {
    return Math.min(1, ...elements.map(el => el.layer));
  };

  const moveElementLayer = (elementId: string, direction: 'up' | 'down' | 'top' | 'bottom' | number) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const maxLayer = getMaxLayer();
    const minLayer = getMinLayer();
    let newLayer = element.layer;

    if (typeof direction === 'number') {
      // Direct layer assignment with bounds checking
      newLayer = Math.max(minLayer, Math.min(maxLayer + 1, direction));
    } else {
      switch (direction) {
        case 'up':
          newLayer = Math.min(maxLayer + 1, element.layer + 1);
          break;
        case 'down':
          newLayer = Math.max(minLayer, element.layer - 1);
          break;
        case 'top':
          newLayer = maxLayer + 1;
          break;
        case 'bottom':
          newLayer = minLayer;
          break;
      }
    }

    // Only update if the layer actually changed
    if (newLayer !== element.layer) {
      updateElement(elementId, { layer: newLayer });
      toast.success(`Moved to layer ${newLayer}! 📚`);
    }
  };

  // Add element to canvas
  const addElement = (type: 'text' | 'emoji' | 'image', content: string, imageData?: string) => {
    const maxLayer = elements.length > 0 ? Math.max(...elements.map(el => el.layer)) : 0;
    
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
      width: type === 'text' ? 120 : 80,
      height: type === 'text' ? 40 : 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: maxLayer + 1,
      isSelected: false,
      isVisible: true,
      style: type === 'text' ? {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      } : undefined,
      imageData
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElement(newElement.id);
    saveToHistory(newElements, newElement.id);
    
    toast.success(`${type === 'text' ? 'Text' : type === 'emoji' ? 'Emoji' : 'Image'} added! 🎨`);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements, selectedElement);
  };

  // Delete element
  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElement(null);
    saveToHistory(newElements, null);
    toast.success('Element deleted! 🗑️');
  };

  // Toggle element visibility
  const toggleElementVisibility = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { isVisible: !element.isVisible });
      toast.success(`Element ${element.isVisible ? 'hidden' : 'shown'}! 👁️`);
    }
  };

  // Save to history for undo/redo
  const saveToHistory = (newElements: CanvasElement[], selectedId: string | null) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ elements: newElements, selectedElement: selectedId });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setElements(state.elements);
      setSelectedElement(state.selectedElement);
      setHistoryIndex(newIndex);
      toast.success('Undone! ↶');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setElements(state.elements);
      setSelectedElement(state.selectedElement);
      setHistoryIndex(newIndex);
      toast.success('Redone! ↷');
    }
  };

  // Mouse event handlers for drag and resize
  const handleMouseDown = (e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(elementId);
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedElement) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    if (isDragging) {
      updateElement(selectedElement, {
        x: Math.max(0, elements.find(el => el.id === selectedElement)!.x + deltaX),
        y: Math.max(0, elements.find(el => el.id === selectedElement)!.y + deltaY)
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement)!;
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      switch (resizeHandle) {
        case 'nw':
          newWidth = Math.max(20, element.width - deltaX);
          newHeight = Math.max(20, element.height - deltaY);
          newX = element.x + deltaX;
          newY = element.y + deltaY;
          break;
        case 'ne':
          newWidth = Math.max(20, element.width + deltaX);
          newHeight = Math.max(20, element.height - deltaY);
          newY = element.y + deltaY;
          break;
        case 'sw':
          newWidth = Math.max(20, element.width - deltaX);
          newHeight = Math.max(20, element.height + deltaY);
          newX = element.x + deltaX;
          break;
        case 'se':
          newWidth = Math.max(20, element.width + deltaX);
          newHeight = Math.max(20, element.height + deltaY);
          break;
        case 'n':
          newHeight = Math.max(20, element.height - deltaY);
          newY = element.y + deltaY;
          break;
        case 's':
          newHeight = Math.max(20, element.height + deltaY);
          break;
        case 'w':
          newWidth = Math.max(20, element.width - deltaX);
          newX = element.x + deltaX;
          break;
        case 'e':
          newWidth = Math.max(20, element.width + deltaX);
          break;
      }
      
      updateElement(selectedElement, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY
      });
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, selectedElement, dragStart, elements, updateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        addElement('image', file.name, imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save sticker
  const handleSaveSticker = () => {
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    // Create new pack if needed
    let targetPackId = selectedPackId;
    if (createNewPack && newPackName.trim()) {
      const newPack = {
        id: `pack-${Date.now()}`,
        name: newPackName.trim(),
        description: 'Custom sticker pack',
        stickers: [],
        category: 'custom' as const,
        count: 0,
        owned: true,
        price: 0,
        createdBy: currentUser?.id || 'user-1',
        createdAt: new Date(),
      };
      
      addStickerPack(newPack);
      targetPackId = newPack.id;
      toast.success(`New pack "${newPackName}" created! 📦`);
    }

    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: stickerName.trim(),
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RpY2tlcjwvdGV4dD48L3N2Zz4=',
      tags: selectedTags,
      createdBy: currentUser?.id || 'user-1',
      usageCount: 0,
      packId: targetPackId,
      elementData: elements.map(el => ({
        id: el.id,
        type: el.type,
        content: el.content,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        flipX: el.flipX,
        flipY: el.flipY,
        layer: el.layer,
        style: el.style,
        imageData: el.imageData
      }))
    };

    addStickerToPack(newSticker, targetPackId);
    updateUserPoints(10);
    
    // Reset form
    setStickerName('');
    setSelectedTags([]);
    setNewPackName('');
    setCreateNewPack(false);
    setSelectedPackId('pack-default');
    setShowSaveModal(false);
    
    // Clear canvas
    setElements([]);
    setSelectedElement(null);
    setHistory([{ elements: [], selectedElement: null }]);
    setHistoryIndex(0);
    
    toast.success(`Sticker "${newSticker.name}" saved! 🎨 (+10 CP)`);
  };

  // Purchase sticker pack
  const handlePurchasePack = (packId: string) => {
    const pack = stickerPacks.find(p => p.id === packId);
    if (!pack || !currentUser) return;

    if (currentUser.clownPoints < pack.price) {
      toast.error(`Not enough ClownPoints! Need ${pack.price} CP 💰`);
      return;
    }

    purchaseStickerPack(packId, currentUser.id);
    toast.success(`${pack.name} pack purchased! 🛍️ (-${pack.price} CP)`);
  };

  // Filter elements for layer panel
  const getFilteredElements = () => {
    let filtered = [...elements];
    
    switch (layerFilter) {
      case 'visible':
        filtered = filtered.filter(el => el.isVisible);
        break;
      case 'hidden':
        filtered = filtered.filter(el => !el.isVisible);
        break;
    }
    
    return filtered.sort((a, b) => b.layer - a.layer);
  };

  // Filter stickers and packs based on search
  const getFilteredStickers = (stickerList: Sticker[]) => {
    if (!searchTerm) return stickerList;
    return stickerList.filter(sticker => 
      sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getFilteredPacks = (packList: any[]) => {
    if (!searchTerm) return packList;
    return packList.filter(pack => 
      pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖼️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
              { id: 'my-packs', label: 'My Packs', icon: Package },
              { id: 'explore-packs', label: 'Explore Packs', icon: ShoppingBag },
              { id: 'create', label: 'Create', icon: Plus },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* My Stickers Tab */}
            {activeTab === 'my-stickers' && (
              <motion.div
                key="my-stickers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search my stickers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getFilteredStickers(myStickers).map((sticker, index) => (
                    <motion.div
                      key={sticker.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800 hover:border-secondary transition-colors"
                    >
                      <div className="aspect-square bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-2 truncate">{sticker.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sticker.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                        {sticker.tags.length > 2 && (
                          <span className="text-gray-400 text-xs">+{sticker.tags.length - 2}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Used {sticker.usageCount} times</span>
                        <button className="text-secondary hover:text-white transition-colors">
                          <Download size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {getFilteredStickers(myStickers).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Grid size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No stickers found</p>
                    <p className="text-sm">
                      {searchTerm ? 'Try a different search term' : 'Create your first sticker!'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* My Packs Tab */}
            {activeTab === 'my-packs' && (
              <motion.div
                key="my-packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search my packs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Packs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredPacks(myPacks).map((pack, index) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-secondary transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                        {pack.createdBy === currentUser?.id && (
                          <Crown size={16} className="text-accent" />
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4">{pack.description}</p>
                      
                      {/* Preview stickers */}
                      <div className="flex space-x-2 mb-4">
                        {pack.stickers.slice(0, 4).map((sticker, i) => (
                          <div key={i} className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-sm">🎨</span>
                          </div>
                        ))}
                        {pack.count > 4 && (
                          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">+{pack.count - 4}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {pack.category.charAt(0).toUpperCase() + pack.category.slice(1)}
                        </span>
                        <button className="px-3 py-1 bg-secondary/20 text-secondary rounded text-sm hover:bg-secondary/30 transition-colors">
                          View Pack
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {getFilteredPacks(myPacks).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No packs found</p>
                    <p className="text-sm">
                      {searchTerm ? 'Try a different search term' : 'Create stickers to build your first pack!'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Explore Packs Tab */}
            {activeTab === 'explore-packs' && (
              <motion.div
                key="explore-packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search marketplace..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Marketplace Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredPacks(explorePacks).map((pack, index) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-primary transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-lg flex items-center justify-center">
                          <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                        <div className="flex items-center space-x-1 text-accent">
                          <Star size={14} />
                          <span className="text-sm">4.8</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4">{pack.description}</p>
                      
                      {/* Preview stickers */}
                      <div className="flex space-x-2 mb-4">
                        {Array.from({ length: Math.min(4, pack.count) }).map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-sm">🎨</span>
                          </div>
                        ))}
                        {pack.count > 4 && (
                          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-400">+{pack.count - 4}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{pack.category}</span>
                          <div className="flex items-center space-x-1 text-gray-400">
                            <Users size={12} />
                            <span className="text-xs">1.2k</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Crown size={14} className="text-accent" />
                          <span className="text-accent font-bold">{pack.price} CP</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handlePurchasePack(pack.id)}
                        disabled={!currentUser || currentUser.clownPoints < pack.price}
                        className="w-full py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-semibold hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {pack.price === 0 ? 'Add to My Stickers' : `Buy for ${pack.price} CP`}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {getFilteredPacks(explorePacks).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No packs found</p>
                    <p className="text-sm">
                      {searchTerm ? 'Try a different search term' : 'Check back later for new packs!'}
                    </p>
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
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Canvas Area */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Toolbar */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Undo size={16} />
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Redo size={16} />
                        </button>
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save size={16} className="mr-2" />
                          Save Sticker
                        </button>
                      </div>
                    </div>

                    {/* Add Element Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => addElement('text', 'New Text')}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                      >
                        <Type size={16} />
                        <span>Add Text</span>
                      </button>
                      
                      <button
                        onClick={() => addElement('emoji', '😀')}
                        className="flex items-center space-x-2 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <span className="text-lg">😀</span>
                        <span>Add Emoji</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <Image size={16} />
                        <span>Add Image</span>
                      </button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Canvas */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
                      onClick={() => setSelectedElement(null)}
                    >
                      {elements.map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move select-none ${
                            !element.isVisible ? 'opacity-30' : ''
                          } ${
                            element.isSelected || selectedElement === element.id
                              ? 'ring-2 ring-primary'
                              : ''
                          }`}
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                            transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                            zIndex: element.layer,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                        >
                          {/* Element Content */}
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center text-center break-words"
                              style={{
                                fontSize: element.style?.fontSize || 16,
                                color: element.style?.color || '#ffffff',
                                fontFamily: element.style?.fontFamily || 'Arial',
                                fontWeight: element.style?.fontWeight || 'normal',
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'emoji' && (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'image' && element.imageData && (
                            <img
                              src={element.imageData}
                              alt={element.content}
                              className="w-full h-full object-cover rounded"
                              draggable={false}
                            />
                          )}

                          {/* Resize Handles */}
                          {selectedElement === element.id && (
                            <>
                              {/* Corner handles */}
                              <div
                                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
                              />
                              <div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
                              />
                              <div
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
                              />
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
                              />
                              
                              {/* Edge handles */}
                              <div
                                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-n-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'n')}
                              />
                              <div
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-s-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 's')}
                              />
                              <div
                                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-w-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'w')}
                              />
                              <div
                                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-e-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'e')}
                              />
                            </>
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p>Click the buttons above to add elements</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="space-y-4">
                  {/* Element Properties */}
                  {selectedElement && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-4">Element Properties</h3>
                      
                      {(() => {
                        const element = elements.find(el => el.id === selectedElement);
                        if (!element) return null;
                        
                        return (
                          <div className="space-y-3">
                            {element.type === 'text' && (
                              <>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">Text</label>
                                  <input
                                    type="text"
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                    className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">Font Size</label>
                                  <input
                                    type="range"
                                    min="8"
                                    max="48"
                                    value={element.style?.fontSize || 16}
                                    onChange={(e) => updateElement(element.id, {
                                      style: { ...element.style, fontSize: parseInt(e.target.value) }
                                    })}
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-gray-300 mb-1">Color</label>
                                  <input
                                    type="color"
                                    value={element.style?.color || '#ffffff'}
                                    onChange={(e) => updateElement(element.id, {
                                      style: { ...element.style, color: e.target.value }
                                    })}
                                    className="w-full h-8 rounded"
                                  />
                                </div>
                              </>
                            )}
                            
                            {element.type === 'emoji' && (
                              <div>
                                <label className="block text-sm text-gray-300 mb-1">Emoji</label>
                                <input
                                  type="text"
                                  value={element.content}
                                  onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                                  placeholder="Enter emoji"
                                />
                              </div>
                            )}
                            
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                value={element.rotation}
                                onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateElement(element.id, { flipX: !element.flipX })}
                                className={`flex-1 py-2 rounded text-sm ${
                                  element.flipX ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                              >
                                Flip X
                              </button>
                              <button
                                onClick={() => updateElement(element.id, { flipY: !element.flipY })}
                                className={`flex-1 py-2 rounded text-sm ${
                                  element.flipY ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                              >
                                Flip Y
                              </button>
                            </div>
                            
                            <button
                              onClick={() => deleteElement(element.id)}
                              className="w-full py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete Element
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Layer Management Panel */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold flex items-center space-x-2">
                        <Layers size={16} />
                        <span>Layers</span>
                      </h3>
                      <select
                        value={layerFilter}
                        onChange={(e) => setLayerFilter(e.target.value as any)}
                        className="bg-gray-700 text-white rounded px-2 py-1 text-xs"
                      >
                        <option value="all">All</option>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {getFilteredElements().map((element) => (
                        <div
                          key={element.id}
                          className={`p-2 rounded border cursor-pointer transition-colors ${
                            selectedElement === element.id
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center text-xs">
                              {element.type === 'text' ? '📝' : element.type === 'image' ? '🖼️' : element.content}
                            </div>
                            <span className="text-white text-sm flex-1 truncate">
                              {element.type === 'text' ? element.content : `${element.type} ${element.id.slice(-4)}`}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleElementVisibility(element.id);
                              }}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              {element.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">Layer:</span>
                            <input
                              type="number"
                              min={getMinLayer()}
                              max={getMaxLayer() + 1}
                              value={element.layer}
                              onChange={(e) => {
                                const newLayer = parseInt(e.target.value);
                                if (!isNaN(newLayer)) {
                                  moveElementLayer(element.id, newLayer);
                                }
                              }}
                              className="w-12 bg-gray-700 text-white rounded px-1 py-0.5 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementLayer(element.id, 'down');
                                }}
                                disabled={element.layer <= getMinLayer()}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementLayer(element.id, 'up');
                                }}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementLayer(element.id, 'bottom');
                                }}
                                disabled={element.layer <= getMinLayer()}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ArrowDown size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementLayer(element.id, 'top');
                                }}
                                className="p-0.5 text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowUp size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {getFilteredElements().length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          {layerFilter === 'all' ? 'No elements' : `No ${layerFilter} elements`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save Sticker Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Save Sticker</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    placeholder="Enter sticker name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-secondary text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Save to Pack
                  </label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-pack"
                        name="pack-option"
                        checked={!createNewPack}
                        onChange={() => setCreateNewPack(false)}
                        className="text-secondary"
                      />
                      <label htmlFor="existing-pack" className="text-white">Use existing pack</label>
                    </div>
                    
                    {!createNewPack && (
                      <select
                        value={selectedPackId}
                        onChange={(e) => setSelectedPackId(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                      >
                        {myPacks.map((pack) => (
                          <option key={pack.id} value={pack.id}>
                            {pack.name} ({pack.count} stickers)
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="new-pack"
                        name="pack-option"
                        checked={createNewPack}
                        onChange={() => setCreateNewPack(true)}
                        className="text-secondary"
                      />
                      <label htmlFor="new-pack" className="text-white">Create new pack</label>
                    </div>
                    
                    {createNewPack && (
                      <input
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                        placeholder="Enter new pack name..."
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSticker}
                  className="flex-1 py-2 bg-gradient-to-r from-secondary to-primary text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-primary/90 transition-all"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};