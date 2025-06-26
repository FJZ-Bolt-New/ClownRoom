import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Smile, 
  Save, 
  Trash2, 
  RotateCcw, 
  Move, 
  Palette,
  Search,
  Star,
  Crown,
  ShoppingCart,
  Package,
  Grid,
  Eye,
  Download,
  Share2,
  ChevronUp,
  ChevronDown,
  Layers,
  X
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateUserPoints, 
    stickerPacks, 
    addStickerToPack, 
    updateStickerPack,
    purchaseStickerPack,
    currentUser 
  } = useStore();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'my-stickers' | 'my-packs' | 'explore' | 'create'>('create');
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [currentLayer, setCurrentLayer] = useState(1);
  
  // UI state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [selectedPack, setSelectedPack] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    'Food': ['🍎', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍭', '🍩', '🍪'],
    'Objects': ['⚽', '🎮', '🎸', '🎨', '📱', '💻', '🚗', '✈️', '🚀', '⭐'],
  };

  // Mock marketplace packs
  const marketplacePacks = [
    {
      id: 'pack-roast-masters',
      name: 'Roast Masters',
      description: 'Ultimate roasting collection',
      category: 'roast' as const,
      count: 25,
      price: 500,
      rating: 4.8,
      users: 1234,
      owned: false,
      preview: ['🔥', '💀', '😈', '👹'],
      creator: 'RoastKing'
    },
    {
      id: 'pack-wholesome',
      name: 'Wholesome Vibes',
      description: 'Spread good energy',
      category: 'wholesome' as const,
      count: 30,
      price: 300,
      rating: 4.9,
      users: 2156,
      owned: false,
      preview: ['🌸', '💖', '🌈', '✨'],
      creator: 'WholesomeQueen'
    },
    {
      id: 'pack-meme-lords',
      name: 'Meme Lords',
      description: 'Elite meme collection',
      category: 'meme' as const,
      count: 40,
      price: 750,
      rating: 4.7,
      users: 987,
      owned: true,
      preview: ['🐸', '📈', '💎', '🚀'],
      creator: 'MemeLord42'
    }
  ];

  // Get user's created stickers
  const myStickers = stickers.filter(sticker => sticker.createdBy === currentUser?.id);
  
  // Get user's owned packs
  const myPacks = stickerPacks.filter(pack => pack.owned);

  // Filter functions
  const filteredMyStickers = myStickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMarketplacePacks = marketplacePacks.filter(pack =>
    pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FIXED: Layer navigation with proper bounds checking
  const getMinLayer = () => 1;
  const getMaxLayer = () => Math.max(1, elements.length);
  
  const getCurrentLayerElement = () => {
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    return sortedElements[currentLayer - 1] || null;
  };

  const navigateLayer = (direction: 'up' | 'down') => {
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    
    if (direction === 'up' && currentLayer < maxLayer) {
      const newLayer = currentLayer + 1;
      setCurrentLayer(newLayer);
      const element = getCurrentLayerElementByIndex(newLayer);
      if (element) {
        setSelectedElement(element.id);
      }
    } else if (direction === 'down' && currentLayer > minLayer) {
      const newLayer = currentLayer - 1;
      setCurrentLayer(newLayer);
      const element = getCurrentLayerElementByIndex(newLayer);
      if (element) {
        setSelectedElement(element.id);
      }
    }
  };

  const getCurrentLayerElementByIndex = (layerIndex: number) => {
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    return sortedElements[layerIndex - 1] || null;
  };

  const setLayerDirectly = (layer: number) => {
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    const boundedLayer = Math.max(minLayer, Math.min(maxLayer, layer));
    
    setCurrentLayer(boundedLayer);
    const element = getCurrentLayerElementByIndex(boundedLayer);
    if (element) {
      setSelectedElement(element.id);
    }
  };

  // Add element functions
  const addText = () => {
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
      layer: elements.length + 1,
      style: {
        fontSize: 24,
        color: '#FF6B9D',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
  };

  const addEmoji = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 100,
      y: 100,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const newElement: StickerElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          content: file.name,
          x: 75,
          y: 75,
          width: 100,
          height: 100,
          rotation: 0,
          flipX: false,
          flipY: false,
          layer: elements.length + 1,
          imageData,
        };
        
        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setCurrentLayer(newElement.layer);
      };
      reader.readAsDataURL(file);
    }
  };

  // FIXED: Click handler to show properties panel
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
    
    // Find the element and set current layer
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setCurrentLayer(element.layer);
    }
  };

  // Mouse event handlers for dragging and resizing
  const handleMouseDown = (elementId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const target = event.target as HTMLElement;
    const isResizeHandle = target.classList.contains('resize-handle');
    
    if (isResizeHandle) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || '');
      setSelectedElement(elementId);
    } else {
      setDraggedElement(elementId);
      setSelectedElement(elementId);
      
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setCurrentLayer(element.layer);
        const rect = event.currentTarget.getBoundingClientRect();
        setDragOffset({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (draggedElement && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = event.clientX - canvasRect.left - dragOffset.x;
      const newY = event.clientY - canvasRect.top - dragOffset.y;
      
      setElements(prev => prev.map(el => 
        el.id === draggedElement 
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      ));
    }
    
    if (isResizing && selectedElement && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      
      setElements(prev => prev.map(el => {
        if (el.id === selectedElement) {
          const newEl = { ...el };
          
          switch (resizeHandle) {
            case 'se':
              newEl.width = Math.max(20, mouseX - el.x);
              newEl.height = Math.max(20, mouseY - el.y);
              break;
            case 'sw':
              const newWidth = Math.max(20, el.x + el.width - mouseX);
              newEl.x = el.x + el.width - newWidth;
              newEl.width = newWidth;
              newEl.height = Math.max(20, mouseY - el.y);
              break;
            case 'ne':
              newEl.width = Math.max(20, mouseX - el.x);
              const newHeight = Math.max(20, el.y + el.height - mouseY);
              newEl.y = el.y + el.height - newHeight;
              newEl.height = newHeight;
              break;
            case 'nw':
              const newW = Math.max(20, el.x + el.width - mouseX);
              const newH = Math.max(20, el.y + el.height - mouseY);
              newEl.x = el.x + el.width - newW;
              newEl.y = el.y + el.height - newH;
              newEl.width = newW;
              newEl.height = newH;
              break;
          }
          
          return newEl;
        }
        return el;
      }));
    }
  }, [draggedElement, dragOffset, isResizing, selectedElement, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  useEffect(() => {
    if (draggedElement || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedElement, isResizing, handleMouseMove, handleMouseUp]);

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<StickerElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (elementId: string) => {
    setElements(prev => {
      const filtered = prev.filter(el => el.id !== elementId);
      // Reassign layers to maintain continuity
      return filtered.map((el, index) => ({ ...el, layer: index + 1 }));
    });
    setSelectedElement(null);
    setCurrentLayer(1);
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
  };

  // FIXED: Save sticker with proper feedback and canvas preservation
  const handleSaveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    // Create the sticker
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: stickerName.trim(),
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+OqDwvdGV4dD48L3N2Zz4=',
      tags: ['custom', 'handmade'],
      createdBy: currentUser?.id || 'user-1',
      usageCount: 0,
      elementData: elements,
    };

    // Handle pack selection
    if (createNewPack && newPackName.trim()) {
      // Create new pack
      const newPack = {
        id: `pack-${Date.now()}`,
        name: newPackName.trim(),
        description: `Custom pack created by ${currentUser?.username}`,
        stickers: [newSticker],
        category: 'custom' as const,
        count: 1,
        owned: true,
        price: 0,
        createdBy: currentUser?.id || 'user-1',
        createdAt: new Date(),
      };
      
      updateStickerPack(newPack.id, newPack);
      addStickerToPack(newSticker, newPack.id);
    } else {
      // Add to existing pack
      addStickerToPack(newSticker, selectedPack);
    }

    // Add sticker to global collection
    addSticker(newSticker);
    updateUserPoints(10);

    // FIXED: Show success message and keep canvas intact
    toast.success(`✨ Sticker "${stickerName}" saved successfully! (+10 CP)`, {
      duration: 4000,
      icon: '🎨',
    });

    // Close modal and reset form (but keep canvas)
    setShowSaveModal(false);
    setStickerName('');
    setNewPackName('');
    setCreateNewPack(false);
    setSelectedPack('pack-default');
  };

  const purchasePack = (packId: string, price: number) => {
    if (!currentUser) return;
    
    if (currentUser.clownPoints < price) {
      toast.error(`Not enough ClownPoints! You need ${price} CP but only have ${currentUser.clownPoints} CP 💰`);
      return;
    }
    
    purchaseStickerPack(packId, currentUser.id);
    updateUserPoints(-price);
    toast.success(`Pack purchased! 🛍️ (-${price} CP)`);
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🌟</div>
        
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
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
              { id: 'my-packs', label: 'My Packs', icon: Package },
              { id: 'explore', label: 'Explore Packs', icon: Eye },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
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
                        onClick={addText}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white font-hand">Add Text</span>
                      </button>
                      
                      <button
                        onClick={addImage}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Image size={20} className="text-secondary" />
                        <span className="text-white font-hand">Add Image</span>
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
                          <div className="grid grid-cols-5 gap-2">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
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

                  {/* Actions */}
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
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <RotateCcw size={16} />
                        <span className="font-hand">Clear Canvas</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">Sticker Canvas</h3>
                    
                    <div
                      ref={canvasRef}
                      className="relative w-full h-96 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
                      onClick={() => setSelectedElement(null)}
                    >
                      {elements.map((element) => (
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
                            zIndex: element.layer,
                          }}
                          onMouseDown={(e) => handleMouseDown(element.id, e)}
                          onClick={(e) => handleElementClick(element.id, e)}
                        >
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{
                                fontSize: element.style?.fontSize || 24,
                                color: element.style?.color || '#000',
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
                              <div className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize" data-handle="nw" />
                              <div className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize" data-handle="ne" />
                              <div className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize" data-handle="sw" />
                              <div className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize" data-handle="se" />
                            </>
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
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
                <div className="lg:col-span-1 space-y-4">
                  {/* Layer Navigation - FIXED */}
                  {elements.length > 0 && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h3 className="text-white font-bold mb-3 font-sketch flex items-center space-x-2">
                        <Layers size={16} />
                        <span>Layers</span>
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigateLayer('down')}
                            disabled={currentLayer <= getMinLayer()}
                            className="p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={16} className="text-white" />
                          </button>
                          
                          <input
                            type="number"
                            value={currentLayer}
                            onChange={(e) => setLayerDirectly(parseInt(e.target.value) || 1)}
                            min={getMinLayer()}
                            max={getMaxLayer()}
                            className="flex-1 bg-dark-light text-white rounded px-2 py-1 text-center border border-gray-700 focus:border-primary focus:outline-none"
                          />
                          
                          <button
                            onClick={() => navigateLayer('up')}
                            disabled={currentLayer >= getMaxLayer()}
                            className="p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={16} className="text-white" />
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-400 text-center font-hand">
                          Layer {currentLayer} of {getMaxLayer()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Element Properties - FIXED: Shows on click */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold font-sketch">Properties</h3>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Position */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-hand">Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              placeholder="Y"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-hand">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: Math.max(20, parseInt(e.target.value) || 20) })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              placeholder="W"
                              min="20"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: Math.max(20, parseInt(e.target.value) || 20) })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              placeholder="H"
                              min="20"
                            />
                          </div>
                        </div>

                        {/* Text Properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1 font-hand">Text</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1 font-hand">Font Size</label>
                              <input
                                type="number"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 24 }
                                })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                                min="8"
                                max="72"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1 font-hand">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FF6B9D'}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 bg-dark-light rounded border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </>
                        )}

                        {/* Rotation */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-hand">Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 text-center font-hand">
                            {selectedElementData.rotation}°
                          </div>
                        </div>

                        {/* Flip */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1 font-hand">Flip</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                              className={`flex-1 py-1 px-2 rounded text-xs transition-colors ${
                                selectedElementData.flipX 
                                  ? 'bg-primary text-white' 
                                  : 'bg-dark-light text-gray-400 hover:text-white'
                              }`}
                            >
                              Flip X
                            </button>
                            <button
                              onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                              className={`flex-1 py-1 px-2 rounded text-xs transition-colors ${
                                selectedElementData.flipY 
                                  ? 'bg-primary text-white' 
                                  : 'bg-dark-light text-gray-400 hover:text-white'
                              }`}
                            >
                              Flip Y
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Stickers Tab */}
            {activeTab === 'my-stickers' && (
              <motion.div
                key="my-stickers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your stickers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredMyStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800 hover:border-primary transition-colors"
                    >
                      <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center text-4xl">
                        🎨
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1 truncate">{sticker.name}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{sticker.usageCount} uses</span>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:text-white transition-colors">
                            <Download size={12} />
                          </button>
                          <button className="p-1 hover:text-white transition-colors">
                            <Share2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMyStickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-lg font-hand">
                      {searchTerm ? 'No stickers found' : 'No stickers created yet'}
                    </p>
                    <p className="text-sm mt-2">
                      {searchTerm ? 'Try a different search term' : 'Start creating your first sticker!'}
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
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-white font-bold flex-1">{pack.name}</h3>
                        {pack.createdBy === currentUser?.id && (
                          <Crown size={16} className="text-accent" />
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{pack.count} stickers</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pack.category === 'custom' ? 'bg-primary/20 text-primary' :
                          pack.category === 'roast' ? 'bg-orange/20 text-orange' :
                          pack.category === 'wholesome' ? 'bg-secondary/20 text-secondary' :
                          'bg-purple/20 text-purple'
                        }`}>
                          {pack.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {myPacks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-hand">No sticker packs yet</p>
                    <p className="text-sm mt-2">Create stickers and organize them into packs!</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Explore Packs Tab */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sticker packs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Marketplace Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMarketplacePacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{pack.name}</h3>
                        <div className="flex items-center space-x-1 text-accent">
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm">{pack.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                      
                      {/* Preview */}
                      <div className="flex space-x-2 mb-3">
                        {pack.preview.map((emoji, index) => (
                          <div key={index} className="w-8 h-8 bg-white rounded flex items-center justify-center text-lg">
                            {emoji}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">{pack.count} stickers</span>
                        <span className="text-gray-400 text-sm">{pack.users.toLocaleString()} users</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">by {pack.creator}</span>
                        {pack.owned ? (
                          <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm">
                            Owned
                          </span>
                        ) : (
                          <button
                            onClick={() => purchasePack(pack.id, pack.price)}
                            className="flex items-center space-x-1 px-3 py-1 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition-colors"
                          >
                            <ShoppingCart size={12} />
                            <span>{pack.price} CP</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMarketplacePacks.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-lg font-hand">No packs found</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                  </div>
                )}
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
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    placeholder="Enter sticker name..."
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                      <label htmlFor="existing-pack" className="text-white">
                        Existing Pack
                      </label>
                    </div>
                    
                    {!createNewPack && (
                      <select
                        value={selectedPack}
                        onChange={(e) => setSelectedPack(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
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
                        className="text-primary"
                      />
                      <label htmlFor="new-pack" className="text-white">
                        Create New Pack
                      </label>
                    </div>
                    
                    {createNewPack && (
                      <input
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                        placeholder="New pack name..."
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
                  disabled={!stickerName.trim() || (createNewPack && !newPackName.trim())}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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