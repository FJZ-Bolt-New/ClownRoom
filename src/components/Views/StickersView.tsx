import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Palette, 
  Download, 
  Share2, 
  Star, 
  Heart, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Type, 
  Smile, 
  Move, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Layers, 
  Save, 
  X, 
  Upload, 
  Minus, 
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown,
  Settings,
  MousePointer,
  Grid,
  Zap,
  Crown,
  ShoppingCart,
  Maximize2
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    updateStickerUsage, 
    updateUserPoints, 
    stickerPacks, 
    addStickerToPack, 
    purchaseStickerPack,
    currentUser 
  } = useStore();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'packs'>('create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Creator state
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'emoji' | 'image' | 'move'>('select');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 300, height: 300 });
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'sw' | 'ne' | 'nw' | null>(null);
  
  // Properties panel state
  const [showProperties, setShowProperties] = useState(true);
  const [stickerName, setStickerName] = useState('');
  const [stickerTags, setStickerTags] = useState<string[]>([]);
  
  // Text tool state
  const [textInput, setTextInput] = useState('');
  const [textStyle, setTextStyle] = useState({
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Arial',
    fontWeight: 'normal'
  });
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Image upload state
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Available emojis
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔'],
    'Objects': ['🎨', '🎭', '🎪', '🎯', '🎲', '🎮', '🎸', '🎤', '🎧', '📱', '💻', '🖥️', '⌨️', '🖱️'],
    'Symbols': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤', '✨', '⭐', '🌟', '💫']
  };
  
  // Font options
  const fontFamilies = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Comic Sans MS'];
  const fontWeights = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  
  // Common sticker tags
  const commonTags = ['funny', 'cute', 'cool', 'epic', 'meme', 'reaction', 'emoji', 'text', 'custom', 'art'];

  // Generate unique ID
  const generateId = () => `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! ✏️');
      return;
    }

    const newElement: StickerElement = {
      id: generateId(),
      type: 'text',
      content: textInput,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 12,
      width: 100,
      height: 24,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: { ...textStyle }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setTextInput('');
    setSelectedTool('select');
    toast.success('Text added! 📝');
  };

  // Add emoji element
  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: generateId(),
      type: 'emoji',
      content: emoji,
      x: canvasSize.width / 2 - 20,
      y: canvasSize.height / 2 - 20,
      width: 40,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length,
      style: { fontSize: 32 }
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setShowEmojiPicker(false);
    setSelectedTool('select');
    toast.success(`${emoji} added!`);
  };

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file! 🖼️');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image too large! Please use an image under 5MB 📏');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate size to fit in canvas while maintaining aspect ratio
        const maxSize = 120;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        const newElement: StickerElement = {
          id: generateId(),
          type: 'image',
          content: file.name,
          x: canvasSize.width / 2 - width / 2,
          y: canvasSize.height / 2 - height / 2,
          width,
          height,
          rotation: 0,
          flipX: false,
          flipY: false,
          layer: elements.length,
          imageData: e.target?.result as string
        };

        setElements([...elements, newElement]);
        setSelectedElement(newElement.id);
        setSelectedTool('select');
        toast.success('Image added! 🖼️');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [elements.length, canvasSize]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle drag and drop for file upload
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Enhanced mouse handlers for dragging and resizing
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedElement(elementId);
    
    // Check if clicking on resize handle
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const elementWidth = element.width * zoom;
    const elementHeight = element.height * zoom;
    
    // Resize handle detection (8px from edges)
    const handleSize = 8;
    const isNearRight = x >= elementWidth - handleSize;
    const isNearLeft = x <= handleSize;
    const isNearBottom = y >= elementHeight - handleSize;
    const isNearTop = y <= handleSize;
    
    if (isNearRight && isNearBottom) {
      setIsResizing(true);
      setResizeHandle('se');
    } else if (isNearLeft && isNearBottom) {
      setIsResizing(true);
      setResizeHandle('sw');
    } else if (isNearRight && isNearTop) {
      setIsResizing(true);
      setResizeHandle('ne');
    } else if (isNearLeft && isNearTop) {
      setIsResizing(true);
      setResizeHandle('nw');
    } else {
      // Start dragging
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset({ 
        x: e.clientX - (element.x * zoom), 
        y: e.clientY - (element.y * zoom) 
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectedElement) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(canvasSize.width - element.width, (e.clientX - dragOffset.x) / zoom));
      const newY = Math.max(0, Math.min(canvasSize.height - element.height, (e.clientY - dragOffset.y) / zoom));
      
      updateElement(selectedElement, { x: newX, y: newY });
    } else if (isResizing && resizeHandle) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      
      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;
      
      switch (resizeHandle) {
        case 'se':
          newWidth = Math.max(10, element.width + deltaX);
          newHeight = Math.max(10, element.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(10, element.width - deltaX);
          newHeight = Math.max(10, element.height + deltaY);
          newX = element.x + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(10, element.width + deltaX);
          newHeight = Math.max(10, element.height - deltaY);
          newY = element.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(10, element.width - deltaX);
          newHeight = Math.max(10, element.height - deltaY);
          newX = element.x + deltaX;
          newY = element.y + deltaY;
          break;
      }
      
      // Keep within canvas bounds
      newX = Math.max(0, Math.min(canvasSize.width - newWidth, newX));
      newY = Math.max(0, Math.min(canvasSize.height - newHeight, newY));
      newWidth = Math.min(newWidth, canvasSize.width - newX);
      newHeight = Math.min(newHeight, canvasSize.height - newY);
      
      updateElement(selectedElement, { 
        x: newX, 
        y: newY, 
        width: newWidth, 
        height: newHeight 
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, isResizing, selectedElement, elements, dragOffset, dragStart, resizeHandle, zoom, canvasSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

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

  // Move element layer
  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === id);
    if (!element) return;

    const newLayer = direction === 'up' ? element.layer + 1 : element.layer - 1;
    const maxLayer = Math.max(...elements.map(el => el.layer));
    
    if (newLayer < 0 || newLayer > maxLayer) return;

    // Swap layers
    const otherElement = elements.find(el => el.layer === newLayer);
    if (otherElement) {
      updateElement(otherElement.id, { layer: element.layer });
    }
    updateElement(id, { layer: newLayer });
    
    toast.success(`Layer moved ${direction}! 📚`);
  };

  // Get selected element
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Save sticker
  const saveSticker = async () => {
    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    try {
      // Create canvas for export
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort elements by layer
      const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

      // Draw each element
      for (const element of sortedElements) {
        ctx.save();
        
        // Apply transformations
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);

        if (element.type === 'text') {
          ctx.fillStyle = element.style?.color || '#FFFFFF';
          ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 24}px ${element.style?.fontFamily || 'Arial'}`;
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
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
              resolve(void 0);
            };
            img.src = element.imageData!;
          });
        }
        
        ctx.restore();
      }

      // Convert to data URL
      const imageUrl = canvas.toDataURL('image/png');

      // Create sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName,
        imageUrl,
        tags: stickerTags,
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements // Store element data for future editing
      };

      // Add to default pack
      addStickerToPack(newSticker, 'pack-default');
      updateUserPoints(20);

      // Reset creator
      setElements([]);
      setSelectedElement(null);
      setStickerName('');
      setStickerTags([]);
      setShowCreateModal(false);

      toast.success('Sticker created successfully! 🎉 (+20 CP)');
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again 😞');
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    toast.success('Canvas cleared! 🧹');
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setStickerTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Get cursor style based on position
  const getCursorStyle = (element: StickerElement, x: number, y: number) => {
    const handleSize = 8;
    const elementWidth = element.width * zoom;
    const elementHeight = element.height * zoom;
    
    const isNearRight = x >= elementWidth - handleSize;
    const isNearLeft = x <= handleSize;
    const isNearBottom = y >= elementHeight - handleSize;
    const isNearTop = y <= handleSize;
    
    if ((isNearRight && isNearBottom) || (isNearLeft && isNearTop)) return 'nw-resize';
    if ((isNearLeft && isNearBottom) || (isNearRight && isNearTop)) return 'ne-resize';
    
    return 'move';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🎭</div>
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
              <h1 className="text-xl font-bold font-sketch">🎨 STICKER LAB 🎨</h1>
              <div className="absolute -top-1 -right-1 text-sm opacity-70 animate-bounce-doodle">✨</div>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Palette },
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Tool Selection */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 font-sketch">🛠️ Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'select', icon: MousePointer, label: 'Select' },
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'emoji', icon: Smile, label: 'Emoji' },
                        { id: 'image', icon: ImageIcon, label: 'Image' },
                      ].map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setSelectedTool(tool.id as any)}
                            className={`p-3 rounded-lg border-2 transition-all doodle-btn ${
                              selectedTool === tool.id
                                ? 'border-secondary bg-secondary/20 text-secondary'
                                : 'border-gray-700 bg-dark-light text-gray-400 hover:text-white hover:border-gray-600'
                            }`}
                          >
                            <Icon size={20} className="mx-auto mb-1" />
                            <div className="text-xs font-hand">{tool.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tool Options */}
                  <AnimatePresence mode="wait">
                    {selectedTool === 'text' && (
                      <motion.div
                        key="text-options"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800"
                      >
                        <h4 className="text-white font-bold mb-3 font-sketch">📝 Text Options</h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Enter text..."
                            className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none font-hand"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Size</label>
                              <input
                                type="range"
                                min="12"
                                max="72"
                                value={textStyle.fontSize}
                                onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                className="w-full"
                              />
                              <div className="text-xs text-gray-400 text-center">{textStyle.fontSize}px</div>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={textStyle.color}
                                onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>
                          </div>
                          
                          <select
                            value={textStyle.fontFamily}
                            onChange={(e) => setTextStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none text-sm"
                          >
                            {fontFamilies.map(font => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                          
                          <button
                            onClick={addTextElement}
                            disabled={!textInput.trim()}
                            className="w-full bg-secondary text-white rounded-lg py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn"
                          >
                            Add Text
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {selectedTool === 'emoji' && (
                      <motion.div
                        key="emoji-options"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800"
                      >
                        <h4 className="text-white font-bold mb-3 font-sketch">😀 Emoji Picker</h4>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <div key={category}>
                              <h5 className="text-xs text-gray-400 font-hand mb-2">{category}</h5>
                              <div className="grid grid-cols-6 gap-1">
                                {emojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => addEmojiElement(emoji)}
                                    className="p-2 text-xl hover:bg-gray-700 rounded-lg transition-colors doodle-btn"
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

                    {selectedTool === 'image' && (
                      <motion.div
                        key="image-options"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800"
                      >
                        <h4 className="text-white font-bold mb-3 font-sketch">🖼️ Image Upload</h4>
                        
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                            dragOver 
                              ? 'border-secondary bg-secondary/10' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-400 text-sm mb-3 font-hand">
                            Drag & drop an image or click to upload
                          </p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors doodle-btn"
                          >
                            Choose File
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2 font-hand">
                          Supported: JPG, PNG, GIF (max 5MB)
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Canvas Controls */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3 font-sketch">⚙️ Canvas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm font-hand">Grid</span>
                        <button
                          onClick={() => setShowGrid(!showGrid)}
                          className={`p-1 rounded transition-colors ${
                            showGrid ? 'text-secondary' : 'text-gray-400'
                          }`}
                        >
                          {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Zoom</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-400 text-center">{Math.round(zoom * 100)}%</div>
                      </div>
                      
                      <button
                        onClick={clearCanvas}
                        className="w-full bg-red-500/20 text-red-400 rounded-lg py-2 font-semibold hover:bg-red-500/30 transition-colors doodle-btn"
                      >
                        Clear Canvas
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold font-sketch">🎨 Canvas</h3>
                      <div className="text-sm text-gray-400 font-hand">
                        {canvasSize.width} × {canvasSize.height}px
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <div
                        ref={canvasRef}
                        className="relative bg-white rounded-lg border-2 border-gray-300 overflow-hidden select-none"
                        style={{
                          width: canvasSize.width * zoom,
                          height: canvasSize.height * zoom,
                          backgroundImage: showGrid 
                            ? 'radial-gradient(circle, #ddd 1px, transparent 1px)'
                            : 'none',
                          backgroundSize: showGrid ? `${20 * zoom}px ${20 * zoom}px` : 'auto'
                        }}
                        onClick={() => setSelectedElement(null)}
                      >
                        {/* Render elements */}
                        {elements
                          .sort((a, b) => a.layer - b.layer)
                          .map((element) => (
                            <div
                              key={element.id}
                              className={`absolute transition-all user-select-none ${
                                selectedElement === element.id 
                                  ? 'ring-2 ring-secondary ring-offset-2 ring-offset-white' 
                                  : 'hover:ring-1 hover:ring-gray-400'
                              }`}
                              style={{
                                left: element.x * zoom,
                                top: element.y * zoom,
                                width: element.width * zoom,
                                height: element.height * zoom,
                                transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                                zIndex: element.layer,
                                cursor: isDragging || isResizing ? 'grabbing' : 'grab'
                              }}
                              onMouseDown={(e) => handleMouseDown(e, element.id)}
                            >
                              {element.type === 'text' && (
                                <div
                                  className="w-full h-full flex items-center justify-center text-center break-words pointer-events-none"
                                  style={{
                                    fontSize: (element.style?.fontSize || 24) * zoom,
                                    color: element.style?.color || '#000000',
                                    fontFamily: element.style?.fontFamily || 'Arial',
                                    fontWeight: element.style?.fontWeight || 'normal'
                                  }}
                                >
                                  {element.content}
                                </div>
                              )}
                              
                              {element.type === 'emoji' && (
                                <div
                                  className="w-full h-full flex items-center justify-center pointer-events-none"
                                  style={{
                                    fontSize: (element.style?.fontSize || 32) * zoom
                                  }}
                                >
                                  {element.content}
                                </div>
                              )}
                              
                              {element.type === 'image' && element.imageData && (
                                <img
                                  src={element.imageData}
                                  alt={element.content}
                                  className="w-full h-full object-cover pointer-events-none"
                                  draggable={false}
                                />
                              )}

                              {/* Resize handles for selected element */}
                              {selectedElement === element.id && (
                                <>
                                  {/* Corner resize handles */}
                                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary border border-white rounded-full cursor-nw-resize" />
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary border border-white rounded-full cursor-ne-resize" />
                                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-secondary border border-white rounded-full cursor-sw-resize" />
                                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary border border-white rounded-full cursor-se-resize" />
                                </>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Canvas Instructions */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-400 font-hand">
                        💡 <strong>Drag</strong> to move • <strong>Corner handles</strong> to resize • <strong>Click outside</strong> to deselect
                      </p>
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold font-sketch">🎛️ Properties</h4>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
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
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 1 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
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
                        
                        {/* Transform buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`p-2 rounded border transition-all ${
                              selectedElementData.flipX 
                                ? 'border-secondary text-secondary' 
                                : 'border-gray-700 text-gray-400 hover:text-white'
                            }`}
                          >
                            <FlipHorizontal size={16} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`p-2 rounded border transition-all ${
                              selectedElementData.flipY 
                                ? 'border-secondary text-secondary' 
                                : 'border-gray-700 text-gray-400 hover:text-white'
                            }`}
                          >
                            <FlipVertical size={16} className="mx-auto" />
                          </button>
                        </div>
                        
                        {/* Layer controls */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Layer {selectedElementData.layer}</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => moveLayer(selectedElementData.id, 'up')}
                              className="flex-1 p-2 bg-dark-light text-gray-400 rounded hover:text-white transition-colors"
                            >
                              <ChevronUp size={16} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => moveLayer(selectedElementData.id, 'down')}
                              className="flex-1 p-2 bg-dark-light text-gray-400 rounded hover:text-white transition-colors"
                            >
                              <ChevronDown size={16} className="mx-auto" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                              <input
                                type="range"
                                min="8"
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
                                value={selectedElementData.style?.color || '#FFFFFF'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Layers Panel */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3 font-sketch">📚 Layers</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {elements
                        .sort((a, b) => b.layer - a.layer)
                        .map((element) => (
                          <div
                            key={element.id}
                            className={`p-2 rounded border cursor-pointer transition-all ${
                              selectedElement === element.id
                                ? 'border-secondary bg-secondary/20'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedElement(element.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="text-sm">
                                  {element.type === 'text' && '📝'}
                                  {element.type === 'emoji' && element.content}
                                  {element.type === 'image' && '🖼️'}
                                </div>
                                <span className="text-xs text-gray-400 font-hand">
                                  {element.type === 'text' ? element.content.slice(0, 10) + (element.content.length > 10 ? '...' : '') : element.type}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">L{element.layer}</span>
                            </div>
                          </div>
                        ))}
                      
                      {elements.length === 0 && (
                        <div className="text-center py-4 text-gray-400">
                          <Layers size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-xs font-hand">No elements yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Save Panel */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3 font-sketch">💾 Save Sticker</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={stickerName}
                        onChange={(e) => setStickerName(e.target.value)}
                        placeholder="Sticker name..."
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none font-hand"
                      />
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-1">
                          {commonTags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={`px-2 py-1 rounded text-xs transition-all ${
                                stickerTags.includes(tag)
                                  ? 'bg-secondary text-white'
                                  : 'bg-gray-700 text-gray-400 hover:text-white'
                              }`}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={saveSticker}
                        disabled={!stickerName.trim() || elements.length === 0}
                        className="w-full bg-gradient-to-r from-secondary to-primary text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Save size={16} />
                          <span>Save Sticker</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* My Stickers */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-4 font-sketch">🎨 My Stickers</h3>
                  
                  {stickers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Palette size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="font-hand">No stickers created yet. Start creating! 🎨</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {stickers.map((sticker) => (
                        <motion.div
                          key={sticker.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-dark-light rounded-lg p-3 border border-gray-700 hover:border-secondary transition-all group"
                        >
                          <div className="aspect-square bg-white rounded-lg mb-2 overflow-hidden">
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="text-white text-sm font-semibold truncate font-hand">{sticker.name}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-1">
                              {sticker.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-xs bg-gray-700 text-gray-300 px-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{sticker.usageCount} uses</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stickerPacks.map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold font-sketch">{pack.name}</h3>
                        {pack.owned ? (
                          <div className="text-green-400 text-sm font-hand">✓ Owned</div>
                        ) : (
                          <div className="flex items-center space-x-1 text-accent">
                            <Crown size={14} />
                            <span className="text-sm font-bold">{pack.price}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 font-hand">{pack.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm font-hand">{pack.count} stickers</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          pack.category === 'roast' ? 'bg-red-500/20 text-red-400' :
                          pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                          pack.category === 'cursed' ? 'bg-purple-500/20 text-purple-400' :
                          pack.category === 'meme' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {pack.category}
                        </span>
                      </div>
                      
                      {!pack.owned && (
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
                          className="w-full bg-accent text-dark rounded-lg py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn"
                        >
                          Purchase Pack
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};