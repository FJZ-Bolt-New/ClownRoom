import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Image, 
  Type, 
  Smile, 
  Download, 
  Share2, 
  Trash2, 
  RotateCcw, 
  Save,
  Upload,
  Palette,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  Grid,
  Search,
  Filter,
  Star,
  Heart,
  ShoppingCart,
  Crown,
  X,
  Play,
  Pause
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateStickerUsage, 
    stickerPacks, 
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
  const [resizeStartData, setResizeStartData] = useState<{ x: number; y: number; width: number; height: number; mouseX: number; mouseY: number } | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'packs'>('create');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPack, setSelectedPack] = useState<string>('all');
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '🤣', '😊', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
    'Food': ['🍎', '🍌', '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁'],
    'Objects': ['⚽', '🏀', '🎮', '🎯', '🎪', '🎨', '🎭', '🎪', '🚀', '💎', '⭐', '🔥'],
  };

  // Get available stickers for browsing
  const getAvailableStickers = () => {
    let filteredStickers = stickers;
    
    if (selectedPack !== 'all') {
      const pack = stickerPacks.find(p => p.id === selectedPack);
      filteredStickers = pack?.stickers || [];
    }
    
    if (searchTerm) {
      filteredStickers = filteredStickers.filter(sticker =>
        sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filteredStickers;
  };

  // Add element to canvas
  const addElement = useCallback((type: StickerElement['type'], content: string, imageData?: string) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: type === 'text' ? 100 : 80,
      height: type === 'text' ? 40 : 80,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: currentLayer,
      style: type === 'text' ? {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      } : undefined,
      imageData
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! 🎨`);
  }, [currentLayer]);

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    addElement('emoji', emoji);
    setShowEmojiPicker(false);
  };

  // Handle text addition
  const handleAddText = () => {
    if (newText.trim()) {
      addElement('text', newText.trim());
      setNewText('');
      setShowTextInput(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        addElement('image', file.name, imageData);
      };
      reader.readAsDataURL(file);
      setShowImageUpload(false);
    }
  };

  // FIXED: Enhanced mouse event handlers for proper resize functionality
  const handleMouseDown = (e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedElement(elementId);
    
    if (action === 'drag') {
      setDraggedElement(elementId);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - element.x,
          y: e.clientY - rect.top - element.y
        });
      }
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || 'se');
      
      // Store initial resize data
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setResizeStartData({
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          mouseX: e.clientX - rect.left,
          mouseY: e.clientY - rect.top
        });
      }
    }
  };

  // FIXED: Enhanced mouse move handler with proper resize logic
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        setElements(prev => prev.map(el =>
          el.id === draggedElement
            ? { ...el, x: Math.max(0, Math.min(newX, 400 - el.width)), y: Math.max(0, Math.min(newY, 400 - el.height)) }
            : el
        ));
      }
    } else if (isResizing && selectedElement && resizeStartData) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const currentMouseX = e.clientX - rect.left;
        const currentMouseY = e.clientY - rect.top;
        
        // Calculate the difference from start position
        const deltaX = currentMouseX - resizeStartData.mouseX;
        const deltaY = currentMouseY - resizeStartData.mouseY;
        
        let newX = resizeStartData.x;
        let newY = resizeStartData.y;
        let newWidth = resizeStartData.width;
        let newHeight = resizeStartData.height;
        
        // Handle different resize handles
        switch (resizeHandle) {
          case 'se': // Southeast (bottom-right)
            newWidth = Math.max(20, resizeStartData.width + deltaX);
            newHeight = Math.max(20, resizeStartData.height + deltaY);
            break;
          case 'sw': // Southwest (bottom-left)
            newWidth = Math.max(20, resizeStartData.width - deltaX);
            newHeight = Math.max(20, resizeStartData.height + deltaY);
            newX = resizeStartData.x + deltaX;
            // Prevent going beyond left edge
            if (newX < 0) {
              newWidth += newX;
              newX = 0;
            }
            break;
          case 'ne': // Northeast (top-right)
            newWidth = Math.max(20, resizeStartData.width + deltaX);
            newHeight = Math.max(20, resizeStartData.height - deltaY);
            newY = resizeStartData.y + deltaY;
            // Prevent going beyond top edge
            if (newY < 0) {
              newHeight += newY;
              newY = 0;
            }
            break;
          case 'nw': // Northwest (top-left)
            newWidth = Math.max(20, resizeStartData.width - deltaX);
            newHeight = Math.max(20, resizeStartData.height - deltaY);
            newX = resizeStartData.x + deltaX;
            newY = resizeStartData.y + deltaY;
            // Prevent going beyond edges
            if (newX < 0) {
              newWidth += newX;
              newX = 0;
            }
            if (newY < 0) {
              newHeight += newY;
              newY = 0;
            }
            break;
        }
        
        // Ensure element stays within canvas bounds
        newX = Math.max(0, Math.min(newX, 400 - newWidth));
        newY = Math.max(0, Math.min(newY, 400 - newHeight));
        newWidth = Math.min(newWidth, 400 - newX);
        newHeight = Math.min(newHeight, 400 - newY);
        
        setElements(prev => prev.map(el =>
          el.id === selectedElement
            ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
            : el
        ));
      }
    }
  }, [draggedElement, isResizing, selectedElement, dragOffset, resizeHandle, resizeStartData]);

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStartData(null);
  }, []);

  // Add event listeners
  React.useEffect(() => {
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

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! ✨');
  };

  // Layer management
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const maxLayer = Math.max(...elements.map(el => el.layer));
    const minLayer = Math.min(...elements.map(el => el.layer));
    
    let newLayer = element.layer;
    if (direction === 'up' && element.layer < maxLayer) {
      newLayer = element.layer + 1;
    } else if (direction === 'down' && element.layer > minLayer) {
      newLayer = element.layer - 1;
    }
    
    // Swap layers if needed
    const elementAtTargetLayer = elements.find(el => el.layer === newLayer);
    if (elementAtTargetLayer) {
      updateElement(elementAtTargetLayer.id, { layer: element.layer });
    }
    
    updateElement(elementId, { layer: newLayer });
    toast.success(`Layer ${direction === 'up' ? 'moved up' : 'moved down'}! 📚`);
  };

  // Get sorted elements by layer
  const getSortedElements = () => {
    return [...elements].sort((a, b) => a.layer - b.layer);
  };

  // FIXED: Save sticker function - saves to pack and clears canvas
  const saveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    try {
      // Generate a unique sticker name
      const stickerName = `Sticker ${Date.now()}`;
      
      // Create the sticker object with current canvas elements
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName,
        imageUrl: `data:image/svg+xml;base64,${btoa('<svg>sticker</svg>')}`, // Placeholder
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        packId: 'pack-default', // Save to "My Stickers" pack
        elementData: [...elements] // Save all current elements
      };

      // Add sticker to the store
      addSticker(newSticker);
      
      // Add to the default "My Stickers" pack
      addStickerToPack(newSticker, 'pack-default');
      
      // Award points
      updateUserPoints(20);
      
      // Show success message
      toast.success('Sticker saved successfully! 🎉 (+20 CP)', {
        duration: 4000,
        icon: '🎨',
      });
      
      // Clear the canvas for new creation
      clearCanvas();
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😞');
    }
  };

  // Download sticker
  const downloadSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to download! 🎨');
      return;
    }
    
    // Create a canvas element to render the sticker
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      
      // Render elements (simplified version)
      getSortedElements().forEach(element => {
        ctx.save();
        ctx.translate(element.x + element.width/2, element.y + element.height/2);
        ctx.rotate(element.rotation * Math.PI / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);
        
        if (element.type === 'text') {
          ctx.fillStyle = element.style?.color || '#000000';
          ctx.font = `${element.style?.fontSize || 24}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          ctx.font = `${element.height}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(element.content, 0, 0);
        }
        
        ctx.restore();
      });
      
      // Download
      const link = document.createElement('a');
      link.download = `sticker-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Sticker downloaded! 📥');
    }
  };

  // Share sticker
  const shareSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to share! 🎨');
      return;
    }
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out my sticker!',
        text: 'I created this awesome sticker in ClownRoom! 🎨',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard! 📋');
    }
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
    toast.success(`${pack.name} pack purchased! 🎉 (-${pack.price} CP)`);
  };

  // Use sticker (add to canvas)
  const useSticker = (sticker: Sticker) => {
    if (sticker.elementData && sticker.elementData.length > 0) {
      // Add all elements from the saved sticker to canvas
      const newElements = sticker.elementData.map(element => ({
        ...element,
        id: `element-${Date.now()}-${Math.random()}`, // New unique ID
        x: element.x + Math.random() * 50, // Slight offset
        y: element.y + Math.random() * 50,
      }));
      
      setElements(prev => [...prev, ...newElements]);
      updateStickerUsage(sticker.id);
      toast.success(`${sticker.name} added to canvas! 🎨`);
    } else {
      // Fallback for stickers without element data
      addElement('emoji', '🎨');
      toast.success(`${sticker.name} added! 🎨`);
    }
    
    setPreviewSticker(null);
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark relative overflow-hidden">
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
              { id: 'browse', label: 'Browse', icon: Grid },
              { id: 'packs', label: 'Packs', icon: ShoppingCart },
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
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={saveSticker}
                          className="px-4 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg hover:from-secondary/90 hover:to-blue-500/90 transition-all flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={downloadSticker}
                          className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={shareSticker}
                          className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden cursor-crosshair"
                      onClick={() => setSelectedElement(null)}
                    >
                      {getSortedElements().map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move select-none ${
                            selectedElement === element.id ? 'ring-2 ring-secondary' : ''
                          }`}
                          style={{
                            left: element.x,
                            top: element.y,
                            width: element.width,
                            height: element.height,
                            transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                            zIndex: element.layer,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedElement(element.id);
                          }}
                          onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                        >
                          {element.type === 'text' && (
                            <div
                              className="w-full h-full flex items-center justify-center text-center break-words"
                              style={{
                                fontSize: element.style?.fontSize,
                                color: element.style?.color,
                                fontFamily: element.style?.fontFamily,
                                fontWeight: element.style?.fontWeight,
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
                          
                          {element.type === 'image' && element.imageData && (
                            <img
                              src={element.imageData}
                              alt={element.content}
                              className="w-full h-full object-cover rounded"
                              draggable={false}
                            />
                          )}
                          
                          {/* FIXED: Enhanced resize handles with proper cursors and positioning */}
                          {selectedElement === element.id && (
                            <>
                              {/* Southeast handle (bottom-right) */}
                              <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full cursor-se-resize border-2 border-white shadow-lg hover:bg-secondary/80 transition-colors"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'se')}
                              />
                              {/* Northeast handle (top-right) */}
                              <div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full cursor-ne-resize border-2 border-white shadow-lg hover:bg-secondary/80 transition-colors"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'ne')}
                              />
                              {/* Southwest handle (bottom-left) */}
                              <div
                                className="absolute -bottom-1 -left-1 w-4 h-4 bg-secondary rounded-full cursor-sw-resize border-2 border-white shadow-lg hover:bg-secondary/80 transition-colors"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'sw')}
                              />
                              {/* Northwest handle (top-left) */}
                              <div
                                className="absolute -top-1 -left-1 w-4 h-4 bg-secondary rounded-full cursor-nw-resize border-2 border-white shadow-lg hover:bg-secondary/80 transition-colors"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'nw')}
                              />
                            </>
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Palette size={48} className="mx-auto mb-2 opacity-50" />
                            <p>Start creating your sticker!</p>
                            <p className="text-sm">Add text, emojis, or images</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3">Add Elements</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setShowTextInput(true)}
                        className="p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex flex-col items-center space-y-1"
                      >
                        <Type size={20} />
                        <span className="text-xs">Text</span>
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(true)}
                        className="p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex flex-col items-center space-y-1"
                      >
                        <Smile size={20} />
                        <span className="text-xs">Emoji</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors flex flex-col items-center space-y-1"
                      >
                        <Image size={20} />
                        <span className="text-xs">Image</span>
                      </button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Layer Management */}
                  {elements.length > 0 && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
                        <Layers size={16} />
                        <span>Layers</span>
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {getSortedElements().reverse().map((element, index) => (
                          <div
                            key={element.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              selectedElement === element.id
                                ? 'bg-secondary/20 border border-secondary'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">L{element.layer}</span>
                              <span className="text-white text-sm truncate">
                                {element.type === 'text' ? element.content : 
                                 element.type === 'emoji' ? element.content :
                                 element.content}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayer(element.id, 'up');
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayer(element.id, 'down');
                                }}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-bold mb-3">Properties</h4>
                      
                      <div className="space-y-3">
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
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
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 20 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 20 })}
                              className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
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
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-400 text-center">{selectedElementData.rotation}°</div>
                        </div>

                        {/* Text Properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
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
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#ffffff'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 rounded"
                              />
                            </div>
                          </>
                        )}

                        {/* Transform Controls */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 p-2 rounded text-xs transition-colors ${
                              selectedElementData.flipX ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <FlipHorizontal size={14} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 p-2 rounded text-xs transition-colors ${
                              selectedElementData.flipY ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <FlipVertical size={14} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => deleteElement(selectedElementData.id)}
                            className="flex-1 p-2 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 size={14} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Search and Filter */}
                <div className="flex space-x-4 max-w-md mx-auto">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stickers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <select
                    value={selectedPack}
                    onChange={(e) => setSelectedPack(e.target.value)}
                    className="bg-dark-card text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  >
                    <option value="all">All Packs</option>
                    {stickerPacks.filter(pack => pack.owned).map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        {pack.name} ({pack.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {getAvailableStickers().map((sticker) => (
                    <motion.div
                      key={sticker.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-secondary transition-colors cursor-pointer group"
                      onClick={() => setPreviewSticker(sticker)}
                    >
                      <div className="aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-2xl">
                        🎨
                      </div>
                      <h4 className="text-white font-semibold text-sm truncate">{sticker.name}</h4>
                      <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sticker.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-1 py-0.5 bg-secondary/20 text-secondary rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {getAvailableStickers().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Grid size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No stickers found. Create some first! 🎨</p>
                  </div>
                )}
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
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-card rounded-xl p-4 border border-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{pack.name}</h3>
                      {pack.owned ? (
                        <Crown size={20} className="text-accent" />
                      ) : (
                        <div className="flex items-center space-x-1 text-accent">
                          <Star size={16} />
                          <span className="font-bold">{pack.price}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300 text-sm">{pack.count} stickers</span>
                      <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                        {pack.category}
                      </span>
                    </div>
                    
                    {pack.owned ? (
                      <button
                        onClick={() => setSelectedPack(pack.id)}
                        className="w-full py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        View Stickers
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchasePack(pack.id)}
                        disabled={!currentUser || currentUser.clownPoints < pack.price}
                        className="w-full py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        Purchase for {pack.price} CP
                      </button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Text Input Modal */}
      <AnimatePresence>
        {showTextInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTextInput(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-bold mb-4">Add Text</h3>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter your text..."
                className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTextInput(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddText}
                  disabled={!newText.trim()}
                  className="flex-1 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Text
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Modal */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmojiPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-xl p-6 w-full max-w-md max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Choose Emoji</h3>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category}>
                    <h4 className="text-gray-300 font-semibold mb-2">{category}</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiSelect(emoji)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker Preview Modal */}
      <AnimatePresence>
        {previewSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewSticker(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center text-4xl">
                  🎨
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{previewSticker.name}</h3>
                <p className="text-gray-400 text-sm mb-4">Used {previewSticker.usageCount} times</p>
                
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {previewSticker.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setPreviewSticker(null)}
                    className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => useSticker(previewSticker)}
                    className="flex-1 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    Use Sticker
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};