import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Image, 
  Type, 
  Smile, 
  Save, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Move, 
  RotateCw, 
  Palette,
  Package,
  ShoppingBag,
  Star,
  Download,
  Trash2,
  RefreshCw
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
    addStickerPack,
    purchaseStickerPack,
    currentUser
  } = useStore();
  
  // Main state
  const [activeTab, setActiveTab] = useState<'create' | 'my-stickers' | 'my-packs' | 'explore'>('create');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Canvas state
  const [elements, setElements] = useState<StickerElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Save modal state
  const [stickerName, setStickerName] = useState('');
  const [selectedPack, setSelectedPack] = useState('pack-default');
  const [newPackName, setNewPackName] = useState('');
  const [createNewPack, setCreateNewPack] = useState(false);
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Get owned sticker packs
  const ownedPacks = stickerPacks.filter(pack => pack.owned);
  const explorePacks = stickerPacks.filter(pack => !pack.owned);

  // FIXED: Layer management with proper z-index
  const getMinLayer = () => 1;
  const getMaxLayer = () => Math.max(1, elements.length);
  
  const getCurrentElement = () => {
    return elements.find(el => el.layer === currentLayer);
  };

  const updateElementLayer = (elementId: string, newLayer: number) => {
    // Ensure layer is within bounds
    const minLayer = getMinLayer();
    const maxLayer = getMaxLayer();
    const boundedLayer = Math.max(minLayer, Math.min(maxLayer, newLayer));
    
    setElements(prev => {
      const newElements = [...prev];
      
      // Find the element to move
      const elementIndex = newElements.findIndex(el => el.id === elementId);
      if (elementIndex === -1) return prev;
      
      const element = newElements[elementIndex];
      const oldLayer = element.layer;
      
      // Update all elements' layers to maintain proper z-index order
      newElements.forEach(el => {
        if (el.id === elementId) {
          el.layer = boundedLayer;
        } else if (boundedLayer > oldLayer) {
          // Moving forward: shift elements between old and new layer backward
          if (el.layer > oldLayer && el.layer <= boundedLayer) {
            el.layer = Math.max(1, el.layer - 1);
          }
        } else if (boundedLayer < oldLayer) {
          // Moving backward: shift elements between new and old layer forward
          if (el.layer >= boundedLayer && el.layer < oldLayer) {
            el.layer = Math.min(elements.length, el.layer + 1);
          }
        }
      });
      
      return newElements;
    });
    
    setCurrentLayer(boundedLayer);
  };

  const moveLayerUp = () => {
    const currentElement = getCurrentElement();
    if (currentElement && currentLayer < getMaxLayer()) {
      updateElementLayer(currentElement.id, currentLayer + 1);
    }
  };

  const moveLayerDown = () => {
    const currentElement = getCurrentElement();
    if (currentElement && currentLayer > getMinLayer()) {
      updateElementLayer(currentElement.id, currentLayer - 1);
    }
  };

  const setLayerNumber = (layer: number) => {
    const currentElement = getCurrentElement();
    if (currentElement) {
      updateElementLayer(currentElement.id, layer);
    }
  };

  // FIXED: Click to select element and show properties
  const selectElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElement(elementId);
      setCurrentLayer(element.layer);
    }
  };

  // Add element functions
  const addTextElement = () => {
    const newElement: StickerElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Your Text',
      x: 100,
      y: 100,
      width: 120,
      height: 40,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
      style: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
      },
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    setShowCreateModal(false);
  };

  const addEmojiElement = (emoji: string) => {
    const newElement: StickerElement = {
      id: `emoji-${Date.now()}`,
      type: 'emoji',
      content: emoji,
      x: 120,
      y: 120,
      width: 60,
      height: 60,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    setShowCreateModal(false);
  };

  const addImageElement = () => {
    const newElement: StickerElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      content: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=200',
      x: 80,
      y: 80,
      width: 100,
      height: 100,
      rotation: 0,
      flipX: false,
      flipY: false,
      layer: elements.length + 1,
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
    setCurrentLayer(newElement.layer);
    setShowCreateModal(false);
  };

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<StickerElement>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setElements(prev => {
      const newElements = prev.filter(el => el.id !== elementId);
      // Reorder layers after deletion
      return newElements.map((el, index) => ({ ...el, layer: index + 1 }));
    });
    
    if (selectedElement === elementId) {
      setSelectedElement(null);
      setCurrentLayer(1);
    }
  };

  // FIXED: Clear all elements
  const clearAllElements = () => {
    setElements([]);
    setSelectedElement(null);
    setCurrentLayer(1);
    toast.success('Canvas cleared! 🧹');
  };

  // FIXED: Save sticker with proper feedback and no auto-clear
  const handleSaveSticker = async () => {
    if (elements.length === 0) {
      toast.error('Add some elements to your sticker first! 🎨');
      return;
    }

    if (!stickerName.trim()) {
      toast.error('Give your sticker a name! 📝');
      return;
    }

    try {
      let targetPackId = selectedPack;
      
      // Create new pack if requested
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
      }

      // Create the sticker
      const newSticker: Sticker = {
        id: `sticker-${Date.now()}`,
        name: stickerName.trim(),
        imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjlkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdGlja2VyPC90ZXh0Pjwvc3ZnPg==',
        tags: ['custom', 'handmade'],
        createdBy: currentUser?.id || 'user-1',
        usageCount: 0,
        packId: targetPackId,
        elementData: elements, // Store the element data for editing
      };

      // Add sticker to the pack
      addStickerToPack(newSticker, targetPackId);
      updateUserPoints(10);

      // FIXED: Show success message and close modal with delay
      toast.success(`✨ Sticker '${stickerName}' saved successfully! (+10 CP)`, {
        duration: 4000,
        icon: '🎨',
      });

      // Close modal after short delay
      setTimeout(() => {
        setShowSaveModal(false);
        // Reset only the save form, NOT the canvas
        setStickerName('');
        setNewPackName('');
        setCreateNewPack(false);
        setSelectedPack('pack-default');
      }, 1500);

    } catch (error) {
      console.error('Error saving sticker:', error);
      toast.error('Failed to save sticker! Please try again. 😞');
    }
  };

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    // Select the element
    selectElement(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const offsetX = e.clientX - rect.left - element.x;
    const offsetY = e.clientY - rect.top - element.y;
    
    setIsDragging(true);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    updateElement(selectedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Purchase sticker pack
  const handlePurchasePack = (packId: string) => {
    const pack = stickerPacks.find(p => p.id === packId);
    if (!pack || !currentUser) return;
    
    if (currentUser.clownPoints < pack.price) {
      toast.error(`Not enough ClownPoints! Need ${pack.price} CP. 💰`);
      return;
    }
    
    purchaseStickerPack(packId, currentUser.id);
    toast.success(`🎉 ${pack.name} pack purchased! (+${pack.count} stickers)`);
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  const emojiOptions = ['😀', '😂', '😍', '🤔', '😎', '🤯', '😈', '🤡', '👻', '💀', '🔥', '💯', '⚡', '💎', '🌟', '✨', '🎉', '🎊', '🎈', '🎁', '🎪', '🎭', '🎨', '🚀', '💫', '⭐', '🌈', '🦄', '🐉', '👑'];

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
          <div className="flex bg-dark-card rounded-xl p-1 mb-6 overflow-x-auto">
            {[
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'my-stickers', label: 'My Stickers', icon: Package },
              { id: 'my-packs', label: 'My Packs', icon: Star },
              { id: 'explore', label: 'Explore Packs', icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all whitespace-nowrap ${
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
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center space-x-2"
                        >
                          <Plus size={16} />
                          <span>Add Element</span>
                        </button>
                        <button
                          onClick={clearAllElements}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw size={16} />
                          <span>Clear All</span>
                        </button>
                        <button
                          onClick={() => setShowSaveModal(true)}
                          disabled={elements.length === 0}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Save size={16} />
                          <span>Save Sticker</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Canvas */}
                    <div 
                      ref={canvasRef}
                      className="relative w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 overflow-hidden"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {elements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <p>Click "Add Element" to start creating!</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Render elements with proper z-index based on layer */}
                      {elements
                        .sort((a, b) => a.layer - b.layer) // Sort by layer for proper z-index
                        .map((element) => (
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
                            zIndex: element.layer, // FIXED: Proper z-index based on layer
                          }}
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectElement(element.id); // FIXED: Click to select
                          }}
                        >
                          {element.type === 'text' && (
                            <div
                              style={{
                                fontSize: element.style?.fontSize || 24,
                                color: element.style?.color || '#000000',
                                fontFamily: element.style?.fontFamily || 'Arial',
                                fontWeight: element.style?.fontWeight || 'normal',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          
                          {element.type === 'emoji' && (
                            <div
                              style={{
                                fontSize: Math.min(element.width, element.height),
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
                          
                          {element.type === 'image' && (
                            <img
                              src={element.content}
                              alt="Sticker element"
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
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="space-y-4">
                  {/* Layer Controls */}
                  <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                    <h4 className="text-white font-semibold mb-3">Layer Controls</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Current Layer:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={moveLayerDown}
                            disabled={currentLayer <= getMinLayer() || !getCurrentElement()}
                            className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <input
                            type="number"
                            value={currentLayer}
                            onChange={(e) => setLayerNumber(parseInt(e.target.value) || 1)}
                            min={getMinLayer()}
                            max={getMaxLayer()}
                            className="w-12 text-center bg-dark-light text-white rounded px-1 py-1 text-sm"
                          />
                          <button
                            onClick={moveLayerUp}
                            disabled={currentLayer >= getMaxLayer() || !getCurrentElement()}
                            className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronUp size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        Total layers: {getMaxLayer()} | Range: {getMinLayer()}-{getMaxLayer()}
                      </div>
                    </div>
                  </div>

                  {/* Element Properties */}
                  {selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold">Element Properties</h4>
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
                          <label className="block text-gray-300 text-sm mb-1">Position</label>
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
                          <label className="block text-gray-300 text-sm mb-1">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              value={Math.round(selectedElementData.width)}
                              onChange={(e) => updateElement(selectedElementData.id, { width: parseInt(e.target.value) || 1 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="Width"
                              min="1"
                            />
                            <input
                              type="number"
                              value={Math.round(selectedElementData.height)}
                              onChange={(e) => updateElement(selectedElementData.id, { height: parseInt(e.target.value) || 1 })}
                              className="bg-dark-light text-white rounded px-2 py-1 text-sm"
                              placeholder="Height"
                              min="1"
                            />
                          </div>
                        </div>

                        {/* Rotation */}
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Rotation</label>
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

                        {/* Text-specific properties */}
                        {selectedElementData.type === 'text' && (
                          <>
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Text Content</label>
                              <input
                                type="text"
                                value={selectedElementData.content}
                                onChange={(e) => updateElement(selectedElementData.id, { content: e.target.value })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Font Size</label>
                              <input
                                type="number"
                                value={selectedElementData.style?.fontSize || 24}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, fontSize: parseInt(e.target.value) || 24 }
                                })}
                                className="w-full bg-dark-light text-white rounded px-2 py-1 text-sm"
                                min="8"
                                max="72"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-gray-300 text-sm mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedElementData.style?.color || '#ffffff'}
                                onChange={(e) => updateElement(selectedElementData.id, { 
                                  style: { ...selectedElementData.style, color: e.target.value }
                                })}
                                className="w-full h-8 bg-dark-light rounded"
                              />
                            </div>
                          </>
                        )}

                        {/* Flip controls */}
                        <div>
                          <label className="block text-gray-300 text-sm mb-2">Flip</label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateElement(selectedElementData.id, { flipX: !selectedElementData.flipX })}
                              className={`flex-1 py-1 px-2 rounded text-sm transition-colors ${
                                selectedElementData.flipX 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              Flip X
                            </button>
                            <button
                              onClick={() => updateElement(selectedElementData.id, { flipY: !selectedElementData.flipY })}
                              className={`flex-1 py-1 px-2 rounded text-sm transition-colors ${
                                selectedElementData.flipY 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              Flip Y
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedElementData && (
                    <div className="bg-dark-card rounded-xl p-4 border border-gray-800 text-center">
                      <div className="text-gray-400">
                        <Move size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Click on an element to edit its properties</p>
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stickers.filter(sticker => sticker.createdBy === currentUser?.id).map((sticker) => (
                    <div key={sticker.id} className="bg-dark-card rounded-xl p-4 border border-gray-800 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="text-white font-semibold text-sm mb-1">{sticker.name}</h4>
                      <p className="text-gray-400 text-xs">Used {sticker.usageCount} times</p>
                    </div>
                  ))}
                  
                  {stickers.filter(sticker => sticker.createdBy === currentUser?.id).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No stickers created yet. Start creating! 🎨</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedPacks.map((pack) => (
                    <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{pack.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pack.category === 'custom' ? 'bg-primary/20 text-primary' :
                          pack.category === 'roast' ? 'bg-orange/20 text-orange' :
                          pack.category === 'wholesome' ? 'bg-secondary/20 text-secondary' :
                          'bg-purple/20 text-purple'
                        }`}>
                          {pack.category}
                        </span>
                        <button className="text-secondary hover:text-white transition-colors">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {explorePacks.map((pack) => (
                    <div key={pack.id} className="bg-dark-card rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange rounded-lg flex items-center justify-center">
                          <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold">{pack.name}</h3>
                          <p className="text-gray-400 text-sm">{pack.count} stickers</p>
                        </div>
                        <div className="text-right">
                          <div className="text-accent font-bold">{pack.price} CP</div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-4">{pack.description}</p>
                      <button
                        onClick={() => handlePurchasePack(pack.id)}
                        disabled={!currentUser || currentUser.clownPoints < pack.price}
                        className="w-full bg-gradient-to-r from-accent to-orange text-white rounded-lg py-2 font-semibold hover:from-accent/90 hover:to-orange/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to My Stickers
                      </button>
                    </div>
                  ))}
                  
                  {explorePacks.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No packs available for purchase right now! 🛍️</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Element Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Add Element</h2>
              
              <div className="space-y-3">
                <button
                  onClick={addTextElement}
                  className="w-full flex items-center space-x-3 p-4 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Type size={24} className="text-primary" />
                  <div className="text-left">
                    <div className="text-white font-semibold">Add Text</div>
                    <div className="text-gray-400 text-sm">Add custom text to your sticker</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    // Show emoji picker
                    setShowCreateModal(false);
                    // For now, add a random emoji
                    const randomEmoji = emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
                    addEmojiElement(randomEmoji);
                  }}
                  className="w-full flex items-center space-x-3 p-4 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Smile size={24} className="text-secondary" />
                  <div className="text-left">
                    <div className="text-white font-semibold">Add Emoji</div>
                    <div className="text-gray-400 text-sm">Add fun emojis and symbols</div>
                  </div>
                </button>
                
                <button
                  onClick={addImageElement}
                  className="w-full flex items-center space-x-3 p-4 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Image size={24} className="text-accent" />
                  <div className="text-left">
                    <div className="text-white font-semibold">Add Image</div>
                    <div className="text-gray-400 text-sm">Upload or use stock images</div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full mt-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <label className="block text-gray-300 text-sm mb-2">Sticker Name</label>
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
                  <label className="block text-gray-300 text-sm mb-2">Save to Pack</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-pack"
                        name="pack-option"
                        checked={!createNewPack}
                        onChange={() => setCreateNewPack(false)}
                        className="text-primary"
                      />
                      <label htmlFor="existing-pack" className="text-white">Existing Pack</label>
                    </div>
                    
                    {!createNewPack && (
                      <select
                        value={selectedPack}
                        onChange={(e) => setSelectedPack(e.target.value)}
                        className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none"
                      >
                        {ownedPacks.map((pack) => (
                          <option key={pack.id} value={pack.id}>
                            {pack.name} ({pack.count} stickers)
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="new-pack"
                        name="pack-option"
                        checked={createNewPack}
                        onChange={() => setCreateNewPack(true)}
                        className="text-primary"
                      />
                      <label htmlFor="new-pack" className="text-white">Create New Pack</label>
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
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSticker}
                  disabled={!stickerName.trim() || (createNewPack && !newPackName.trim())}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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