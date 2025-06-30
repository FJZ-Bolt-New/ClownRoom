import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { User, Crown, Sparkles, Zap, Star, Eye, EyeOff, Check, X, Info } from 'lucide-react';
import { User as UserType } from '../../types';
import toast from 'react-hot-toast';

export const SignInView = () => {
  const { setCurrentUser, updateUserPoints } = useStore();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signInData, setSignInData] = useState({
    username: '',
    password: ''
  });
  const [createAccountData, setCreateAccountData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    avatar: '🤡',
    title: 'Clown Apprentice'
  });

  const avatarOptions = ['🤡', '😈', '👑', '🔥', '💀', '🎭', '🎪', '🎨', '🚀', '💎', '⚡', '🌟', '👻', '🤖', '🦄', '🐉'];
  
  const titleOptions = [
    'Clown Apprentice', 'Jester in Training', 'Chaos Cadet', 'Meme Rookie',
    'Roast Warrior', 'Comedy Knight', 'Humor Hero', 'Joke Jedi'
  ];

  // Mock existing users for demo
  const existingUsers = [
    {
      username: 'ClownMaster',
      password: 'chaos123',
      user: {
        id: 'user-1',
        username: 'ClownMaster',
        avatar: '🤡',
        clownPoints: 1337,
        level: 7,
        title: 'Supreme Jester',
        joinedAt: new Date('2024-01-01'),
        stats: {
          roastsGiven: 42,
          roastsReceived: 38,
          challengesWon: 15,
          stickersCreated: 23,
          memesShared: 156,
        },
      }
    },
    {
      username: 'MemeLord42',
      password: 'memes4life',
      user: {
        id: 'user-2',
        username: 'MemeLord42',
        avatar: '😈',
        clownPoints: 892,
        level: 5,
        title: 'Meme Lord',
        joinedAt: new Date('2024-01-15'),
        stats: {
          roastsGiven: 28,
          roastsReceived: 31,
          challengesWon: 8,
          stickersCreated: 15,
          memesShared: 89,
        },
      }
    },
    {
      username: 'ChaosQueen',
      password: 'queenofchaos',
      user: {
        id: 'user-3',
        username: 'ChaosQueen',
        avatar: '👑',
        clownPoints: 1156,
        level: 6,
        title: 'Chaos Master',
        joinedAt: new Date('2024-01-10'),
        stats: {
          roastsGiven: 35,
          roastsReceived: 29,
          challengesWon: 12,
          stickersCreated: 19,
          memesShared: 124,
        },
      }
    }
  ];

  // FIXED: Enhanced password validation function with better logic
  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 6 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@#*!$%^&+=]/.test(password),
      validChars: /^[a-zA-Z0-9@#*!$%^&+=]*$/.test(password)
    };

    return validations;
  };

  // ENHANCED: Much more obvious "Excellent" password strength with vibrant colors
  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { strength: 'none', color: 'text-gray-400', bgColor: 'bg-gray-400', percentage: 0 };
    }

    const validations = validatePassword(password);
    
    // Calculate score based on requirements met
    let score = 0;
    let maxScore = 6;
    
    // Each validation adds to the score
    if (validations.length) score += 1;
    if (validations.uppercase) score += 1;
    if (validations.lowercase) score += 1;
    if (validations.number) score += 1;
    if (validations.special) score += 1;
    if (validations.validChars) score += 1;
    
    // Additional scoring for length beyond minimum
    if (password.length >= 8) score += 0.5;
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;
    maxScore += 1.5; // Adjust max score for bonus points
    
    const percentage = Math.min((score / maxScore) * 100, 100);
    
    // Determine strength level based on percentage with ENHANCED EXCELLENT colors
    if (percentage < 30) {
      return { strength: 'weak', color: 'text-red-400', bgColor: 'bg-red-400', percentage };
    } else if (percentage < 60) {
      return { strength: 'fair', color: 'text-yellow-400', bgColor: 'bg-yellow-400', percentage };
    } else if (percentage < 80) {
      return { strength: 'good', color: 'text-blue-400', bgColor: 'bg-blue-400', percentage };
    } else if (percentage < 95) {
      return { strength: 'strong', color: 'text-green-400', bgColor: 'bg-green-400', percentage };
    } else {
      // ENHANCED: Much more vibrant and obvious "Excellent" colors!
      return { 
        strength: 'excellent', 
        color: 'text-pink-400', // Changed from purple to bright pink
        bgColor: 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500', // Vibrant gradient!
        percentage 
      };
    }
  };

  // FIXED: Simplified password validation check
  const isPasswordValid = (password: string) => {
    const validations = validatePassword(password);
    return validations.length && validations.uppercase && validations.lowercase && 
           validations.number && validations.special && validations.validChars;
  };

  const handleSignIn = () => {
    if (!signInData.username.trim() || !signInData.password.trim()) {
      toast.error('Please enter both username and password! 📝');
      return;
    }

    // Check if user exists
    const existingUser = existingUsers.find(
      u => u.username.toLowerCase() === signInData.username.toLowerCase() && 
           u.password === signInData.password
    );

    if (existingUser) {
      setCurrentUser(existingUser.user);
      toast.success(`Welcome back, ${existingUser.user.username}! 🎪✨`, {
        duration: 4000,
        icon: existingUser.user.avatar,
      });
    } else {
      toast.error('Invalid username or password! 🚫');
    }
  };

  const handleCreateAccount = () => {
    if (!createAccountData.username.trim()) {
      toast.error('Username is required! 📝');
      return;
    }

    if (createAccountData.username.length < 3) {
      toast.error('Username must be at least 3 characters! 📏');
      return;
    }

    if (createAccountData.username.length > 20) {
      toast.error('Username must be less than 20 characters! 📏');
      return;
    }

    if (!createAccountData.password.trim()) {
      toast.error('Password is required! 🔒');
      return;
    }

    // Enhanced password validation
    if (!isPasswordValid(createAccountData.password)) {
      toast.error('Password does not meet security requirements! 🔒');
      return;
    }

    if (createAccountData.password !== createAccountData.confirmPassword) {
      toast.error('Passwords do not match! 🚫');
      return;
    }

    // Check if username already exists
    const userExists = existingUsers.some(
      u => u.username.toLowerCase() === createAccountData.username.toLowerCase()
    );

    if (userExists) {
      toast.error('Username already exists! Try another one! 🤔');
      return;
    }

    // Create new user
    const newUser: UserType = {
      id: `user-${Date.now()}`,
      username: createAccountData.username.trim(),
      avatar: createAccountData.avatar,
      clownPoints: 100, // Starting points
      level: 1,
      title: createAccountData.title,
      joinedAt: new Date(),
      stats: {
        roastsGiven: 0,
        roastsReceived: 0,
        challengesWon: 0,
        stickersCreated: 0,
        memesShared: 0,
      },
    };

    setCurrentUser(newUser);
    toast.success(`Account created! Welcome to ClownRoom, ${newUser.username}! 🎉🎪`, {
      duration: 5000,
      icon: newUser.avatar,
    });
  };

  const handleQuickSignIn = (userIndex: number) => {
    const user = existingUsers[userIndex];
    setCurrentUser(user.user);
    toast.success(`Quick sign in as ${user.user.username}! 🚀`, {
      duration: 3000,
      icon: user.user.avatar,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'signIn' | 'createAccount') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'signIn') {
        handleSignIn();
      } else {
        handleCreateAccount();
      }
    }
  };

  const passwordValidations = validatePassword(createAccountData.password);
  const passwordStrength = getPasswordStrength(createAccountData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark paper-texture relative overflow-hidden">
      {/* Artistic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce-doodle">🎪</div>
        <div className="absolute top-32 right-16 text-3xl opacity-15 animate-wiggle">🎨</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-25 animate-float">⭐</div>
        <div className="absolute bottom-20 right-12 text-3xl opacity-20 animate-bounce-doodle">🎭</div>
        <div className="absolute top-1/2 left-1/4 text-lg opacity-10 animate-wiggle">✨</div>
        <div className="absolute top-1/3 right-1/3 text-2xl opacity-15 animate-float">🚀</div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-secondary/5 rounded-full blur-lg animate-float" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl mb-4"
            >
              🎪
            </motion.div>
            <h1 className="text-4xl font-bold font-sketch crayon-text mb-2">
              Welcome to ClownRoom!
            </h1>
            <p className="text-gray-400 font-hand text-lg">
              Where chaos meets creativity! 🤡✨
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!showCreateAccount ? (
              /* Sign In Form */
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-dark-card rounded-2xl p-6 sketch-card paper-texture relative"
              >
                {/* Doodle decorations */}
                <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">🔑</div>
                <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">✨</div>
                
                <h2 className="text-2xl font-bold text-white mb-6 font-sketch crayon-text text-center">
                  Sign In to the Chaos! 🎭
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Username
                    </label>
                    <input
                      type="text"
                      value={signInData.username}
                      onChange={(e) => setSignInData(prev => ({ ...prev, username: e.target.value }))}
                      onKeyDown={(e) => handleKeyPress(e, 'signIn')}
                      className="w-full bg-dark-light text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                      placeholder="Enter your username"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      onKeyDown={(e) => handleKeyPress(e, 'signIn')}
                      className="w-full bg-dark-light text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                      placeholder="Enter your password"
                    />
                  </div>

                  <motion.button
                    onClick={handleSignIn}
                    disabled={!signInData.username.trim() || !signInData.password.trim()}
                    className="w-full bg-gradient-to-r from-primary to-purple text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border font-hand"
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98, rotate: -1 }}
                  >
                    Sign In 🎪
                  </motion.button>

                  <div className="text-center">
                    <button
                      onClick={() => setShowCreateAccount(true)}
                      className="text-secondary hover:text-white transition-colors font-hand underline"
                    >
                      Don't have an account? Create one! ✨
                    </button>
                  </div>
                </div>

                {/* Quick Sign In Demo */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-white font-bold mb-3 font-sketch text-center">
                    Quick Demo Sign In 🚀
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {existingUsers.slice(0, 3).map((user, index) => (
                      <motion.button
                        key={user.username}
                        onClick={() => handleQuickSignIn(index)}
                        className="flex items-center space-x-3 p-3 bg-dark-light rounded-lg hover:bg-gray-700 transition-colors doodle-btn sketch-border"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl">{user.user.avatar}</span>
                        <div className="flex-1 text-left">
                          <div className="text-white font-semibold font-hand">{user.user.username}</div>
                          <div className="text-gray-400 text-xs font-hand">{user.user.title}</div>
                        </div>
                        <div className="flex items-center space-x-1 text-accent">
                          <Crown size={14} />
                          <span className="text-sm font-hand">{user.user.clownPoints}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-2 font-hand">
                    Click any user to sign in instantly! 🎯
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Create Account Form */
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-dark-card rounded-2xl p-6 sketch-card paper-texture relative max-h-[90vh] overflow-y-auto"
              >
                {/* Doodle decorations */}
                <div className="absolute -top-2 -right-2 text-2xl opacity-60 animate-bounce-doodle">🎨</div>
                <div className="absolute -bottom-1 -left-1 text-lg opacity-40 animate-wiggle">⭐</div>
                
                <h2 className="text-2xl font-bold text-white mb-6 font-sketch crayon-text text-center">
                  Join the Chaos! 🎪
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Username
                    </label>
                    <input
                      type="text"
                      value={createAccountData.username}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, username: e.target.value }))}
                      onKeyDown={(e) => handleKeyPress(e, 'createAccount')}
                      className="w-full bg-dark-light text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                      placeholder="Choose your username"
                      maxLength={20}
                      autoFocus
                    />
                    <div className="text-xs text-gray-400 mt-1 font-hand">
                      {createAccountData.username.length}/20 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Password
                    </label>
                    
                    {/* Password Requirements Hint - Always Visible */}
                    <div className="mb-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-blue-400 font-semibold text-sm font-hand mb-1">Password Requirements:</h4>
                          <div className="text-xs text-gray-300 space-y-1 font-hand">
                            <div>• 6-20 characters long</div>
                            <div>• At least 1 uppercase letter (A-Z)</div>
                            <div>• At least 1 lowercase letter (a-z)</div>
                            <div>• At least 1 number (0-9)</div>
                            <div>• At least 1 special character (@#*!$%^&+=)</div>
                            <div>• Only letters, numbers, and allowed symbols</div>
                          </div>
                          <div className="mt-2 text-xs text-blue-300 font-hand">
                            💡 Example: <span className="font-mono bg-blue-500/20 px-1 rounded">MyPass123!</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={createAccountData.password}
                        onChange={(e) => setCreateAccountData(prev => ({ ...prev, password: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, 'createAccount')}
                        className="w-full bg-dark-light text-white rounded-lg px-4 py-3 pr-12 border border-gray-700 focus:border-primary focus:outline-none sketch-border font-hand"
                        placeholder="Create a secure password"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    
                    {/* ENHANCED: Password Validation with SUPER OBVIOUS Excellent styling */}
                    {createAccountData.password && (
                      <div className="mt-3 space-y-3">
                        {/* ENHANCED: Password Strength Indicator with special Excellent styling */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-hand">Password Strength:</span>
                            <span className={`text-xs font-hand font-bold capitalize ${passwordStrength.color} ${
                              passwordStrength.strength === 'excellent' ? 'animate-pulse' : ''
                            }`}>
                              {passwordStrength.strength === 'excellent' && '✨ '}
                              {passwordStrength.strength}
                              {passwordStrength.strength === 'excellent' && ' ✨'}
                            </span>
                          </div>
                          
                          {/* ENHANCED: Animated Progress Bar with special Excellent effects */}
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden relative">
                            {passwordStrength.strength === 'excellent' ? (
                              // Special animated gradient for Excellent
                              <motion.div 
                                className={`h-full rounded-full ${passwordStrength.bgColor} relative overflow-hidden`}
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${passwordStrength.percentage}%`,
                                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                }}
                                transition={{ 
                                  width: { duration: 0.5, ease: "easeOut" },
                                  backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                                }}
                                style={{ backgroundSize: '200% 200%' }}
                              >
                                {/* Sparkle effect for Excellent */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                              </motion.div>
                            ) : (
                              // Regular progress bar for other levels
                              <motion.div 
                                className={`h-full rounded-full transition-all duration-500 ${passwordStrength.bgColor}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${passwordStrength.percentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                              />
                            )}
                          </div>
                          
                          {/* ENHANCED: Strength Description with special Excellent styling */}
                          <div className={`text-xs font-hand ${
                            passwordStrength.strength === 'excellent' 
                              ? 'text-pink-300 font-bold bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg px-2 py-1 border border-pink-500/30' 
                              : 'text-gray-400'
                          }`}>
                            {passwordStrength.strength === 'none' && 'Start typing to see strength'}
                            {passwordStrength.strength === 'weak' && '🔴 Too weak - add more requirements'}
                            {passwordStrength.strength === 'fair' && '🟡 Getting better - add more complexity'}
                            {passwordStrength.strength === 'good' && '🔵 Good password - almost there!'}
                            {passwordStrength.strength === 'strong' && '🟢 Strong password - well done!'}
                            {passwordStrength.strength === 'excellent' && (
                              <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex items-center justify-center space-x-1"
                              >
                                <Sparkles size={12} className="text-pink-400" />
                                <span>🌟 EXCELLENT PASSWORD - MAXIMUM SECURITY! 🌟</span>
                                <Sparkles size={12} className="text-pink-400" />
                              </motion.span>
                            )}
                          </div>
                        </div>

                        {/* Live Requirements Checklist */}
                        <div className="bg-dark-light rounded-lg p-3 border border-gray-700">
                          <h4 className="text-xs font-semibold text-gray-300 mb-2 font-hand">Requirements Check:</h4>
                          <div className="grid grid-cols-1 gap-1 text-xs">
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.length ? 'text-green-400' : 'text-gray-400'}`}>
                              {passwordValidations.length ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">6-20 characters ({createAccountData.password.length}/20)</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                              {passwordValidations.uppercase ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">Uppercase letter (A-Z)</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                              {passwordValidations.lowercase ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">Lowercase letter (a-z)</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.number ? 'text-green-400' : 'text-gray-400'}`}>
                              {passwordValidations.number ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">Number (0-9)</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.special ? 'text-green-400' : 'text-gray-400'}`}>
                              {passwordValidations.special ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">Special character (@#*!$%^&+=)</span>
                            </div>
                            <div className={`flex items-center space-x-2 transition-colors ${passwordValidations.validChars ? 'text-green-400' : 'text-red-400'}`}>
                              {passwordValidations.validChars ? <Check size={12} /> : <X size={12} />}
                              <span className="font-hand">Only allowed characters</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={createAccountData.confirmPassword}
                        onChange={(e) => setCreateAccountData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        onKeyDown={(e) => handleKeyPress(e, 'createAccount')}
                        className={`w-full bg-dark-light text-white rounded-lg px-4 py-3 pr-12 border focus:outline-none sketch-border font-hand ${
                          createAccountData.confirmPassword && createAccountData.password !== createAccountData.confirmPassword
                            ? 'border-red-500 focus:border-red-400'
                            : 'border-gray-700 focus:border-primary'
                        }`}
                        placeholder="Confirm your password"
                        maxLength={20}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {createAccountData.confirmPassword && createAccountData.password !== createAccountData.confirmPassword && (
                      <div className="flex items-center space-x-2 mt-2 text-red-400">
                        <X size={12} />
                        <span className="text-xs font-hand">Passwords do not match</span>
                      </div>
                    )}
                    {createAccountData.confirmPassword && createAccountData.password === createAccountData.confirmPassword && createAccountData.password && (
                      <div className="flex items-center space-x-2 mt-2 text-green-400">
                        <Check size={12} />
                        <span className="text-xs font-hand">Passwords match</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Choose Your Avatar
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => setCreateAccountData(prev => ({ ...prev, avatar }))}
                          className={`p-2 rounded-lg text-2xl border-2 transition-all doodle-btn sticker-element ${
                            createAccountData.avatar === avatar
                              ? 'border-primary bg-primary/20 shadow-doodle'
                              : 'border-gray-700 bg-dark-light hover:border-gray-600'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-hand">
                      Starting Title
                    </label>
                    <select
                      value={createAccountData.title}
                      onChange={(e) => setCreateAccountData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-dark-light text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-primary focus:outline-none font-hand"
                    >
                      {titleOptions.map((title) => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>

                  <motion.button
                    onClick={handleCreateAccount}
                    disabled={
                      !createAccountData.username.trim() || 
                      !isPasswordValid(createAccountData.password) || 
                      createAccountData.password !== createAccountData.confirmPassword
                    }
                    className="w-full bg-gradient-to-r from-secondary to-blue-500 text-white rounded-lg py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed doodle-btn sketch-border font-hand"
                    whileHover={{ scale: 1.02, rotate: 1 }}
                    whileTap={{ scale: 0.98, rotate: -1 }}
                  >
                    Create Account 🎨
                  </motion.button>

                  <div className="text-center">
                    <button
                      onClick={() => setShowCreateAccount(false)}
                      className="text-secondary hover:text-white transition-colors font-hand underline"
                    >
                      Already have an account? Sign in! 🔑
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fun Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <div className="flex justify-center space-x-4 text-2xl mb-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                🎭
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                🎪
              </motion.span>
              <motion.span
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                🎨
              </motion.span>
            </div>
            <p className="text-gray-400 font-hand">
              Ready to unleash your inner clown? 🤡✨
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};