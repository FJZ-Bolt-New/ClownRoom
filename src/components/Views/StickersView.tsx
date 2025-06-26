import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  Save, 
  Trash2, 
  RotateCw, 
  Move, 
  Palette,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  Upload,
  Grid,
  Package,
  ShoppingCart,
  Star,
  Crown,
  Zap,
  Heart,
  X,
  Search,
  Filter,
  ArrowLeft,
  Check
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateUserPoints, 
    stickerPacks, 
    addStickerPack, 
    updateStickerPack, 
    addStickerToPack, 
    purchaseStickerPack,
    currentUser 
  } = useStore();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'mystickers' | 'mypacks' | 'explore'>('create');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreatePackModal, setShowCreatePackModal] = useState(false);
  
  // Save modal state
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // Create pack modal state
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packCategory, setPackCategory] = useState<'custom' | 'wholesome' | 'cursed' | 'roast' | 'meme'>('custom');
  
  // Explore state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'wholesome' | 'cursed' | 'roast' | 'meme'>('all');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
    'Food': ['🍎', '🍌', '🍓', '🍕', '🍔', '🌭', '🍟', '🍗', '🎂', '🍰', '🍪', '🍩', '☕', '🥤'],
    'Objects': ['⚽', '🏀', '🎮', '🎸', '🎨', '📱', '💻', '🚗', '✈️', '🚀', '⭐', '🌟', '✨', '🎪'],
  };

  // Get layer bounds
  const getMinLayer = () => 1;
  const getMaxLayer = () => Math.max(1, elements.length);

  // FIXED: Layer management with proper z-index calculation
  const moveElementLayer = (direction: 'up' | 'down') => {
    if (!selectedElement) return;
    
    const elementIndex = elements.findIndex(el => el.id === selectedElement);
    if (elementIndex === -1) return;
    
    const currentElement = elements[elementIndex];
    let newLayer = currentElement.layer;
    
    if (direction === 'up') {
      // Move forward (higher z-index)
      newLayer = Math.min(currentElement.layer + 1, getMaxLayer());
    } else {
      // Move backward (lower z-index)
      newLayer = Math.max(currentElement.layer - 1, getMinLayer());
    }
    
    if (newLayer === currentElement.layer) return; // No change needed
    
    // Update the element's layer
    const updatedElements = elements.map(el => {
      if (el.id === selectedElement) {
        return { ...el, layer: newLayer };
      }
      // Adjust other elements' layers to maintain proper stacking
      if (direction === 'up' && el.layer === newLayer && el.id !== selectedElement) {
        return { ...el, layer: el.layer - 1 };
      }
      if (direction === 'down' && el.layer === newLayer && el.id !== selectedElement) {
        return { ...el, layer: el.layer + 1 };
      }
      return el;
    });
    
    setElements(updatedElements);
    setCurrentLayer(newLayer);
    toast.success(`Moved ${direction === 'up' ? 'forward' : 'backward'}! 📐`);
  };

  const setElementLayer = (layer: number) => {
    if (!selectedElement) return;
    
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    const boundedLayer = Math.max(minLayer, Math.min(layer, maxLayer));
    
    if (boundedLayer !== layer) {
      toast.error(`Layer must be between ${minLayer} and ${maxLayer}! 📏`);
      return;
    }
    
    const elementIndex = elements.findIndex(el => el.id === selectedElement);
    if (elementIndex === -1) return;
    
    const currentElement = elements[elementIndex];
    if (currentElement.layer === boundedLayer) return;
    
    // Update the element's layer and adjust others accordingly
    const updatedElements = elements.map(el => {
      if (el.id === selectedElement) {
        return { ...el, layer: boundedLayer };
      }
      // Shift other elements to make room
      if (boundedLayer > currentElement.layer && el.layer > currentElement.layer && el.layer <= boundedLayer) {
        return { ...el, layer: el.layer - 1 };
      }
      if (boundedLayer < currentElement.layer && el.layer < currentElement.layer && el.layer >= boundedLayer) {
        return { ...el, layer: el.layer + 1 };
      }
      return el;
    });
    
    setElements(updatedElements);
    setCurrentLayer(boundedLayer);
  };

  // Add element functions
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1, // FIXED: Assign next available layer
      style: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success('Text added! ✏️');
  };

  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 75,
      y: 75,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1, // FIXED: Assign next available layer
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success(`${emoji} added! 🎨`);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file! 🖼️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      
      const newElement: StickerElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 25,
        y: 25,
        width: 100,
        height: 100,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: elements.length + 1, // FIXED: Assign next available layer
        imageData,
      };
      
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setCurrentLayer(newElement.layer);
      toast.success('Image uploaded! 📸');
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Element manipulation
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    const elementToDelete = elements.find(el => el.id === id);
    if (!elementToDelete) return;
    
    // Remove the element and adjust layers of elements above it
    const updatedElements = elements
      .filter(el => el.id !== id)
      .map(el => ({
        ...el,
        layer: el.layer > elementToDelete.layer ? el.layer - 1 : el.layer
      }));
    
    setElements(updatedElements);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Element deleted! 🗑️');
  };

  // FIXED: Element selection with proper layer sync
  const selectElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      setSelectedElement(id);
      setCurrentLayer(element.layer);
    }
  };

  // Canvas operations
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // Save sticker
  const handleSaveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }
    
    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    // Create new pack if needed
    if (createNewPack && newPackName.trim()) {
      const newPack = {
        id: `pack-${Date.now()}`,
        name: newPackName.trim(),
        description: `Custom pack created by ${currentUser?.username}`,
        stickers: [],
        category: 'custom' as const,
        count: 0,
        owned: true,
        price: 0,
        createdBy: currentUser?.id || 'user-1',
        createdAt: new Date(),
      };
      
      addStickerPack(newPack);
      setSelectedPackId(newPack.id);
    }

    // Create sticker
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: stickerName.trim(),
      imageUrl: `data:image/svg+xml;base64,${btoa('<svg>sticker</svg>')}`,
      tags: ['custom'],
      createdBy: currentUser?.id || 'user-1',
      usageCount: 0,
      packId: selectedPackId,
      elementData: elements,
    };

    // Add to pack
    addStickerToPack(newSticker, selectedPackId);
    updateUserPoints(10);
    
    // FIXED: Show success toast and reset only form fields
    toast.success(`✨ Sticker '${stickerName}' saved successfully! (+10 CP)`, {
      duration: 4000,
      icon: '🎨',
    });
    
    // Reset only the save modal form
    setShowSaveModal(false);
    setStickerName('');
    setCreateNewPack(false);
    setNewPackName('');
    setSelectedPackId('pack-default');
    
    // Keep canvas intact - don't clear elements
  };

  // Create pack
  const handleCreatePack = () => {
    if (!packName.trim()) {
      toast.error('Pack name is required! 📝');
      return;
    }

    const newPack = {
      id: `pack-${Date.now()}`,
      name: packName.trim(),
      description: packDescription.trim() || `${packCategory} sticker pack`,
      stickers: [],
      category: packCategory,
      count: 0,
      owned: true,
      price: 0,
      createdBy: currentUser?.id || 'user-1',
      createdAt: new Date(),
    };

    addStickerPack(newPack);
    updateUserPoints(5);
    
    setShowCreatePackModal(false);
    setPackName('');
    setPackDescription('');
    setPackCategory('custom');
    
    toast.success(`Pack "${newPack.name}" created! 📦 (+5 CP)`);
  };

  // Get user's owned packs
  const getOwnedPacks = () => {
    return stickerPacks.filter(pack => pack.owned);
  };

  // Get user's created stickers
  const getUserStickers = () => {
    return stickers.filter(sticker => sticker.createdBy === currentUser?.id);
  };

  // Get explore packs (not owned)
  const getExplorePacks = () => {
    let packs = stickerPacks.filter(pack => !pack.owned);
    
    if (searchTerm) {
      packs = packs.filter(pack => 
        pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      packs = packs.filter(pack => pack.category === filterCategory);
    }
    
    return packs;
  };

  // Purchase pack
  const handlePurchasePack = (packId: string) => {
    const pack = stickerPacks.find(p => p.id === packId);
    if (!pack || !currentUser) return;
    
    if (currentUser.clownPoints < pack.price) {
      toast.error(`Not enough ClownPoints! Need ${pack.price} CP 💰`);
      return;
    }
    
    purchaseStickerPack(packId, currentUser.id);
    toast.success(`${pack.name} pack purchased! 🛒 (-${pack.price} CP)`);
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-bounce-doodle">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-wiggle">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-float">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
        
        {/* Floating art supplies */}
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-secondary/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-primary/5 rounded-full blur-lg animate-float" />
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'mystickers', label: 'My Stickers', icon: Star },
              { id: 'mypacks', label: 'My Packs', icon: Package },
              { id: 'explore', label: 'Explore Packs', icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
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
            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Add Elements</h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={addTextElement}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white font-hand">Add Text</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ImageIcon size={20} className="text-secondary" />
                        <span className="text-white font-hand">Upload Image</span>
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

                  {/* Emoji Picker */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Emojis</h3>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category}>
                          <h4 className="text-xs text-gray-400 font-hand mb-2">{category}</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addEmojiElement(emoji)}
                                className="p-2 text-2xl hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Layer Controls */}
                  {selectedElement && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3 font-sketch">Layer Controls</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 text-sm font-hand">Layer:</span>
                          <input
                            type="number"
                            value={currentLayer}
                            onChange={(e) => setElementLayer(parseInt(e.target.value) || 1)}
                            min={getMinLayer()}
                            max={getMaxLayer()}
                            className="w-16 bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                          />
                          <span className="text-gray-400 text-xs">/ {getMaxLayer()}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => moveElementLayer('up')}
                            disabled={currentLayer >= getMaxLayer()}
                            className="flex-1 flex items-center justify-center space-x-1 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={16} />
                            <span className="text-sm font-hand">Forward</span>
                          </button>
                          
                          <button
                            onClick={() => moveElementLayer('down')}
                            disabled={currentLayer <= getMinLayer()}
                            className="flex-1 flex items-center justify-center space-x-1 p-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={16} />
                            <span className="text-sm font-hand">Backward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Canvas Actions */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Actions</h3>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={elements.length === 0}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} />
                        <span className="font-hand">Save Sticker</span>
                      </button>
                      
                      <button
                        onClick={clearCanvas}
                        className="w-full flex items-center justify-center space-x-2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="font-hand">Clear Canvas</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4 font-sketch">Sticker Canvas</h3>
                    
                    <div
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden"
                      style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '20px 20px' }}
                    >
                      {elements
                        .sort((a, b) => a.layer - b.layer) // FIXED: Sort by layer for proper z-index
                        .map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move select-none ${
                            selectedElement === element.id ? 'ring-2 ring-primary' : ''
                          }`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            width: `${element.width}px`,
                            height: `${element.height}px`,
                            transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                            zIndex: element.layer, // FIXED: Use layer as z-index
                          }}
                          onClick={() => selectElement(element.id)} // FIXED: Click to select
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectElement(element.id);
                            
                            const startX = e.clientX - element.x;
                            const startY = e.clientY - element.y;
                            
                            const handleMouseMove = (e: MouseEvent) => {
                              const rect = canvasRef.current?.getBoundingClientRect();
                              if (!rect) return;
                              
                              const newX = Math.max(0, Math.min(rect.width - element.width, e.clientX - rect.left - startX));
                              const newY = Math.max(0, Math.min(rect.height - element.height, e.clientY - rect.top - startY));
                              
                              updateElement(element.id, { x: newX, y: newY });
                            };
                            
                            const handleMouseUp = () => {
                              document.removeEventListener('mousemove', handleMouseMove);
                              document.removeEventListener('mouseup', handleMouseUp);
                            };
                            
                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                          }}
                        >
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center font-bold"
                              style={{
                                fontSize: `${element.style?.fontSize || 24}px`,
                                color: element.style?.color || '#000000',
                                fontFamily: element.style?.fontFamily || 'Arial',
                                fontWeight: element.style?.fontWeight || 'bold',
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
                          
                          {/* Resize handles */}
                          {selectedElement === element.id && (
                            <>
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  const startX = e.clientX;
                                  const startY = e.clientY;
                                  const startWidth = element.width;
                                  const startHeight = element.height;
                                  
                                  const handleMouseMove = (e: MouseEvent) => {
                                    const newWidth = Math.max(20, startWidth + (e.clientX - startX));
                                    const newHeight = Math.max(20, startHeight + (e.clientY - startY));
                                    updateElement(element.id, { width: newWidth, height: newHeight });
                                  };
                                  
                                  const handleMouseUp = () => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                  };
                                  
                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }}
                              />
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p className="font-hand">Start creating your sticker!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1">
                  {selectedElementData ? (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3 font-sketch">Properties</h3>
                      
                      <div className="space-y-4">
                        {/* Position */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-400">X</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.x)}
                                onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Y</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.y)}
                                onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-400">Width</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.width)}
                                onChange={(e) => updateElement(selectedElementData.id, { width: Math.max(20, parseInt(e.target.value) || 20) })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Height</label>
                              <input
                                type="number"
                                value={Math.round(selectedElementData.height)}
                                onChange={(e) => updateElement(selectedElementData.id, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Text Properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Text</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Font Size</label>
                              <input
                                type="range"
                                min="12"
                                max="72"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                              <div className="text-xs text-gray-400 text-center">{selectedElementData.style?.fontSize || 24}px</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#ffffff'}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-10 bg-dark-light rounded border border-gray-700"
                              />
                            </div>
                          </>
                        )}

                        {/* Transform */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">Transform</label>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-400">Rotation</label>
                              <input
                                type="range"
                                min="-180"
                                max="180"
                                value={selectedElementData.rotation}
                                onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <div className="text-xs text-gray-400 text-center">{selectedElementData.rotation}°</div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                                className={`flex-1 p-2 rounded text-sm font-hand transition-colors ${
                                  selectedElementData.flipX 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                Flip X
                              </button>
                              <button
                                onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                                className={`flex-1 p-2 rounded text-sm font-hand transition-colors ${
                                  selectedElementData.flipY 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                Flip Y
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">👆</div>
                        <p className="font-hand">Click an element to edit its properties</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Stickers Tab */}
            {activeTab === 'mystickers' && (
              <motion.div
                key="mystickers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {getUserStickers().map((sticker) => (
                    <div key={sticker.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-1">{sticker.name}</h4>
                      <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                    </div>
                  ))}
                  
                  {getUserStickers().length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">🎨</div>
                      <p className="font-hand">No stickers created yet. Start creating!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Packs Tab */}
            {activeTab === 'mypacks' && (
              <motion.div
                key="mypacks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-4">
                  <button
                    onClick={() => setShowCreatePackModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg hover:from-secondary/90 hover:to-blue-500/90 transition-all"
                  >
                    <Plus size={16} />
                    <span className="font-hand">Create New Pack</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getOwnedPacks().map((pack) => (
                    <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pack.category === 'custom' ? 'bg-primary/20 text-primary' :
                          pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                          pack.category === 'cursed' ? 'bg-red-500/20 text-red-400' :
                          pack.category === 'roast' ? 'bg-orange/20 text-orange' :
                          'bg-purple/20 text-purple'
                        }`}>
                          {pack.category}
                        </span>
                        
                        <div className="flex items-center space-x-1 text-accent">
                          <Crown size={14} />
                          <span className="text-sm font-bold">Owned</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getOwnedPacks().length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="font-hand">No packs created yet. Create your first pack!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Explore Packs Tab */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search packs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none font-hand"
                    />
                  </div>
                  
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                    className="px-4 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none font-hand"
                  >
                    <option value="all">All Categories</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getExplorePacks().map((pack) => (
                    <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                          <Package size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                          pack.category === 'cursed' ? 'bg-red-500/20 text-red-400' :
                          pack.category === 'roast' ? 'bg-orange/20 text-orange' :
                          'bg-purple/20 text-purple'
                        }`}>
                          {pack.category}
                        </span>
                        
                        <div className="flex items-center space-x-1 text-accent">
                          <Crown size={14} />
                          <span className="text-sm font-bold">{pack.price} CP</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handlePurchasePack(pack.id)}
                        disabled={!currentUser || currentUser.clownPoints < pack.price}
                        className="w-full flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-accent to-yellow-500 text-dark rounded-lg hover:from-accent/90 hover:to-yellow-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-hand font-bold"
                      >
                        <ShoppingCart size={16} />
                        <span>Add to My Stickers</span>
                      </button>
                    </div>
                  ))}
                  
                  {getExplorePacks().length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">🛒</div>
                      <p className="font-hand">
                        {searchTerm || filterCategory !== 'all' 
                          ? 'No packs match your search criteria'
                          : 'No packs available for purchase'
                        }
                      </p>
                    </div>
                  )}
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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">Save Sticker</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                    placeholder="Enter sticker name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Save to Pack
                  </label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-pack"
                        name="pack-option"
                        checked={!createNewPack}
                        onChange={() => setCreateNewPack(false)}
                        className="text-primary"
                      />
                      <label htmlFor="existing-pack" className="text-white font-hand">Existing Pack</label>
                    </div>
                    
                    {!createNewPack && (
                      <select
                        value={selectedPackId}
                        onChange={(e) => setSelectedPackId(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                      >
                        {getOwnedPacks().map((pack) => (
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
                        className="text-primary"
                      />
                      <label htmlFor="new-pack" className="text-white font-hand">Create New Pack</label>
                    </div>
                    
                    {createNewPack && (
                      <input
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                        placeholder="New pack name..."
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors font-hand"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSticker}
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-semibold hover:from-primary/90 hover:to-purple/90 transition-all font-hand"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Pack Modal */}
      <AnimatePresence>
        {showCreatePackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreatePackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4 font-sketch">Create Sticker Pack</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Pack Name
                  </label>
                  <input
                    type="text"
                    value={packName}
                    onChange={(e) => setPackName(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                    placeholder="Enter pack name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Description
                  </label>
                  <textarea
                    value={packDescription}
                    onChange={(e) => setPackDescription(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-20 resize-none font-hand"
                    placeholder="Describe your pack..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Category
                  </label>
                  <select
                    value={packCategory}
                    onChange={(e) => setPackCategory(e.target.value as any)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                  >
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePackModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors font-hand"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePack}
                  className="flex-1 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all font-hand"
                >
                  Create Pack
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};