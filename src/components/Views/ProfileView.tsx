import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Crown, Star, Zap, Users, Camera, Trophy, TrendingUp } from 'lucide-react';

export const ProfileView = () => {
  const { currentUser } = useStore();

  if (!currentUser) return null;

  const achievements = [
    { id: 'roast-master', name: 'Roast Master', icon: '🔥', description: '50+ successful roasts', unlocked: true },
    { id: 'sticker-lord', name: 'Sticker Lord', icon: '🎨', description: '100+ stickers created', unlocked: true },
    { id: 'chaos-bringer', name: 'Chaos Bringer', icon: '💀', description: 'Legendary chaos level', unlocked: false },
    { id: 'meme-king', name: 'Meme King', icon: '👑', description: '500+ memes shared', unlocked: true },
  ];

  const stats = [
    { label: 'Roasts Given', value: currentUser.stats.roastsGiven, icon: Zap, color: 'text-orange' },
    { label: 'Roasts Received', value: currentUser.stats.roastsReceived, icon: Zap, color: 'text-red-400' },
    { label: 'Challenges Won', value: currentUser.stats.challengesWon, icon: Trophy, color: 'text-accent' },
    { label: 'Stickers Created', value: currentUser.stats.stickersCreated, icon: Camera, color: 'text-secondary' },
    { label: 'Memes Shared', value: currentUser.stats.memesShared, icon: Star, color: 'text-purple' },
    { label: 'Friends Roasted', value: 12, icon: Users, color: 'text-primary' },
  ];

  const getNextLevelProgress = () => {
    const currentLevelBase = Math.pow(currentUser.level, 2) * 100;
    const nextLevelBase = Math.pow(currentUser.level + 1, 2) * 100;
    const progressInLevel = currentUser.clownPoints - currentLevelBase;
    const pointsForNextLevel = nextLevelBase - currentLevelBase;
    return (progressInLevel / pointsForNextLevel) * 100;
  };

  return (
    <div className="p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-purple rounded-2xl p-6 text-white text-center"
        >
          <div className="text-6xl mb-3">{currentUser.avatar}</div>
          <h1 className="text-2xl font-bold mb-1">{currentUser.username}</h1>
          <p className="text-white/80 mb-3">{currentUser.title}</p>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Crown size={20} className="text-accent" />
              <span className="font-bold text-xl">{currentUser.clownPoints.toLocaleString()}</span>
            </div>
            <div className="w-px h-6 bg-white/30" />
            <div className="flex items-center space-x-1">
              <Star size={20} className="text-accent" />
              <span className="font-bold text-xl">Level {currentUser.level}</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/20 rounded-full h-3 mb-2">
            <motion.div
              className="bg-accent rounded-full h-full"
              initial={{ width: 0 }}
              animate={{ width: `${getNextLevelProgress()}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-white/60 text-sm">
            {Math.round(getNextLevelProgress())}% to Level {currentUser.level + 1}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-card rounded-xl p-4 border border-gray-800"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon size={20} className={stat.color} />
                  <span className="text-white font-bold text-2xl">{stat.value}</span>
                </div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ClownMeter™ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-card rounded-xl p-4 border border-gray-800"
        >
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={24} className="text-primary" />
            <h3 className="text-white font-bold text-lg">ClownMeter™</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Chaos Level</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-orange to-red-500 rounded-full h-full w-3/4" />
                </div>
                <span className="text-orange font-bold">Epic</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Roast Accuracy</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-secondary to-blue-500 rounded-full h-full w-5/6" />
                </div>
                <span className="text-secondary font-bold">92%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Meme Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple to-pink-500 rounded-full h-full w-4/5" />
                </div>
                <span className="text-purple font-bold">Legendary</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-dark-card rounded-xl p-4 border border-gray-800"
        >
          <h3 className="text-white font-bold text-lg mb-4">Achievements</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${
                  achievement.unlocked
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-1 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className={`font-semibold text-sm ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-accent/20 to-yellow-500/20 rounded-xl p-4 border border-accent/30 text-center"
        >
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="text-accent font-bold text-lg">This Week's Title</h3>
          <p className="text-white text-lg font-semibold">Supreme Jester</p>
          <p className="text-gray-400 text-sm mt-1">
            You've earned this title through epic chaos
          </p>
        </motion.div>
      </div>
    </div>
  );
};