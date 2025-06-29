import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Plus, Users, Lock, Copy, Search, Settings, UserPlus, Crown, Shield, User, Trash2 } from 'lucide-react';
import { Room } from '../../types';
import toast from 'react-hot-toast';

export const RoomsView = () => {
  const { 
    rooms, 
    addRoom, 
    setCurrentRoom, 
    setActiveView, 
    updateRoom, 
    deleteRoom, 
    joinRoomByCode, // NEW: Use the enhanced join function
    currentUser,
    themeSettings // Get theme settings
  } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    theme: 'neon' as Room['theme'],
    avatar: '🔥',
  });

  // Enhanced themes with proper light/dark mode support
  const themes = [
    // Dark mode themes
    { id: 'neon', name: 'Neon', gradient: 'from-primary via-secondary to-purple', emoji: '⚡', mode: 'dark' },
    { id: 'retro', name: 'Retro', gradient: 'from-orange via-accent to-secondary', emoji: '🌆', mode: 'dark' },
    { id: 'cyberpunk', name: 'Cyberpunk', gradient: 'from-secondary via-purple to-primary', emoji: '🤖', mode: 'dark' },
    { id: 'rainbow', name: 'Rainbow', gradient: 'from-primary via-accent to-secondary', emoji: '🌈', mode: 'dark' },
    // Light mode themes
    { id: 'minimal', name: 'Minimal', gradient: 'from-primary via-secondary to-accent', emoji: '🌸', mode: 'light' },
    { id: 'nature', name: 'Nature', gradient: 'from-primary via-secondary to-accent', emoji: '🌿', mode: 'light' },
    { id: 'ocean', name: 'Ocean', gradient: 'from-primary via-secondary to-accent', emoji: '🌊', mode: 'light' },
    { id: 'sunset', name: 'Sunset', gradient: 'from-primary via-secondary to-accent', emoji: '🌅', mode: 'light' },
  ] as const;

  const avatars = ['🔥', '💀', '🌟', '⚡', '🎭', '🎪', '🎨', '🚀', '👑', '💎'];

  // Filter themes based on current dark mode setting
  const getAvailableThemes = () => {
    if (themeSettings.darkMode) {
      return themes.filter(theme => theme.mode === 'dark');
    } else {
      return themes.filter(theme => theme.mode === 'light');
    }
  };

  // Generate a 6-character invite code
  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateRoom = () => {
    if (!newRoom.name.trim()) {
      toast.error('Room name is required! 📝');
      return;
    }

    if (!currentUser) {
      toast.error('You must be signed in to create a room! 🔑');
      return;
    }

    const room: Room = {
      id: `room-${Date.now()}`,
      ...newRoom,
      members: [{
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
        role: 'owner',
        joinedAt: new Date(),
      }],
      createdBy: currentUser.id,
      createdAt: new Date(),
      isPrivate: true,
      inviteCode: generateInviteCode(), // Now generates 6-character codes
    };
    
    addRoom(room);
    setShowCreateModal(false);
    setNewRoom({ name: '', description: '', theme: getAvailableThemes()[0].id as Room['theme'], avatar: '🔥' });
    toast.success(`Room "${room.name}" created! 🎉 Invite code: ${room.inviteCode}`);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      toast.error('Enter an invite code! 🔑');
      return;
    }

    if (!currentUser) {
      toast.error('You must be signed in to join a room! 🔑');
      return;
    }

    // First, check if the room exists
    const room = rooms.find(r => r.inviteCode.toLowerCase() === joinCode.trim().toLowerCase());
    
    if (!room) {
      toast.error('Invalid invite code! 😵 Make sure you entered it correctly.');
      return;
    }

    // Check if user is already a member
    const isAlreadyMember = room.members.some(member => member.id === currentUser.id);
    
    if (isAlreadyMember) {
      // User is already in this room - show friendly message and navigate to it
      setCurrentRoom(room);
      setActiveView('roasts');
      setShowJoinModal(false);
      setJoinCode('');
      toast.success(`🎪 You're already in "${room.name}"! Welcome back! 🤡`, {
        duration: 4000,
        icon: room.avatar,
      });
      return;
    }

    // Use the enhanced join function for new members
    const success = joinRoomByCode(joinCode.trim(), currentUser);
    
    if (success) {
      setActiveView('roasts');
      setShowJoinModal(false);
      setJoinCode('');
      toast.success(`Successfully joined "${room.name}"! 🎪 Welcome to the chaos!`, {
        duration: 4000,
        icon: room.avatar,
      });
    } else {
      toast.error('Unable to join room! Please try again. 😵');
    }
  };

  const handleRoomClick = (room: Room) => {
    // Check if current user is a member of this room
    const isMember = room.members.some(member => member.id === currentUser?.id);
    
    if (!isMember && currentUser) {
      // User is not a member, try to join them automatically
      const success = joinRoomByCode(room.inviteCode, currentUser);
      if (!success) {
        toast.error('Unable to join this room! 🚫');
        return;
      }
      toast.success(`Joined "${room.name}"! 🎪 Welcome to the chaos!`, {
        duration: 3000,
        icon: room.avatar,
      });
    } else {
      toast.success(`Welcome back to "${room.name}"! 🎪`, {
        duration: 2000,
        icon: room.avatar,
      });
    }
    
    setCurrentRoom(room);
    setActiveView('roasts');
  };

  const copyInviteCode = (code: string, roomName: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${roomName} invite code copied! 📋`);
  };

  const openManageModal = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setShowManageModal(true);
  };

  const canManageRoom = (room: Room) => {
    const currentUserMember = room.members.find(m => m.id === currentUser?.id);
    return currentUserMember && (currentUserMember.role === 'owner' || currentUserMember.role === 'admin');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={14} className="text-yellow-500" />;
      case 'admin': return <Shield size={14} className="text-blue-500" />;
      default: return <User size={14} className="text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-500 bg-yellow-500/20';
      case 'admin': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Filter rooms to show user's rooms and available rooms
  const getUserRooms = () => {
    if (!currentUser) return [];
    return rooms.filter(room => 
      room.members.some(member => member.id === currentUser.id)
    );
  };

  const getAvailableRooms = () => {
    if (!currentUser) return rooms;
    return rooms.filter(room => 
      !room.members.some(member => member.id === currentUser.id)
    );
  };

  const userRooms = getUserRooms();
  const availableRooms = getAvailableRooms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark paper-texture relative overflow-hidden">
      {/* Artistic doodle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce-doodle">🎪</div>
        <div className="absolute top-32 right-16 text-3xl opacity-15 animate-wiggle">🎨</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-25 animate-float">⭐</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-bounce-doodle">🎭</div>
        <div className="absolute top-1/2 left-1/4 text-lg opacity-10 animate-wiggle">✨</div>
        <div className="absolute top-1/3 right-1/3 text-2xl opacity-15 animate-float">🚀</div>
        
        {/* Sketch lines */}
        <svg className="absolute top-20 left-1/3 w-32 h-16 opacity-10" viewBox="0 0 100 50">
          <path d="M10,25 Q30,10 50,25 T90,25" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary animate-scribble" strokeDasharray="100" strokeDashoffset="100" />
        </svg>
        <svg className="absolute bottom-32 right-1/4 w-24 h-12 opacity-15" viewBox="0 0 100 50">
          <path d="M10,40 Q50,10 90,40" stroke="currentColor" strokeWidth="2" fill="none" className="text-secondary animate-scribble" strokeDasharray="100" strokeDashoffset="100" />
        </svg>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <div className="max-w-md mx-auto space-y-4">
          {/* Welcome doodle */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-block"
            >
              <h1 className="text-3xl font-bold font-sketch crayon-text mb-2">Welcome to ClownRoom!</h1>
              <div className="flex justify-center space-x-2 text-2xl animate-bounce-doodle">
                <span>🎪</span>
                <span>🤡</span>
                <span>🎨</span>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons - NOW USING THEME COLORS */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary via-secondary to-purple text-white rounded-2xl p-4 shadow-doodle doodle-btn sketch-border sticker-element"
              whileHover={{ scale: 1.02, rotate: 2 }}
              whileTap={{ scale: 0.98, rotate: -2 }}
            >
              <div className="flex items-center justify-center space-x-2 relative">
                <Plus size={20} className="hand-drawn-icon" />
                <span className="font-bold font-hand">Create</span>
                <div className="absolute -top-2 -right-2 text-xs opacity-70 animate-bounce-doodle">✨</div>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setShowJoinModal(true)}
              className="bg-gradient-to-r from-secondary via-accent to-primary text-white rounded-2xl p-4 shadow-doodle doodle-btn sketch-border sticker-element"
              whileHover={{ scale: 1.02, rotate: -2 }}
              whileTap={{ scale: 0.98, rotate: 2 }}
            >
              <div className="flex items-center justify-center space-x-2 relative">
                <Search size={20} className="hand-drawn-icon" />
                <span className="font-bold font-hand">Join</span>
                <div className="absolute -top-2 -right-2 text-xs opacity-70 animate-wiggle">🔍</div>
              </div>
            </motion.button>
          </div>

          {/* Your Rooms Section */}
          {userRooms.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-white font-bold text-lg font-sketch crayon-text flex items-center space-x-2">
                <Crown size={20} className="text-accent" />
                <span>Your Rooms</span>
              </h2>
              
              {userRooms.map((room, index) => {
                const theme = themes.find(t => t.id === room.theme) || themes[0];
                const canManage = canManageRoom(room);
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${theme.gradient} rounded-xl p-4 text-white relative overflow-hidden cursor-pointer sketch-card sticker-element`}
                    onClick={() => handleRoomClick(room)}
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98, rotate: -1 }}
                  >
                    {/* Doodle decorations */}
                    <div className="absolute -top-1 -right-1 text-lg opacity-60 animate-bounce-doodle">{theme.emoji}</div>
                    <div className="absolute -bottom-1 -left-1 text-sm opacity-40 animate-wiggle">✨</div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl sticker-element">{room.avatar}</span>
                          <div>
                            <h3 className="font-bold text-lg font-sketch scribble-underline">{room.name}</h3>
                            <p className="text-white/80 text-sm font-hand">{room.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {canManage && (
                            <button
                              onClick={(e) => openManageModal(room, e)}
                              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors doodle-btn"
                              title="Manage Room"
                            >
                              <Settings size={16} className="hand-drawn-icon" />
                            </button>
                          )}
                          <div className="flex items-center space-x-1">
                            <Lock size={16} className="text-white/60 hand-drawn-icon" />
                            <span className="text-sm text-white/60 font-hand">{room.members.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Member Avatars */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-white/60 hand-drawn-icon" />
                          <div className="flex -space-x-2">
                            {room.members.slice(0, 4).map((member, i) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm border-2 border-white/30 relative"
                                title={`${member.username} (${member.role})`}
                              >
                                <span>{member.avatar}</span>
                                <div className="absolute -top-1 -right-1">
                                  {getRoleIcon(member.role)}
                                </div>
                              </div>
                            ))}
                            {room.members.length > 4 && (
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs border-2 border-white/30 font-bold">
                                +{room.members.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-white/80 font-hand">
                            {room.members.length} clowns
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-white/80 font-hand">
                            Created {new Date(room.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyInviteCode(room.inviteCode, room.name);
                            }}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors doodle-btn"
                          >
                            <Copy size={16} className="hand-drawn-icon" />
                          </button>
                          <div className="px-3 py-1 bg-white/20 rounded-lg font-mono text-sm sketch-border">
                            {room.inviteCode}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Background doodle pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Available Rooms Section */}
          {availableRooms.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-white font-bold text-lg font-sketch crayon-text flex items-center space-x-2">
                <Search size={20} className="text-secondary" />
                <span>Available Rooms</span>
              </h2>
              
              {availableRooms.map((room, index) => {
                const theme = themes.find(t => t.id === room.theme) || themes[0];
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ delay: (userRooms.length + index) * 0.1 }}
                    className={`bg-gradient-to-r ${theme.gradient} rounded-xl p-4 text-white relative overflow-hidden cursor-pointer sketch-card sticker-element opacity-80 hover:opacity-100 transition-opacity`}
                    onClick={() => handleRoomClick(room)}
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98, rotate: -1 }}
                  >
                    {/* Join indicator */}
                    <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-1 text-xs font-hand">
                      Click to Join
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl sticker-element">{room.avatar}</span>
                        <div>
                          <h3 className="font-bold text-lg font-sketch scribble-underline">{room.name}</h3>
                          <p className="text-white/80 text-sm font-hand">{room.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-white/60 hand-drawn-icon" />
                          <span className="text-sm text-white/80 font-hand">
                            {room.members.length} members
                          </span>
                        </div>
                        
                        <div className="px-3 py-1 bg-white/20 rounded-lg font-mono text-sm sketch-border">
                          {room.inviteCode}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* No rooms message */}
          {userRooms.length === 0 && availableRooms.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="text-6xl mb-4 animate-bounce-doodle">🎪</div>
              <p className="font-hand text-lg">No rooms yet. Create your first chaos den! 🔥</p>
              <div className="mt-4 flex justify-center space-x-2 text-2xl opacity-50">
                <span className="animate-wiggle">🎨</span>
                <span className="animate-bounce-doodle">⭐</span>
                <span className="animate-float">🎭</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
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
              initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto sketch-card paper-texture relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">🎨</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">✨</div>
              
              <h2 className="text-xl font-bold text-white mb-4 font-sketch crayon-text scribble-underline">Create New Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Room Name
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                    placeholder="The Chaos Den"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                    placeholder="Where sanity goes to die 💀"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Theme {themeSettings.darkMode ? '(Dark Mode)' : '(Light Mode)'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getAvailableThemes().map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setNewRoom({ ...newRoom, theme: theme.id as Room['theme'] })}
                        className={`p-3 rounded-lg border-2 transition-all doodle-btn ${
                          newRoom.theme === theme.id
                            ? 'border-primary bg-primary/20 shadow-doodle'
                            : 'border-gray-700 bg-dark-light hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.gradient} mb-1 sticker-element`} />
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-lg">{theme.emoji}</span>
                          <span className="text-xs text-gray-300 font-hand">{theme.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-hand">
                    {themeSettings.darkMode 
                      ? '🌙 Dark mode themes available'
                      : '☀️ Light mode themes available'
                    }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Avatar
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {avatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setNewRoom({ ...newRoom, avatar })}
                        className={`p-2 rounded-lg text-2xl border-2 transition-all doodle-btn sticker-element ${
                          newRoom.avatar === avatar
                            ? 'border-primary bg-primary/20 shadow-doodle'
                            : 'border-gray-700 bg-dark-light hover:border-gray-600'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name}
                  className="flex-1 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border font-hand"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Room Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: 5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: -5 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm sketch-card paper-texture relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-wiggle">🔍</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-bounce-doodle">🎪</div>
              
              <h2 className="text-xl font-bold text-white mb-4 font-sketch crayon-text scribble-underline">Join Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-secondary focus:outline-none font-mono text-center text-lg sketch-border"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                </div>
                
                <div className="text-center text-gray-400 text-sm">
                  <p className="font-hand">Enter the 6-character invite code</p>
                  <p className="font-hand">shared by your friend 🤝</p>
                  <p className="font-hand text-xs mt-2 text-accent">
                    💡 If you're already in the room, we'll take you there!
                  </p>
                </div>

                {/* Show available room codes as hints */}
                {availableRooms.length > 0 && (
                  <div className="bg-dark-light rounded-lg p-3 border border-gray-700">
                    <h3 className="text-secondary font-semibold mb-2 text-sm font-hand">Available Rooms:</h3>
                    <div className="space-y-1">
                      {availableRooms.slice(0, 3).map((room) => (
                        <button
                          key={room.id}
                          onClick={() => setJoinCode(room.inviteCode)}
                          className="w-full text-left p-2 rounded hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{room.avatar}</span>
                              <span className="text-white text-sm font-hand">{room.name}</span>
                            </div>
                            <span className="text-secondary font-mono text-sm">{room.inviteCode}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border font-hand"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Management Modal */}
      <AnimatePresence>
        {showManageModal && selectedRoom && (
          <RoomManagementModal
            room={selectedRoom}
            onClose={() => {
              setShowManageModal(false);
              setSelectedRoom(null);
            }}
            onUpdate={(updatedRoom) => {
              updateRoom(updatedRoom);
              setSelectedRoom(updatedRoom);
            }}
            onDelete={(roomId) => {
              deleteRoom(roomId);
              setShowManageModal(false);
              setSelectedRoom(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Room Management Modal Component
const RoomManagementModal = ({ 
  room, 
  onClose, 
  onUpdate,
  onDelete
}: { 
  room: Room; 
  onClose: () => void; 
  onUpdate: (room: Room) => void;
  onDelete: (roomId: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'add' | 'settings'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock available users to add
  const availableUsers = [
    { id: 'user-2', username: 'MemeLord42', avatar: '😈' },
    { id: 'user-3', username: 'ChaosQueen', avatar: '👑' },
    { id: 'user-4', username: 'RoastKing', avatar: '🔥' },
    { id: 'user-5', username: 'StickerMaster', avatar: '🎨' },
    { id: 'user-6', username: 'JokesterPro', avatar: '🃏' },
    { id: 'user-7', username: 'MemeWizard', avatar: '🧙‍♂️' },
  ].filter(user => !room.members.some(member => member.id === user.id));

  const filteredUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipants = () => {
    if (selectedUsers.length === 0) {
      toast.error('Select at least one user to add! 👥');
      return;
    }

    const newMembers = selectedUsers.map(userId => {
      const user = availableUsers.find(u => u.id === userId);
      return {
        id: userId,
        username: user?.username || 'Unknown',
        avatar: user?.avatar || '👤',
        role: 'member' as const,
        joinedAt: new Date(),
      };
    });

    const updatedRoom = {
      ...room,
      members: [...room.members, ...newMembers],
    };

    onUpdate(updatedRoom);
    setSelectedUsers([]);
    setActiveTab('members');
    
    toast.success(`Added ${selectedUsers.length} participant${selectedUsers.length > 1 ? 's' : ''}! 🎉`);
  };

  const handleRemoveMember = (memberId: string) => {
    if (memberId === room.createdBy) {
      toast.error("Can't remove the room owner! 👑");
      return;
    }

    const updatedRoom = {
      ...room,
      members: room.members.filter(member => member.id !== memberId),
    };

    onUpdate(updatedRoom);
    toast.success('Member removed! 👋');
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'member') => {
    if (memberId === room.createdBy) {
      toast.error("Can't change the owner's role! 👑");
      return;
    }

    const updatedRoom = {
      ...room,
      members: room.members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      ),
    };

    onUpdate(updatedRoom);
    toast.success(`Role updated to ${newRole}! ${newRole === 'admin' ? '🛡️' : '👤'}`);
  };

  const handleDeleteRoom = () => {
    if (room.createdBy !== 'user-1') {
      toast.error("Only the room owner can delete the room! 👑");
      return;
    }

    onDelete(room.id);
    toast.success(`${room.name} has been deleted! 🗑️`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={14} className="text-yellow-500" />;
      case 'admin': return <Shield size={14} className="text-blue-500" />;
      default: return <User size={14} className="text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-500 bg-yellow-500/20';
      case 'admin': return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.9, opacity: 0, rotate: 3 }}
        className="bg-dark-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden sketch-card paper-texture relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Doodle decorations */}
        <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">⚙️</div>
        <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">👥</div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white font-sketch crayon-text">
            Manage {room.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors doodle-btn"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-dark-light rounded-xl p-1 mb-4">
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'add', label: 'Add', icon: UserPlus },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto max-h-96">
          <AnimatePresence mode="wait">
            {/* Members Tab */}
            {activeTab === 'members' && (
              <motion.div
                key="members"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {room.members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-light rounded-xl p-3 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{member.avatar}</div>
                        <div>
                          <h3 className="text-white font-semibold font-hand">{member.username}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              <span>{member.role}</span>
                            </span>
                            <span className="text-xs text-gray-400">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {member.id !== room.createdBy && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value as 'admin' | 'member')}
                            className="bg-dark-card text-white rounded px-2 py-1 text-xs border border-gray-600 focus:border-primary focus:outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Remove member"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Add Participants Tab */}
            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-light text-white rounded-lg border border-gray-700 focus:border-primary focus:outline-none font-hand"
                  />
                </div>

                {/* User List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedUsers.includes(user.id)
                          ? 'border-primary bg-primary/20'
                          : 'border-gray-700 bg-dark-light hover:border-gray-600'
                      }`}
                      onClick={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user.id)
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        );
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{user.avatar}</div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold font-hand">{user.username}</h3>
                          <p className="text-gray-400 text-sm font-hand">Available to add</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedUsers.includes(user.id)
                            ? 'border-primary bg-primary'
                            : 'border-gray-600'
                        }`}>
                          {selectedUsers.includes(user.id) && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="font-hand">
                        {searchTerm ? 'No users found' : 'All available users are already in the room!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Button */}
                {selectedUsers.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleAddParticipants}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white rounded-lg py-3 font-bold doodle-btn sketch-border"
                  >
                    Add {selectedUsers.length} Participant{selectedUsers.length > 1 ? 's' : ''}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-dark-light rounded-xl p-4 border border-gray-700">
                  <h3 className="text-white font-bold mb-3 font-sketch">Room Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-hand">Created:</span>
                      <span className="text-white font-hand">{new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-hand">Members:</span>
                      <span className="text-white font-hand">{room.members.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-hand">Invite Code:</span>
                      <span className="text-white font-mono">{room.inviteCode}</span>
                    </div>
                  </div>
                </div>

                {/* Delete Room Section */}
                {room.createdBy === 'user-1' && (
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-500/30">
                    <h3 className="text-red-400 font-bold mb-2 font-sketch">Danger Zone</h3>
                    <p className="text-gray-300 text-sm mb-3 font-hand">
                      Deleting this room will permanently remove all messages, memories, and data. This action cannot be undone.
                    </p>
                    
                    {!showDeleteConfirm ? (
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bg-red-500/20 text-red-400 rounded-lg py-2 font-semibold hover:bg-red-500/30 transition-colors doodle-btn sketch-border font-hand flex items-center justify-center space-x-2"
                      >
                        <Trash2 size={16} />
                        <span>Delete Room</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-red-500/30 rounded-lg p-3 border border-red-500/50">
                          <p className="text-red-300 text-sm font-hand text-center">
                            Are you absolutely sure? Type "{room.name}" to confirm:
                          </p>
                        </div>
                        <input
                          type="text"
                          placeholder={`Type "${room.name}" to confirm`}
                          className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-red-500 focus:border-red-400 focus:outline-none font-hand"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value === room.name) {
                              handleDeleteRoom();
                            }
                          }}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn font-hand"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                              if (input?.value === room.name) {
                                handleDeleteRoom();
                              } else {
                                toast.error('Room name does not match! 🚫');
                              }
                            }}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition-colors doodle-btn font-hand flex items-center justify-center space-x-2"
                          >
                            <Trash2 size={16} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};