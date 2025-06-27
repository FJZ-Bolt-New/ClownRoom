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
  Trash2, 
  RotateCcw, 
  Save,
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
  Layers,
  Package,
  Check
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
    addStickerPack,
    addStickerToPack,
    updateStickerPack
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
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'packs'>('create');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  
  // Save modal state
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [createNewPack, setCreateNewPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    'Food': ['🍎', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🍪', '🍩'],
    'Objects': ['⚽', '🎮', '🎸', '🎨', '📱', '💻', '🚗', '✈️', '🚀', '⭐'],
  };

  // Generate auto sticker name
  const generateStickerName = () => {
    const adjectives = ['Epic', 'Crazy', 'Wild', 'Awesome', 'Cool', 'Funky', 'Rad', 'Sick'];
    const nouns = ['Sticker', 'Creation', 'Art', 'Masterpiece', 'Design', 'Chaos'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun} ${Date.now().toString().slice(-4)}`;
  };

  // Initialize save modal
  useEffect(() => {
    if (showSaveModal && !stickerName) {
      setStickerName(generateStickerName());
    }
  }, [showSaveModal]);

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast.error('Enter some text first! ✏️');
      return;
    }

    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      width: 100,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: {
        fontSize: 24,
        color: '#FF6B9D',
        fontFamily: 'Kalam',
        fontWeight: 'bold',
      },
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    setTextInput('');
    setShowTextInput(false);
    toast.success('Text added! 📝');
  };

  // Add emoji element
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
      layer: elements.length + 1,
      style: {
        fontSize: 48,
      },
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    setShowEmojiPicker(false);
    toast.success(`${emoji} added!`);
  };

  // Handle image upload
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
        width: 150,
        height: 150,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: elements.length + 1,
        imageData,
      };

      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setCurrentLayer(newElement.layer);
      setShowImageUpload(false);
      toast.success('Image added! 🖼️');
    };

    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Handle element click
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setCurrentLayer(element.layer);
    }
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Mouse down handler for dragging and resizing
  const handleMouseDown = (elementId: string, event: React.MouseEvent, handle?: string) => {
    event.stopPropagation();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
      setSelectedElement(elementId);
    } else {
      setDraggedElement(elementId);
      setSelectedElement(elementId);
      
      const element = elements.find(el => el.id === elementId);
      if (element && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDragOffset({
          x: event.clientX - rect.left - element.x,
          y: event.clientY - rect.top - element.y,
        });
      }
    }
  };

  // Mouse move handler
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (draggedElement) {
      const newX = Math.max(0, Math.min(300 - 50, mouseX - dragOffset.x));
      const newY = Math.max(0, Math.min(300 - 50, mouseY - dragOffset.y));

      setElements(elements.map(el =>
        el.id === draggedElement
          ? { ...el, x: newX, y: newY }
          : el
      ));
    } else if (isResizing && selectedElement && resizeHandle) {
      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      let newWidth = element.width;
      let newHeight = element.height;

      if (resizeHandle.includes('right')) {
        newWidth = Math.max(20, mouseX - element.x);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(20, mouseY - element.y);
      }
      if (resizeHandle.includes('left')) {
        const newX = Math.max(0, mouseX);
        newWidth = Math.max(20, element.x + element.width - newX);
        if (newX !== element.x) {
          setElements(elements.map(el =>
            el.id === selectedElement
              ? { ...el, x: newX, width: newWidth }
              : el
          ));
          return;
        }
      }
      if (resizeHandle.includes('top')) {
        const newY = Math.max(0, mouseY);
        newHeight = Math.max(20, element.y + element.height - newY);
        if (newY !== element.y) {
          setElements(elements.map(el =>
            el.id === selectedElement
              ? { ...el, y: newY, height: newHeight }
              : el
          ));
          return;
        }
      }

      setElements(elements.map(el =>
        el.id === selectedElement
          ? { ...el, width: newWidth, height: newHeight }
          : el
      ));
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Update element property
  const updateElementProperty = (elementId: string, property: string, value: any) => {
    setElements(elements.map(el =>
      el.id === elementId
        ? property.includes('.')
          ? {
              ...el,
              style: {
                ...el.style,
                [property.split('.')[1]]: value
              }
            }
          : { ...el, [property]: value }
        : el
    ));
  };

  // Layer management
  const moveLayer = (direction: 'up' | 'down') => {
    if (!selectedElement) return;

    const maxLayers = elements.length;
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;

    const currentLayerNum = element.layer;
    let newLayer: number;

    if (direction === 'up') {
      newLayer = Math.min(maxLayers, currentLayerNum + 1);
    } else {
      newLayer = Math.max(1, currentLayerNum - 1);
    }

    if (newLayer === currentLayerNum) return;

    // Find element at target layer and swap
    const targetElement = elements.find(el => el.layer === newLayer);
    
    setElements(elements.map(el => {
      if (el.id === selectedElement) {
        return { ...el, layer: newLayer };
      } else if (targetElement && el.id === targetElement.id) {
        return { ...el, layer: currentLayerNum };
      }
      return el;
    }));

    setCurrentLayer(newLayer);
    toast.success(`Moved to layer ${newLayer}! 📚`);
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // FIXED: Functional save sticker
  const saveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (createNewPack && !newPackName.trim()) {
      toast.error('Please enter a pack name! 📦');
      return;
    }

    try {
      // Generate sticker preview image
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, 300, 300);

      // Sort elements by layer for proper rendering
      const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

      // Render each element
      for (const element of sortedElements) {
        ctx.save();
        
        // Apply transformations
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);

        if (element.type === 'text') {
          // Render text
          ctx.font = `${element.style?.fontWeight || 'bold'} ${element.style?.fontSize || 24}px ${element.style?.fontFamily || 'Kalam'}`;
          ctx.fillStyle = element.style?.color || '#FF6B9D';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          // Render emoji
          ctx.font = `${element.style?.fontSize || 48}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'image' && element.imageData) {
          // Render image
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = element.imageData!;
          });
          
          ctx.drawImage(
            img,
            -element.width / 2,
            -element.height / 2,
            element.width,
            element.height
          );
        }
        
        ctx.restore();
      }

      // Convert canvas to data URL
      const imageUrl = canvas.toDataURL('image/png');

      // Create sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl,
        tags: ['custom', 'user-created'],
        createdBy: 'user-1',
        usageCount: 0,
        elementData: elements, // Store element data for editing
      };

      // Handle pack creation or selection
      let targetPackId = selectedPackId;

      if (createNewPack) {
        // Create new pack
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName.trim(),
          description: newPackDescription.trim() || 'Custom sticker pack',
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: 'user-1',
          createdAt: new Date(),
        };

        addStickerPack(newPack);
        targetPackId = newPack.id;
        toast.success(`New pack "${newPack.name}" created! 📦`);
      }

      // Add sticker to the target pack
      addStickerToPack(newSticker, targetPackId);

      // Update user points
      updateUserPoints(20);

      // Reset save modal state
      setShowSaveModal(false);
      setStickerName('');
      setSelectedPackId('pack-default');
      setCreateNewPack(false);
      setNewPackName('');
      setNewPackDescription('');

      // Success message
      const packName = createNewPack ? newPackName : stickerPacks.find(p => p.id === targetPackId)?.name || 'Unknown Pack';
      toast.success(`Sticker "${newSticker.name}" saved to "${packName}"! 🎨✨ (+20 CP)`);

    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😅');
    }
  };

  // Download sticker
  const downloadSticker = (sticker: Sticker) => {
    const link = document.createElement('a');
    link.download = `${sticker.name}.png`;
    link.href = sticker.imageUrl;
    link.click();
    toast.success(`${sticker.name} downloaded! 💾`);
  };

  // Share sticker
  const shareSticker = (sticker: Sticker) => {
    if (navigator.share) {
      navigator.share({
        title: sticker.name,
        text: `Check out my sticker: ${sticker.name}`,
        url: sticker.imageUrl,
      });
    } else {
      navigator.clipboard.writeText(sticker.imageUrl);
      toast.success('Sticker link copied to clipboard! 📋');
    }
  };

  // Preview sticker
  const previewStickerFunc = (sticker: Sticker) => {
    setPreviewSticker(sticker);
    setShowPreviewModal(true);
  };

  // Get sorted elements for rendering
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Get owned sticker packs
  const ownedPacks = stickerPacks.filter(pack => pack.owned);

  // Get all user stickers
  const userStickers = stickerPacks
    .filter(pack => pack.owned)
    .flatMap(pack => pack.stickers)
    .filter(sticker => sticker.createdBy === 'user-1');

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
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
              { id: 'packs', label: 'Packs', icon: Package },
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Sticker Canvas</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <Save size={14} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-400 transition-colors flex items-center space-x-1"
                        >
                          <RotateCcw size={14} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div
                      ref={canvasRef}
                      className="relative w-full h-80 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
                      onClick={handleCanvasClick}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Grid Pattern */}
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

                      {/* Elements */}
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
                          onClick={(e) => handleElementClick(element.id, e)}
                          onMouseDown={(e) => handleMouseDown(element.id, e)}
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
                              style={{ fontSize: element.style?.fontSize }}
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

                          {/* Resize Handles */}
                          {selectedElement === element.id && (
                            <>
                              {/* Corner handles */}
                              <div
                                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'top-left')}
                              />
                              <div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'top-right')}
                              />
                              <div
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'bottom-left')}
                              />
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'bottom-right')}
                              />
                              
                              {/* Edge handles */}
                              <div
                                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-n-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'top')}
                              />
                              <div
                                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full cursor-s-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'bottom')}
                              />
                              <div
                                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-w-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'left')}
                              />
                              <div
                                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full cursor-e-resize"
                                onMouseDown={(e) => handleMouseDown(element.id, e, 'right')}
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
                            <p className="text-sm">Start creating your sticker!</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tools */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => setShowTextInput(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                      >
                        <Type size={16} />
                        <span>Add Text</span>
                      </button>

                      <button
                        onClick={() => setShowEmojiPicker(true)}
                        className="flex items-center space-x-2 px-3 py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors"
                      >
                        <Smile size={16} />
                        <span>Add Emoji</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-3 py-2 bg-purple text-white rounded-lg hover:bg-purple/90 transition-colors"
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
                </div>

                {/* Properties Panel */}
                <div className="space-y-4">
                  {/* Layer Info */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
                      <Layers size={16} />
                      <span>Layers</span>
                    </h4>
                    
                    <div className="text-center mb-3">
                      <span className="text-gray-300 text-sm">
                        Layer {currentLayer} of {elements.length || 1}
                      </span>
                    </div>

                    {selectedElement && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moveLayer('up')}
                          disabled={currentLayer >= elements.length}
                          className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={14} />
                          <span className="text-xs">Up</span>
                        </button>
                        <button
                          onClick={() => moveLayer('down')}
                          disabled={currentLayer <= 1}
                          className="flex-1 flex items-center justify-center space-x-1 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={14} />
                          <span className="text-xs">Down</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">Properties</h4>
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
                          <label className="block text-xs text-gray-400 mb-1">Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'x', parseInt(e.target.value) || 0)}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'y', parseInt(e.target.value) || 0)}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="Y"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'width', parseInt(e.target.value) || 20)}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="Width"
                              min="20"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'height', parseInt(e.target.value) || 20)}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="Height"
                              min="20"
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
                            onChange={(e) => updateElementProperty(selectedElementData.id, 'rotation', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-center text-xs text-gray-400 mt-1">
                            {selectedElementData.rotation}°
                          </div>
                        </div>

                        {/* Flip Controls */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Flip</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateElementProperty(selectedElementData.id, 'flipX', !selectedElementData.flipX)}
                              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded text-xs transition-colors ${
                                selectedElementData.flipX
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <FlipHorizontal size={12} />
                              <span>H</span>
                            </button>
                            <button
                              onClick={() => updateElementProperty(selectedElementData.id, 'flipY', !selectedElementData.flipY)}
                              className={`flex-1 flex items-center justify-center space-x-1 py-1 rounded text-xs transition-colors ${
                                selectedElementData.flipY
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              <FlipVertical size={12} />
                              <span>V</span>
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
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'style.fontSize', parseInt(e.target.value))}
                                className="w-full"
                              />
                              <div className="text-center text-xs text-gray-400 mt-1">
                                {selectedElementData.style?.fontSize || 24}px
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FF6B9D'}
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'style.color', e.target.value)}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
                              <select
                                value={selectedElementData.style?.fontWeight || 'bold'}
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'style.fontWeight', e.target.value)}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="300">Light</option>
                                <option value="700">Extra Bold</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Emoji-specific properties */}
                        {selectedElementData.type === 'emoji' && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Size</label>
                            <input
                              type="range"
                              min="16"
                              max="120"
                              value={selectedElementData.style?.fontSize || 48}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'style.fontSize', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="text-center text-xs text-gray-400 mt-1">
                              {selectedElementData.style?.fontSize || 48}px
                            </div>
                          </div>
                        )}
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-gray-600 transition-colors"
                    >
                      <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h4 className="text-white font-semibold text-sm mb-2 truncate">
                        {sticker.name}
                      </h4>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => previewStickerFunc(sticker)}
                          className="flex-1 flex items-center justify-center py-1 bg-secondary text-white rounded text-xs hover:bg-secondary/90 transition-colors"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => downloadSticker(sticker)}
                          className="flex-1 flex items-center justify-center py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => shareSticker(sticker)}
                          className="flex-1 flex items-center justify-center py-1 bg-accent text-dark rounded text-xs hover:bg-accent/90 transition-colors"
                        >
                          <Share2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {userStickers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-lg mb-2">No stickers yet!</p>
                      <p className="text-sm">Create your first sticker to get started.</p>
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
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="bg-dark-card rounded-xl p-4 border border-gray-800"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">📦</div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                      
                      <div className="grid grid-cols-4 gap-1 mb-3">
                        {pack.stickers.slice(0, 4).map((sticker) => (
                          <div key={sticker.id} className="aspect-square bg-white rounded overflow-hidden">
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {Array.from({ length: Math.max(0, 4 - pack.stickers.length) }).map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-700 rounded flex items-center justify-center">
                            <div className="text-gray-500 text-xs">+</div>
                          </div>
                        ))}
                      </div>
                      
                      <button className="w-full py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition-colors text-sm">
                        View Pack
                      </button>
                    </div>
                  ))}
                </div>
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
              <h3 className="text-white font-bold text-lg mb-4">Add Text</h3>
              
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your text..."
                className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none mb-4"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addTextElement()}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTextInput(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTextElement}
                  className="flex-1 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
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
                <h3 className="text-white font-bold text-lg">Choose Emoji</h3>
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
                    <h4 className="text-gray-300 font-semibold text-sm mb-2">{category}</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addEmojiElement(emoji)}
                          className="p-3 text-2xl hover:bg-gray-700 rounded-lg transition-colors"
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
              className="bg-dark-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Save Sticker</h3>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
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
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="createNewPack"
                    checked={createNewPack}
                    onChange={(e) => setCreateNewPack(e.target.checked)}
                    className="w-4 h-4 text-primary bg-dark-light border-gray-700 rounded focus:ring-primary"
                  />
                  <label htmlFor="createNewPack" className="text-sm text-gray-300">
                    Create new pack
                  </label>
                </div>

                {/* Pack Selection or Creation */}
                {createNewPack ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Pack Name
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
                  </div>
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
                      {ownedPacks.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                    
                    {/* Pack Preview */}
                    {selectedPackId && (
                      <div className="mt-2 p-3 bg-dark-light rounded-lg">
                        <div className="text-sm text-gray-300">
                          <strong>{ownedPacks.find(p => p.id === selectedPackId)?.name}</strong>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {ownedPacks.find(p => p.id === selectedPackId)?.description}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSticker}
                  disabled={!stickerName.trim() || (createNewPack && !newPackName.trim())}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Sticker</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
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
              className="bg-dark-card rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">{previewSticker.name}</h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="aspect-square bg-white rounded-lg mb-4 overflow-hidden">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadSticker(previewSticker)}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareSticker(previewSticker)}
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