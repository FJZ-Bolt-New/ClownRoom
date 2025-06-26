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
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  Move,
  ChevronUp,
  ChevronDown,
  Layers,
  Package,
  ShoppingBag,
  Star,
  Download,
  Eye,
  Grid,
  Search,
  Filter,
  X,
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
    addStickerPack, 
    updateStickerPack,
    addStickerToPack,
    purchaseStickerPack,
    currentUser
  } = useStore();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'my-packs' | 'explore'>('create');
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  
  // Canvas and UI refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Text input state
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [stickerName, setStickerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // Marketplace state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPackDetails, setShowPackDetails] = useState<string | null>(null);

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiCategories = {
    'Faces': ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'],
    'Food': ['🍎', '🍌', '🍓', '🍕', '🍔', '🌭', '🍟', '🍗', '🎂', '🍰', '🍪', '🍩', '☕', '🥤'],
    'Objects': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥅', '🎯', '🎮', '🎲', '🎸', '🎹'],
  };

  // Get current layer bounds
  const getMinLayer = () => 0;
  const getMaxLayer = () => Math.max(0, elements.length - 1);
  
  // Get current element's layer
  const getCurrentLayer = () => {
    if (!selectedElement) return 0;
    const element = elements.find(el => el.id === selectedElement);
    return element ? element.layer : 0;
  };

  // Layer navigation functions with improved logic
  const moveLayerUp = () => {
    if (!selectedElement) return;
    
    const currentLayer = getCurrentLayer();
    const maxLayer = getMaxLayer();
    
    // Can't go higher than the max layer
    if (currentLayer >= maxLayer) return;
    
    const newLayer = currentLayer + 1;
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, layer: newLayer }
        : el
    ));
    
    toast.success(`Moved to layer ${newLayer + 1}! 📈`);
  };

  const moveLayerDown = () => {
    if (!selectedElement) return;
    
    const currentLayer = getCurrentLayer();
    const minLayer = getMinLayer();
    
    // Can't go lower than the min layer
    if (currentLayer <= minLayer) return;
    
    const newLayer = currentLayer - 1;
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, layer: newLayer }
        : el
    ));
    
    toast.success(`Moved to layer ${newLayer + 1}! 📉`);
  };

  // Add element with proper layer assignment
  const addElement = (element: Omit<StickerElement, 'id' | 'layer'>) => {
    const newLayer = elements.length; // New elements go on top
    const newElement: StickerElement = {
      ...element,
      id: `element-${Date.now()}`,
      layer: newLayer,
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${element.type === 'text' ? 'Text' : element.type === 'emoji' ? 'Emoji' : 'Image'} added! 🎨`);
  };

  // Add text element
  const addTextElement = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text! 📝');
      return;
    }
    
    addElement({
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      width: 150,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      style: {
        fontSize: 24,
        color: '#FF6B9D',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    });
    
    setTextInput('');
    setShowTextInput(false);
  };

  // Add emoji element
  const addEmojiElement = (emoji: string) => {
    addElement({
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      style: {
        fontSize: 48,
      },
    });
    
    setShowEmojiPicker(false);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large! Please use images under 5MB 📏');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      
      addElement({
        type: 'image',
        content: file.name,
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
        flipX: false,
        flipY: false,
        imageData,
      });
    };
    
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Element selection with click
  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedElement(elementId);
  };

  // Mouse handlers for dragging
  const handleMouseDown = (elementId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragOffset({
      x: event.clientX - rect.left - element.x,
      y: event.clientY - rect.top - element.y,
    });
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(300, event.clientX - rect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(300, event.clientY - rect.top - dragOffset.y));
    
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, x: newX, y: newY }
        : el
    ));
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Mouse event listeners
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

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<StickerElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(prev => {
      const filtered = prev.filter(el => el.id !== elementId);
      // Reassign layers to maintain continuity
      return filtered.map((el, index) => ({ ...el, layer: index }));
    });
    setSelectedElement(null);
    toast.success('Element deleted! 🗑️');
  };

  // Clear canvas
  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
    toast.success('Canvas cleared! 🧹');
  };

  // Save sticker
  const handleSaveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements first! 🎨');
      return;
    }

    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    try {
      // Create sticker data
      const stickerData: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkN1c3RvbSBTdGlja2VyPC90ZXh0Pjwvc3ZnPg==',
        tags: ['custom', 'handmade'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: elements,
      };

      // Handle pack creation or selection
      let targetPackId = selectedPackId;
      
      if (createNewPack && newPackName.trim()) {
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
        
        addStickerPack(newPack);
        targetPackId = newPack.id;
        toast.success(`New pack "${newPackName}" created! 📦`);
      }

      // Add sticker to pack
      addStickerToPack(stickerData, targetPackId);
      updateUserPoints(10);
      
      // Show success message with sticker name
      toast.success(`✨ Sticker '${stickerName}' saved successfully! (+10 CP)`, {
        duration: 4000,
        icon: '🎨',
      });
      
      // Reset only the save modal form, keep canvas intact
      setShowSaveModal(false);
      setStickerName('');
      setNewPackName('');
      setCreateNewPack(false);
      setSelectedPackId('pack-default');
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  // Get selected element
  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  // Sort elements by layer for rendering (higher layer = on top)
  const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

  // Get user's sticker packs
  const userPacks = stickerPacks.filter(pack => pack.createdBy === currentUser?.id);
  const userStickers = stickers.filter(sticker => sticker.createdBy === currentUser?.id);

  // Get marketplace packs (not owned by user)
  const marketplacePacks = stickerPacks.filter(pack => 
    pack.createdBy !== currentUser?.id && 
    (selectedCategory === 'all' || pack.category === selectedCategory) &&
    (searchTerm === '' || pack.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-bounce-doodle">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-wiggle">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-float">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🌟</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Package },
              { id: 'my-packs', label: 'My Packs', icon: Grid },
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
                {/* Canvas */}
                <div className="lg:col-span-2">
                  <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Sticker Canvas</h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 size={16} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-80 bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden cursor-crosshair"
                      onClick={() => setSelectedElement(null)}
                    >
                      {/* Render elements sorted by layer */}
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
                            zIndex: element.layer + 1, // Ensure proper stacking
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
                          
                          {/* Layer indicator for selected element */}
                          {selectedElement === element.id && (
                            <div className="absolute -top-6 -left-1 bg-primary text-white text-xs px-2 py-1 rounded">
                              Layer {element.layer + 1}
                            </div>
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

                {/* Tools & Properties */}
                <div className="space-y-6">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h3 className="text-white font-bold mb-4">Add Elements</h3>
                    
                    <div className="space-y-3">
                      {/* Add Text */}
                      <div>
                        <button
                          onClick={() => setShowTextInput(!showTextInput)}
                          className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Type size={20} className="text-primary" />
                          <span className="text-white">Add Text</span>
                        </button>
                        
                        {showTextInput && (
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              value={textInput}
                              onChange={(e) => setTextInput(e.target.value)}
                              placeholder="Enter text..."
                              className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && addTextElement()}
                            />
                            <button
                              onClick={addTextElement}
                              className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary/90 transition-colors"
                            >
                              Add Text
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Add Emoji */}
                      <div>
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <Smile size={20} className="text-secondary" />
                          <span className="text-white">Add Emoji</span>
                        </button>
                        
                        {showEmojiPicker && (
                          <div className="mt-2 bg-dark-light rounded-lg p-3 max-h-48 overflow-y-auto">
                            {Object.entries(emojiCategories).map(([category, emojis]) => (
                              <div key={category} className="mb-3">
                                <h4 className="text-xs text-gray-400 mb-2">{category}</h4>
                                <div className="grid grid-cols-6 gap-1">
                                  {emojis.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => addEmojiElement(emoji)}
                                      className="p-2 text-xl hover:bg-gray-700 rounded transition-colors"
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

                      {/* Add Image */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center space-x-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <ImageIcon size={20} className="text-accent" />
                          <span className="text-white">Add Image</span>
                        </button>
                      </div>
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
                      
                      <div className="space-y-4">
                        {/* Layer Controls */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-2">
                            Layer: {selectedElementData.layer + 1} of {elements.length}
                          </label>
                          <div className="flex space-x-2">
                            <button
                              onClick={moveLayerUp}
                              disabled={getCurrentLayer() >= getMaxLayer()}
                              className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronUp size={16} />
                              <span className="text-sm">Forward</span>
                            </button>
                            <button
                              onClick={moveLayerDown}
                              disabled={getCurrentLayer() <= getMinLayer()}
                              className="flex-1 flex items-center justify-center space-x-1 p-2 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronDown size={16} />
                              <span className="text-sm">Backward</span>
                            </button>
                          </div>
                        </div>

                        {/* Position */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">X</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.x)}
                              onChange={(e) => updateElement(selectedElementData.id, { x: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Y</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.y)}
                              onChange={(e) => updateElement(selectedElementData.id, { y: parseInt(e.target.value) || 0 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>

                        {/* Size */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Width</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 1 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Height</label>
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 1 })}
                              className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              min="1"
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="block text-sm text-gray-300 mb-1">Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                          <div className="text-center text-xs text-gray-400 mt-1">
                            {selectedElementData.rotation}°
                          </div>
                        </div>

                        {/* Flip Controls */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 flex items-center justify-center space-x-1 p-2 rounded-lg transition-colors ${
                              selectedElementData.flipX ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <FlipHorizontal size={16} />
                            <span className="text-sm">Flip H</span>
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 flex items-center justify-center space-x-1 p-2 rounded-lg transition-colors ${
                              selectedElementData.flipY ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <FlipVertical size={16} />
                            <span className="text-sm">Flip V</span>
                          </button>
                        </div>

                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Font Size</label>
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
                              <div className="text-center text-xs text-gray-400 mt-1">
                                {selectedElementData.style?.fontSize || 24}px
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#FF6B9D'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-10 rounded border border-gray-700"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Font Weight</label>
                              <select
                                value={selectedElementData.style?.fontWeight || 'normal'}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, fontWeight: e.target.value }
                                })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm border border-gray-700"
                              >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="lighter">Light</option>
                              </select>
                            </div>
                          </>
                        )}

                        {/* Emoji-specific properties */}
                        {selectedElementData.type === 'emoji' && (
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Size</label>
                            <input
                              type="range"
                              min="16"
                              max="120"
                              value={selectedElementData.style?.fontSize || 48}
                              onChange={(e) => updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                              })}
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-4">My Stickers ({userStickers.length})</h2>
                  
                  {userStickers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">🎨</div>
                      <p>You haven't created any stickers yet!</p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Create Your First Sticker
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {userStickers.map((sticker) => (
                        <div
                          key={sticker.id}
                          className="bg-dark-light rounded-lg p-3 border border-gray-700 hover:border-primary transition-colors"
                        >
                          <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center">
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <h3 className="text-white text-sm font-semibold truncate">{sticker.name}</h3>
                          <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
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
                  <h2 className="text-xl font-bold text-white mb-4">My Sticker Packs ({userPacks.length})</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userPacks.map((pack) => (
                      <div
                        key={pack.id}
                        className="bg-dark-light rounded-lg p-4 border border-gray-700 hover:border-primary transition-colors"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Package size={24} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{pack.name}</h3>
                            <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            pack.category === 'custom' ? 'bg-primary/20 text-primary' :
                            pack.category === 'roast' ? 'bg-red-500/20 text-red-400' :
                            pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {pack.category}
                          </span>
                          
                          <button className="text-secondary hover:text-white transition-colors">
                            <Eye size={16} />
                          </button>
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Explore Sticker Packs</h2>
                    <div className="flex items-center space-x-2 text-accent">
                      <Crown size={20} />
                      <span className="font-bold">{currentUser?.clownPoints || 0} CP</span>
                    </div>
                  </div>
                  
                  {/* Search and Filter */}
                  <div className="flex space-x-4 mb-6">
                    <div className="flex-1 relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search packs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="roast">Roast</option>
                      <option value="wholesome">Wholesome</option>
                      <option value="meme">Meme</option>
                      <option value="cursed">Cursed</option>
                    </select>
                  </div>
                  
                  {/* Marketplace Packs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketplacePacks.map((pack) => {
                      const canAfford = (currentUser?.clownPoints || 0) >= pack.price;
                      const isOwned = pack.owned;
                      
                      return (
                        <div
                          key={pack.id}
                          className="bg-dark-light rounded-lg p-4 border border-gray-700 hover:border-primary transition-colors"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              pack.category === 'roast' ? 'bg-red-500/20' :
                              pack.category === 'wholesome' ? 'bg-green-500/20' :
                              pack.category === 'meme' ? 'bg-purple-500/20' :
                              pack.category === 'cursed' ? 'bg-gray-500/20' :
                              'bg-primary/20'
                            }`}>
                              {pack.category === 'roast' ? '🔥' :
                               pack.category === 'wholesome' ? '💖' :
                               pack.category === 'meme' ? '😂' :
                               pack.category === 'cursed' ? '💀' :
                               '🎨'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold">{pack.name}</h3>
                              <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                            </div>
                            {isOwned && (
                              <div className="text-green-400">
                                <Unlock size={16} />
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                pack.category === 'roast' ? 'bg-red-500/20 text-red-400' :
                                pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                                pack.category === 'meme' ? 'bg-purple-500/20 text-purple-400' :
                                pack.category === 'cursed' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-primary/20 text-primary'
                              }`}>
                                {pack.category}
                              </span>
                              
                              {pack.price > 0 && (
                                <div className="flex items-center space-x-1 text-accent">
                                  <Crown size={12} />
                                  <span className="text-xs font-bold">{pack.price}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowPackDetails(pack.id)}
                                className="text-secondary hover:text-white transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                              
                              {!isOwned && (
                                <button
                                  onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                                  disabled={!canAfford}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    canAfford
                                      ? 'bg-primary text-white hover:bg-primary/90'
                                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  {pack.price === 0 ? 'Free' : 'Buy'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {marketplacePacks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">📦</div>
                      <p>No packs found matching your criteria.</p>
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
                    placeholder="My awesome sticker"
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
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

                  {createNewPack ? (
                    <input
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      placeholder="New pack name"
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    />
                  ) : (
                    <select
                      value={selectedPackId}
                      onChange={(e) => setSelectedPackId(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      {userPacks.map((pack) => (
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