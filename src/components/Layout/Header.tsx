import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Crown, Settings, X, User, LogOut, Palette, Bell, Save, Camera, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Header = () => {
  const { 
    currentUser, 
    currentRoom, 
    activeView, 
    showSettings, 
    setShowSettings, 
    updateUser, 
    setCurrentUser,
    setCurrentRoom,
    setActiveView,
    themeSettings,
    setThemeSettings,
    notificationSettings,
    setNotificationSettings
  } = useStore();
  
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'theme' | 'notifications'>('profile');
  const [showSignOutModal, setShowSignOutModal] = useState(false); // NEW: Sign out modal state
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || '',
    avatar: currentUser?.avatar || '🤡',
    title: currentUser?.title || 'Clown Apprentice'
  });

  const avatarOptions = ['🤡', '😈', '👑', '🔥', '💀', '🎭', '🎪', '🎨', '🚀', '💎', '⚡', '🌟', '👻', '🤖', '🦄', '🐉'];
  
  const titleOptions = [
    'Clown Apprentice', 'Jester in Training', 'Chaos Cadet', 'Meme Rookie',
    'Roast Warrior', 'Comedy Knight', 'Humor Hero', 'Joke Jedi',
    'Chaos Master', 'Supreme Jester', 'Meme Lord', 'Roast King',
    'Comedy Emperor', 'Legendary Clown', 'Chaos God', 'Ultimate Jester'
  ];

  // Enhanced color schemes with light mode themes
  const colorSchemes = [
    // Dark mode themes (vibrant)
    { id: 'neon', name: 'Neon Chaos', colors: ['#FF6B9D', '#4ECDC4', '#FFE66D'], emoji: '⚡', mode: 'dark' },
    { id: 'retro', name: 'Retro Vibes', colors: ['#FF8A5B', '#F1C40F', '#E74C3C'], emoji: '🌆', mode: 'dark' },
    { id: 'cyberpunk', name: 'Cyber Punk', colors: ['#00FFFF', '#9B59B6', '#FF1493'], emoji: '🤖', mode: 'dark' },
    { id: 'rainbow', name: 'Rainbow Chaos', colors: ['#E74C3C', '#F1C40F', '#2ECC71'], emoji: '🌈', mode: 'dark' },
    // Light mode themes (elegant)
    { id: 'minimal', name: 'Minimal Clean', colors: ['#6366f1', '#10b981', '#f59e0b'], emoji: '🌸', mode: 'light' },
    { id: 'nature', name: 'Nature Fresh', colors: ['#059669', '#0d9488', '#ca8a04'], emoji: '🌿', mode: 'light' },
    { id: 'ocean', name: 'Ocean Breeze', colors: ['#0ea5e9', '#06b6d4', '#0891b2'], emoji: '🌊', mode: 'light' },
    { id: 'sunset', name: 'Sunset Warm', colors: ['#dc2626', '#ea580c', '#d97706'], emoji: '🌅', mode: 'light' },
  ];

  const getTitle = () => {
    switch (activeView) {
      case 'rooms': return 'ClownRoom 🤡';
      case 'roasts': return currentRoom ? `${currentRoom.avatar} ${currentRoom.name}` : 'Roast Stage 🔥';
      case 'chat': return currentRoom ? `💬 ${currentRoom.name}` : 'Chat Room 💬';
      case 'stickers': return 'Sticker Lab 🎨';
      case 'challenges': return 'Challenge Arena 🏆';
      case 'memories': return 'Memory Vault 📸';
      case 'profile': return 'ClownMeter™ 📊';
      default: return 'ClownRoom';
    }
  };

  const getGradient = () => {
    switch (activeView) {
      case 'rooms': return 'from-primary via-doodle-pink to-purple';
      case 'roasts': return 'from-orange via-sketch-red to-red-500';
      case 'chat': return 'from-secondary via-doodle-cyan to-blue-500';
      case 'stickers': return 'from-secondary via-doodle-cyan to-blue-500';
      case 'challenges': return 'from-accent via-sketch-yellow to-yellow-500';
      case 'memories': return 'from-purple via-sketch-purple to-pink-500';
      case 'profile': return 'from-primary via-secondary to-accent';
      default: return 'from-primary via-doodle-pink to-purple';
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    if (!showSettings) {
      // Reset to profile data when opening
      setProfileData({
        username: currentUser?.username || '',
        avatar: currentUser?.avatar || '🤡',
        title: currentUser?.title || 'Clown Apprentice'
      });
      setEditingProfile(false);
      setActiveSettingsTab('profile');
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.username.trim()) {
      toast.error('Username cannot be empty! 📝');
      return;
    }

    if (profileData.username.length < 3) {
      toast.error('Username must be at least 3 characters! 📏');
      return;
    }

    if (profileData.username.length > 20) {
      toast.error('Username must be less than 20 characters! 📏');
      return;
    }

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        username: profileData.username.trim(),
        avatar: profileData.avatar,
        title: profileData.title
      };
      
      setCurrentUser(updatedUser);
      setEditingProfile(false);
      toast.success('Profile updated successfully! ✨');
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      username: currentUser?.username || '',
      avatar: currentUser?.avatar || '🤡',
      title: currentUser?.title || 'Clown Apprentice'
    });
    setEditingProfile(false);
  };

  const handleThemeChange = (setting: string, value: any) => {
    setThemeSettings({ [setting]: value });
    
    // Show appropriate toast message
    switch (setting) {
      case 'colorScheme':
        const scheme = colorSchemes.find(s => s.id === value);
        toast.success(`Theme changed to ${scheme?.name}! ${scheme?.emoji}`);
        break;
      case 'animations':
        toast.success(value ? 'Animations enabled! 🎭' : 'Animations disabled! 🚫');
        break;
      case 'soundEffects':
        toast.success(value ? 'Sound effects enabled! 🔊' : 'Sound effects disabled! 🔇');
        break;
      case 'darkMode':
        toast.success(value ? 'Dark mode enabled! 🌙' : 'Light mode enabled! ☀️');
        break;
      default:
        toast.success('Theme setting updated! 🎨');
    }
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings({ [setting]: value });
    
    if (setting === 'browserNotifications' && value) {
      // Request browser notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            toast.success('Browser notifications enabled! 🔔');
            new Notification('ClownRoom Notifications', {
              body: 'You\'ll now receive notifications for important events!',
              icon: '/clown.svg'
            });
          } else {
            toast.error('Browser notifications denied! 🚫');
            setNotificationSettings({ browserNotifications: false });
          }
        });
      }
    } else {
      const settingNames: Record<string, string> = {
        roastNotifications: 'Roast notifications',
        chatMessages: 'Chat message notifications',
        challengeInvites: 'Challenge invite notifications',
        memoryTags: 'Memory tag notifications',
        soundNotifications: 'Sound notifications',
        browserNotifications: 'Browser notifications'
      };
      
      toast.success(`${settingNames[setting]} ${value ? 'enabled' : 'disabled'}! ${value ? '🔔' : '🔇'}`);
    }
  };

  // NEW: Enhanced sign out handler with modal
  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleConfirmSignOut = () => {
    try {
      // Clear current user and session data
      setCurrentUser(null);
      setCurrentRoom(null);
      setActiveView('rooms');
      setShowSettings(false);
      setShowSignOutModal(false);
      
      // Clear any editing states
      setEditingProfile(false);
      setActiveSettingsTab('profile');
      
      // Show success message
      toast.success('👋 Signed out successfully! Come back soon!', {
        duration: 4000,
        icon: '🤡',
      });
      
      // Optional: Clear sensitive data from localStorage after a delay
      setTimeout(() => {
        // You could clear specific sensitive data here if needed
        // For now, we keep the rooms and other data for when they sign back in
      }, 1000);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('❌ Error signing out. Please try again!');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notification permission granted! 🔔');
        setNotificationSettings({ browserNotifications: true });
      } else {
        toast.error('Notification permission denied! 🚫');
      }
    } else {
      toast.error('Notifications not supported in this browser! 😞');
    }
  };

  // Filter color schemes based on current dark mode setting
  const getAvailableColorSchemes = () => {
    if (themeSettings.darkMode) {
      return colorSchemes.filter(scheme => scheme.mode === 'dark');
    } else {
      return colorSchemes.filter(scheme => scheme.mode === 'light');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className={`bg-gradient-to-r ${getGradient()} p-4 paper-texture relative overflow-hidden`}>
          {/* Doodle decorations */}
          <div className="absolute top-2 left-4 text-lg opacity-30 animate-bounce-doodle">✨</div>
          <div className="absolute top-1 right-8 text-sm opacity-40 animate-wiggle">🎨</div>
          <div className="absolute bottom-1 left-1/3 text-xs opacity-25 animate-float">⭐</div>
          
          <div className="flex items-center justify-between max-w-md mx-auto relative z-10">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={activeView}
            >
              <h1 className="text-xl font-bold text-white font-sketch scribble-underline">
                {getTitle()}
              </h1>
            </motion.div>
            
            <div className="flex items-center space-x-3">
              {currentUser && (
                <motion.div
                  className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1 sketch-border"
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  style={{ transform: 'rotate(-1deg)' }}
                >
                  <Crown size={16} className="text-accent hand-drawn-icon" />
                  <span className="text-white font-semibold text-sm font-hand">
                    {currentUser.clownPoints.toLocaleString()}
                  </span>
                </motion.div>
              )}
              
              <motion.button
                onClick={handleSettingsClick}
                className="p-2 bg-white/20 rounded-full doodle-btn sketch-border"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95, rotate: -5 }}
              >
                <Settings size={18} className="text-white hand-drawn-icon" />
              </motion.button>
            </div>
          </div>
          
          {/* Sketch lines decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>
      </header>

      {/* Enhanced Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 5 }}
              className="bg-dark-card rounded-2xl w-full max-w-md sketch-card paper-texture relative flex flex-col"
              style={{ 
                maxHeight: 'calc(100vh - 2rem)',
                height: editingProfile ? 'auto' : 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">⚙️</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">✨</div>
              
              {/* Header - Fixed */}
              <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white font-sketch crayon-text">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors doodle-btn"
                >
                  <X size={20} className="hand-drawn-icon" />
                </button>
              </div>

              {/* Tab Navigation - Fixed */}
              <div className="px-6 pb-4 flex-shrink-0">
                <div className="flex bg-dark-light rounded-xl p-1">
                  {[
                    { id: 'profile', label: 'Profile', icon: User },
                    { id: 'theme', label: 'Theme', icon: Palette },
                    { id: 'notifications', label: 'Alerts', icon: Bell },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSettingsTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
                          activeSettingsTab === tab.id
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
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 pb-4">
                <AnimatePresence mode="wait">
                  {/* Profile Tab */}
                  {activeSettingsTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Current Profile Display */}
                      {!editingProfile && currentUser && (
                        <div className="bg-dark-light rounded-xl p-4 border border-gray-700 text-center">
                          <div className="text-4xl mb-2">{currentUser.avatar}</div>
                          <h3 className="text-white font-bold text-lg font-hand">{currentUser.username}</h3>
                          <p className="text-gray-400 text-sm font-hand">{currentUser.title}</p>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Crown size={16} className="text-accent" />
                            <span className="text-accent font-bold">{currentUser.clownPoints.toLocaleString()} CP</span>
                          </div>
                          <button
                            onClick={() => setEditingProfile(true)}
                            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors doodle-btn flex items-center space-x-2 mx-auto"
                          >
                            <Edit3 size={16} />
                            <span>Edit Profile</span>
                          </button>
                        </div>
                      )}

                      {/* Profile Editing Form */}
                      {editingProfile && (
                        <div className="space-y-4">
                          {/* Username */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                              Username
                            </label>
                            <input
                              type="text"
                              value={profileData.username}
                              onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                              className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                              placeholder="Enter your username"
                              maxLength={20}
                            />
                            <div className="text-xs text-gray-400 mt-1 font-hand">
                              {profileData.username.length}/20 characters
                            </div>
                          </div>

                          {/* Avatar Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                              Avatar
                            </label>
                            <div className="grid grid-cols-8 gap-2">
                              {avatarOptions.map((avatar) => (
                                <button
                                  key={avatar}
                                  onClick={() => setProfileData(prev => ({ ...prev, avatar }))}
                                  className={`p-2 rounded-lg text-2xl border-2 transition-all doodle-btn ${
                                    profileData.avatar === avatar
                                      ? 'border-primary bg-primary/20 shadow-doodle'
                                      : 'border-gray-700 bg-dark-light hover:border-gray-600'
                                  }`}
                                >
                                  {avatar}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Title Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                              Title
                            </label>
                            <select
                              value={profileData.title}
                              onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                            >
                              {titleOptions.map((title) => (
                                <option key={title} value={title}>{title}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Theme Tab */}
                  {activeSettingsTab === 'theme' && (
                    <motion.div
                      key="theme"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Dark/Light Mode Toggle */}
                      <div className="bg-dark-light rounded-lg p-3 border border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🌙</span>
                            <div>
                              <h4 className="text-white font-semibold font-hand">Dark Mode</h4>
                              <p className="text-gray-400 text-xs font-hand">Switch between light and dark themes</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleThemeChange('darkMode', !themeSettings.darkMode)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              themeSettings.darkMode
                                ? 'bg-primary'
                                : 'bg-gray-600'
                            }`}
                          >
                            <div
                              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                themeSettings.darkMode ? 'translate-x-6' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Color Scheme */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 font-hand">
                          Color Scheme {themeSettings.darkMode ? '(Dark Mode)' : '(Light Mode)'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {getAvailableColorSchemes().map((scheme) => (
                            <button
                              key={scheme.id}
                              onClick={() => handleThemeChange('colorScheme', scheme.id)}
                              className={`p-3 rounded-lg border-2 transition-all doodle-btn ${
                                themeSettings.colorScheme === scheme.id
                                  ? 'border-primary bg-primary/20 shadow-doodle'
                                  : 'border-gray-700 bg-dark-light hover:border-gray-600'
                              }`}
                            >
                              <div className="flex space-x-1 mb-2">
                                {scheme.colors.map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="text-xs text-gray-300 font-hand flex items-center space-x-1">
                                <span>{scheme.emoji}</span>
                                <span>{scheme.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-hand">
                          {themeSettings.darkMode 
                            ? '🌙 Dark mode themes are vibrant and energetic'
                            : '☀️ Light mode themes are elegant and calming'
                          }
                        </p>
                      </div>

                      {/* Toggle Settings */}
                      <div className="space-y-3">
                        {[
                          { key: 'animations', label: 'Animations', icon: '🎭', description: 'Enable fun animations and transitions' },
                          { key: 'soundEffects', label: 'Sound Effects', icon: '🔊', description: 'Play sounds for interactions' }
                        ].map((setting) => (
                          <div key={setting.key} className="bg-dark-light rounded-lg p-3 border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{setting.icon}</span>
                                <div>
                                  <h4 className="text-white font-semibold font-hand">{setting.label}</h4>
                                  <p className="text-gray-400 text-xs font-hand">{setting.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleThemeChange(setting.key, !themeSettings[setting.key as keyof typeof themeSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  themeSettings[setting.key as keyof typeof themeSettings]
                                    ? 'bg-primary'
                                    : 'bg-gray-600'
                                }`}
                              >
                                <div
                                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    themeSettings[setting.key as keyof typeof themeSettings] ? 'translate-x-6' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Notifications Tab */}
                  {activeSettingsTab === 'notifications' && (
                    <motion.div
                      key="notifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Notification Permission */}
                      {'Notification' in window && Notification.permission !== 'granted' && (
                        <div className="bg-gradient-to-r from-accent/20 to-yellow-500/20 rounded-lg p-4 border border-accent/30">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">🔔</span>
                            <h3 className="text-accent font-bold font-hand">Enable Notifications</h3>
                          </div>
                          <p className="text-gray-300 text-sm mb-3 font-hand">
                            Allow ClownRoom to send you notifications for important events!
                          </p>
                          <button
                            onClick={requestNotificationPermission}
                            className="w-full bg-accent text-dark rounded-lg py-2 font-bold hover:bg-accent/90 transition-colors doodle-btn font-hand"
                          >
                            Enable Notifications
                          </button>
                        </div>
                      )}

                      {/* Notification Settings */}
                      <div className="space-y-3">
                        {[
                          { key: 'roastNotifications', label: 'Roast Notifications', icon: '🔥', description: 'When someone roasts you' },
                          { key: 'chatMessages', label: 'Chat Messages', icon: '💬', description: 'New messages in your rooms' },
                          { key: 'challengeInvites', label: 'Challenge Invites', icon: '🏆', description: 'When invited to challenges' },
                          { key: 'memoryTags', label: 'Memory Tags', icon: '📸', description: 'When tagged in memories' },
                          { key: 'soundNotifications', label: 'Sound Alerts', icon: '🔊', description: 'Play sounds for notifications' },
                          { key: 'browserNotifications', label: 'Browser Notifications', icon: '🌐', description: 'Show browser notifications' }
                        ].map((setting) => (
                          <div key={setting.key} className="bg-dark-light rounded-lg p-3 border border-gray-700">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{setting.icon}</span>
                                <div>
                                  <h4 className="text-white font-semibold font-hand">{setting.label}</h4>
                                  <p className="text-gray-400 text-xs font-hand">{setting.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleNotificationChange(setting.key, !notificationSettings[setting.key as keyof typeof notificationSettings])}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  notificationSettings[setting.key as keyof typeof notificationSettings]
                                    ? 'bg-primary'
                                    : 'bg-gray-600'
                                }`}
                              >
                                <div
                                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    notificationSettings[setting.key as keyof typeof notificationSettings] ? 'translate-x-6' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="p-6 pt-4 flex-shrink-0 border-t border-gray-700">
                {/* Profile Edit Action Buttons */}
                {activeSettingsTab === 'profile' && editingProfile && (
                  <div className="flex space-x-3 mb-4">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors doodle-btn sketch-border font-hand flex items-center justify-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  </div>
                )}

                {/* Sign Out Button */}
                <motion.button 
                  onClick={handleSignOutClick}
                  className="w-full flex items-center justify-center space-x-3 p-3 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors doodle-btn sketch-border font-hand"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={20} className="hand-drawn-icon" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Beautiful Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowSignOutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-dark-card rounded-2xl p-6 w-full max-w-sm sketch-card paper-texture relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Doodle decorations */}
              <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">👋</div>
              <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">✨</div>
              
              {/* Modal Content */}
              <div className="text-center">
                {/* Animated Clown Icon */}
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ 
                    rotate: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  🤡
                </motion.div>
                
                <h2 className="text-xl font-bold text-white mb-2 font-sketch crayon-text">
                  Leaving the Circus? 🎪
                </h2>
                
                <p className="text-gray-300 mb-6 font-hand text-sm leading-relaxed">
                  Are you sure you want to sign out?<br/>
                  <span className="text-gray-400">Your rooms and chaos will be saved! 💾</span>
                </p>
                
                {/* Benefits List */}
                <div className="bg-dark-light rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-accent font-semibold mb-2 text-sm font-hand">What happens when you sign out:</h3>
                  <div className="space-y-1 text-xs text-gray-300 font-hand">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>Your rooms and data will be saved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>You can sign back in anytime</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">✓</span>
                      <span>Your ClownPoints are preserved</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400">ℹ</span>
                      <span>You'll return to the sign-in screen</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowSignOutModal(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors doodle-btn sketch-border font-hand"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Stay in the Chaos! 🎪
                  </motion.button>
                  
                  <motion.button
                    onClick={handleConfirmSignOut}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all doodle-btn sketch-border font-hand flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
                
                {/* Fun Footer */}
                <p className="text-gray-500 text-xs mt-4 font-hand">
                  The circus will miss you! 🎭✨
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};