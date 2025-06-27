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
  Layers,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Grid,
  Package,
  ShoppingCart,
  Star,
  Crown,
  X,
  Edit3,
  FolderPlus,
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
    updateStickerPack,
    addStickerToPack,
    purchaseStickerPack,
    getStickersByPack,
    currentUser
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'create' | 'packs' | 'shop'>('create');
  const [selectedPack, setSelectedPack] = useState<string>('');
  const [showPackModal, setShowPackModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showStickerPreview, setShowStickerPreview] = useState<string | null>(null);
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [currentLayer, setCurrentLayer] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  
  // Save modal state
  const [stickerName, setStickerName] = useState('');
  const [selectedSavePack, setSelectedSavePack] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDescription, setNewPackDescription] = useState('');
  
  // Pack creation state
  const [newPack, setNewPack] = useState({
    name: '',
    description: '',
    category: 'custom' as const
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get owned packs for save modal
  const ownedPacks = stickerPacks.filter(pack => pack.owned);
  
  // Get stickers for selected pack in "My Packs" view
  const selectedPackStickers = selectedPack ? getStickersByPack(selectedPack) : [];
  const selectedPackData = stickerPacks.find(pack => pack.id === selectedPack);

  // Auto-generate sticker name
  useEffect(() => {
    if (showSaveModal && !stickerName) {
      const timestamp = new Date().toLocaleString();
      setStickerName(`Sticker ${timestamp}`);
    }
  }, [showSaveModal, stickerName]);

  // Layer management
  const maxLayers = Math.max(1, elements.length);
  
  const switchLayer = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentLayer < maxLayers) {
      setCurrentLayer(currentLayer + 1);
    } else if (direction === 'down' && currentLayer > 1) {
      setCurrentLayer(currentLayer - 1);
    }
  };

  const getCurrentLayerElements = () => {
    return elements.filter(el => el.layer === currentLayer);
  };

  const addElement = (type: StickerElement['type'], content: string) => {
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
      layer: currentLayer,
      style: type === 'text' ? {
        fontSize: 16,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      } : undefined
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    updateUserPoints(1);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added! (+1 CP)`);
  };

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

  // FIXED: Enhanced save sticker function with proper pack management
  const saveSticker = async () => {
    if (!stickerName.trim()) {
      toast.error('Please enter a sticker name! 📝');
      return;
    }

    if (!createNewPack && !selectedSavePack) {
      toast.error('Please select a pack or create a new one! 📦');
      return;
    }

    if (createNewPack && (!newPackName.trim() || !newPackDescription.trim())) {
      toast.error('Please fill in all pack details! 📋');
      return;
    }

    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    try {
      // Generate sticker preview (simplified for demo)
      const stickerPreview = await generateStickerPreview();
      
      // Create the sticker object
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: stickerPreview,
        tags: ['custom', 'user-created'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        elementData: [...elements], // Store the element data for editing
        packId: createNewPack ? `pack-${Date.now()}` : selectedSavePack
      };

      // Handle pack creation or selection
      let targetPackId = selectedSavePack;
      
      if (createNewPack) {
        // Create new pack
        const newPackData = {
          id: newSticker.packId!,
          name: newPackName.trim(),
          description: newPackDescription.trim(),
          stickers: [],
          category: 'custom' as const,
          count: 0,
          owned: true,
          price: 0,
          createdBy: currentUser?.id || 'user-1',
          createdAt: new Date()
        };
        
        addStickerPack(newPackData);
        targetPackId = newPackData.id;
        toast.success(`New pack "${newPackName}" created! 📦`);
      }

      // Add sticker to the pack
      addStickerToPack(newSticker, targetPackId);
      
      // Update points
      updateUserPoints(20);
      
      // Close modal and reset form
      setShowSaveModal(false);
      setStickerName('');
      setSelectedSavePack('');
      setCreateNewPack(false);
      setNewPackName('');
      setNewPackDescription('');
      
      toast.success(`Sticker "${stickerName}" saved successfully! 🎨✨ (+20 CP)`);
      
    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker. Please try again! ❌');
    }
  };

  // Generate sticker preview (simplified)
  const generateStickerPreview = async (): Promise<string> => {
    // For demo purposes, return a placeholder
    // In a real app, you'd render the canvas to an image
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
        <text x="100" y="100" text-anchor="middle" fill="#666" font-size="12">Sticker Preview</text>
        <text x="100" y="120" text-anchor="middle" fill="#999" font-size="10">${elements.length} elements</text>
      </svg>
    `)}`;
  };

  // Create new pack
  const createPack = () => {
    if (!newPack.name.trim() || !newPack.description.trim()) {
      toast.error('Please fill in all pack details! 📋');
      return;
    }

    const packData = {
      id: `pack-${Date.now()}`,
      name: newPack.name.trim(),
      description: newPack.description.trim(),
      stickers: [],
      category: newPack.category,
      count: 0,
      owned: true,
      price: 0,
      createdBy: currentUser?.id || 'user-1',
      createdAt: new Date()
    };

    addStickerPack(packData);
    setNewPack({ name: '', description: '', category: 'custom' });
    setShowPackModal(false);
    updateUserPoints(10);
    toast.success(`Pack "${packData.name}" created! 📦 (+10 CP)`);
  };

  // Download sticker
  const downloadSticker = async (sticker: Sticker) => {
    try {
      // Create a download link
      const link = document.createElement('a');
      link.href = sticker.imageUrl;
      link.download = `${sticker.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      updateStickerUsage(sticker.id);
      updateUserPoints(1);
      toast.success(`${sticker.name} downloaded! 💾 (+1 CP)`);
    } catch (error) {
      toast.error('Download failed! Please try again. ❌');
    }
  };

  // Share sticker
  const shareSticker = async (sticker: Sticker) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sticker.name,
          text: `Check out this awesome sticker: ${sticker.name}`,
          url: sticker.imageUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(sticker.imageUrl);
        toast.success('Sticker link copied to clipboard! 📋');
      }
      
      updateStickerUsage(sticker.id);
      updateUserPoints(2);
      toast.success(`${sticker.name} shared! 🚀 (+2 CP)`);
    } catch (error) {
      toast.error('Share failed! Please try again. ❌');
    }
  };

  // Mouse event handlers for drag and resize
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
      setResizeHandle(handle || '');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = Math.max(0, Math.min(400 - 60, e.clientX - rect.left - dragOffset.x));
        const newY = Math.max(0, Math.min(400 - 60, e.clientY - rect.top - dragOffset.y));
        
        updateElement(draggedElement, { x: newX, y: newY });
      }
    } else if (isResizing && selectedElement) {
      const element = elements.find(el => el.id === selectedElement);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (element && rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        let newWidth = element.width;
        let newHeight = element.height;
        
        if (resizeHandle.includes('right')) {
          newWidth = Math.max(20, mouseX - element.x);
        }
        if (resizeHandle.includes('bottom')) {
          newHeight = Math.max(20, mouseY - element.y);
        }
        
        updateElement(selectedElement, { width: newWidth, height: newHeight });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setIsResizing(false);
    setResizeHandle('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        addElement('image', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-secondary/10 to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-12 text-3xl opacity-15 animate-float">🎨</div>
        <div className="absolute top-32 right-20 text-2xl opacity-20 animate-bounce-slow">✨</div>
        <div className="absolute bottom-32 left-16 text-4xl opacity-10 animate-wiggle">🖌️</div>
        <div className="absolute bottom-16 right-12 text-2xl opacity-15 animate-pulse">🌟</div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 max-w-md mx-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'packs', label: 'My Packs', icon: Package },
              { id: 'shop', label: 'Shop', icon: ShoppingCart },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-secondary text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
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
                        {/* Layer Controls */}
                        <div className="flex items-center space-x-1 bg-dark-light rounded-lg px-2 py-1">
                          <button
                            onClick={() => setShowLayers(!showLayers)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Layers size={16} />
                          </button>
                          <span className="text-xs text-gray-400">L{currentLayer}</span>
                          <button
                            onClick={() => switchLayer('up')}
                            disabled={currentLayer >= maxLayers}
                            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => switchLayer('down')}
                            disabled={currentLayer <= 1}
                            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={clearCanvas}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas Area */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Grid Pattern */}
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
                      
                      {/* Elements */}
                      {getCurrentLayerElements().map((element) => (
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
                            zIndex: element.layer
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
                                fontSize: element.style?.fontSize || 16,
                                color: element.style?.color || '#000000',
                                fontFamily: element.style?.fontFamily || 'Arial',
                                fontWeight: element.style?.fontWeight || 'normal'
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
                          
                          {element.type === 'image' && (
                            <img
                              src={element.content}
                              alt="Sticker element"
                              className="w-full h-full object-cover rounded"
                              draggable={false}
                            />
                          )}
                          
                          {/* Resize Handles */}
                          {selectedElement === element.id && (
                            <>
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'bottom-right')}
                              />
                              <div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-ne-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'top-right')}
                              />
                              <div
                                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-sw-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'bottom-left')}
                              />
                              <div
                                className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full cursor-nw-resize"
                                onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'top-left')}
                              />
                            </>
                          )}
                        </div>
                      ))}
                      
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
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

                {/* Tools Panel */}
                <div className="space-y-4">
                  {/* Add Elements */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Add Elements</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => addElement('text', 'New Text')}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Type size={20} className="text-primary" />
                        <span className="text-white">Add Text</span>
                      </button>
                      
                      <button
                        onClick={() => addElement('emoji', '😀')}
                        className="w-full flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Smile size={20} className="text-secondary" />
                        <span className="text-white">Add Emoji</span>
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

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-semibold mb-3">Element Properties</h4>
                      <div className="space-y-3">
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Text</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Font Size</label>
                              <input
                                type="range"
                                min="8"
                                max="48"
                                value={selectedElementData.style?.fontSize || 16}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) }
                                })}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-1">Color</label>
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
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Rotation</label>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedElementData.rotation}
                            onChange={(e) => updateElement(selectedElementData.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                            className={`flex-1 p-2 rounded text-sm ${selectedElementData.flipX ? 'bg-primary text-white' : 'bg-dark-light text-gray-400'}`}
                          >
                            <FlipHorizontal size={16} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                            className={`flex-1 p-2 rounded text-sm ${selectedElementData.flipY ? 'bg-primary text-white' : 'bg-dark-light text-gray-400'}`}
                          >
                            <FlipVertical size={16} className="mx-auto" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => deleteElement(selectedElementData.id)}
                          className="w-full p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                        >
                          Delete Element
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Layers Panel */}
                  {showLayers && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <h4 className="text-white font-semibold mb-3">Layers</h4>
                      <div className="space-y-2">
                        {Array.from({ length: maxLayers }, (_, i) => i + 1).reverse().map((layer) => {
                          const layerElements = elements.filter(el => el.layer === layer);
                          return (
                            <div
                              key={layer}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                currentLayer === layer ? 'bg-primary/20 border border-primary' : 'bg-dark-light hover:bg-gray-700'
                              }`}
                              onClick={() => setCurrentLayer(layer)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm">Layer {layer}</span>
                                <span className="text-gray-400 text-xs">{layerElements.length} items</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* My Packs Tab - ENHANCED AND FUNCTIONAL */}
            {activeTab === 'packs' && (
              <motion.div
                key="packs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Pack Management Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">My Sticker Packs</h2>
                  <button
                    onClick={() => setShowPackModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <FolderPlus size={20} />
                    <span>Create Pack</span>
                  </button>
                </div>

                {/* Pack Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedPacks.map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-dark-card rounded-xl p-4 border-2 cursor-pointer transition-all ${
                        selectedPack === pack.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPack(selectedPack === pack.id ? '' : pack.id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">📦</div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                        {selectedPack === pack.id && (
                          <Check size={20} className="text-primary" />
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{pack.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created {new Date(pack.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pack.category === 'custom' ? 'bg-primary/20 text-primary' :
                          pack.category === 'roast' ? 'bg-red-500/20 text-red-400' :
                          pack.category === 'wholesome' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pack.category}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {ownedPacks.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No sticker packs yet. Create your first pack!</p>
                    </div>
                  )}
                </div>

                {/* Selected Pack Stickers */}
                {selectedPack && selectedPackData && (
                  <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedPackData.name}</h3>
                        <p className="text-gray-400">{selectedPackData.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl text-primary font-bold">{selectedPackData.count}</div>
                        <div className="text-sm text-gray-400">stickers</div>
                      </div>
                    </div>

                    {/* Stickers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {selectedPackStickers.map((sticker) => (
                        <motion.div
                          key={sticker.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-dark-light rounded-lg p-3 hover:bg-gray-700 transition-colors group"
                        >
                          <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={sticker.imageUrl}
                              alt={sticker.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="text-white text-sm font-medium truncate">{sticker.name}</h4>
                          <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                          
                          {/* Sticker Actions */}
                          <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setShowStickerPreview(sticker.id)}
                              className="flex-1 p-1 bg-primary/20 text-primary rounded text-xs hover:bg-primary/30 transition-colors"
                            >
                              <Eye size={12} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => downloadSticker(sticker)}
                              className="flex-1 p-1 bg-secondary/20 text-secondary rounded text-xs hover:bg-secondary/30 transition-colors"
                            >
                              <Download size={12} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => shareSticker(sticker)}
                              className="flex-1 p-1 bg-accent/20 text-accent rounded text-xs hover:bg-accent/30 transition-colors"
                            >
                              <Share2 size={12} className="mx-auto" />
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {selectedPackStickers.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">🎨</div>
                          <p>No stickers in this pack yet.</p>
                          <p className="text-sm">Create some stickers to add here!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Shop Tab */}
            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white text-center">Sticker Shop</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stickerPacks.filter(pack => !pack.owned).map((pack) => (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-card rounded-xl p-6 border border-gray-800"
                    >
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">
                          {pack.category === 'roast' ? '🔥' :
                           pack.category === 'wholesome' ? '💖' :
                           pack.category === 'meme' ? '😂' : '🎨'}
                        </div>
                        <h3 className="text-white font-bold text-lg">{pack.name}</h3>
                        <p className="text-gray-400 text-sm">{pack.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Stickers:</span>
                          <span className="text-white font-semibold">{pack.count}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Price:</span>
                          <div className="flex items-center space-x-1">
                            <Crown size={16} className="text-accent" />
                            <span className="text-accent font-bold">{pack.price} CP</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => purchaseStickerPack(pack.id, currentUser?.id || 'user-1')}
                          disabled={!currentUser || currentUser.clownPoints < pack.price}
                          className="w-full py-2 bg-gradient-to-r from-primary to-purple text-white rounded-lg font-semibold hover:from-primary/90 hover:to-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!currentUser || currentUser.clownPoints < pack.price ? 'Not Enough CP' : 'Purchase'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {stickerPacks.filter(pack => !pack.owned).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                    <p>All packs owned! Check back later for new releases.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FIXED: Enhanced Save Modal with Pack Management */}
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
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
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

                {/* Pack Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Save to Pack
                  </label>
                  
                  {/* Create New Pack Toggle */}
                  <div className="flex items-center space-x-2 mb-3">
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
                    /* New Pack Creation */
                    <div className="space-y-3 bg-dark-light rounded-lg p-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Pack Name</label>
                        <input
                          type="text"
                          value={newPackName}
                          onChange={(e) => setNewPackName(e.target.value)}
                          className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-600 focus:border-primary focus:outline-none"
                          placeholder="Enter pack name..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Description</label>
                        <textarea
                          value={newPackDescription}
                          onChange={(e) => setNewPackDescription(e.target.value)}
                          className="w-full bg-dark text-white rounded px-2 py-1 text-sm border border-gray-600 focus:border-primary focus:outline-none h-16 resize-none"
                          placeholder="Describe your pack..."
                        />
                      </div>
                    </div>
                  ) : (
                    /* Existing Pack Selection */
                    <select
                      value={selectedSavePack}
                      onChange={(e) => setSelectedSavePack(e.target.value)}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    >
                      <option value="">Select a pack...</option>
                      {ownedPacks.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.name} ({pack.count} stickers)
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Pack Preview */}
                  {!createNewPack && selectedSavePack && (
                    <div className="mt-2 p-3 bg-dark-light rounded-lg">
                      <div className="text-sm text-gray-300">
                        <strong>{ownedPacks.find(p => p.id === selectedSavePack)?.name}</strong>
                      </div>
                      <div className="text-xs text-gray-400">
                        {ownedPacks.find(p => p.id === selectedSavePack)?.description}
                      </div>
                    </div>
                  )}
                </div>

                {/* Canvas Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="bg-gray-200 rounded-lg p-4 text-center">
                    <div className="text-gray-600 text-sm">
                      🎨 Sticker with {elements.length} elements
                    </div>
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

      {/* Create Pack Modal */}
      <AnimatePresence>
        {showPackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create New Pack</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pack Name
                  </label>
                  <input
                    type="text"
                    value={newPack.name}
                    onChange={(e) => setNewPack({ ...newPack, name: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                    placeholder="Enter pack name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPack.description}
                    onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none h-20 resize-none"
                    placeholder="Describe your pack..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newPack.category}
                    onChange={(e) => setNewPack({ ...newPack, category: e.target.value as any })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                  >
                    <option value="custom">Custom</option>
                    <option value="wholesome">Wholesome</option>
                    <option value="cursed">Cursed</option>
                    <option value="roast">Roast</option>
                    <option value="meme">Meme</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPackModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPack}
                  className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Create Pack
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticker Preview Modal */}
      <AnimatePresence>
        {showStickerPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStickerPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const sticker = stickers.find(s => s.id === showStickerPreview);
                if (!sticker) return null;
                
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">{sticker.name}</h2>
                      <button
                        onClick={() => setShowStickerPreview(null)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="bg-gray-200 rounded-lg p-8 mb-4 text-center">
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.name}
                        className="max-w-full max-h-64 mx-auto"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span>Used {sticker.usageCount} times</span>
                      <span>Created by {sticker.createdBy}</span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          downloadSticker(sticker);
                          setShowStickerPreview(null);
                        }}
                        className="flex-1 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => {
                          shareSticker(sticker);
                          setShowStickerPreview(null);
                        }}
                        className="flex-1 py-2 bg-accent text-dark rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Share2 size={16} />
                        <span>Share</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};