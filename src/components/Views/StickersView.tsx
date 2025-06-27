import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Smile, 
  Download, 
  Share2, 
  Save, 
  Trash2, 
  RotateCcw, 
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Grid,
  Package,
  Star,
  Crown,
  ShoppingCart,
  Check
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateStickerUsage, 
    stickerPacks, 
    addStickerPack,
    addStickerToPack,
    purchaseStickerPack,
    updateUserPoints,
    currentUser 
  } = useStore();
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'create' | 'packs' | 'my-stickers'>('create');
  const [showPreview, setShowPreview] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Save modal state
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [createNewPack, setCreateNewPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate auto sticker name
  const generateStickerName = () => {
    const adjectives = ['Cool', 'Epic', 'Awesome', 'Wild', 'Crazy', 'Fun', 'Chaotic', 'Doodle'];
    const nouns = ['Sticker', 'Creation', 'Art', 'Design', 'Masterpiece'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun} ${Date.now().toString().slice(-4)}`;
  };

  // Reset save modal state
  const resetSaveModal = () => {
    setStickerName(generateStickerName());
    setSelectedPackId('pack-default');
    setCreateNewPack(false);
    setNewPackName('');
    setNewPackDescription('');
  };

  // Open save modal
  const handleSaveClick = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }
    
    resetSaveModal();
    setShowSaveModal(true);
  };

  // FIXED: Save sticker function
  const handleSaveSticker = () => {
    // Validation
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (createNewPack) {
      if (!newPackName.trim()) {
        toast.error('Please enter a pack name! 📦');
        return;
      }
      if (!newPackDescription.trim()) {
        toast.error('Please enter a pack description! 📝');
        return;
      }
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    try {
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: `data:image/svg+xml;base64,${btoa(generateStickerSVG())}`, // Generate SVG representation
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements, // Store the element data for editing
      };

      if (createNewPack) {
        // Create new pack first
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName.trim(),
          description: newPackDescription.trim(),
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: currentUser?.id || 'user-1',
          createdAt: new Date(),
        };

        // Add the pack to store
        addStickerPack(newPack);
        
        // Add sticker to the new pack
        addStickerToPack(newSticker, newPack.id);
        
        toast.success(`Sticker saved to new pack "${newPackName}"! 🎨✨ (+20 CP)`);
      } else {
        // Add to existing pack
        addStickerToPack(newSticker, selectedPackId);
        
        const packName = stickerPacks.find(p => p.id === selectedPackId)?.name || 'pack';
        toast.success(`Sticker saved to "${packName}"! 🎨✨ (+20 CP)`);
      }

      // Award points
      updateUserPoints(20);
      
      // Close modal
      setShowSaveModal(false);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😅');
    }
  };

  // Generate SVG representation of the sticker
  const generateStickerSVG = () => {
    const svgElements = elements.map(element => {
      const transform = `translate(${element.x}, ${element.y}) rotate(${element.rotation}) scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`;
      
      switch (element.type) {
        case 'text':
          return `<text x="0" y="0" transform="${transform}" font-size="${element.style?.fontSize || 24}" fill="${element.style?.color || '#000'}" font-family="${element.style?.fontFamily || 'Arial'}" font-weight="${element.style?.fontWeight || 'normal'}">${element.content}</text>`;
        case 'emoji':
          return `<text x="0" y="0" transform="${transform}" font-size="${element.height}" fill="currentColor">${element.content}</text>`;
        case 'image':
          return `<image x="0" y="0" width="${element.width}" height="${element.height}" transform="${transform}" href="${element.imageData || element.content}" />`;
        default:
          return '';
      }
    }).join('');

    return `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">${svgElements}</svg>`;
  };

  // Add element functions
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Your Text',
      x: 150,
      y: 150,
      width: 100,
      height: 30,
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
    toast.success('Text added! Click to edit properties! ✏️');
  };

  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 150,
      y: 150,
      width: 50,
      height: 50,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success(`${emoji} added! Click to resize! 🎨`);
  };

  const addImageElement = () => {
    // For demo purposes, add a placeholder image
    const images = [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
      'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
    ];
    
    const randomImage = images[Math.floor(Math.random() * images.length)];
    
    const newElement: StickerElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: randomImage,
      x: 150,
      y: 150,
      width: 80,
      height: 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    toast.success('Image added! Click to resize and edit! 🖼️');
  };

  // Element manipulation functions
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // Layer management
  const moveElementLayer = (id: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const maxLayer = Math.max(...elements.map(el => el.layer));
    const minLayer = Math.min(...elements.map(el => el.layer));

    let newLayer = element.layer;
    if (direction === 'up' && element.layer < maxLayer) {
      newLayer = element.layer + 1;
    } else if (direction === 'down' && element.layer > minLayer) {
      newLayer = element.layer - 1;
    } else {
      return; // Can't move further
    }

    // Swap layers with the element at the target layer
    const targetElement = elements.find(el => el.layer === newLayer);
    if (targetElement) {
      updateElement(targetElement.id, { layer: element.layer });
    }
    updateElement(id, { layer: newLayer });
    
    toast.success(`Layer moved ${direction}! 📚`);
  };

  // Get sorted elements by layer
  const getSortedElements = () => {
    return [...elements].sort((a, b) => a.layer - b.layer);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    setCurrentLayer(element.layer);
    
    // Check if clicking on resize handle
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || null);
      return;
    }

    // Start dragging
    setDraggedElement(elementId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;

      switch (resizeHandle) {
        case 'se': // Southeast corner
          newWidth = Math.max(20, x - element.x);
          newHeight = Math.max(20, y - element.y);
          break;
        case 'sw': // Southwest corner
          newWidth = Math.max(20, element.x + element.width - x);
          newHeight = Math.max(20, y - element.y);
          newX = x;
          break;
        case 'ne': // Northeast corner
          newWidth = Math.max(20, x - element.x);
          newHeight = Math.max(20, element.y + element.height - y);
          newY = y;
          break;
        case 'nw': // Northwest corner
          newWidth = Math.max(20, element.x + element.width - x);
          newHeight = Math.max(20, element.y + element.height - y);
          newX = x;
          newY = y;
          break;
      }

      updateElement(selectedElement, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    } else if (draggedElement) {
      const newX = Math.max(0, Math.min(300 - 50, x - dragOffset.x));
      const newY = Math.max(0, Math.min(300 - 50, y - dragOffset.y));
      
      updateElement(draggedElement, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Preview and download functions
  const handlePreviewSticker = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreview(true);
  };

  const handleDownloadSticker = (sticker: Sticker) => {
    // Create a download link
    const link = document.createElement('a');
    link.href = sticker.imageUrl;
    link.download = `${sticker.name}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${sticker.name} downloaded! 💾`);
  };

  const handleShareSticker = (sticker: Sticker) => {
    if (navigator.share) {
      navigator.share({
        title: sticker.name,
        text: `Check out my custom sticker: ${sticker.name}`,
        url: sticker.imageUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Check out my custom sticker: ${sticker.name}`);
      toast.success('Sticker link copied to clipboard! 📋');
    }
  };

  // Get user's stickers
  const getUserStickers = () => {
    return stickers.filter(sticker => sticker.createdBy === currentUser?.id);
  };

  // Get owned packs
  const getOwnedPacks = () => {
    return stickerPacks.filter(pack => pack.owned);
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
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'packs', label: 'Packs', icon: Package },
              { id: 'my-stickers', label: 'My Stickers', icon: Star },
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
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Layer {currentLayer}</span>
                        <button
                          onClick={handleSaveClick}
                          className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-1"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 size={16} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div className="relative">
                      <div
                        ref={canvasRef}
                        className="w-full h-80 bg-white rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Grid background */}
                        <div className="absolute inset-0 opacity-10">
                          <svg width="100%" height="100%">
                            <defs>
                              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="1"/>
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                          </svg>
                        </div>

                        {/* Render elements */}
                        {getSortedElements().map((element) => (
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
                            onMouseDown={(e) => handleMouseDown(e, element.id)}
                          >
                            {element.type === 'text' && (
                              <div
                                className="w-full h-full flex items-center justify-center text-center break-words"
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
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ fontSize: element.height * 0.8 }}
                              >
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'image' && (
                              <img
                                src={element.content}
                                alt="Sticker element"
                                className="w-full h-full object-cover rounded"
                                draggable={false}
                              />
                            )}

                            {/* Resize handles */}
                            {selectedElement === element.id && (
                              <>
                                <div
                                  className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                  data-handle="se"
                                />
                                <div
                                  className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                                  data-handle="sw"
                                />
                                <div
                                  className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                                  data-handle="ne"
                                />
                                <div
                                  className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                                  data-handle="nw"
                                />
                              </>
                            )}
                          </div>
                        ))}

                        {/* Empty state */}
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
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Add Elements</h4>
                    <div className="space-y-3">
                      <button
                        onClick={addTextElement}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white">Add Text</span>
                      </button>
                      
                      <button
                        onClick={addImageElement}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Image size={20} className="text-secondary" />
                        <span className="text-white">Add Image</span>
                      </button>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Smile size={16} className="text-accent" />
                          <span className="text-white text-sm font-medium">Add Emoji</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '🌟', '✨', '🎉', '🎊', '🎈'].map((emoji) => (
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
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Element Properties</h4>
                      
                      <div className="space-y-3">
                        {/* Layer Controls */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Layer: {selectedElementData.layer}</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => moveElementLayer(selectedElementData.id, 'up')}
                              className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors"
                            >
                              <ChevronUp size={16} />
                              <span className="text-sm">Up</span>
                            </button>
                            <button
                              onClick={() => moveElementLayer(selectedElementData.id, 'down')}
                              className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors"
                            >
                              <ChevronDown size={16} />
                              <span className="text-sm">Down</span>
                            </button>
                          </div>
                        </div>

                        {/* Text Properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Text Content</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Font Size</label>
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
                              <span className="text-xs text-gray-400">{selectedElementData.style?.fontSize || 24}px</span>
                            </div>
                            
                            <div>
                              <label className="block text-sm text-gray-300 mb-2">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FF6B9D'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-10 rounded border border-gray-700"
                              />
                            </div>
                          </>
                        )}

                        {/* Transform Controls */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">Rotation</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-400">{selectedElementData.rotation}°</span>
                        </div>

                        {/* Flip Controls */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 flex items-center justify-center space-x-1 p-2 rounded transition-colors ${
                              selectedElementData.flipX ? 'bg-primary text-white' : 'bg-dark-light hover:bg-gray-700'
                            }`}
                          >
                            <FlipHorizontal size={16} />
                            <span className="text-sm">Flip H</span>
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 flex items-center justify-center space-x-1 p-2 rounded transition-colors ${
                              selectedElementData.flipY ? 'bg-primary text-white' : 'bg-dark-light hover:bg-gray-700'
                            }`}
                          >
                            <FlipVertical size={16} />
                            <span className="text-sm">Flip V</span>
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="w-full flex items-center justify-center space-x-2 p-2 bg-red-500 text-white rounded hover:bg-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                          <span>Delete Element</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {stickerPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className={`bg-dark-card rounded-xl p-4 border ${
                      pack.owned ? 'border-green-500' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{pack.name}</h3>
                      {pack.owned ? (
                        <div className="flex items-center space-x-1 text-green-400">
                          <Check size={16} />
                          <span className="text-sm">Owned</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-accent">
                          <Crown size={16} />
                          <span className="text-sm">{pack.price} CP</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{pack.count} stickers</span>
                      {!pack.owned && (
                        <button
                          onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                          disabled={!currentUser || currentUser.clownPoints < pack.price}
                          className="flex items-center space-x-1 px-3 py-1 bg-accent text-dark rounded hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={14} />
                          <span className="text-sm">Buy</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* My Stickers Tab */}
            {activeTab === 'my-stickers' && (
              <motion.div
                key="my-stickers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {getOwnedPacks().map((pack) => (
                  <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                      <span className="text-gray-400 text-sm">{pack.stickers.length} stickers</span>
                    </div>
                    
                    {pack.stickers.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {pack.stickers.map((sticker) => (
                          <div
                            key={sticker.id}
                            className="bg-dark-light rounded-lg p-3 hover:bg-gray-700 transition-colors group"
                          >
                            <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                              <img
                                src={sticker.imageUrl}
                                alt={sticker.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="text-white text-sm font-medium truncate">{sticker.name}</h4>
                            <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handlePreviewSticker(sticker)}
                                className="p-1 text-secondary hover:text-white transition-colors"
                                title="Preview"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => handleDownloadSticker(sticker)}
                                className="p-1 text-accent hover:text-white transition-colors"
                                title="Download"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => handleShareSticker(sticker)}
                                className="p-1 text-primary hover:text-white transition-colors"
                                title="Share"
                              >
                                <Share2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">📦</div>
                        <p>No stickers in this pack yet</p>
                        <p className="text-sm">Create some stickers to fill it up!</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {getOwnedPacks().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-lg">No sticker packs yet</p>
                    <p>Create your first sticker to get started!</p>
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
                {/* Sticker Name */}
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
                  />
                </div>

                {/* Create New Pack Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createNewPack"
                    checked={createNewPack}
                    onChange={(e) => setCreateNewPack(e.target.checked)}
                    className="rounded border-gray-700 text-primary focus:ring-primary"
                  />
                  <label htmlFor="createNewPack" className="text-gray-300 text-sm">
                    Create new pack
                  </label>
                </div>

                {/* Pack Selection or New Pack Creation */}
                {createNewPack ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pack Name
                      </label>
                      <input
                        type="text"
                        value={newPackName}
                        onChange={(e) => setNewPackName(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                        placeholder="Enter pack name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pack Description
                      </label>
                      <textarea
                        value={newPackDescription}
                        onChange={(e) => setNewPackDescription(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-20 resize-none"
                        placeholder="Describe your pack..."
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Save to Pack
                    </label>
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      {getOwnedPacks().map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.stickers.length} stickers)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Pack Preview */}
                {!createNewPack && (
                  <div className="bg-dark-light rounded-lg p-3">
                    <h4 className="text-white font-semibold text-sm mb-1">
                      {stickerPacks.find(p => p.id === selectedPackId)?.name}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {stickerPacks.find(p => p.id === selectedPackId)?.description}
                    </p>
                  </div>
                )}
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
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Save Sticker
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{previewSticker.name}</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="max-w-full max-h-48 object-contain"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadSticker(previewSticker)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleShareSticker(previewSticker)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};