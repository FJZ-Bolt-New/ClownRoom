import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Download, 
  Share2, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Smile, 
  Save,
  X,
  Eye,
  Trash2,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ChevronUp,
  ChevronDown,
  Layers,
  Grid,
  Search,
  ShoppingCart,
  Crown,
  Star,
  Package
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);
  
  // Create sticker state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(24);
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Hands': ['👍', '👎', '👏', '🙌', '🤝', '✋', '👋', '🤘', '✌️', '🤞'],
    'Hearts': ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '🧡', '💜', '🖤'],
    'Objects': ['🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'],
  };

  // Get next layer number
  const getNextLayer = () => {
    return elements.length > 0 ? Math.max(...elements.map(el => el.layer)) + 1 : 1;
  };

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
      width: 150,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getNextLayer(),
      style: {
        fontSize,
        color: textColor,
        fontFamily: 'Arial',
        fontWeight: 'normal',
      },
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setTextInput('');
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
      layer: getNextLayer(),
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setShowEmojiPicker(false);
    toast.success(`${emoji} added!`);
  };

  // Add image element
  const addImageElement = () => {
    if (!uploadedImage) {
      toast.error('Upload an image first! 📸');
      return;
    }

    const newElement: StickerElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: uploadedImage,
      x: 25,
      y: 25,
      width: 100,
      height: 100,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getNextLayer(),
      imageData: uploadedImage,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Image added! 🖼️');
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        toast.success('Image uploaded! 📸');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (elementId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const offsetX = event.clientX - rect.left - element.x;
    const offsetY = event.clientY - rect.top - element.y;

    setDraggedElement(elementId);
    setDragOffset({ x: offsetX, y: offsetY });
    setSelectedElement(elementId);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(300 - 50, event.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(300 - 50, event.clientY - rect.top - dragOffset.y));

    setElements(elements.map(el =>
      el.id === draggedElement
        ? { ...el, x: newX, y: newY }
        : el
    ));
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Handle resize
  const handleResize = (elementId: string, newWidth: number, newHeight: number) => {
    setElements(elements.map(el =>
      el.id === elementId
        ? { ...el, width: Math.max(20, newWidth), height: Math.max(20, newHeight) }
        : el
    ));
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

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Move layer
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    const currentIndex = sortedElements.findIndex(el => el.id === elementId);
    
    if (direction === 'up' && currentIndex < sortedElements.length - 1) {
      const targetElement = sortedElements[currentIndex + 1];
      const tempLayer = element.layer;
      updateElementProperty(elementId, 'layer', targetElement.layer);
      updateElementProperty(targetElement.id, 'layer', tempLayer);
      toast.success('Moved to front! ⬆️');
    } else if (direction === 'down' && currentIndex > 0) {
      const targetElement = sortedElements[currentIndex - 1];
      const tempLayer = element.layer;
      updateElementProperty(elementId, 'layer', targetElement.layer);
      updateElementProperty(targetElement.id, 'layer', tempLayer);
      toast.success('Moved to back! ⬇️');
    }
  };

  // Navigate layers
  const navigateLayer = (direction: 'prev' | 'next') => {
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    const currentIndex = sortedElements.findIndex(el => el.id === selectedElement);
    
    if (direction === 'next' && currentIndex < sortedElements.length - 1) {
      setSelectedElement(sortedElements[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedElement(sortedElements[currentIndex - 1].id);
    }
  };

  // Get selected element
  const selectedElementData = elements.find(el => el.id === selectedElement);

  // FIXED: Save sticker function - only saves and clears canvas
  const saveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    // Create the sticker object
    const newSticker: Sticker = {
      id: `sticker-${Date.now()}`,
      name: `Sticker ${Date.now()}`,
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3RpY2tlcjwvdGV4dD48L3N2Zz4=',
      tags: ['custom'],
      createdBy: currentUser?.id || 'user-1',
      usageCount: 0,
      packId: 'pack-default',
      elementData: elements,
    };

    // Add sticker to the store
    addSticker(newSticker);
    
    // Add to default pack
    addStickerToPack(newSticker, 'pack-default');
    
    // Update user points
    updateUserPoints(20);
    
    // Show success message
    toast.success('Sticker saved successfully! 🎉 (+20 CP)');
    
    // Clear the canvas
    setElements([]);
    setSelectedElement(null);
    setUploadedImage(null);
    setTextInput('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sticker
  const downloadSticker = (sticker: Sticker) => {
    toast.success(`${sticker.name} downloaded! 💾`);
  };

  // Share sticker
  const shareSticker = (sticker: Sticker) => {
    navigator.clipboard.writeText(`Check out my sticker: ${sticker.name}`);
    toast.success('Sticker link copied! 📋');
  };

  // Preview sticker
  const handlePreviewSticker = (sticker: Sticker) => {
    setPreviewSticker(sticker);
  };

  // Get user's stickers
  const userStickers = stickers.filter(sticker => sticker.createdBy === currentUser?.id);

  // Get filtered stickers
  const getFilteredStickers = () => {
    let filtered = userStickers;
    
    if (searchTerm) {
      filtered = filtered.filter(sticker => 
        sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/20 to-dark paper-texture relative overflow-hidden">
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
              { id: 'packs', label: 'Packs', icon: Package },
              { id: 'my-stickers', label: 'My Stickers', icon: Grid },
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
            {/* Create Sticker Tab */}
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
                      <h2 className="text-white font-bold text-lg">Sticker Canvas</h2>
                      <div className="flex items-center space-x-2">
                        {elements.length > 1 && selectedElement && (
                          <div className="flex items-center space-x-1 bg-dark-light rounded-lg px-2 py-1">
                            <button
                              onClick={() => navigateLayer('prev')}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              disabled={!selectedElement}
                            >
                              <ChevronDown size={14} />
                            </button>
                            <span className="text-xs text-gray-400 px-2">
                              Layer {elements.find(el => el.id === selectedElement)?.layer || 1}
                            </span>
                            <button
                              onClick={() => navigateLayer('next')}
                              className="p-1 text-gray-400 hover:text-white transition-colors"
                              disabled={!selectedElement}
                            >
                              <ChevronUp size={14} />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={saveSticker}
                          className="px-4 py-2 bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg font-semibold hover:from-secondary/90 hover:to-blue-500/90 transition-all flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden cursor-crosshair"
                      onClick={handleCanvasClick}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%">
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>

                      {/* Render elements sorted by layer */}
                      {elements
                        .sort((a, b) => a.layer - b.layer)
                        .map((element) => (
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
                            onClick={(e) => handleElementClick(element.id, e)}
                            onMouseDown={(e) => handleMouseDown(element.id, e)}
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
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {element.content}
                              </div>
                            )}
                            
                            {element.type === 'image' && element.imageData && (
                              <img
                                src={element.imageData}
                                alt="Sticker element"
                                className="w-full h-full object-cover rounded"
                                draggable={false}
                              />
                            )}

                            {/* Resize handles */}
                            {selectedElement === element.id && (
                              <>
                                {/* Corner resize handles */}
                                <div
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary rounded-full cursor-se-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setIsResizing(true);
                                    setResizeHandle('se');
                                  }}
                                />
                                <div
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full cursor-ne-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setIsResizing(true);
                                    setResizeHandle('ne');
                                  }}
                                />
                                <div
                                  className="absolute -top-1 -left-1 w-3 h-3 bg-secondary rounded-full cursor-nw-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setIsResizing(true);
                                    setResizeHandle('nw');
                                  }}
                                />
                                <div
                                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-secondary rounded-full cursor-sw-resize"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setIsResizing(true);
                                    setResizeHandle('sw');
                                  }}
                                />
                              </>
                            )}
                          </div>
                        ))}

                      {/* Empty state */}
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Palette size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Start creating your sticker!</p>
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
                    <h3 className="text-white font-bold mb-4">Add Elements</h3>
                    
                    {/* Text Input */}
                    <div className="space-y-3 mb-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Enter text..."
                          className="flex-1 bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none text-sm"
                        />
                        <button
                          onClick={addTextElement}
                          className="px-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
                        >
                          <Type size={16} />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-10 h-8 rounded border border-gray-700"
                        />
                        <input
                          type="range"
                          min="12"
                          max="48"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-gray-400 text-sm">{fontSize}px</span>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center space-x-2 py-2 bg-dark-light text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                        >
                          <ImageIcon size={16} />
                          <span className="text-sm">Upload Image</span>
                        </button>
                        {uploadedImage && (
                          <button
                            onClick={addImageElement}
                            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                      {uploadedImage && (
                        <div className="mt-2">
                          <img src={uploadedImage} alt="Uploaded" className="w-16 h-16 object-cover rounded border border-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Emoji Picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors font-semibold"
                      >
                        <Smile size={16} />
                        <span className="text-sm">Add Emoji</span>
                      </button>

                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card rounded-lg border border-gray-700 p-3 z-20 max-h-48 overflow-y-auto">
                          {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <div key={category} className="mb-3">
                              <h4 className="text-xs text-gray-400 mb-2">{category}</h4>
                              <div className="grid grid-cols-5 gap-1">
                                {emojis.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => addEmojiElement(emoji)}
                                    className="p-2 text-lg hover:bg-gray-700 rounded transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">Properties</h3>
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
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
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'x', Number(e.target.value))}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="X"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'y', Number(e.target.value))}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
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
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'width', Number(e.target.value))}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="W"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElementProperty(selectedElementData.id, 'height', Number(e.target.value))}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700 focus:border-secondary focus:outline-none"
                              placeholder="H"
                            />
                          </div>
                        </div>

                        {/* Text Properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                              <input
                                type="range"
                                min="8"
                                max="72"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'style.fontSize', Number(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-400">{selectedElementData.style?.fontSize || 24}px</span>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#000000'}
                                onChange={(e) => updateElementProperty(selectedElementData.id, 'style.color', e.target.value)}
                                className="w-full h-8 rounded border border-gray-700"
                              />
                            </div>
                          </>
                        )}

                        {/* Transform Controls */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Transform</label>
                          <div className="grid grid-cols-4 gap-2">
                            <button
                              onClick={() => updateElementProperty(selectedElementData.id, 'rotation', selectedElementData.rotation + 15)}
                              className="p-2 bg-dark-light text-gray-300 rounded hover:bg-gray-700 transition-colors"
                              title="Rotate"
                            >
                              <RotateCw size={14} />
                            </button>
                            <button
                              onClick={() => updateElementProperty(selectedElementData.id, 'flipX', !selectedElementData.flipX)}
                              className={`p-2 rounded transition-colors ${selectedElementData.flipX ? 'bg-secondary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'}`}
                              title="Flip Horizontal"
                            >
                              <FlipHorizontal size={14} />
                            </button>
                            <button
                              onClick={() => updateElementProperty(selectedElementData.id, 'flipY', !selectedElementData.flipY)}
                              className={`p-2 rounded transition-colors ${selectedElementData.flipY ? 'bg-secondary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'}`}
                              title="Flip Vertical"
                            >
                              <FlipVertical size={14} />
                            </button>
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveLayer(selectedElementData.id, 'up')}
                                className="p-1 bg-dark-light text-gray-300 rounded-t hover:bg-gray-700 transition-colors"
                                title="Move Forward"
                              >
                                <ChevronUp size={12} />
                              </button>
                              <button
                                onClick={() => moveLayer(selectedElementData.id, 'down')}
                                className="p-1 bg-dark-light text-gray-300 rounded-b hover:bg-gray-700 transition-colors"
                                title="Move Backward"
                              >
                                <ChevronDown size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Sticker Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stickerPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className={`bg-dark-card rounded-xl p-4 border ${
                        pack.owned ? 'border-secondary' : 'border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{pack.name}</h3>
                        {pack.owned ? (
                          <div className="flex items-center space-x-1 text-secondary">
                            <Crown size={16} />
                            <span className="text-xs">Owned</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-accent">
                            <Star size={16} />
                            <span className="text-sm font-bold">{pack.price}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3">{pack.description}</p>
                      <p className="text-gray-500 text-xs mb-4">{pack.count} stickers</p>
                      
                      {!pack.owned && (
                        <button
                          onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                          disabled={!currentUser || currentUser.clownPoints < pack.price}
                          className="w-full bg-gradient-to-r from-accent to-yellow-500 text-dark rounded-lg py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-accent/90 hover:to-yellow-500/90 transition-all flex items-center justify-center space-x-2"
                        >
                          <ShoppingCart size={16} />
                          <span>Purchase</span>
                        </button>
                      )}
                    </div>
                  ))}
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
                <div className="relative max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your stickers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                  />
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {getFilteredStickers().map((sticker) => (
                    <div
                      key={sticker.id}
                      className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-secondary transition-colors group"
                    >
                      <div className="aspect-square bg-gray-700 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        <img
                          src={sticker.imageUrl}
                          alt={sticker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h4 className="text-white font-semibold text-sm mb-1 truncate">{sticker.name}</h4>
                      <p className="text-gray-400 text-xs mb-2">Used {sticker.usageCount} times</p>
                      
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePreviewSticker(sticker)}
                          className="flex-1 p-1 bg-secondary text-white rounded text-xs hover:bg-secondary/90 transition-colors flex items-center justify-center"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => downloadSticker(sticker)}
                          className="flex-1 p-1 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors flex items-center justify-center"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => shareSticker(sticker)}
                          className="flex-1 p-1 bg-accent text-dark rounded text-xs hover:bg-accent/90 transition-colors flex items-center justify-center"
                        >
                          <Share2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {getFilteredStickers().length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No stickers found. Create your first sticker!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{previewSticker.name}</h2>
                <button
                  onClick={() => setPreviewSticker(null)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={previewSticker.imageUrl}
                  alt={previewSticker.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Usage Count:</span>
                  <span className="text-white">{previewSticker.usageCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tags:</span>
                  <span className="text-white">{previewSticker.tags.join(', ')}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => downloadSticker(previewSticker)}
                  className="flex-1 bg-primary text-white rounded-lg py-2 font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => shareSticker(previewSticker)}
                  className="flex-1 bg-secondary text-white rounded-lg py-2 font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
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