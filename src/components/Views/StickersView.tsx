import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Download, 
  Undo, 
  Redo, 
  Trash2, 
  Move, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Filter,
  ShoppingCart,
  Package,
  Star,
  Crown,
  Lock,
  Unlock
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
  
  // Main view state
  const [activeTab, setActiveTab] = useState<'create' | 'packs' | 'shop'>('create');
  
  // Creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [history, setHistory] = useState<StickerElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Layer management state
  const [layerFilter, setLayerFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  
  // Pack selection state
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [showNewPackInput, setShowNewPackInput] = useState(false);
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Available emojis (removed shapes)
  const emojis = [
    '😀', '😂', '🤣', '😊', '😍', '🤔', '😎', '🤯', '😈', '🤡',
    '👻', '💀', '🔥', '💯', '⚡', '✨', '🌟', '💎', '🚀', '🎉',
    '🎊', '🎈', '🎁', '🏆', '👑', '💖', '💕', '💔', '❤️', '🧡'
  ];

  // Get maximum layer number
  const getMaxLayer = () => {
    if (elements.length === 0) return 1;
    return Math.max(...elements.map(el => el.layer));
  };

  // Get minimum layer number
  const getMinLayer = () => {
    if (elements.length === 0) return 1;
    return Math.min(...elements.map(el => el.layer));
  };

  // Validate and constrain layer number
  const constrainLayer = (layer: number) => {
    const min = getMinLayer();
    const max = getMaxLayer();
    return Math.max(min, Math.min(max, layer));
  };

  // Add element to history
  const addToHistory = (newElements: StickerElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  // Add text element
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      style: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      }
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
    toast.success('Text added! 📝');
  };

  // Add emoji element
  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      width: 40,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
    toast.success(`${emoji} added!`);
  };

  // Add image element
  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newElement: StickerElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            content: file.name,
            x: 50,
            y: 50,
            width: 80,
            height: 80,
            rotation: 0,
            flipX: false,
            flipY: false,
            layer: getMaxLayer() + 1,
            imageData: event.target?.result as string
          };
          
          const newElements = [...elements, newElement];
          setElements(newElements);
          addToHistory(newElements);
          setSelectedElement(newElement.id);
          toast.success('Image added! 🖼️');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Update element
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  // Delete element
  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Layer management functions with proper constraints
  const moveElementLayer = (id: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const currentLayer = element.layer;
    const newLayer = direction === 'up' ? currentLayer + 1 : currentLayer - 1;
    const constrainedLayer = constrainLayer(newLayer);
    
    // Only update if the layer actually changes
    if (constrainedLayer !== currentLayer) {
      updateElement(id, { layer: constrainedLayer });
    }
  };

  const setElementLayer = (id: string, layer: number) => {
    const constrainedLayer = constrainLayer(layer);
    updateElement(id, { layer: constrainedLayer });
  };

  const moveElementToTop = (id: string) => {
    updateElement(id, { layer: getMaxLayer() });
  };

  const moveElementToBottom = (id: string) => {
    updateElement(id, { layer: getMinLayer() });
  };

  // Toggle element visibility
  const toggleElementVisibility = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { hidden: !element.hidden });
    }
  };

  // Get filtered elements for layer panel
  const getFilteredElements = () => {
    let filtered = [...elements];
    
    if (layerFilter === 'visible') {
      filtered = filtered.filter(el => !el.hidden);
    } else if (layerFilter === 'hidden') {
      filtered = filtered.filter(el => el.hidden);
    }
    
    return filtered.sort((a, b) => b.layer - a.layer);
  };

  // Save sticker
  const saveSticker = () => {
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    // Create sticker
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: stickerName,
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RpY2tlcjwvdGV4dD48L3N2Zz4=',
      tags: ['custom'],
      createdBy: currentUser?.id || 'user-1',
      usageCount: 0,
      elementData: elements
    };

    // Handle pack selection
    if (selectedPackId === 'new' && newPackName.trim()) {
      // Create new pack
      const newPack = {
        id: `pack-${Date.now()}`,
        name: newPackName,
        description: 'Custom sticker pack',
        stickers: [],
        category: 'custom' as const,
        count: 0,
        owned: true,
        price: 0,
        createdBy: currentUser?.id || 'user-1',
        createdAt: new Date()
      };
      
      addStickerToPack(newSticker, newPack.id);
      updateStickerPack(newPack.id, newPack);
      toast.success(`Sticker saved to new pack "${newPackName}"! 🎨`);
    } else {
      // Add to existing pack
      addStickerToPack(newSticker, selectedPackId);
      toast.success('Sticker saved! 🎨');
    }

    updateUserPoints(10);
    
    // Reset form
    setStickerName('');
    setElements([]);
    setSelectedElement(null);
    setHistory([]);
    setHistoryIndex(-1);
    setShowCreateModal(false);
    setNewPackName('');
    setShowNewPackInput(false);
    setSelectedPackId('pack-default');
  };

  // Mouse event handlers for drag and resize
  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(elementId);
    
    if (action === 'drag') {
      setIsDragging(true);
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setDragOffset({
          x: e.clientX - element.x,
          y: e.clientY - element.y
        });
      }
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || '');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElement) return;

    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    if (isDragging) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const newX = e.clientX - canvasRect.left - dragOffset.x;
        const newY = e.clientY - canvasRect.top - dragOffset.y;
        
        updateElement(selectedElement, {
          x: Math.max(0, Math.min(300 - element.width, newX)),
          y: Math.max(0, Math.min(300 - element.height, newY))
        });
      }
    } else if (isResizing && resizeHandle) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
        
        let newWidth = element.width;
        let newHeight = element.height;
        let newX = element.x;
        let newY = element.y;

        // Handle different resize directions
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(20, mouseX - element.x);
        }
        if (resizeHandle.includes('left')) {
          newWidth = Math.max(20, element.width + (element.x - mouseX));
          newX = Math.min(element.x, mouseX);
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(20, mouseY - element.y);
        }
        if (resizeHandle.includes('top')) {
          newHeight = Math.max(20, element.height + (element.y - mouseY));
          newY = Math.min(element.y, mouseY);
        }

        updateElement(selectedElement, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Render element on canvas
  const renderElement = (element: StickerElement) => {
    const isSelected = selectedElement === element.id;
    const style = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
      zIndex: element.layer,
      opacity: element.hidden ? 0.3 : 1,
      cursor: 'move',
      border: isSelected ? '2px solid #FF6B9D' : '1px solid transparent',
      borderRadius: '4px'
    };

    const content = (() => {
      switch (element.type) {
        case 'text':
          return (
            <div
              style={{
                ...element.style,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none'
              }}
            >
              {element.content}
            </div>
          );
        case 'emoji':
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.min(element.width, element.height) * 0.8,
                userSelect: 'none'
              }}
            >
              {element.content}
            </div>
          );
        case 'image':
          return element.imageData ? (
            <img
              src={element.imageData}
              alt={element.content}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#ccc' }} />
          );
        default:
          return null;
      }
    })();

    return (
      <div
        key={element.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement(element.id);
        }}
      >
        {content}
        
        {/* Resize handles */}
        {isSelected && (
          <>
            {/* Corner handles */}
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize"
              style={{ top: -6, left: -6 }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'top-left')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize"
              style={{ top: -6, right: -6 }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'top-right')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize"
              style={{ bottom: -6, left: -6 }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'bottom-left')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize"
              style={{ bottom: -6, right: -6 }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'bottom-right')}
            />
            
            {/* Edge handles */}
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-n-resize"
              style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'top')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-s-resize"
              style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'bottom')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-w-resize"
              style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'left')}
            />
            <div
              className="absolute w-3 h-3 bg-primary border border-white rounded-full cursor-e-resize"
              style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'right')}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖼️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-md mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-4">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'packs', label: 'My Packs', icon: Package },
              { id: 'shop', label: 'Shop', icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
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
            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-2xl p-6 shadow-glow relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Plus size={24} />
                    <span className="text-lg font-bold">Create New Sticker</span>
                    <span className="text-2xl">🎨</span>
                  </div>
                </motion.button>

                {/* Recent Stickers */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3">Recent Creations</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {stickers.slice(-6).map((sticker) => (
                      <div
                        key={sticker.id}
                        className="bg-dark-light rounded-lg p-3 text-center hover:bg-gray-700 transition-colors"
                      >
                        <div className="text-2xl mb-1">🎨</div>
                        <p className="text-white text-xs font-semibold truncate">{sticker.name}</p>
                        <p className="text-gray-400 text-xs">Used {sticker.usageCount}x</p>
                      </div>
                    ))}
                    
                    {stickers.length === 0 && (
                      <div className="col-span-3 text-center py-4 text-gray-400">
                        <p className="text-sm">No stickers created yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* My Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {stickerPacks.filter(pack => pack.owned).map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📦</div>
                        <div>
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold">{pack.count}</div>
                        <div className="text-gray-400 text-xs">stickers</div>
                      </div>
                    </div>
                    
                    {/* Sticker Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {pack.stickers.slice(0, 8).map((sticker) => (
                        <div
                          key={sticker.id}
                          className="bg-dark-light rounded-lg p-2 text-center hover:bg-gray-700 transition-colors"
                        >
                          <div className="text-lg mb-1">🎨</div>
                          <p className="text-white text-xs truncate">{sticker.name}</p>
                        </div>
                      ))}
                      
                      {pack.stickers.length > 8 && (
                        <div className="bg-dark-light rounded-lg p-2 text-center flex items-center justify-center">
                          <span className="text-gray-400 text-xs">+{pack.stickers.length - 8}</span>
                        </div>
                      )}
                      
                      {pack.stickers.length === 0 && (
                        <div className="col-span-4 text-center py-4 text-gray-400">
                          <p className="text-sm">No stickers in this pack</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {stickerPacks.filter(pack => pack.owned).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No sticker packs owned yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Shop Tab */}
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {stickerPacks.filter(pack => !pack.owned).map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {pack.category === 'roast' && '🔥'}
                          {pack.category === 'wholesome' && '💖'}
                          {pack.category === 'meme' && '😂'}
                          {pack.category === 'cursed' && '💀'}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-accent">
                          <Crown size={16} />
                          <span className="font-bold">{pack.price}</span>
                        </div>
                        <div className="text-gray-400 text-xs">{pack.count} stickers</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (currentUser && currentUser.clownPoints >= pack.price) {
                          purchaseStickerPack(pack.id, currentUser.id);
                          toast.success(`${pack.name} purchased! 🎉`);
                        } else {
                          toast.error('Not enough ClownPoints! 💸');
                        }
                      }}
                      disabled={!currentUser || currentUser.clownPoints < pack.price}
                      className="w-full bg-gradient-to-r from-accent to-yellow-500 text-dark rounded-lg py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentUser && currentUser.clownPoints >= pack.price ? 'Purchase' : 'Insufficient CP'}
                    </button>
                  </div>
                ))}
                
                {stickerPacks.filter(pack => !pack.owned).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                    <p>All packs owned! 🎉</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Sticker Modal */}
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
              className="bg-dark-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full">
                {/* Left Panel - Tools */}
                <div className="w-80 bg-dark-light p-4 overflow-y-auto">
                  <h2 className="text-xl font-bold text-white mb-4">Sticker Creator</h2>
                  
                  {/* Tools */}
                  <div className="space-y-4">
                    {/* Add Elements */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">Add Elements</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={addTextElement}
                          className="flex items-center space-x-2 p-2 bg-dark-card rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Type size={16} className="text-primary" />
                          <span className="text-white text-sm">Text</span>
                        </button>
                        <button
                          onClick={addImageElement}
                          className="flex items-center space-x-2 p-2 bg-dark-card rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Image size={16} className="text-secondary" />
                          <span className="text-white text-sm">Image</span>
                        </button>
                      </div>
                    </div>

                    {/* Emojis */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">Emojis</h3>
                      <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addEmojiElement(emoji)}
                            className="p-2 text-xl hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layer Management */}
                    {elements.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">Layers</h3>
                          <select
                            value={layerFilter}
                            onChange={(e) => setLayerFilter(e.target.value as any)}
                            className="bg-dark-card text-white text-xs rounded px-2 py-1 border border-gray-700"
                          >
                            <option value="all">All</option>
                            <option value="visible">Visible</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {getFilteredElements().map((element) => (
                            <div
                              key={element.id}
                              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedElement === element.id
                                  ? 'bg-primary/20 border border-primary'
                                  : 'bg-dark-card hover:bg-gray-700'
                              }`}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              {/* Element Icon */}
                              <div className="text-sm">
                                {element.type === 'text' && '📝'}
                                {element.type === 'image' && '🖼️'}
                                {element.type === 'emoji' && element.content}
                              </div>
                              
                              {/* Element Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-xs font-medium truncate">
                                  {element.type === 'text' ? element.content : 
                                   element.type === 'emoji' ? element.content :
                                   element.content}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Layer {element.layer} • {Math.round(element.width)}×{Math.round(element.height)}
                                </div>
                              </div>
                              
                              {/* Layer Controls */}
                              <div className="flex items-center space-x-1">
                                {/* Visibility Toggle */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleElementVisibility(element.id);
                                  }}
                                  className="p-1 hover:bg-gray-600 rounded"
                                >
                                  {element.hidden ? 
                                    <EyeOff size={12} className="text-gray-400" /> : 
                                    <Eye size={12} className="text-gray-300" />
                                  }
                                </button>
                                
                                {/* Layer Input */}
                                <input
                                  type="number"
                                  value={element.layer}
                                  onChange={(e) => setElementLayer(element.id, parseInt(e.target.value) || 1)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-8 h-6 bg-dark text-white text-xs text-center rounded border border-gray-600 focus:border-primary focus:outline-none"
                                  min={getMinLayer()}
                                  max={getMaxLayer()}
                                />
                                
                                {/* Layer Buttons */}
                                <div className="flex flex-col">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'up');
                                    }}
                                    disabled={element.layer >= getMaxLayer()}
                                    className="p-0.5 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ChevronUp size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'down');
                                    }}
                                    disabled={element.layer <= getMinLayer()}
                                    className="p-0.5 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <ChevronDown size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Element Properties */}
                    {selectedElement && (
                      <div>
                        <h3 className="text-white font-semibold mb-2">Properties</h3>
                        {(() => {
                          const element = elements.find(el => el.id === selectedElement);
                          if (!element) return null;

                          return (
                            <div className="space-y-2">
                              {element.type === 'text' && (
                                <>
                                  <input
                                    type="text"
                                    value={element.content}
                                    onChange={(e) => updateElement(element.id, { content: e.target.value })}
                                    className="w-full bg-dark-card text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                                    placeholder="Text content"
                                  />
                                  <input
                                    type="color"
                                    value={element.style?.color || '#ffffff'}
                                    onChange={(e) => updateElement(element.id, { 
                                      style: { ...element.style, color: e.target.value }
                                    })}
                                    className="w-full h-8 bg-dark-card rounded border border-gray-700"
                                  />
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
                                </>
                              )}
                              
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateElement(element.id, { flipX: !element.flipX })}
                                  className={`flex-1 p-2 rounded text-sm ${element.flipX ? 'bg-primary text-white' : 'bg-dark-card text-gray-300'}`}
                                >
                                  <FlipHorizontal size={16} className="mx-auto" />
                                </button>
                                <button
                                  onClick={() => updateElement(element.id, { flipY: !element.flipY })}
                                  className={`flex-1 p-2 rounded text-sm ${element.flipY ? 'bg-primary text-white' : 'bg-dark-card text-gray-300'}`}
                                >
                                  <FlipVertical size={16} className="mx-auto" />
                                </button>
                                <button
                                  onClick={() => deleteElement(element.id)}
                                  className="flex-1 p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                >
                                  <Trash2 size={16} className="mx-auto" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* History Controls */}
                    <div>
                      <h3 className="text-white font-semibold mb-2">History</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-card rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Undo size={16} />
                          <span className="text-sm">Undo</span>
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-card rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Redo size={16} />
                          <span className="text-sm">Redo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Canvas and Save */}
                <div className="flex-1 flex flex-col">
                  {/* Canvas */}
                  <div className="flex-1 p-4 bg-gray-800">
                    <div className="h-full flex items-center justify-center">
                      <div
                        ref={canvasRef}
                        className="relative bg-white rounded-lg shadow-lg"
                        style={{ width: 300, height: 300 }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={() => setSelectedElement(null)}
                      >
                        {elements.map(renderElement)}
                        
                        {elements.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎨</div>
                              <p className="text-sm">Add elements to start creating</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Save Section */}
                  <div className="p-4 bg-dark-light border-t border-gray-700">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={stickerName}
                        onChange={(e) => setStickerName(e.target.value)}
                        placeholder="Sticker name..."
                        className="w-full bg-dark-card text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Save to Pack
                        </label>
                        <div className="space-y-2">
                          <select
                            value={selectedPackId}
                            onChange={(e) => {
                              setSelectedPackId(e.target.value);
                              if (e.target.value === 'new') {
                                setShowNewPackInput(true);
                              } else {
                                setShowNewPackInput(false);
                              }
                            }}
                            className="w-full bg-dark-card text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                          >
                            {stickerPacks.filter(pack => pack.owned).map((pack) => (
                              <option key={pack.id} value={pack.id}>
                                {pack.name} ({pack.count} stickers)
                              </option>
                            ))}
                            <option value="new">+ Create New Pack</option>
                          </select>
                          
                          {showNewPackInput && (
                            <input
                              type="text"
                              value={newPackName}
                              onChange={(e) => setNewPackName(e.target.value)}
                              placeholder="New pack name..."
                              className="w-full bg-dark-card text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowCreateModal(false)}
                          className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveSticker}
                          disabled={!stickerName.trim() || elements.length === 0 || (selectedPackId === 'new' && !newPackName.trim())}
                          className="flex-1 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Sticker
                        </button>
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