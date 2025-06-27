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
  Download, 
  Upload, 
  Layers, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Grid,
  Search,
  ShoppingCart,
  Crown,
  Star,
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
  
  // Canvas and elements state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // FIXED: Unified interaction state
  const [interactionData, setInteractionData] = useState<{
    type: 'drag' | 'resize' | null;
    isDragging: boolean;
    isResizing: boolean;
    handle?: string;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
    elementStartWidth: number;
    elementStartHeight: number;
  } | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'create' | 'packs' | 'collection'>('create');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
    'Food': ['🍎', '🍌', '🍓', '🍕', '🍔', '🌭', '🍟', '🍗', '🎂', '🍰', '🍪', '🍩', '☕', '🥤'],
    'Objects': ['⚽', '🏀', '🎮', '🎸', '🎨', '📱', '💻', '🚗', '✈️', '🚀', '⭐', '🌟', '💫', '✨'],
  };

  // Add element functions
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Your Text',
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: {
        fontSize: 24,
        color: '#FF6B9D',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Text added! ✏️');
  };

  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: {
        fontSize: 48,
      },
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setShowEmojiPicker(false);
    toast.success(`${emoji} added!`);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB! 📏');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const newElement: StickerElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: elements.length,
        imageData,
      };
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Image added! 🖼️');
    };
    reader.readAsDataURL(file);
  };

  // FIXED: Unified mouse down handler that properly detects resize handles
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    
    // Check if clicking on a resize handle
    const target = e.target as HTMLElement;
    const isResizeHandle = target.classList.contains('resize-handle');
    const handle = target.getAttribute('data-handle');
    
    if (isResizeHandle && handle) {
      // Start resizing
      setInteractionData({
        type: 'resize',
        isDragging: false,
        isResizing: true,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: element.x,
        elementStartY: element.y,
        elementStartWidth: element.width,
        elementStartHeight: element.height,
      });
    } else {
      // Start dragging
      setInteractionData({
        type: 'drag',
        isDragging: true,
        isResizing: false,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: element.x,
        elementStartY: element.y,
        elementStartWidth: element.width,
        elementStartHeight: element.height,
      });
    }
  }, [elements]);

  // FIXED: Unified mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!interactionData || !selectedElement) return;
    
    const deltaX = e.clientX - interactionData.startX;
    const deltaY = e.clientY - interactionData.startY;
    
    if (interactionData.type === 'drag' && interactionData.isDragging) {
      // Handle dragging
      const newX = Math.max(0, Math.min(300 - 50, interactionData.elementStartX + deltaX));
      const newY = Math.max(0, Math.min(300 - 50, interactionData.elementStartY + deltaY));
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: newX, y: newY }
          : el
      ));
    } else if (interactionData.type === 'resize' && interactionData.isResizing) {
      // Handle resizing
      setElements(prev => prev.map(el => {
        if (el.id !== selectedElement) return el;
        
        let newX = interactionData.elementStartX;
        let newY = interactionData.elementStartY;
        let newWidth = interactionData.elementStartWidth;
        let newHeight = interactionData.elementStartHeight;
        
        switch (interactionData.handle) {
          case 'se': // Southeast (bottom-right)
            newWidth = Math.max(20, interactionData.elementStartWidth + deltaX);
            newHeight = Math.max(20, interactionData.elementStartHeight + deltaY);
            break;
          case 'sw': // Southwest (bottom-left)
            newWidth = Math.max(20, interactionData.elementStartWidth - deltaX);
            newHeight = Math.max(20, interactionData.elementStartHeight + deltaY);
            newX = Math.max(0, interactionData.elementStartX + deltaX);
            break;
          case 'ne': // Northeast (top-right)
            newWidth = Math.max(20, interactionData.elementStartWidth + deltaX);
            newHeight = Math.max(20, interactionData.elementStartHeight - deltaY);
            newY = Math.max(0, interactionData.elementStartY + deltaY);
            break;
          case 'nw': // Northwest (top-left)
            newWidth = Math.max(20, interactionData.elementStartWidth - deltaX);
            newHeight = Math.max(20, interactionData.elementStartHeight - deltaY);
            newX = Math.max(0, interactionData.elementStartX + deltaX);
            newY = Math.max(0, interactionData.elementStartY + deltaY);
            break;
        }
        
        // Ensure element stays within canvas bounds
        newX = Math.max(0, Math.min(300 - newWidth, newX));
        newY = Math.max(0, Math.min(300 - newHeight, newY));
        
        return { ...el, x: newX, y: newY, width: newWidth, height: newHeight };
      }));
    }
  }, [interactionData, selectedElement]);

  // FIXED: Mouse up handler
  const handleMouseUp = useCallback(() => {
    setInteractionData(null);
  }, []);

  // Mouse event listeners
  React.useEffect(() => {
    if (interactionData?.isDragging || interactionData?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [interactionData, handleMouseMove, handleMouseUp]);

  // Update element content
  const updateElementContent = (elementId: string, content: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, content } : el
    ));
  };

  // Update element style
  const updateElementStyle = (elementId: string, style: Partial<StickerElement['style']>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, style: { ...el.style, ...style } }
        : el
    ));
  };

  // Layer management
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newLayer = direction === 'up' 
      ? Math.min(elements.length - 1, element.layer + 1)
      : Math.max(0, element.layer - 1);

    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return { ...el, layer: newLayer };
      }
      if (direction === 'up' && el.layer === newLayer && el.id !== elementId) {
        return { ...el, layer: element.layer };
      }
      if (direction === 'down' && el.layer === newLayer && el.id !== elementId) {
        return { ...el, layer: element.layer };
      }
      return el;
    }));
  };

  // Transform functions
  const rotateElement = (elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, rotation: (el.rotation + 90) % 360 }
        : el
    ));
  };

  const flipElement = (elementId: string, axis: 'x' | 'y') => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, [axis === 'x' ? 'flipX' : 'flipY']: !el[axis === 'x' ? 'flipX' : 'flipY'] }
        : el
    ));
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    toast.success('Canvas cleared! ✨');
  };

  // Save sticker function
  const saveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    try {
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: `Sticker ${Date.now()}`,
        imageUrl: 'data:image/svg+xml;base64,' + btoa(generateSVG()),
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements, // Store the element data for future editing
      };

      // Determine which pack to save to
      let targetPackId = selectedPackId;
      
      if (!targetPackId || targetPackId === 'new') {
        // Create new pack
        if (!newPackName.trim()) {
          toast.error('Enter a pack name! 📝');
          return;
        }
        
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
        
        // Add the new pack first
        addStickerPack(newPack);
        targetPackId = newPack.id;
        
        toast.success(`New pack "${newPackName}" created! 📦`);
      }

      // Add sticker to the pack
      addStickerToPack(newSticker, targetPackId);
      
      // Update user points
      updateUserPoints(10);
      
      // Clear the canvas and reset form
      clearCanvas();
      setShowSaveModal(false);
      setNewPackName('');
      setSelectedPackId('');
      
      toast.success('Sticker saved successfully! 🎉 (+10 CP)');
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! 😞');
    }
  };

  // Generate SVG from elements
  const generateSVG = () => {
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    
    let svgContent = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">`;
    
    sortedElements.forEach(element => {
      const transform = `translate(${element.x}, ${element.y}) rotate(${element.rotation}) scale(${element.flipX ? -1 : 1}, ${element.flipY ? -1 : 1})`;
      
      if (element.type === 'text') {
        svgContent += `<text x="0" y="${element.height * 0.7}" 
          font-family="${element.style?.fontFamily || 'Arial'}" 
          font-size="${element.style?.fontSize || 24}" 
          font-weight="${element.style?.fontWeight || 'normal'}"
          fill="${element.style?.color || '#000000'}" 
          transform="${transform}">${element.content}</text>`;
      } else if (element.type === 'emoji') {
        svgContent += `<text x="0" y="${element.height * 0.8}" 
          font-size="${element.style?.fontSize || 48}" 
          transform="${transform}">${element.content}</text>`;
      } else if (element.type === 'image' && element.imageData) {
        svgContent += `<image x="0" y="0" 
          width="${element.width}" 
          height="${element.height}" 
          href="${element.imageData}" 
          transform="${transform}"/>`;
      }
    });
    
    svgContent += `</svg>`;
    return svgContent;
  };

  // Get sorted elements for rendering
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Get user's owned packs
  const ownedPacks = stickerPacks.filter(pack => pack.owned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'packs', label: 'Packs', icon: Grid },
              { id: 'collection', label: 'Collection', icon: Star },
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
                  <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={clearCanvas}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Clear Canvas"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save Sticker"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-80 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden"
                      style={{ aspectRatio: '1' }}
                      onClick={() => setSelectedElement(null)}
                    >
                      {sortedElements.map((element) => (
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
                          {/* Element Content */}
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center text-center break-words"
                              style={{
                                fontSize: element.style?.fontSize || 24,
                                color: element.style?.color || '#000000',
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
                              alt={element.content}
                              className="w-full h-full object-cover rounded"
                              draggable={false}
                            />
                          )}
                          
                          {/* FIXED: Resize Handles with proper data attributes */}
                          {selectedElement === element.id && (
                            <>
                              {/* Corner resize handles with data-handle attributes */}
                              <div
                                className="resize-handle absolute -top-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-nw-resize shadow-lg hover:scale-110 transition-transform"
                                data-handle="nw"
                                onMouseDown={(e) => handleMouseDown(e, element.id)}
                              />
                              <div
                                className="resize-handle absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-ne-resize shadow-lg hover:scale-110 transition-transform"
                                data-handle="ne"
                                onMouseDown={(e) => handleMouseDown(e, element.id)}
                              />
                              <div
                                className="resize-handle absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-sw-resize shadow-lg hover:scale-110 transition-transform"
                                data-handle="sw"
                                onMouseDown={(e) => handleMouseDown(e, element.id)}
                              />
                              <div
                                className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-white rounded-full cursor-se-resize shadow-lg hover:scale-110 transition-transform"
                                data-handle="se"
                                onMouseDown={(e) => handleMouseDown(e, element.id)}
                              />
                            </>
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
                        onClick={addTextElement}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white">Add Text</span>
                      </button>
                      
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <ImageIcon size={20} className="text-secondary" />
                          <span className="text-white">Add Image</span>
                        </label>
                      </div>
                      
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Smile size={20} className="text-accent" />
                        <span className="text-white">Add Emoji</span>
                      </button>
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800"
                      >
                        <h4 className="text-white font-bold mb-3">Choose Emoji</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <div key={category}>
                              <h5 className="text-gray-400 text-sm mb-2">{category}</h5>
                              <div className="grid grid-cols-7 gap-2">
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Element Properties</h4>
                      
                      {/* Content Editor */}
                      {selectedElementData.type === 'text' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Text</label>
                            <input
                              type="text"
                              value={selectedElementData.content}
                              onChange={(e) => updateElementContent(selectedElementData.id, e.target.value)}
                              className="w-full bg-dark-light text-white rounded px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Size</label>
                              <input
                                type="range"
                                min="12"
                                max="72"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElementStyle(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FF6B9D'}
                                onChange={(e) => updateElementStyle(selectedElementData.id, { color: e.target.value })}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Transform Controls */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Layer</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => moveLayer(selectedElementData.id, 'up')}
                              className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              onClick={() => moveLayer(selectedElementData.id, 'down')}
                              className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => rotateElement(selectedElementData.id)}
                            className="flex-1 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <RotateCw size={16} />
                            <span className="text-sm">Rotate</span>
                          </button>
                          
                          <button
                            onClick={() => flipElement(selectedElementData.id, 'x')}
                            className="flex-1 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <FlipHorizontal size={16} />
                            <span className="text-sm">Flip H</span>
                          </button>
                          
                          <button
                            onClick={() => flipElement(selectedElementData.id, 'y')}
                            className="flex-1 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center space-x-1"
                          >
                            <FlipVertical size={16} />
                            <span className="text-sm">Flip V</span>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="w-full p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Delete Element</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Layers Panel */}
                  {elements.length > 0 && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Layers</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {[...elements]
                          .sort((a, b) => b.layer - a.layer)
                          .map((element) => (
                            <div
                              key={element.id}
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedElement === element.id
                                  ? 'bg-primary/20 border border-primary'
                                  : 'bg-dark-light hover:bg-gray-700'
                              }`}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              <div className="text-lg">
                                {element.type === 'text' && '📝'}
                                {element.type === 'emoji' && element.content}
                                {element.type === 'image' && '🖼️'}
                              </div>
                              <div className="flex-1">
                                <div className="text-white text-sm font-medium">
                                  {element.type === 'text' ? element.content.slice(0, 10) + '...' : 
                                   element.type === 'emoji' ? element.content :
                                   element.content}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  Layer {element.layer}
                                </div>
                              </div>
                            </div>
                          ))}
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
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Sticker Packs</h2>
                  <p className="text-gray-400">Discover and collect amazing sticker packs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stickerPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-dark-card rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">{pack.name}</h3>
                        {pack.owned ? (
                          <div className="flex items-center space-x-1 text-green-400">
                            <Crown size={16} />
                            <span className="text-sm">Owned</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-accent">
                            <Star size={16} />
                            <span className="text-sm">{pack.price} CP</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">{pack.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{pack.count} stickers</span>
                        
                        {pack.owned ? (
                          <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg cursor-default">
                            Owned
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (currentUser && currentUser.clownPoints >= pack.price) {
                                purchaseStickerPack(pack.id, currentUser.id);
                                toast.success(`${pack.name} purchased! 🎉`);
                              } else {
                                toast.error('Not enough ClownPoints! 💰');
                              }
                            }}
                            disabled={!currentUser || currentUser.clownPoints < pack.price}
                            className="px-4 py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          >
                            <ShoppingCart size={16} />
                            <span>Buy</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">My Collection</h2>
                    <p className="text-gray-400">Your created and collected stickers</p>
                  </div>
                  
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stickers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stickers
                    .filter(sticker => 
                      sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((sticker) => (
                      <div
                        key={sticker.id}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors group"
                      >
                        <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          <img
                            src={sticker.imageUrl}
                            alt={sticker.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <h4 className="text-white font-medium text-sm mb-1 truncate">{sticker.name}</h4>
                        <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sticker.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>

                {stickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-lg">No stickers yet</p>
                    <p className="text-sm">Create your first sticker to get started!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save Modal */}
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
                  <label className="block text-gray-300 text-sm mb-2">Save to Pack</label>
                  <select
                    value={selectedPackId}
                    onChange={(e) => setSelectedPackId(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a pack...</option>
                    {ownedPacks.map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.name} ({pack.count} stickers)
                      </option>
                    ))}
                    <option value="new">Create New Pack</option>
                  </select>
                </div>
                
                {(selectedPackId === 'new' || selectedPackId === '') && (
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">New Pack Name</label>
                    <input
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      placeholder="Enter pack name..."
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    />
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
    </div>
  );
};