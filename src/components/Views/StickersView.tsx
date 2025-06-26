import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  Download, 
  Share2, 
  Palette, 
  Move, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Layers, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Save,
  Eye,
  Edit3,
  Grid,
  Package,
  ShoppingBag,
  Star,
  Crown,
  Zap,
  Heart,
  Coffee,
  Music,
  Camera,
  Gamepad2,
  Sparkles,
  Filter,
  Search,
  X,
  Check,
  AlertCircle
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
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'my-packs' | 'explore'>('create');
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Sticker creation state
  const [stickerName, setStickerName] = useState('');
  const [stickerTags, setStickerTags] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Preview state
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Marketplace state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Available emojis
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Hands': ['👍', '👎', '👏', '🙌', '🤝', '✋', '👋', '🤘', '✌️', '🤞'],
    'Hearts': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤'],
    'Objects': ['🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'],
  };
  
  // Available fonts
  const fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Times', value: 'Times New Roman, serif' },
    { name: 'Courier', value: 'Courier New, monospace' },
    { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
    { name: 'Impact', value: 'Impact, sans-serif' },
  ];
  
  // Predefined colors
  const colors = [
    '#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#9B59B6',
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#E67E22',
    '#1ABC9C', '#9B59B6', '#34495E', '#95A5A6', '#000000', '#FFFFFF'
  ];
  
  // Tag suggestions
  const tagSuggestions = [
    'funny', 'cute', 'cool', 'epic', 'meme', 'reaction', 'mood', 'vibe',
    'chaos', 'wholesome', 'cursed', 'blessed', 'fire', 'ice', 'love', 'hate'
  ];

  // Mock marketplace packs
  const marketplacePacks = [
    {
      id: 'pack-roast-masters',
      name: 'Roast Masters',
      description: 'Ultimate roasting stickers',
      category: 'roast',
      price: 500,
      owned: false,
      creator: 'RoastKing',
      rating: 4.8,
      downloads: 1234,
      preview: ['🔥', '💀', '😈'],
      stickers: []
    },
    {
      id: 'pack-wholesome-vibes',
      name: 'Wholesome Vibes',
      description: 'Spread good energy',
      category: 'wholesome',
      price: 300,
      owned: false,
      creator: 'GoodVibesOnly',
      rating: 4.9,
      downloads: 2156,
      preview: ['💕', '🌟', '😊'],
      stickers: []
    },
    {
      id: 'pack-chaos-energy',
      name: 'Chaos Energy',
      description: 'Pure chaotic stickers',
      category: 'cursed',
      price: 750,
      owned: false,
      creator: 'ChaosQueen',
      rating: 4.7,
      downloads: 987,
      preview: ['🤡', '💥', '⚡'],
      stickers: []
    }
  ];

  // Get maximum layer number
  const getMaxLayer = () => {
    return elements.length > 0 ? Math.max(...elements.map(el => el.layer)) : 0;
  };

  // Get elements on current layer
  const getCurrentLayerElements = () => {
    return elements.filter(el => el.layer === currentLayer);
  };

  // Navigate layers safely
  const navigateLayer = (direction: 'up' | 'down') => {
    const maxLayer = getMaxLayer();
    if (maxLayer === 0) return; // No elements
    
    if (direction === 'up' && currentLayer < maxLayer) {
      setCurrentLayer(currentLayer + 1);
    } else if (direction === 'down' && currentLayer > 1) {
      setCurrentLayer(currentLayer - 1);
    }
    
    // Clear selection when changing layers
    setSelectedElement(null);
  };

  // Add text element
  const addText = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Your Text',
      x: 150,
      y: 150,
      width: 120,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      style: {
        fontSize: 24,
        color: '#000000',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success('Text added! ✏️');
  };

  // Add emoji element
  const addEmoji = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 150,
      y: 150,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      style: {
        fontSize: 48,
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success(`${emoji} added!`);
  };

  // Add image element
  const addImage = (imageData: string) => {
    const newElement: StickerElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: '',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      imageData,
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success('Image added! 📸');
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file! 🖼️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      addImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  // Handle mouse down for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedElement(elementId);
    setCurrentLayer(element.layer);
    
    if (action === 'drag') {
      setDraggedElement(elementId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else if (action === 'resize' && handle) {
      setIsResizing(elementId);
      setResizeHandle(handle);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
    }
  };

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedElement) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;
      
      updateElement(draggedElement, {
        x: Math.max(0, Math.min(newX, 400 - 50)),
        y: Math.max(0, Math.min(newY, 400 - 50)),
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      
      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case 'se': // Southeast (bottom-right)
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'sw': // Southwest (bottom-left)
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height + deltaY);
          break;
        case 'ne': // Northeast (top-right)
          newWidth = Math.max(20, resizeStart.width + deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          break;
        case 'nw': // Northwest (top-left)
          newWidth = Math.max(20, resizeStart.width - deltaX);
          newHeight = Math.max(20, resizeStart.height - deltaY);
          break;
      }
      
      // For text and emoji, maintain aspect ratio
      const element = elements.find(el => el.id === isResizing);
      if (element && (element.type === 'emoji' || element.type === 'text')) {
        const aspectRatio = resizeStart.width / resizeStart.height;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }
      
      updateElement(isResizing, {
        width: newWidth,
        height: newHeight,
      });
      
      // Update font size for text elements
      if (element?.type === 'text') {
        const scaleFactor = newWidth / resizeStart.width;
        const newFontSize = Math.max(8, Math.min(72, (element.style?.fontSize || 24) * scaleFactor));
        updateElement(isResizing, {
          style: { ...element.style, fontSize: newFontSize }
        });
      }
      
      // Update font size for emoji elements
      if (element?.type === 'emoji') {
        const scaleFactor = Math.min(newWidth / resizeStart.width, newHeight / resizeStart.height);
        const newFontSize = Math.max(16, Math.min(120, (element.style?.fontSize || 48) * scaleFactor));
        updateElement(isResizing, {
          style: { ...element.style, fontSize: newFontSize }
        });
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggedElement(null);
    setIsResizing(null);
    setResizeHandle(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // Save sticker
  const saveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }
    
    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }
    
    // Generate sticker preview (simplified)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Sort elements by layer for proper rendering
      const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
      
      // Simple preview generation (you might want to enhance this)
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, 400, 400);
      
      // For now, just use the first emoji or a default icon
      const firstEmoji = sortedElements.find(el => el.type === 'emoji');
      const previewContent = firstEmoji ? firstEmoji.content : '🎨';
      
      const imageUrl = canvas.toDataURL('image/png');
      
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName,
        imageUrl,
        tags: stickerTags,
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        packId: 'pack-default',
        elementData: elements, // Store element data for editing
      };
      
      addSticker(newSticker);
      addStickerToPack(newSticker, 'pack-default');
      updateUserPoints(10);
      
      // Don't clear the canvas - keep it intact
      setStickerName('');
      setStickerTags([]);
      setShowSaveModal(false);
      
      toast.success(`Sticker "${stickerName}" saved! 🎉 (+10 CP)`);
    }
  };

  // Load sticker for editing
  const loadStickerForEdit = (sticker: Sticker) => {
    if (sticker.elementData) {
      setElements(sticker.elementData);
      setSelectedElement(null);
      setCurrentLayer(1);
      setStickerName(sticker.name);
      setStickerTags(sticker.tags);
      setActiveTab('create');
      toast.success(`Loaded "${sticker.name}" for editing! ✏️`);
    } else {
      toast.error('This sticker cannot be edited! 😅');
    }
  };

  // Download sticker
  const downloadSticker = (sticker: Sticker) => {
    try {
      const link = document.createElement('a');
      link.href = sticker.imageUrl;
      link.download = `${sticker.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded "${sticker.name}"! 💾`);
    } catch (error) {
      toast.error('Download failed! 😞');
    }
  };

  // Share sticker
  const shareSticker = async (sticker: Sticker) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out my sticker: ${sticker.name}`,
          text: `I created this awesome sticker "${sticker.name}" in ClownRoom! 🎨`,
          url: window.location.href,
        });
        toast.success('Sticker shared! 📤');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `Check out my sticker "${sticker.name}" created in ClownRoom! 🎨 ${window.location.href}`
        );
        toast.success('Share link copied to clipboard! 📋');
      }
    } catch (error) {
      toast.error('Sharing failed! 😞');
    }
  };

  // Preview sticker
  const previewStickerModal = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreviewModal(true);
  };

  // Purchase sticker pack
  const purchasePack = (packId: string) => {
    const pack = marketplacePacks.find(p => p.id === packId);
    if (!pack || !currentUser) return;
    
    if (currentUser.clownPoints < pack.price) {
      toast.error(`Not enough ClownPoints! Need ${pack.price} CP 💰`);
      return;
    }
    
    purchaseStickerPack(packId, currentUser.id);
    toast.success(`Purchased "${pack.name}"! 🛒 (-${pack.price} CP)`);
  };

  // Filter marketplace packs
  const filteredPacks = marketplacePacks.filter(pack => {
    const matchesSearch = pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    return matchesSearch && matchesCategory && !pack.owned;
  });

  // Get user's stickers
  const userStickers = stickers.filter(sticker => sticker.createdBy === currentUser?.id);

  // Render resize handles
  const renderResizeHandles = (element: StickerElement) => {
    if (selectedElement !== element.id) return null;
    
    const handleSize = 8;
    const handles = [
      { position: 'nw', cursor: 'nw-resize', top: -handleSize/2, left: -handleSize/2 },
      { position: 'ne', cursor: 'ne-resize', top: -handleSize/2, right: -handleSize/2 },
      { position: 'sw', cursor: 'sw-resize', bottom: -handleSize/2, left: -handleSize/2 },
      { position: 'se', cursor: 'se-resize', bottom: -handleSize/2, right: -handleSize/2 },
    ];
    
    return (
      <>
        {handles.map(handle => (
          <div
            key={handle.position}
            className="absolute bg-primary border-2 border-white rounded-full shadow-lg z-20"
            style={{
              width: handleSize,
              height: handleSize,
              cursor: handle.cursor,
              top: handle.top,
              left: handle.left,
              right: handle.right,
              bottom: handle.bottom,
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', handle.position)}
          />
        ))}
      </>
    );
  };

  // Get selected element
  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-bounce-doodle">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-wiggle">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-float">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
              { id: 'my-packs', label: 'My Packs', icon: Package },
              { id: 'explore', label: 'Explore', icon: ShoppingBag },
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">Sticker Canvas</h3>
                      <div className="flex items-center space-x-2">
                        {/* Layer Navigation */}
                        <div className="flex items-center space-x-1 bg-dark-light rounded-lg px-2 py-1">
                          <span className="text-gray-400 text-sm">Layer {currentLayer}</span>
                          <button
                            onClick={() => navigateLayer('up')}
                            disabled={currentLayer >= getMaxLayer()}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => navigateLayer('down')}
                            disabled={currentLayer <= 1}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-96 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onClick={() => setSelectedElement(null)}
                    >
                      {/* Grid Pattern */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `
                            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px'
                        }}
                      />
                      
                      {/* Elements */}
                      {elements
                        .sort((a, b) => a.layer - b.layer)
                        .map((element) => (
                          <div
                            key={element.id}
                            className={`absolute select-none cursor-move ${
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
                            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedElement(element.id);
                              setCurrentLayer(element.layer);
                            }}
                          >
                            {/* Element Content */}
                            {element.type === 'text' && (
                              <div
                                className="w-full h-full flex items-center justify-center text-center break-words"
                                style={{
                                  fontSize: element.style?.fontSize || 24,
                                  color: element.style?.color || '#000000',
                                  fontFamily: element.style?.fontFamily || 'Arial, sans-serif',
                                  fontWeight: element.style?.fontWeight || 'normal',
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'emoji' && (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                  fontSize: element.style?.fontSize || 48,
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'image' && element.imageData && (
                              <img
                                src={element.imageData}
                                alt="Sticker element"
                                className="w-full h-full object-contain"
                                draggable={false}
                              />
                            )}
                            
                            {/* Resize Handles */}
                            {renderResizeHandles(element)}
                          </div>
                        ))}
                      
                      {/* Empty State */}
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p>Start creating your sticker!</p>
                            <p className="text-sm">Add text, emojis, or images</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Save Button */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {elements.length} element{elements.length !== 1 ? 's' : ''} • {getMaxLayer()} layer{getMaxLayer() !== 1 ? 's' : ''}
                      </div>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={elements.length === 0}
                        className="px-4 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Save size={16} />
                        <span>Save Sticker</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Add Elements</h3>
                    
                    <div className="space-y-3">
                      {/* Text Button */}
                      <button
                        onClick={addText}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white font-medium">Add Text</span>
                      </button>
                      
                      {/* Image Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ImageIcon size={20} className="text-secondary" />
                        <span className="text-white font-medium">Add Image</span>
                      </button>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                      <Smile size={20} className="text-accent" />
                      <span>Emojis</span>
                    </h3>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category}>
                          <h4 className="text-xs text-gray-400 mb-2">{category}</h4>
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

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">Properties</h3>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Text Content */}
                        {selectedElementData.type === 'text' && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Text</label>
                            <input
                              type="text"
                              value={selectedElementData.content}
                              onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                        )}
                        
                        {/* Font Family */}
                        {selectedElementData.type === 'text' && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Font</label>
                            <select
                              value={selectedElementData.style?.fontFamily || 'Arial, sans-serif'}
                              onChange={(e) => updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontFamily: e.target.value }
                              })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            >
                              {fonts.map((font) => (
                                <option key={font.value} value={font.value}>
                                  {font.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Font Size */}
                        {(selectedElementData.type === 'text' || selectedElementData.type === 'emoji') && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Size</label>
                            <input
                              type="range"
                              min={selectedElementData.type === 'text' ? 8 : 16}
                              max={selectedElementData.type === 'text' ? 72 : 120}
                              value={selectedElementData.style?.fontSize || (selectedElementData.type === 'text' ? 24 : 48)}
                              onChange={(e) => updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                              })}
                              className="w-full"
                            />
                            <div className="text-xs text-gray-400 text-center">
                              {selectedElementData.style?.fontSize || (selectedElementData.type === 'text' ? 24 : 48)}px
                            </div>
                          </div>
                        )}
                        
                        {/* Color */}
                        {selectedElementData.type === 'text' && (
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Color</label>
                            <div className="grid grid-cols-4 gap-2">
                              {colors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateElement(selectedElementData.id, {
                                    style: { ...selectedElementData.style, color }
                                  })}
                                  className={`w-8 h-8 rounded border-2 ${
                                    selectedElementData.style?.color === color
                                      ? 'border-white'
                                      : 'border-gray-600'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        
                        {/* Size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Width</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 20 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 20 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                        
                        {/* Rotation */}
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 text-center">
                            {selectedElementData.rotation}°
                          </div>
                        </div>
                        
                        {/* Flip Controls */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 p-2 rounded text-sm transition-colors ${
                              selectedElementData.flipX
                                ? 'bg-primary text-white'
                                : 'bg-dark-light text-gray-400 hover:text-white'
                            }`}
                          >
                            <FlipHorizontal size={16} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 p-2 rounded text-sm transition-colors ${
                              selectedElementData.flipY
                                ? 'bg-primary text-white'
                                : 'bg-dark-light text-gray-400 hover:text-white'
                            }`}
                          >
                            <FlipVertical size={16} className="mx-auto" />
                          </button>
                        </div>
                        
                        {/* Layer */}
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Layer</label>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateElement(selectedElementData.id, { layer: Math.max(1, selectedElementData.layer - 1) })}
                              disabled={selectedElementData.layer <= 1}
                              className="p-1 bg-dark-light text-gray-400 rounded hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <span className="flex-1 text-center text-white text-sm">
                              {selectedElementData.layer}
                            </span>
                            <button
                              onClick={() => updateElement(selectedElementData.id, { layer: selectedElementData.layer + 1 })}
                              className="p-1 bg-dark-light text-gray-400 rounded hover:text-white"
                            >
                              <ChevronUp size={16} />
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
              >
                <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Stickers</h2>
                    <div className="text-sm text-gray-400">
                      {userStickers.length} sticker{userStickers.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {userStickers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 opacity-50">🎨</div>
                      <h3 className="text-xl font-bold text-white mb-2">No stickers yet!</h3>
                      <p className="text-gray-400 mb-4">Create your first sticker to get started</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="px-6 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all"
                      >
                        Create Sticker
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {userStickers.map((sticker) => (
                        <div
                          key={sticker.id}
                          className="bg-dark-light rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all group relative"
                        >
                          {/* Sticker Preview */}
                          <div 
                            className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center cursor-pointer relative overflow-hidden"
                            onClick={() => previewStickerModal(sticker)}
                          >
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-contain"
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={24} className="text-white" />
                            </div>
                          </div>

                          {/* Sticker Info */}
                          <div className="space-y-2">
                            <h4 className="text-white font-semibold text-sm truncate">{sticker.name}</h4>
                            
                            {/* Tags */}
                            {sticker.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {sticker.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {sticker.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{sticker.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Usage Count */}
                            <div className="text-xs text-gray-400">
                              Used {sticker.usageCount} time{sticker.usageCount !== 1 ? 's' : ''}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-1">
                              <button
                                onClick={() => previewStickerModal(sticker)}
                                className="flex-1 p-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors flex items-center justify-center"
                                title="Preview"
                              >
                                <Eye size={12} />
                              </button>
                              <button
                                onClick={() => downloadSticker(sticker)}
                                className="flex-1 p-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors flex items-center justify-center"
                                title="Download"
                              >
                                <Download size={12} />
                              </button>
                              <button
                                onClick={() => shareSticker(sticker)}
                                className="flex-1 p-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30 transition-colors flex items-center justify-center"
                                title="Share"
                              >
                                <Share2 size={12} />
                              </button>
                              {sticker.elementData && (
                                <button
                                  onClick={() => loadStickerForEdit(sticker)}
                                  className="flex-1 p-1 bg-orange-500/20 text-orange-400 rounded text-xs hover:bg-orange-500/30 transition-colors flex items-center justify-center"
                                  title="Edit"
                                >
                                  <Edit3 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Packs Tab */}
            {activeTab === 'my-packs' && (
              <motion.div
                key="my-packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                  <h2 className="text-2xl font-bold text-white mb-6">My Sticker Packs</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stickerPacks
                      .filter(pack => pack.owned)
                      .map((pack) => (
                        <div
                          key={pack.id}
                          className="bg-dark-light rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Package size={24} className="text-secondary" />
                            <div>
                              <h3 className="text-white font-semibold">{pack.name}</h3>
                              <p className="text-gray-400 text-sm">{pack.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              {pack.count} sticker{pack.count !== 1 ? 's' : ''}
                            </span>
                            <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                              {pack.category}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Explore Tab */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Explore Sticker Packs</h2>
                    <div className="text-sm text-gray-400">
                      {currentUser?.clownPoints.toLocaleString()} CP available
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search sticker packs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="roast">Roast</option>
                      <option value="wholesome">Wholesome</option>
                      <option value="cursed">Cursed</option>
                      <option value="meme">Meme</option>
                    </select>
                  </div>

                  {/* Marketplace Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className="bg-dark-light rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                      >
                        {/* Pack Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <ShoppingBag size={24} className="text-accent" />
                            <div>
                              <h3 className="text-white font-semibold">{pack.name}</h3>
                              <p className="text-gray-400 text-sm">by {pack.creator}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                            {pack.category}
                          </span>
                        </div>

                        {/* Pack Preview */}
                        <div className="flex justify-center space-x-2 mb-3 p-3 bg-white rounded-lg">
                          {pack.preview.map((emoji, index) => (
                            <span key={index} className="text-2xl">
                              {emoji}
                            </span>
                          ))}
                        </div>

                        {/* Pack Info */}
                        <p className="text-gray-300 text-sm mb-3">{pack.description}</p>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Star size={14} className="text-yellow-400" />
                              <span>{pack.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Download size={14} />
                              <span>{pack.downloads.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-accent font-bold">
                            <Crown size={16} />
                            <span>{pack.price} CP</span>
                          </div>
                        </div>

                        {/* Purchase Button */}
                        <button
                          onClick={() => purchasePack(pack.id)}
                          disabled={!currentUser || currentUser.clownPoints < pack.price}
                          className="w-full py-2 bg-gradient-to-r from-accent to-yellow-500 text-dark rounded-lg font-semibold hover:from-accent/90 hover:to-yellow-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!currentUser || currentUser.clownPoints < pack.price ? 'Not Enough CP' : 'Purchase Pack'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {filteredPacks.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No packs found</h3>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
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
                    Tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (stickerTags.includes(tag)) {
                            setStickerTags(stickerTags.filter(t => t !== tag));
                          } else {
                            setStickerTags([...stickerTags, tag]);
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          stickerTags.includes(tag)
                            ? 'bg-secondary text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  {stickerTags.length > 0 && (
                    <div className="text-sm text-gray-400">
                      Selected: {stickerTags.map(tag => `#${tag}`).join(', ')}
                    </div>
                  )}
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
                  onClick={saveSticker}
                  disabled={!stickerName.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Sticker Modal */}
      <AnimatePresence>
        {showPreviewModal && previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{previewSticker.name}</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Large Preview */}
              <div className="bg-white rounded-lg p-8 mb-4 flex items-center justify-center">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="max-w-full max-h-48 object-contain"
                />
              </div>

              {/* Sticker Info */}
              <div className="space-y-3 mb-6">
                {previewSticker.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {previewSticker.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  Used {previewSticker.usageCount} time{previewSticker.usageCount !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => downloadSticker(previewSticker)}
                  className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareSticker(previewSticker)}
                  className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded-lg font-semibold hover:bg-purple-500/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                {previewSticker.elementData && (
                  <button
                    onClick={() => {
                      loadStickerForEdit(previewSticker);
                      setShowPreviewModal(false);
                    }}
                    className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded-lg font-semibold hover:bg-orange-500/30 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};