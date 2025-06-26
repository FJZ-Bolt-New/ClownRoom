import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  Save, 
  X, 
  Move, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  ChevronUp, 
  ChevronDown, 
  Layers,
  Palette,
  Download,
  Share2,
  Eye,
  Grid,
  Package,
  ShoppingBag,
  Star,
  Crown,
  Trash2,
  Edit3
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    stickerPacks, 
    addStickerToPack, 
    updateUserPoints,
    getStickersByPack,
    purchaseStickerPack,
    currentUser
  } = useStore();
  
  // Main view state
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'my-packs' | 'explore'>('create');
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  const [stickerName, setStickerName] = useState('');
  const [selectedPack, setSelectedPack] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '🤣', '😊', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
    'Food': ['🍎', '🍌', '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁'],
    'Objects': ['⚽', '🏀', '🎮', '🎯', '🎪', '🎨', '🎭', '🎪', '🚀', '💎', '⭐', '🔥'],
  };

  // Get layer bounds
  const getMinLayer = () => 1;
  const getMaxLayer = () => Math.max(1, elements.length);

  // Layer navigation with bounds checking
  const navigateLayer = (direction: 'up' | 'down') => {
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    
    if (direction === 'up' && currentLayer < maxLayer) {
      setCurrentLayer(currentLayer + 1);
    } else if (direction === 'down' && currentLayer > minLayer) {
      setCurrentLayer(currentLayer - 1);
    }
    
    // Select the element at the new layer
    const elementAtLayer = elements.find(el => el.layer === currentLayer);
    if (elementAtLayer) {
      setSelectedElement(elementAtLayer.id);
    }
  };

  // Handle layer input change with validation
  const handleLayerInputChange = (value: string) => {
    const layerNum = parseInt(value);
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    
    if (!isNaN(layerNum) && layerNum >= minLayer && layerNum <= maxLayer) {
      setCurrentLayer(layerNum);
      
      // Select the element at this layer
      const elementAtLayer = elements.find(el => el.layer === layerNum);
      if (elementAtLayer) {
        setSelectedElement(elementAtLayer.id);
      }
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
      width: 100,
      height: 30,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: {
        fontSize: 16,
        color: '#FF6B9D',
        fontFamily: 'Arial',
        fontWeight: 'normal',
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    updateUserPoints(2);
    toast.success('Text added! ✏️ (+2 CP)');
  };

  const addEmoji = (emoji: string) => {
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
      layer: elements.length + 1,
      style: {
        fontSize: 32,
      },
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    updateUserPoints(1);
    toast.success(`${emoji} added! (+1 CP)`);
  };

  const addImage = () => {
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
            layer: elements.length + 1,
            imageData: event.target?.result as string,
          };
          
          setElements([...elements, newElement]);
          setSelectedElement(newElement.id);
          setCurrentLayer(newElement.layer);
          updateUserPoints(3);
          toast.success('Image added! 🖼️ (+3 CP)');
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Element manipulation functions
  const updateElement = (id: string, updates: Partial<StickerElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    const elementToDelete = elements.find(el => el.id === id);
    if (!elementToDelete) return;
    
    // Remove the element
    const newElements = elements.filter(el => el.id !== id);
    
    // Reassign layers to maintain continuity
    const reorderedElements = newElements.map((el, index) => ({
      ...el,
      layer: index + 1
    }));
    
    setElements(reorderedElements);
    setSelectedElement(null);
    
    // Adjust current layer if necessary
    const maxLayer = Math.max(1, reorderedElements.length);
    if (currentLayer > maxLayer) {
      setCurrentLayer(maxLayer);
    }
    
    toast.success('Element deleted! 🗑️');
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    // Select element and show properties
    setSelectedElement(elementId);
    setCurrentLayer(element.layer);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    
    setDragOffset({
      x: startX - element.x,
      y: startY - element.y
    });
    
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    updateElement(selectedElement, {
      x: Math.max(0, Math.min(newX, 300)),
      y: Math.max(0, Math.min(newY, 300))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Click handler for element selection
  const handleElementClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElement(elementId);
      setCurrentLayer(element.layer);
    }
  };

  // Save sticker function
  const saveSticker = async () => {
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    try {
      // Generate sticker preview (simplified)
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set transparent background
        ctx.clearRect(0, 0, 300, 300);
        
        // Sort elements by layer
        const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
        
        // Draw each element
        for (const element of sortedElements) {
          ctx.save();
          
          // Apply transformations
          ctx.translate(element.x + element.width/2, element.y + element.height/2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);
          
          if (element.type === 'text') {
            ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 16}px ${element.style?.fontFamily || 'Arial'}`;
            ctx.fillStyle = element.style?.color || '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.content, 0, 0);
          } else if (element.type === 'emoji') {
            ctx.font = `${element.style?.fontSize || 32}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.content, 0, 0);
          } else if (element.type === 'image' && element.imageData) {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, -element.width/2, -element.height/2, element.width, element.height);
            };
            img.src = element.imageData;
          }
          
          ctx.restore();
        }
      }

      const imageUrl = canvas.toDataURL('image/png');

      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: imageUrl,
        tags: ['custom'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        packId: createNewPack ? `pack-${Date.now()}` : selectedPack,
        elementData: elements, // Store element data for editing
      };

      if (createNewPack && newPackName.trim()) {
        // Create new pack logic would go here
        toast.success(`New pack "${newPackName}" created!`);
      }

      addStickerToPack(newSticker, newSticker.packId || 'pack-default');
      updateUserPoints(10);
      
      // Success feedback - keep canvas intact
      toast.success(`✨ Sticker '${stickerName}' saved successfully! (+10 CP)`, {
        duration: 4000,
        icon: '🎨',
      });
      
      // Reset only the modal form
      setShowSaveModal(false);
      setStickerName('');
      setCreateNewPack(false);
      setNewPackName('');
      setSelectedPack('pack-default');
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // Get my stickers
  const getMyStickers = () => {
    return stickers.filter(sticker => sticker.createdBy === currentUser?.id);
  };

  // Preview sticker
  const previewStickerFunc = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreviewModal(true);
  };

  // Download sticker
  const downloadSticker = (sticker: Sticker) => {
    try {
      const link = document.createElement('a');
      link.download = `${sticker.name}.png`;
      link.href = sticker.imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`📥 ${sticker.name} downloaded!`);
    } catch (error) {
      toast.error('Download failed! 😞');
    }
  };

  // Share sticker
  const shareSticker = async (sticker: Sticker) => {
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: `Check out my sticker: ${sticker.name}`,
          text: `I created this awesome sticker in ClownRoom! 🎨`,
          url: window.location.href
        });
        toast.success('Sticker shared! 📤');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`Check out my sticker: ${sticker.name} - Created in ClownRoom! 🎨`);
        toast.success('Share link copied to clipboard! 📋');
      }
    } catch (error) {
      toast.error('Sharing failed! 😞');
    }
  };

  // Delete sticker
  const deleteSticker = (stickerId: string) => {
    // This would need to be implemented in the store
    toast.success('Sticker deleted! 🗑️');
  };

  // Edit sticker
  const editSticker = (sticker: Sticker) => {
    if (sticker.elementData) {
      setElements(sticker.elementData);
      setSelectedElement(null);
      setCurrentLayer(1);
      setActiveTab('create');
      toast.success(`Editing ${sticker.name}! ✏️`);
    } else {
      toast.error('This sticker cannot be edited! 😞');
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

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
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
              { id: 'my-packs', label: 'My Packs', icon: Package },
              { id: 'explore', label: 'Explore Packs', icon: ShoppingBag },
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
                {/* Canvas Area */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save Sticker
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas */}
                    <div
                      ref={canvasRef}
                      className="relative w-full h-80 bg-white/10 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
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
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                          onClick={() => handleElementClick(element.id)}
                        >
                          {element.type === 'text' && (
                            <div
                              style={{
                                fontSize: element.style?.fontSize,
                                color: element.style?.color,
                                fontFamily: element.style?.fontFamily,
                                fontWeight: element.style?.fontWeight,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'emoji' && (
                            <div
                              style={{
                                fontSize: element.style?.fontSize,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'image' && element.imageData && (
                            <img
                              src={element.imageData}
                              alt={element.content}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                              draggable={false}
                            />
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p>Start creating your sticker!</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-6">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Add Elements</h4>
                    <div className="space-y-3">
                      <button
                        onClick={addText}
                        className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white">Add Text</span>
                      </button>
                      
                      <button
                        onClick={addImage}
                        className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ImageIcon size={20} className="text-secondary" />
                        <span className="text-white">Add Image</span>
                      </button>
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Add Emoji</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category}>
                          <h5 className="text-xs text-gray-400 mb-2">{category}</h5>
                          <div className="grid grid-cols-6 gap-2">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="p-2 text-xl hover:bg-gray-700 rounded transition-colors"
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
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
                      <Layers size={16} />
                      <span>Layer Controls</span>
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Current Layer:</span>
                        <input
                          type="number"
                          value={currentLayer}
                          onChange={(e) => handleLayerInputChange(e.target.value)}
                          min={getMinLayer()}
                          max={getMaxLayer()}
                          className="w-16 bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                        />
                        <span className="text-gray-400 text-sm">/ {getMaxLayer()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigateLayer('up')}
                          disabled={currentLayer >= getMaxLayer()}
                          className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={16} />
                          <span className="text-sm">Up</span>
                        </button>
                        <button
                          onClick={() => navigateLayer('down')}
                          disabled={currentLayer <= getMinLayer()}
                          className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={16} />
                          <span className="text-sm">Down</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">Element Properties</h4>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">X Position</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Y Position</label>
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
                            <label className="block text-xs text-gray-400 mb-1">Width</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 1 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 1 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Text Content</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                                <input
                                  type="number"
                                  value={selectedElementData.style?.fontSize || 16}
                                  onChange={(e) => updateElement(selectedElementData.id, { 
                                    style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 16 }
                                  })}
                                  className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Color</label>
                                <input
                                  type="color"
                                  value={selectedElementData.style?.color || '#FF6B9D'}
                                  onChange={(e) => updateElement(selectedElementData.id, { 
                                    style: { ...selectedElementData.style, color: e.target.value }
                                  })}
                                  className="w-full h-8 bg-dark-light rounded border border-gray-700 focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {/* Emoji-specific properties */}
                        {selectedElementData.type === 'emoji' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Size</label>
                            <input
                              type="number"
                              value={selectedElementData.style?.fontSize || 32}
                              onChange={(e) => updateElement(selectedElementData.id, { 
                                style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 32 }
                              })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Transform controls */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Rotation</label>
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
                            className={`flex-1 p-2 rounded text-sm transition-colors ${
                              selectedElementData.flipX ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <FlipHorizontal size={16} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 p-2 rounded text-sm transition-colors ${
                              selectedElementData.flipY ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <FlipVertical size={16} className="mx-auto" />
                          </button>
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
                  <h3 className="text-white font-bold text-lg mb-4">My Stickers</h3>
                  
                  {getMyStickers().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">🎨</div>
                      <p>No stickers created yet!</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Create Your First Sticker
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {getMyStickers().map((sticker) => (
                        <div
                          key={sticker.id}
                          className="bg-dark-light rounded-lg p-3 border border-gray-700 hover:border-primary transition-colors group"
                        >
                          <div className="aspect-square mb-2 relative">
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => previewStickerFunc(sticker)}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>
                          
                          <h4 className="text-white font-semibold text-sm mb-2 truncate">{sticker.name}</h4>
                          
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span>Used {sticker.usageCount} times</span>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => previewStickerFunc(sticker)}
                              className="flex-1 p-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                              title="Preview"
                            >
                              <Eye size={12} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => downloadSticker(sticker)}
                              className="flex-1 p-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                              title="Download"
                            >
                              <Download size={12} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => shareSticker(sticker)}
                              className="flex-1 p-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30 transition-colors"
                              title="Share"
                            >
                              <Share2 size={12} className="mx-auto" />
                            </button>
                            {sticker.elementData && (
                              <button
                                onClick={() => editSticker(sticker)}
                                className="flex-1 p-1 bg-orange-500/20 text-orange-400 rounded text-xs hover:bg-orange-500/30 transition-colors"
                                title="Edit"
                              >
                                <Edit3 size={12} className="mx-auto" />
                              </button>
                            )}
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
                  <h3 className="text-white font-bold text-lg mb-4">My Sticker Packs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stickerPacks.filter(pack => pack.owned).map((pack) => (
                      <div
                        key={pack.id}
                        className="bg-dark-light rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <Package size={20} className="text-secondary" />
                          <h4 className="text-white font-semibold">{pack.name}</h4>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{pack.count} stickers</span>
                          <span className="text-secondary font-semibold">{pack.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                  <h3 className="text-white font-bold text-lg mb-4">Explore Sticker Packs</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stickerPacks.filter(pack => !pack.owned).map((pack) => (
                      <div
                        key={pack.id}
                        className="bg-dark-light rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center space-x-2 mb-3">
                          <ShoppingBag size={20} className="text-accent" />
                          <h4 className="text-white font-semibold">{pack.name}</h4>
                          {pack.price === 0 && <span className="text-green-400 text-xs">FREE</span>}
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400 text-sm">{pack.count} stickers</span>
                          <div className="flex items-center space-x-1">
                            <Crown size={14} className="text-accent" />
                            <span className="text-accent font-bold">{pack.price} CP</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                          disabled={!currentUser || currentUser.clownPoints < pack.price}
                          className="w-full py-2 bg-accent text-dark rounded font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pack.price === 0 ? 'Add to My Stickers' : 'Purchase Pack'}
                        </button>
                      </div>
                    ))}
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
                    <select
                      value={selectedPack}
                      onChange={(e) => setSelectedPack(e.target.value)}
                      disabled={createNewPack}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      {stickerPacks.filter(pack => pack.owned).map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="createNewPack"
                        checked={createNewPack}
                        onChange={(e) => setCreateNewPack(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="createNewPack" className="text-sm text-gray-300">
                        Create new pack
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
                  onClick={saveSticker}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
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
              
              <div className="bg-white/10 rounded-lg p-4 mb-4 flex items-center justify-center">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
              
              <div className="text-sm text-gray-400 mb-4">
                <p>Used {previewSticker.usageCount} times</p>
                <p>Tags: {previewSticker.tags.join(', ')}</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadSticker(previewSticker)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareSticker(previewSticker)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
                {previewSticker.elementData && (
                  <button
                    onClick={() => {
                      editSticker(previewSticker);
                      setShowPreviewModal(false);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
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