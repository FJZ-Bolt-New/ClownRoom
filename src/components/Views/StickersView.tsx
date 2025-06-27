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
  EyeOff,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ChevronUp,
  ChevronDown,
  Layers,
  X,
  Play,
  ShoppingCart,
  Crown,
  Star,
  Palette,
  Grid,
  Search
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
    purchaseStickerPack,
    currentUser 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'packs'>('create');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showProperties, setShowProperties] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({
    name: '',
    packId: 'pack-default',
    createNewPack: false,
    newPackName: '',
    newPackDescription: ''
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    'Food': ['🍎', '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍰', '🍪', '🍩'],
    'Objects': ['🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁'],
  };

  // Font options
  const fontOptions = [
    { name: 'Kalam', value: 'Kalam, cursive' },
    { name: 'Caveat', value: 'Caveat, cursive' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times', value: 'Times New Roman, serif' },
    { name: 'Courier', value: 'Courier New, monospace' },
  ];

  // Color palette
  const colorPalette = [
    '#FF6B9D', '#4ECDC4', '#FFE66D', '#FF8A5B', '#9B59B6',
    '#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#95A5A6',
    '#FFFFFF', '#000000', '#34495E', '#E67E22', '#1ABC9C'
  ];

  // Generate auto name for sticker
  const generateStickerName = () => {
    const adjectives = ['Cool', 'Epic', 'Awesome', 'Wild', 'Crazy', 'Fun', 'Cute', 'Bold'];
    const nouns = ['Sticker', 'Creation', 'Art', 'Design', 'Masterpiece'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun} ${Date.now().toString().slice(-4)}`;
  };

  // Initialize save data when modal opens
  useEffect(() => {
    if (showSaveModal && !saveData.name) {
      setSaveData(prev => ({
        ...prev,
        name: generateStickerName()
      }));
    }
  }, [showSaveModal]);

  // Add element to canvas
  const addElement = (type: StickerElement['type'], content: string, imageData?: string) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      width: type === 'text' ? 100 : 60,
      height: type === 'text' ? 40 : 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: type === 'text' ? {
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: 'Kalam, cursive',
        fontWeight: 'normal'
      } : undefined,
      imageData
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setShowProperties(true);
    setCurrentLayer(newElement.layer);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! 🎨`);
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
    }
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
      setShowProperties(false);
    }
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    setShowProperties(false);
    setCurrentLayer(1);
    toast.success('Canvas cleared! ✨');
  };

  // Move layer
  const moveLayer = (elementId: string, direction: 'up' | 'down') => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    const currentIndex = sortedElements.findIndex(el => el.id === elementId);
    
    if (direction === 'up' && currentIndex < sortedElements.length - 1) {
      const nextElement = sortedElements[currentIndex + 1];
      updateElement(elementId, { layer: nextElement.layer });
      updateElement(nextElement.id, { layer: element.layer });
    } else if (direction === 'down' && currentIndex > 0) {
      const prevElement = sortedElements[currentIndex - 1];
      updateElement(elementId, { layer: prevElement.layer });
      updateElement(prevElement.id, { layer: element.layer });
    }
  };

  // Navigate layers
  const navigateLayer = (direction: 'prev' | 'next') => {
    const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);
    const currentIndex = sortedElements.findIndex(el => el.id === selectedElement);
    
    if (direction === 'next' && currentIndex < sortedElements.length - 1) {
      const nextElement = sortedElements[currentIndex + 1];
      setSelectedElement(nextElement.id);
      setCurrentLayer(nextElement.layer);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevElement = sortedElements[currentIndex - 1];
      setSelectedElement(prevElement.id);
      setCurrentLayer(prevElement.layer);
    }
  };

  // Handle element click
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
    setShowProperties(true);
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setCurrentLayer(element.layer);
    }
  };

  // Handle canvas click
  const handleCanvasClick = () => {
    setSelectedElement(null);
    setShowProperties(false);
  };

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
  };

  // Mouse move handler for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !selectedElement || !resizeHandle) return;

      const element = elements.find(el => el.id === selectedElement);
      if (!element) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const deltaX = e.clientX - rect.left - element.x;
      const deltaY = e.clientY - rect.top - element.y;

      let newWidth = element.width;
      let newHeight = element.height;

      if (resizeHandle.includes('right')) {
        newWidth = Math.max(20, deltaX);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.max(20, deltaY);
      }

      updateElement(selectedElement, {
        width: newWidth,
        height: newHeight
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle('');
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, selectedElement, resizeHandle, elements]);

  // Save sticker function
  const handleSaveSticker = () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!saveData.name.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (saveData.createNewPack && !saveData.newPackName.trim()) {
      toast.error('Please enter a pack name! 📦');
      return;
    }

    try {
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: saveData.name.trim(),
        imageUrl: `data:sticker/canvas;base64,${btoa(JSON.stringify(elements))}`, // Store elements as base64
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements, // Store the actual element data
        packId: saveData.createNewPack ? `pack-${Date.now()}` : saveData.packId
      };

      // If creating a new pack, create it first
      if (saveData.createNewPack) {
        const newPack = {
          id: newSticker.packId!,
          name: saveData.newPackName.trim(),
          description: saveData.newPackDescription.trim() || 'Custom sticker pack',
          stickers: [newSticker],
          category: 'custom' as const,
          count: 1,
          owned: true,
          price: 0,
          createdBy: currentUser?.id || 'user-1',
          createdAt: new Date()
        };
        
        addStickerPack(newPack);
        toast.success(`New pack "${newPack.name}" created! 📦`);
      } else {
        // Add to existing pack
        addStickerToPack(newSticker, saveData.packId);
      }

      // Add sticker to global stickers array
      addSticker(newSticker);
      
      // Award points
      updateUserPoints(20);
      
      // Reset save modal
      setShowSaveModal(false);
      setSaveData({
        name: '',
        packId: 'pack-default',
        createNewPack: false,
        newPackName: '',
        newPackDescription: ''
      });

      toast.success(`Sticker "${newSticker.name}" saved successfully! 🎉 (+20 CP)`);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! 😅');
    }
  };

  // Get selected element
  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Filter stickers for browse tab
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sticker.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || sticker.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
              >
                {/* Tools Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                      <Plus size={20} className="text-secondary" />
                      <span>Add Elements</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => addElement('text', 'New Text')}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white">Add Text</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Image size={20} className="text-accent" />
                        <span className="text-white">Add Image</span>
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
                                onClick={() => addElement('emoji', emoji)}
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

                  {/* Canvas Actions */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-3">Canvas</h3>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowSaveModal(true)}
                        disabled={elements.length === 0}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-primary to-purple text-white rounded-lg hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save size={16} />
                        <span>Save Sticker</span>
                      </button>
                      
                      <button
                        onClick={clearCanvas}
                        className="w-full flex items-center justify-center space-x-2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold">Sticker Canvas</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowLayerPanel(!showLayerPanel)}
                          className={`p-2 rounded-lg transition-colors ${
                            showLayerPanel ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          <Layers size={16} />
                        </button>
                        {selectedElement && (
                          <>
                            <button
                              onClick={() => navigateLayer('prev')}
                              disabled={!elements.find(el => el.layer < (selectedElementData?.layer || 1))}
                              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                              <ChevronDown size={16} />
                            </button>
                            <span className="text-white text-sm">
                              Layer {selectedElementData?.layer || 1}
                            </span>
                            <button
                              onClick={() => navigateLayer('next')}
                              disabled={!elements.find(el => el.layer > (selectedElementData?.layer || 1))}
                              className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                              <ChevronUp size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden cursor-crosshair"
                    >
                      {elements
                        .sort((a, b) => a.layer - b.layer)
                        .map((element) => (
                          <div
                            key={element.id}
                            onClick={(e) => handleElementClick(element.id, e)}
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
                          >
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
                                <div
                                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                  onMouseDown={(e) => handleMouseDown(e, element.id, 'bottom-right')}
                                />
                                <div
                                  className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                                  onMouseDown={(e) => handleMouseDown(e, element.id, 'top-right')}
                                />
                                <div
                                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                                  onMouseDown={(e) => handleMouseDown(e, element.id, 'bottom-left')}
                                />
                                <div
                                  className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                                  onMouseDown={(e) => handleMouseDown(e, element.id, 'top-left')}
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
                            <p className="text-sm">Add text, images, or emojis</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="lg:col-span-1">
                  <AnimatePresence>
                    {showProperties && selectedElementData && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold">Properties</h3>
                          <button
                            onClick={() => setShowProperties(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Position */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Position</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={Math.round(selectedElementData.x)}
                                onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                                className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                                placeholder="X"
                              />
                              <input
                                type="number"
                                value={Math.round(selectedElementData.y)}
                                onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                                className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                                placeholder="Y"
                              />
                            </div>
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Size</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                value={Math.round(selectedElementData.width)}
                                onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 20 })}
                                className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                                placeholder="W"
                                min="20"
                              />
                              <input
                                type="number"
                                value={Math.round(selectedElementData.height)}
                                onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 20 })}
                                className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                                placeholder="H"
                                min="20"
                              />
                            </div>
                          </div>

                          {/* Text Properties */}
                          {selectedElementData.type === 'text' && (
                            <>
                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Text</label>
                                <input
                                  type="text"
                                  value={selectedElementData.content}
                                  onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                  className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
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
                                <label className="block text-sm text-gray-300 mb-2">Font</label>
                                <select
                                  value={selectedElementData.style?.fontFamily || 'Arial, sans-serif'}
                                  onChange={(e) => updateElement(selectedElementData.id, {
                                    style: { ...selectedElementData.style, fontFamily: e.target.value }
                                  })}
                                  className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                                >
                                  {fontOptions.map((font) => (
                                    <option key={font.value} value={font.value}>
                                      {font.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm text-gray-300 mb-2">Color</label>
                                <div className="grid grid-cols-5 gap-1">
                                  {colorPalette.map((color) => (
                                    <button
                                      key={color}
                                      onClick={() => updateElement(selectedElementData.id, {
                                        style: { ...selectedElementData.style, color }
                                      })}
                                      className={`w-8 h-8 rounded border-2 ${
                                        selectedElementData.style?.color === color ? 'border-white' : 'border-gray-600'
                                      }`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Transform */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Transform</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                                className={`p-2 rounded text-sm ${selectedElementData.flipX ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                              >
                                <FlipHorizontal size={16} />
                              </button>
                              <button
                                onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                                className={`p-2 rounded text-sm ${selectedElementData.flipY ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
                              >
                                <FlipVertical size={16} />
                              </button>
                            </div>
                          </div>

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

                          {/* Layer Controls */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-2">Layer</label>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => moveLayer(selectedElementData.id, 'down')}
                                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                              >
                                <ChevronDown size={16} />
                              </button>
                              <span className="text-white text-sm flex-1 text-center">
                                {selectedElementData.layer}
                              </span>
                              <button
                                onClick={() => moveLayer(selectedElementData.id, 'up')}
                                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                              >
                                <ChevronUp size={16} />
                              </button>
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => deleteElement(selectedElementData.id)}
                            className="w-full p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            <Trash2 size={16} className="mx-auto" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Layer Panel */}
                  <AnimatePresence>
                    {showLayerPanel && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-dark-card rounded-xl p-4 border border-gray-800 mt-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-white font-bold">Layers</h3>
                          <button
                            onClick={() => setShowLayerPanel(false)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {elements
                            .sort((a, b) => b.layer - a.layer)
                            .map((element) => (
                              <div
                                key={element.id}
                                onClick={() => handleElementClick(element.id, {} as any)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedElement === element.id
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-light text-gray-300 hover:bg-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    {element.type === 'text' && <Type size={16} />}
                                    {element.type === 'image' && <Image size={16} />}
                                    {element.type === 'emoji' && <span className="text-lg">{element.content}</span>}
                                    <span className="text-sm truncate">
                                      {element.type === 'text' ? element.content : element.type}
                                    </span>
                                  </div>
                                  <span className="text-xs">L{element.layer}</span>
                                </div>
                              </div>
                            ))}
                          
                          {elements.length === 0 && (
                            <div className="text-center text-gray-400 py-4">
                              <Layers size={32} className="mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No layers yet</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                className="space-y-6"
              >
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search stickers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-dark-card text-white rounded-lg border border-gray-700 focus:border-secondary focus:outline-none"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-dark-card text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>

                {/* Stickers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredStickers.map((sticker) => (
                    <motion.div
                      key={sticker.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-dark-card rounded-xl p-3 border border-gray-800 hover:border-secondary transition-colors group"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {sticker.elementData ? (
                          <div className="relative w-full h-full">
                            {sticker.elementData
                              .sort((a, b) => a.layer - b.layer)
                              .map((element) => (
                                <div
                                  key={element.id}
                                  className="absolute"
                                  style={{
                                    left: `${(element.x / 400) * 100}%`,
                                    top: `${(element.y / 400) * 100}%`,
                                    width: `${(element.width / 400) * 100}%`,
                                    height: `${(element.height / 400) * 100}%`,
                                    transform: `rotate(${element.rotation}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`,
                                    zIndex: element.layer,
                                  }}
                                >
                                  {element.type === 'text' && (
                                    <div
                                      className="w-full h-full flex items-center justify-center text-center break-words"
                                      style={{
                                        fontSize: `${(element.style?.fontSize || 24) * 0.3}px`,
                                        color: element.style?.color || '#000000',
                                        fontFamily: element.style?.fontFamily || 'Arial',
                                        fontWeight: element.style?.fontWeight || 'normal',
                                      }}
                                    >
                                      {element.content}
                                    </div>
                                  )}
                                  {element.type === 'emoji' && (
                                    <div className="w-full h-full flex items-center justify-center text-lg">
                                      {element.content}
                                    </div>
                                  )}
                                  {element.type === 'image' && element.imageData && (
                                    <img
                                      src={element.imageData}
                                      alt={element.content}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  )}
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-4xl">🎨</div>
                        )}
                      </div>
                      
                      <h4 className="text-white font-semibold text-sm truncate">{sticker.name}</h4>
                      <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                      
                      <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateStickerUsage(sticker.id)}
                          className="p-1 bg-secondary text-white rounded hover:bg-secondary/80 transition-colors"
                        >
                          <Play size={12} />
                        </button>
                        <div className="flex space-x-1">
                          <button className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                            <Download size={12} />
                          </button>
                          <button className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
                            <Share2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredStickers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No stickers found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Packs Tab */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stickerPacks.map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-dark-card rounded-xl p-6 border border-gray-800"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold text-lg">{pack.name}</h3>
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
                          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                            View Pack
                          </button>
                        ) : (
                          <button
                            onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                            disabled={!currentUser || currentUser.clownPoints < pack.price}
                            className="px-4 py-2 bg-accent text-dark rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Buy Pack
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sticker Name
                  </label>
                  <input
                    type="text"
                    value={saveData.name}
                    onChange={(e) => setSaveData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    placeholder="Enter sticker name..."
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="createNewPack"
                      checked={saveData.createNewPack}
                      onChange={(e) => setSaveData(prev => ({ ...prev, createNewPack: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="createNewPack" className="text-sm font-medium text-gray-300">
                      Create new pack
                    </label>
                  </div>

                  {saveData.createNewPack ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={saveData.newPackName}
                        onChange={(e) => setSaveData(prev => ({ ...prev, newPackName: e.target.value }))}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                        placeholder="Pack name..."
                      />
                      <textarea
                        value={saveData.newPackDescription}
                        onChange={(e) => setSaveData(prev => ({ ...prev, newPackDescription: e.target.value }))}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-20 resize-none"
                        placeholder="Pack description..."
                      />
                    </div>
                  ) : (
                    <select
                      value={saveData.packId}
                      onChange={(e) => setSaveData(prev => ({ ...prev, packId: e.target.value }))}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      {stickerPacks.filter(pack => pack.owned).map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
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
    </div>
  );
};