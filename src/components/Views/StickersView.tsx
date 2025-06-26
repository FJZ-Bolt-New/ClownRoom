import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Type, 
  Image, 
  Save, 
  X, 
  Download, 
  Share2, 
  Palette, 
  Smile,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Layers
} from 'lucide-react';
import { Sticker, StickerElement } from '../../types';
import toast from 'react-hot-toast';

export const StickersView = () => {
  const { 
    stickers, 
    addSticker, 
    stickerPacks, 
    addStickerToPack, 
    updateStickerPack,
    updateUserPoints 
  } = useStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'gallery' | 'create'>('gallery');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Sticker creation state
  const [stickerName, setStickerName] = useState('');
  const [stickerTags, setStickerTags] = useState<string[]>([]);
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [selectedPackId, setSelectedPackId] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [showNewPackInput, setShowNewPackInput] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji categories - restored from previous version
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔'],
    'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️'],
    'Objects': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🪁', '🏹', '🎣'],
    'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'],
    'Faces': ['😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱']
  };

  const allTags = ['funny', 'cute', 'cool', 'epic', 'meme', 'wholesome', 'cursed', 'random', 'art', 'custom'];

  // Fixed layer management functions
  const getMaxLayer = () => {
    return elements.length > 0 ? Math.max(...elements.map(el => el.layer)) : 0;
  };

  const moveElementLayer = (elementId: string, direction: 'up' | 'down' | 'front' | 'back') => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(el => el.id === elementId);
      if (elementIndex === -1) return prevElements;

      const newElements = [...prevElements];
      const element = newElements[elementIndex];
      const maxLayer = getMaxLayer();

      switch (direction) {
        case 'front':
          element.layer = maxLayer + 1;
          break;
        case 'back':
          element.layer = 0;
          // Shift all other elements up
          newElements.forEach(el => {
            if (el.id !== elementId) {
              el.layer += 1;
            }
          });
          break;
        case 'up':
          if (element.layer < maxLayer) {
            // Find element with next higher layer and swap
            const higherElement = newElements.find(el => el.layer === element.layer + 1);
            if (higherElement) {
              higherElement.layer = element.layer;
              element.layer += 1;
            } else {
              element.layer += 1;
            }
          }
          break;
        case 'down':
          if (element.layer > 0) {
            // Find element with next lower layer and swap
            const lowerElement = newElements.find(el => el.layer === element.layer - 1);
            if (lowerElement) {
              lowerElement.layer = element.layer;
              element.layer -= 1;
            } else {
              element.layer -= 1;
            }
          }
          break;
      }

      // Normalize layers to ensure they're sequential
      const sortedElements = newElements.sort((a, b) => a.layer - b.layer);
      sortedElements.forEach((el, index) => {
        el.layer = index;
      });

      return sortedElements;
    });
  };

  const toggleElementVisibility = (elementId: string) => {
    setElements(prevElements =>
      prevElements.map(el =>
        el.id === elementId
          ? { ...el, visible: !el.visible }
          : el
      )
    );
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const newElement: StickerElement = {
      ...element,
      id: `element-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20,
      layer: getMaxLayer() + 1
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    toast.success('Element duplicated! 📋');
  };

  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
    toast.success('Element deleted! 🗑️');
  };

  // Add text element
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      x: 50,
      y: 50,
      width: 100,
      height: 30,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      visible: true,
      style: {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  // Add emoji element - restored previous functionality
  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `element-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 50,
      y: 50,
      width: 40,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: getMaxLayer() + 1,
      visible: true
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setShowEmojiPicker(false);
    toast.success(`Added ${emoji} emoji! 🎨`);
  };

  // Add image element
  const addImageElement = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      
      const newElement: StickerElement = {
        id: `element-${Date.now()}`,
        type: 'image',
        content: file.name,
        x: 50,
        y: 50,
        width: 80,
        height: 80,
        rotation: 0,
        flipX: false,
        flipY: false,
        layer: getMaxLayer() + 1,
        visible: true,
        imageData
      };
      
      setElements(prev => [...prev, newElement]);
      setSelectedElement(newElement.id);
      toast.success('Image added! 🖼️');
    };
    
    reader.readAsDataURL(file);
  };

  // Mouse event handlers for drag and resize
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedElement(elementId);
    
    if (action === 'drag') {
      setIsDragging(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - element.x,
          y: e.clientY - rect.top - element.y
        });
      }
    } else if (action === 'resize') {
      setIsResizing(true);
    }
  }, [elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!selectedElement || (!isDragging && !isResizing)) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setElements(prev => prev.map(el => {
      if (el.id !== selectedElement) return el;

      if (isDragging) {
        return {
          ...el,
          x: Math.max(0, Math.min(mouseX - dragOffset.x, 300 - el.width)),
          y: Math.max(0, Math.min(mouseY - dragOffset.y, 300 - el.height))
        };
      } else if (isResizing) {
        const newWidth = Math.max(20, mouseX - el.x);
        const newHeight = Math.max(20, mouseY - el.y);
        return {
          ...el,
          width: Math.min(newWidth, 300 - el.x),
          height: Math.min(newHeight, 300 - el.y)
        };
      }

      return el;
    }));
  }, [selectedElement, isDragging, isResizing, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Update element style
  const updateElementStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    setElements(prev => prev.map(el => {
      if (el.id !== selectedElement) return el;
      
      if (property === 'content') {
        return { ...el, content: value };
      } else {
        return {
          ...el,
          style: { ...el.style, [property]: value }
        };
      }
    }));
  };

  // Save sticker
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
      // Create canvas for preview
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      // Clear canvas
      ctx.clearRect(0, 0, 300, 300);

      // Sort elements by layer for proper rendering
      const sortedElements = [...elements].sort((a, b) => a.layer - b.layer);

      // Render each element
      for (const element of sortedElements) {
        if (!element.visible) continue;

        ctx.save();
        
        // Apply transformations
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1);

        if (element.type === 'text') {
          ctx.fillStyle = element.style?.color || '#ffffff';
          ctx.font = `${element.style?.fontWeight || 'normal'} ${element.style?.fontSize || 16}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'emoji') {
          ctx.font = `${element.height}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content, 0, 0);
        } else if (element.type === 'image' && element.imageData) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
          };
          img.src = element.imageData;
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
        createdBy: 'user-1',
        usageCount: 0,
        elementData: elements
      };

      // Handle pack selection
      if (selectedPackId === 'new' && newPackName.trim()) {
        // Create new pack
        const newPack = {
          id: `pack-${Date.now()}`,
          name: newPackName,
          description: 'Custom sticker pack',
          stickers: [newSticker],
          category: 'custom' as const,
          count: 1,
          owned: true,
          price: 0,
          createdBy: 'user-1',
          createdAt: new Date()
        };
        
        addStickerToPack(newSticker, newPack.id);
        updateUserPoints(10);
        toast.success(`Sticker saved to new pack "${newPackName}"! 🎉 (+10 CP)`);
      } else {
        // Add to existing pack
        addStickerToPack(newSticker, selectedPackId);
        updateUserPoints(10);
        
        const pack = stickerPacks.find(p => p.id === selectedPackId);
        toast.success(`Sticker saved to "${pack?.name}"! 🎉 (+10 CP)`);
      }

      // Reset form
      setStickerName('');
      setStickerTags([]);
      setElements([]);
      setSelectedElement(null);
      setShowCreateModal(false);
      setNewPackName('');
      setShowNewPackInput(false);
      setSelectedPackId('pack-default');

    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  const toggleTag = (tag: string) => {
    setStickerTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  // Get sorted elements for layer panel (top to bottom)
  const sortedElementsForDisplay = [...elements].sort((a, b) => b.layer - a.layer);

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
        <div className="max-w-md mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-4">
            {[
              { id: 'gallery', label: 'Gallery', icon: Image },
              { id: 'create', label: 'Create', icon: Plus },
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
            {/* Gallery Tab */}
            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Search and Filter */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Search stickers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  />
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>

                {/* Sticker Packs */}
                <div className="space-y-4">
                  {stickerPacks.filter(pack => pack.owned).map((pack) => (
                    <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{pack.name}</h3>
                        <span className="text-secondary text-sm">{pack.count} stickers</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {pack.stickers.slice(0, 8).map((sticker) => (
                          <div
                            key={sticker.id}
                            className="aspect-square bg-dark-light rounded-lg p-2 hover:bg-gray-700 transition-colors cursor-pointer"
                          >
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ))}
                        
                        {pack.count > 8 && (
                          <div className="aspect-square bg-dark-light rounded-lg flex items-center justify-center text-gray-400 text-xs">
                            +{pack.count - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create New Sticker Button */}
                <motion.button
                  onClick={() => setActiveTab('create')}
                  className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-xl p-4 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus size={20} />
                    <span>Create New Sticker</span>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Create Tab */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Canvas and Tools */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold">Sticker Canvas</h3>
                    <button
                      onClick={() => setShowLayerPanel(!showLayerPanel)}
                      className={`p-2 rounded-lg transition-colors ${
                        showLayerPanel ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Layers size={16} />
                    </button>
                  </div>

                  <div className="flex space-x-4">
                    {/* Layer Panel */}
                    {showLayerPanel && (
                      <div className="w-48 bg-dark-light rounded-lg p-3 border border-gray-700">
                        <h4 className="text-white font-semibold mb-2 text-sm">Layers</h4>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {sortedElementsForDisplay.map((element, index) => (
                            <div
                              key={element.id}
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                selectedElement === element.id
                                  ? 'bg-secondary/20 border border-secondary'
                                  : 'hover:bg-gray-700'
                              }`}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleElementVisibility(element.id);
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                {element.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                              </button>
                              
                              <div className="flex-1 flex items-center space-x-2">
                                <span className="text-xs">
                                  {element.type === 'text' ? '📝' : 
                                   element.type === 'emoji' ? element.content : '🖼️'}
                                </span>
                                <span className="text-xs text-gray-300 truncate">
                                  {element.type === 'text' ? element.content : 
                                   element.type === 'emoji' ? 'Emoji' : 'Image'}
                                </span>
                              </div>
                              
                              <span className="text-xs text-gray-500">#{element.layer}</span>
                              
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Toggle context menu
                                  }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <MoreVertical size={12} />
                                </button>
                                
                                {/* Context Menu */}
                                <div className="absolute right-0 top-6 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-20 min-w-32 hidden group-hover:block">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'front');
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ChevronUp size={10} />
                                    <span>To Front</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'up');
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ArrowUp size={10} />
                                    <span>Move Up</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'down');
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ArrowDown size={10} />
                                    <span>Move Down</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveElementLayer(element.id, 'back');
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <ChevronDown size={10} />
                                    <span>To Back</span>
                                  </button>
                                  <hr className="border-gray-700" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateElement(element.id);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <Copy size={10} />
                                    <span>Duplicate</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteElement(element.id);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                                  >
                                    <Trash2 size={10} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {elements.length === 0 && (
                            <div className="text-center py-4 text-gray-400 text-xs">
                              No elements yet
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Canvas */}
                    <div className="flex-1">
                      <div
                        ref={canvasRef}
                        className="relative w-full aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Render elements sorted by layer */}
                        {[...elements]
                          .filter(el => el.visible !== false)
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
                              zIndex: element.layer
                            }}
                            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
                          >
                            {element.type === 'text' && (
                              <div
                                className="w-full h-full flex items-center justify-center text-center break-words"
                                style={{
                                  fontSize: element.style?.fontSize || 16,
                                  color: element.style?.color || '#ffffff',
                                  fontFamily: element.style?.fontFamily || 'Arial',
                                  fontWeight: element.style?.fontWeight || 'normal'
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
                            
                            {/* Resize handle */}
                            {selectedElement === element.id && (
                              <div
                                className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full cursor-se-resize transform translate-x-1 translate-y-1"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize')}
                              />
                            )}
                          </div>
                        ))}
                        
                        {elements.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            Add elements to start creating
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tools */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3">Add Elements</h3>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      onClick={addTextElement}
                      className="flex flex-col items-center space-y-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Type size={20} className="text-secondary" />
                      <span className="text-xs text-gray-300">Text</span>
                    </button>
                    
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="flex flex-col items-center space-y-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Smile size={20} className="text-accent" />
                      <span className="text-xs text-gray-300">Emoji</span>
                    </button>
                    
                    <button
                      onClick={addImageElement}
                      className="flex flex-col items-center space-y-2 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Image size={20} className="text-purple" />
                      <span className="text-xs text-gray-300">Image</span>
                    </button>
                  </div>

                  {/* Emoji Picker - Restored Previous Version */}
                  {showEmojiPicker && (
                    <div className="bg-dark-light rounded-lg p-3 border border-gray-700 mb-4">
                      <div className="max-h-48 overflow-y-auto">
                        {Object.entries(emojiCategories).map(([category, emojis]) => (
                          <div key={category} className="mb-3">
                            <h4 className="text-xs text-gray-400 mb-2">{category}</h4>
                            <div className="grid grid-cols-8 gap-1">
                              {emojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => addEmojiElement(emoji)}
                                  className="p-1 text-lg hover:bg-gray-700 rounded transition-colors"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-light rounded-lg p-3 border border-gray-700">
                      <h4 className="text-white font-semibold mb-2">Element Properties</h4>
                      
                      {selectedElementData.type === 'text' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={selectedElementData.content}
                            onChange={(e) => updateElementStyle('content', e.target.value)}
                            className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-600"
                            placeholder="Text content"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={selectedElementData.style?.fontSize || 16}
                              onChange={(e) => updateElementStyle('fontSize', parseInt(e.target.value))}
                              className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-600"
                              placeholder="Font size"
                              min="8"
                              max="72"
                            />
                            
                            <input
                              type="color"
                              value={selectedElementData.style?.color || '#ffffff'}
                              onChange={(e) => updateElementStyle('color', e.target.value)}
                              className="w-full bg-dark rounded border border-gray-600 h-8"
                            />
                          </div>
                          
                          <select
                            value={selectedElementData.style?.fontWeight || 'normal'}
                            onChange={(e) => updateElementStyle('fontWeight', e.target.value)}
                            className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-600"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save Section */}
                <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                  <h3 className="text-white font-bold mb-3">Save Sticker</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={stickerName}
                      onChange={(e) => setStickerName(e.target.value)}
                      placeholder="Sticker name..."
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                    />
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-1 rounded-full text-xs transition-colors ${
                              stickerTags.includes(tag)
                                ? 'bg-secondary text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Save to Pack</label>
                      <select
                        value={selectedPackId}
                        onChange={(e) => {
                          setSelectedPackId(e.target.value);
                          setShowNewPackInput(e.target.value === 'new');
                        }}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                      >
                        {stickerPacks.filter(pack => pack.owned).map((pack) => (
                          <option key={pack.id} value={pack.id}>
                            {pack.name} ({pack.count} stickers)
                          </option>
                        ))}
                        <option value="new">Create New Pack</option>
                      </select>
                      
                      {showNewPackInput && (
                        <input
                          type="text"
                          value={newPackName}
                          onChange={(e) => setNewPackName(e.target.value)}
                          placeholder="New pack name..."
                          className="w-full mt-2 bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none"
                        />
                      )}
                    </div>
                    
                    <button
                      onClick={saveSticker}
                      disabled={!stickerName.trim() || elements.length === 0}
                      className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Save size={20} />
                        <span>Save Sticker</span>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};