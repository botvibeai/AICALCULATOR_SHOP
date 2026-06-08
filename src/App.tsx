/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Calculator, 
  TrendingUp, 
  Zap, 
  Shield, 
  Cpu, 
  Globe, 
  ExternalLink, 
  ChevronRight, 
  Home, 
  Menu, 
  X, 
  Share2, 
  Twitter,
  Facebook,
  Linkedin,
  Star, 
  CreditCard, 
  ArrowRight,
  Search,
  CheckCircle2,
  Info,
  DollarSign,
  BarChart3,
  Clock,
  Heart,
  Briefcase,
  Layers,
  Smartphone,
  Sun,
  Cloud,
  Lock,
  ZapOff,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  User as UserIcon,
  LogOut,
  History,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider, createUserProfile, getUserProfile, logActivity, toggleToolFavorite, db } from './services/firebaseService';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { Language, translations } from './translations';
import { Logo } from './components/Logo';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'reward' | 'alert';
  isRead: boolean;
  createdAt: Date;
};

// --- TYPES ---
type Category = {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  description: string;
  color: string;
};

type Tool = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  isPremium: boolean;
  type: 'native' | 'premium';
};

// --- DATA ---
const CATEGORIES: Category[] = [
  { id: 'health', name: 'Health & Fitness', slug: 'health-fitness', icon: <Activity className="w-6 h-6" />, description: 'Optimize your biological machine.', color: 'neon-green' },
  { id: 'finance', name: 'Finance & Wealth', slug: 'finance-wealth', icon: <TrendingUp className="w-6 h-6" />, description: 'Master your capital flow.', color: 'neon-gold' },
  { id: 'math', name: 'Math & Science', slug: 'math-science', icon: <Calculator className="w-6 h-6" />, description: 'Pure logic, zero friction.', color: 'neon-blue' },
  { id: 'business', name: 'Business & Productivity', slug: 'business-productivity', icon: <Briefcase className="w-6 h-6" />, description: 'Scale your operations.', color: 'neon-magenta' },
  { id: 'tech', name: 'Tech & Lifestyle', slug: 'tech-lifestyle', icon: <Smartphone className="w-6 h-6" />, description: 'Sovereign tech for daily life.', color: 'neon-blue' },
  { id: 'ai-cost', name: 'AI Token & Cost', slug: 'ai-token-cost', icon: <DollarSign className="w-6 h-6" />, description: 'Premium arbitrage estimators.', color: 'neon-magenta' },
  { id: 'ai-inference', name: 'Inference & Optimization', slug: 'ai-inference-optimization', icon: <Cpu className="w-6 h-6" />, description: 'Llama-powered performance.', color: 'neon-green' },
  { id: 'ai-enterprise', name: 'Enterprise & ROI', slug: 'ai-enterprise-roi', icon: <Layers className="w-6 h-6" />, description: 'High-margin AI strategies.', color: 'neon-gold' },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate', icon: <Home className="w-6 h-6" />, description: 'Property valuation and ROI.', color: 'neon-blue' },
  { id: 'solar', name: 'Solar Energy', slug: 'solar-energy', icon: <Sun className="w-6 h-6" />, description: 'Energy efficiency and savings.', color: 'neon-gold' },
];

const TOOLS: Tool[] = [
  // Health & Fitness (1-10)
  { id: '1', name: 'BMI Calculator', slug: 'bmi-calculator', categoryId: 'health', description: 'Calculate Body Mass Index instantly.', isPremium: false, type: 'native' },
  { id: '2', name: 'TDEE Estimator', slug: 'tdee-estimator', categoryId: 'health', description: 'Total Daily Energy Expenditure.', isPremium: false, type: 'native' },
  { id: '3', name: 'Body Fat %', slug: 'body-fat-percent', categoryId: 'health', description: 'Estimate body composition.', isPremium: false, type: 'native' },
  { id: '4', name: 'Macro Split', slug: 'macro-split', categoryId: 'health', description: 'Optimize protein, carbs, and fats.', isPremium: false, type: 'native' },
  { id: '5', name: 'Exercise Calories', slug: 'exercise-calories', categoryId: 'health', description: 'Burn rate for 50+ activities.', isPremium: false, type: 'native' },
  { id: '6', name: 'Pregnancy Due Date', slug: 'pregnancy-due-date', categoryId: 'health', description: 'Track your journey.', isPremium: false, type: 'native' },
  { id: '7', name: 'Biological Age', slug: 'biological-age', categoryId: 'health', description: 'How old are you really?', isPremium: false, type: 'native' },
  { id: '8', name: 'Heart Rate Zones', slug: 'heart-rate-zones', categoryId: 'health', description: 'Target zones for training.', isPremium: false, type: 'native' },
  { id: '9', name: 'Sleep Cycle Optimizer', slug: 'sleep-cycle-optimizer', categoryId: 'health', description: 'Wake up refreshed.', isPremium: false, type: 'native' },
  { id: '10', name: 'Longevity Score', slug: 'longevity-score', categoryId: 'health', description: 'Predict your healthspan.', isPremium: false, type: 'native' },

  // Finance (11-20)
  { id: '11', name: 'Mortgage Payment', slug: 'mortgage-payment', categoryId: 'finance', description: 'Home loan amortization.', isPremium: false, type: 'native' },
  { id: '12', name: 'Loan EMI', slug: 'loan-emi', categoryId: 'finance', description: 'Equated Monthly Installments.', isPremium: false, type: 'native' },
  { id: '13', name: 'Compound Interest', slug: 'compound-interest', categoryId: 'finance', description: 'The 8th wonder of the world.', isPremium: false, type: 'native' },
  { id: '14', name: 'Retirement Planner', slug: 'retirement-planner', categoryId: 'finance', description: 'FIRE goal tracking.', isPremium: false, type: 'native' },
  { id: '15', name: 'Budget Allocator', slug: 'budget-allocator', categoryId: 'finance', description: '50/30/20 rule simulator.', isPremium: false, type: 'native' },
  { id: '16', name: 'Investment ROI', slug: 'investment-roi', categoryId: 'finance', description: 'Return on Investment.', isPremium: false, type: 'native' },
  { id: '17', name: 'Break-Even', slug: 'break-even', categoryId: 'finance', description: 'When does profit start?', isPremium: false, type: 'native' },
  { id: '18', name: 'Profit Margin', slug: 'profit-margin', categoryId: 'finance', description: 'Gross vs Net margins.', isPremium: false, type: 'native' },
  { id: '19', name: 'Sales Tax', slug: 'sales-tax', categoryId: 'finance', description: 'Global tax estimator.', isPremium: false, type: 'native' },
  { id: '20', name: 'Currency Converter', slug: 'currency-converter', categoryId: 'finance', description: 'Live FX rates.', isPremium: false, type: 'native' },

  // Math/Science (21-28)
  { id: '21', name: 'Scientific Calculator', slug: 'scientific-calculator', categoryId: 'math', description: 'Advanced functions.', isPremium: false, type: 'native' },
  { id: '22', name: 'Graphing Tool', slug: 'graphing-tool', categoryId: 'math', description: 'Visualize equations.', isPremium: false, type: 'native' },
  { id: '23', name: 'Unit Converter', slug: 'unit-converter', categoryId: 'math', description: 'Metric to Imperial.', isPremium: false, type: 'native' },
  { id: '24', name: 'Percentage Calculator', slug: 'percentage-calculator', categoryId: 'math', description: 'Quick math.', isPremium: false, type: 'native' },
  { id: '25', name: 'Probability', slug: 'probability', categoryId: 'math', description: 'Odds and outcomes.', isPremium: false, type: 'native' },
  { id: '26', name: 'Statistical Significance', slug: 'statistical-significance', categoryId: 'math', description: 'A/B test validator.', isPremium: false, type: 'native' },
  { id: '27', name: 'Carbon Footprint', slug: 'carbon-footprint', categoryId: 'math', description: 'Environmental impact.', isPremium: false, type: 'native' },
  { id: '28', name: 'Time Value of Money', slug: 'tvm-calculator', categoryId: 'math', description: 'Present vs Future value.', isPremium: false, type: 'native' },

  // Business/Productivity (29-33)
  { id: '29', name: 'Payroll Tax', slug: 'payroll-tax', categoryId: 'business', description: 'Employer cost estimator.', isPremium: false, type: 'native' },
  { id: '30', name: 'Project Cost Estimator', slug: 'project-cost-estimator', categoryId: 'business', description: 'Budgeting for builders.', isPremium: false, type: 'native' },
  { id: '31', name: 'Freelance Rate', slug: 'freelance-rate', categoryId: 'business', description: 'Calculate your hourly worth.', isPremium: false, type: 'native' },
  { id: '32', name: 'SEO Traffic Value', slug: 'seo-traffic-value', categoryId: 'business', description: 'What is your rank worth?', isPremium: false, type: 'native' },
  { id: '33', name: 'API Rate Limit Simulator', slug: 'api-rate-limit', categoryId: 'business', description: 'Stress test your architecture.', isPremium: false, type: 'native' },

  // Tech/Lifestyle (34-40)
  { id: '34', name: 'Bandwidth Cost', slug: 'bandwidth-cost', categoryId: 'tech', description: 'Data egress projector.', isPremium: false, type: 'native' },
  { id: '35', name: 'Cloud Storage Projector', slug: 'cloud-storage', categoryId: 'tech', description: 'S3 vs R2 vs Local.', isPremium: false, type: 'native' },
  { id: '36', name: 'File Size Converter', slug: 'file-size', categoryId: 'tech', description: 'Bits to Terabytes.', isPremium: false, type: 'native' },
  { id: '37', name: 'Crypto Converter', slug: 'crypto-converter', categoryId: 'tech', description: 'BTC/ETH to Fiat.', isPremium: false, type: 'native' },
  { id: '38', name: 'EV Charging Cost', slug: 'ev-charging', categoryId: 'tech', description: 'Electric vs Gas savings.', isPremium: false, type: 'native' },
  { id: '39', name: 'Solar Payback', slug: 'solar-payback', categoryId: 'tech', description: 'ROI on solar panels.', isPremium: false, type: 'native' },
  { id: '40', name: 'Travel Budget', slug: 'travel-budget', categoryId: 'tech', description: 'Plan your next escape.', isPremium: false, type: 'native' },

  // Premium & ROI Tools (41-53)
  { id: '41', name: 'LLM Token & Arbitrage Cost Estimator', slug: 'llm-arbitrage-cost', categoryId: 'ai-cost', description: 'Compare 800+ models instantly.', isPremium: true, type: 'premium' },
  { id: '42', name: 'AI Model Price Comparator', slug: 'ai-price-comparator', categoryId: 'ai-cost', description: 'Live cheapest route finder.', isPremium: true, type: 'premium' },
  { id: '43', name: 'Monthly AI Spend Projector', slug: 'ai-spend-projector', categoryId: 'ai-cost', description: 'Forecast your inference bills.', isPremium: true, type: 'premium' },
  { id: '44', name: 'Task-Specific Inference Simulator', slug: 'inference-simulator', categoryId: 'ai-inference', description: 'Simulate Llama performance.', isPremium: true, type: 'premium' },
  { id: '45', name: 'Prompt Optimizer + Cost Reducer', slug: 'prompt-optimizer', categoryId: 'ai-inference', description: 'Save 30% on tokens.', isPremium: true, type: 'premium' },
  { id: '46', name: 'Caching Efficiency Estimator', slug: 'caching-efficiency', categoryId: 'ai-inference', description: 'Context caching ROI.', isPremium: true, type: 'premium' },
  { id: '47', name: 'Enterprise AI TCO Calculator', slug: 'enterprise-tco', categoryId: 'ai-enterprise', description: 'Total Cost of Ownership.', isPremium: true, type: 'premium' },
  { id: '48', name: 'BYOK Cost Tracker', slug: 'byok-tracker', categoryId: 'ai-enterprise', description: 'Bring Your Own Key analytics.', isPremium: true, type: 'premium' },
  { id: '49', name: 'API Spend ROI Calculator', slug: 'api-roi', categoryId: 'ai-enterprise', description: 'Revenue per inference.', isPremium: true, type: 'premium' },
  { id: '50', name: 'TruthNowAI Face Scan Optimizer', slug: 'face-scan-optimizer', categoryId: 'ai-enterprise', description: 'Link to TruthNowAI.com.', isPremium: true, type: 'premium' },
  { id: '51', name: 'Human vs. AI Cost Calculator', slug: 'human-vs-ai-cost', categoryId: 'ai-enterprise', description: 'Compare employee vs AI agent ROI accurately.', isPremium: false, type: 'native' },
  { id: '52', name: 'Agent Efficiency Calculator', slug: 'agent-efficiency', categoryId: 'ai-enterprise', description: 'Calculate 24/7 handling capacity vs humans.', isPremium: false, type: 'native' },
  { id: '53', name: 'BotVibe Custom AI Agent ROI', slug: 'botvibe-agent-roi', categoryId: 'ai-enterprise', description: 'Specific ROI metrics for BotVibe.tech agents.', isPremium: false, type: 'native' },

  // New Calculators
  { id: '54', name: 'Real Estate Valuation', slug: 'real-estate-valuation', categoryId: 'real-estate', description: 'Simple property valuation.', isPremium: false, type: 'native' },
  { id: '55', name: 'Solar Capacity Estimator', slug: 'solar-capacity', categoryId: 'solar', description: 'Estimate solar capacity needed.', isPremium: false, type: 'native' },
  { id: '56', name: 'Real Estate ROI Simulator', slug: 'real-estate-roi', categoryId: 'real-estate', description: 'Simulate property ROI simulator.', isPremium: true, type: 'premium' },
  { id: '57', name: 'Rental Income Projection', slug: 'rental-income', categoryId: 'real-estate', description: 'Project yearly rental income.', isPremium: true, type: 'premium' },
  { id: '58', name: 'Solar ROI Projector', slug: 'solar-roi', categoryId: 'solar', description: 'Project ROI for solar setup.', isPremium: true, type: 'premium' },
  { id: '59', name: 'Solar Payback Analysis', slug: 'solar-payback-analysis', categoryId: 'solar', description: 'Detailed payback analysis.', isPremium: true, type: 'premium' },
];

const InputWithTooltip = ({ label, tooltip, ...inputProps }: { label: string, tooltip: string, [key: string]: any }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1">
      {label}
      <span className="group relative cursor-help">
        <Info className="w-3 h-3 text-white/30 hover:text-white transition-colors" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-white/10 text-center">
          {tooltip}
        </span>
      </span>
    </label>
    <input {...inputProps} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-blue outline-none text-sm text-white" />
  </div>
);

// --- COMPONENTS ---

type ViewState = { type: 'home' | 'category' | 'tool' | 'all' | 'premium' | 'favorites' | 'dashboard' | 'login' | 'terms' | 'privacy'; id?: string };

const StaticPage = ({ title, content }: { title: string, content: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <h1 className="text-4xl font-black mb-8 tracking-tight">{title}</h1>
    <div className="prose prose-invert prose-neon-blue max-w-none text-white/70">
      {content}
    </div>
  </div>
);

const TermsOfService = () => (
  <StaticPage title="Terms of Service" content={
    <div className="space-y-4">
      <p>Last updated: May 16, 2026</p>
      <p>Welcome to AICalculator.shop. By accessing our services, you agree to these terms.</p>
      <h2 className="text-xl font-bold text-white">1. Use of Services</h2>
      <p>Users must use our tools responsibly. Any misuse of our API arbitrage estimators will result in account suspension.</p>
      <h2 className="text-xl font-bold text-white">2. Intellectual Property</h2>
      <p>All tool algorithms and designs are property of BotVibe AI.</p>
    </div>
  } />
);

const PrivacyPolicy = () => (
  <StaticPage title="Privacy Policy" content={
    <div className="space-y-6 text-white/70">
      <p className="text-white">Last updated: May 16, 2026</p>
      <p>At AICalculator.shop, we are committed to protecting your privacy. This policy outlines how we handle data.</p>
      
      <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
      <p>We collect information you provide directly, such as your email address and name when you sign up using Google. We also log your activity on our platform (tool usage, points earned) to enhance your experience.</p>
      
      <h2 className="text-xl font-bold text-white">2. Cookies and Tracking</h2>
      <p>We use essential cookies to manage your session and preferences. We do not use third-party tracking for advertising purposes.</p>
      
      <h2 className="text-xl font-bold text-white">3. Data Security and Sharing</h2>
      <p>Your data is stored securely in Firebase. We do not sell or share your personal information with third parties. Your data is used strictly for the operation of this platform and the improvement of our services.</p>
      
      <h2 className="text-xl font-bold text-white">4. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, please contact us at support@aicalculator.shop.</p>
    </div>
  } />
);

const Header = ({ points, credits, favoritesCount, setView, user, onLogin, onLogout, notifications, onShowNotifications, language, setLanguage, t }: { 
  points: number, 
  credits: number, 
  favoritesCount: number, 
  setView: (v: ViewState) => void,
  user: any,
  onLogin: () => void,
  onLogout: () => void,
  notifications: Notification[],
  onShowNotifications: () => void,
  language: Language,
  setLanguage: (lang: Language) => void,
  t: any
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  return (
  <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div 
        className="cursor-pointer"
        onClick={() => setView({ type: 'home' })}
      >
        <Logo iconSize="md" showText={true} />
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
        <button onClick={() => setView({ type: 'home' })} className="hover:text-neon-blue transition-colors">{t.home}</button>
        <button onClick={() => setView({ type: 'all' })} className="hover:text-neon-blue transition-colors">{t.allTools}</button>
        <button onClick={() => setView({ type: 'privacy' })} className="hover:text-neon-blue transition-colors">{t.privacy}</button>
        <button onClick={() => setView({ type: 'favorites' })} className="hover:text-neon-magenta transition-colors flex items-center gap-1 relative group">
          <Heart className="w-4 h-4" /> {t.favorites}
          {favoritesCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={favoritesCount}
              className="absolute -top-2 -right-3 bg-neon-magenta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,0,170,0.5)]"
            >
              {favoritesCount}
            </motion.span>
          )}
        </button>
        {user && (
          <button onClick={() => setView({ type: 'dashboard' })} className="hover:text-neon-blue transition-colors flex items-center gap-1">
            <Activity className="w-4 h-4" /> {t.dashboard}
          </button>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-cyber-black text-white text-xs p-1 rounded border border-white/10 cursor-pointer"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
        </select>
        <button onClick={onShowNotifications} className="relative p-2 text-white/50 hover:text-white transition-colors">
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-neon-blue rounded-full" />
          )}
        </button>

        <div className="hidden lg:flex items-center gap-3 mr-2">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Zap className="w-4 h-4 text-neon-gold animate-pulse" />
            <span className="text-xs font-mono font-bold text-neon-gold uppercase tracking-widest">{points} PTS</span>
          </div>
          <div className="flex items-center gap-2 bg-neon-blue/10 px-3 py-1.5 rounded-full border border-neon-blue/20">
            <Cpu className="w-4 h-4 text-neon-blue" />
            <span className="text-xs font-mono font-bold text-neon-blue uppercase tracking-widest">{credits} CREDITS</span>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView({ type: 'dashboard' })}
              className="w-10 h-10 rounded-full border border-white/20 overflow-hidden hover:border-neon-blue transition-all"
              title="View Dashboard"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </button>
            <button 
              onClick={onLogout}
              className="hidden sm:flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Lock className="w-3 h-3" /> LOGIN
          </button>
        )}

        <button 
          onClick={() => setView({ type: 'premium' })}
          className="hidden sm:flex items-center gap-2 bg-neon-magenta px-4 py-1.5 rounded-full text-xs font-black shadow-[0_0_15px_rgba(255,0,170,0.4)] hover:scale-105 transition-transform uppercase tracking-widest"
        >
          <Star className="w-4 h-4" /> PRO
        </button>
        <button className="md:hidden text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  </header>
  );
};

const Footer = ({ setView }: { setView: (v: ViewState) => void }) => (
  <footer className="bg-cyber-black border-t border-white/10 py-12 px-4 mt-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="cursor-pointer mb-6" onClick={() => setView({ type: 'home' })}>
          <Logo iconSize="lg" showText={true} />
        </div>
        <p className="text-white/50 max-w-md mb-8">
          The world's first high-conversion sovereign calculator hub. Powered by Cloudflare Workers AI and Native Arbitrage. Save 70% Plus on AI costs instantly.
        </p>
        <div className="flex gap-4">
          <a href="https://CostImplodeAI.com" className="text-white/40 hover:text-neon-blue transition-colors">CostImplodeAI.com</a>
          <a href="https://TokenTax0.site" className="text-white/40 hover:text-neon-magenta transition-colors">TokenTax0.site</a>
          <a href="https://BotVibe.tech" className="text-white/40 hover:text-neon-green transition-colors">BotVibe.tech</a>
        </div>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Categories</h4>
        <ul className="space-y-3 text-sm text-white/50">
          {CATEGORIES.slice(0, 5).map(c => (
            <li 
              key={c.id} 
              onClick={() => setView({ type: 'category', id: c.id })}
              className="hover:text-neon-blue cursor-pointer transition-colors"
            >
              {c.name}
            </li>
          ))}
          <li 
            onClick={() => setView({ type: 'all' })}
            className="hover:text-neon-blue cursor-pointer transition-colors font-bold"
          >
            ALL TOOLS
          </li>
          <li 
            onClick={() => setView({ type: 'privacy' })}
            className="hover:text-neon-blue cursor-pointer transition-colors"
          >
            Privacy Policy
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Resource Hub</h4>
        <ul className="space-y-3 text-sm text-white/50">
          <li onClick={() => setView({ type: 'terms' })} className="hover:text-neon-blue cursor-pointer transition-colors">Terms of Service</li>
          <li onClick={() => setView({ type: 'privacy' })} className="hover:text-neon-blue cursor-pointer transition-colors">Privacy Policy</li>
          <li><a href="/seo/about.txt" target="_blank" className="hover:text-neon-blue transition-colors">Our Mission (.txt)</a></li>
          <li><a href="/sitemap.xml" target="_blank" className="hover:text-neon-blue transition-colors">Sitemap (.xml)</a></li>
          <li><a href="/robots.txt" target="_blank" className="hover:text-neon-blue transition-colors">Robots Config</a></li>
          <li className="text-neon-gold font-bold">© 2026 BotVibe AI</li>
        </ul>
      </div>
    </div>
  </footer>
);

const Hero = ({ onBrowse }: { onBrowse: () => void }) => (
  <section className="relative overflow-hidden pt-20 pb-32 px-4">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-magenta/10 blur-[120px] rounded-full" />
    </div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-white/70">100% Cloudflare Native • Zero Google Rent</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
          53 FREE AI & <br />
          <span className="neon-text-blue">EVERYDAY CALCULATORS</span>
        </h1>
        
        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
          Powered by Sovereign Tech. Save <span className="text-neon-green font-bold">70% Plus</span> on AI costs instantly with our arbitrage-ready tools.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onBrowse}
            className="w-full sm:w-auto bg-neon-blue text-cyber-black px-8 py-4 rounded-xl font-black text-lg shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            BROWSE ALL TOOLS <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="https://CostImplodeAI.com"
            target="_blank"
            className="w-full sm:w-auto bg-white/5 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            CLAIM FREE PRO <Zap className="w-5 h-5 text-neon-gold" />
          </a>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-6 h-6" /> SECURE</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-6 h-6" /> FAST</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Globe className="w-6 h-6" /> GLOBAL</div>
        </div>
      </motion.div>
    </div>
  </section>
);

const CategoryCard: React.FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
    onClick={onClick}
    className={`group cursor-pointer p-6 rounded-2xl glass border border-white/10 hover:border-${category.color} transition-all duration-300 relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${category.color}/5 blur-[40px] -mr-16 -mt-16 group-hover:bg-${category.color}/10 transition-colors`} />
    
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${category.color}/20 text-${category.color} shadow-[0_0_15px_rgba(var(--${category.color}-rgb),0.2)]`}>
      {category.icon}
    </div>

    <h3 className="text-xl font-bold mb-2 group-hover:text-neon-blue transition-colors">{category.name}</h3>
    <p className="text-white/50 text-sm mb-6">{category.description}</p>

    <div className="flex items-center text-xs font-bold tracking-widest uppercase text-white/30 group-hover:text-white transition-colors">
      EXPLORE TOOLS <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

const ToolListItem: React.FC<{ 
  tool: Tool; 
  onClick: () => void; 
  isFavorite: boolean; 
  onToggleFavorite: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
}> = ({ tool, onClick, isFavorite, onToggleFavorite, onShare }) => {
  const shareUrl = encodeURIComponent(`https://aicalculator.shop/tool/${tool.slug}`);
  const shareText = encodeURIComponent(`Check out this ${tool.name} on AICalculator.shop!`);
  const category = CATEGORIES.find(c => c.id === tool.categoryId);
  const Icon = category?.icon || <Calculator className="w-5 h-5" />;
  const colorClasses = category?.color === 'neon-green' ? 'bg-neon-green/20 text-neon-green' :
                       category?.color === 'neon-gold' ? 'bg-neon-gold/20 text-neon-gold' :
                       category?.color === 'neon-magenta' ? 'bg-neon-magenta/20 text-neon-magenta' :
                       'bg-neon-blue/20 text-neon-blue';

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-neon-blue/30 cursor-pointer transition-all gap-4"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 relative ${colorClasses}`}>
          {Icon}
          {tool.isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-magenta flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold group-hover:text-neon-blue transition-colors leading-tight truncate">{tool.name}</h4>
          <p className="text-[13px] text-white/50 mt-1 font-medium italic group-hover:text-white/70 transition-colors uppercase tracking-wider line-clamp-1">
            {tool.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <div className="flex items-center bg-cyber-black/40 rounded-lg px-2 py-1 border border-white/5">
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              const shareData = {
                title: tool.name,
                text: `Check out ${tool.name} on AICalculator.shop!`,
                url: `https://aicalculator.shop/tool/${tool.slug}`
              };
              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                  // alert('Copied link to clipboard!'); // Disable alert for non-intrusive UI
                }
                onShare(e); // Award points after sharing
              } catch (err) {
                console.error('Error sharing:', err);
              }
            }}
            className="p-1.5 rounded-md text-white/20 hover:text-neon-blue hover:bg-neon-blue/10 transition-all"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, '_blank');
              onShare(e);
            }}
            className="p-1.5 rounded-md text-white/20 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
            title="Share on Twitter"
          >
            <Twitter className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
              onShare(e);
            }}
            className="p-1.5 rounded-md text-white/20 hover:text-[#4267B2] hover:bg-[#4267B2]/10 transition-all"
            title="Share on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(tool.name)}`, '_blank');
              onShare(e);
            }}
            className="p-1.5 rounded-md text-white/20 hover:text-[#0077B5] hover:bg-[#0077B5]/10 transition-all"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </button>
        </div>

        <motion.button 
          whileTap={{ scale: 1.4 }}
          onClick={onToggleFavorite}
          className={`p-2 rounded-lg transition-all ${isFavorite ? 'text-neon-magenta bg-neon-magenta/10' : 'text-white/20 hover:text-neon-magenta hover:bg-white/5'}`}
        >
          <motion.div
            animate={{ 
              scale: isFavorite ? [1, 1.2, 1] : 1,
              fill: isFavorite ? "currentColor" : "none"
            }}
            transition={{ duration: 0.3 }}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.div>
        </motion.button>
        {tool.isPremium && (
          <span className="text-[10px] font-black bg-neon-magenta/20 text-neon-magenta px-2 py-0.5 rounded border border-neon-magenta/30 uppercase tracking-tighter">PREMIUM</span>
        )}
        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

// --- CHATBOT COMPONENT ---

const FeaturedTools = ({ onSelectTool }: { onSelectTool: (id: string) => void }) => {
  const tool = TOOLS.find(t => t.id === '41'); // 'LLM Token & Arbitrage Cost Estimator'
  if (!tool) return null;
  
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-sm font-black tracking-[0.2em] uppercase text-neon-magenta mb-6 text-center md:text-left">Featured AI Tool</h2>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="p-8 rounded-3xl bg-gradient-to-r from-neon-magenta/20 via-neon-blue/10 to-transparent border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl font-black mb-2">{tool.name}</h3>
          <p className="text-white/60 mb-6">{tool.description}</p>
          <button 
            onClick={() => onSelectTool(tool.id)} 
            className="group inline-flex items-center gap-2 bg-neon-magenta text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            USE ESTIMATOR <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="w-full md:w-auto">
          <div className="bg-cyber-black/50 rounded-2xl p-6 border border-white/10 shadow-2xl w-full md:w-80">
             <div className="flex justify-between items-center text-neon-green font-bold text-sm mb-2">
                <span>ESTIMATED SAVINGS</span>
                <span className="text-xl">97%</span>
             </div>
             <div className="text-[10px] text-white/40 uppercase tracking-widest text-center">Arbitrage-Ready Optimization</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const Chatbot = ({ context }: { context: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Systems online. I'm Astro, your AI guide. How can I assist your navigation through the sovereign toolsets today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error. My logic-engine is currently cycling. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: "History purged. I'm ready for new instructions." }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 sm:w-96 h-[500px] mb-4 glass border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-4 bg-neon-blue/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-neon-blue rounded-lg flex items-center justify-center">
                  <Cpu className="text-cyber-black w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest neon-text-blue">Astro AI Guide</h4>
                  <p className="text-[10px] text-white/40 uppercase">v3.1 Flash Preview</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearChat}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/20 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-neon-blue text-cyber-black font-medium rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-neon-blue animate-spin" />
                    <span className="text-xs text-white/40 font-mono">Processing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-cyber-black/30">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask Astro anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-blue/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-blue disabled:text-white/10 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-white/20 mt-3 uppercase tracking-tighter">
                Powered by Gemini 1.5 Pro • CostImplodeAI Arbitrage Secure
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-neon-blue rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <MessageSquare className="text-cyber-black w-8 h-8 relative z-10" />
      </motion.button>
    </div>
  );
};

// --- CALCULATOR COMPONENTS ---

const HumanVsAICostCalculator = () => {
  const [hourlyRate, setHourlyRate] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [employees, setEmployees] = useState(1);
  const [benefits, setBenefits] = useState(20); // 20% benefits/overhead

  const annualHumanCost = useMemo(() => {
    const weeklyRate = hourlyRate * hoursPerWeek;
    const baseAnnual = weeklyRate * 52 * employees;
    const totalAnnual = baseAnnual * (1 + benefits / 100);
    return totalAnnual;
  }, [hourlyRate, hoursPerWeek, employees, benefits]);

  // BotVibe Pro Agent estimated at $199/mo per 5000 tasks, let's assume a "seat" model for comparison
  const botVibeCost = 199 * 12 * Math.ceil(employees / 5); // One agent handles work of many

  const savings = annualHumanCost - botVibeCost;
  const savingsPercent = ((savings / annualHumanCost) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputWithTooltip 
          label="Hourly Rate ($)"
          tooltip="The average hourly wage cost for an employee including taxes and base salary."
          type="number" 
          value={hourlyRate} 
          onChange={e => setHourlyRate(Number(e.target.value))} 
        />
        <InputWithTooltip 
          label="Hours / Week"
          tooltip="Average number of hours an employee works in a week."
          type="number" 
          value={hoursPerWeek} 
          onChange={e => setHoursPerWeek(Number(e.target.value))} 
        />
        <InputWithTooltip 
          label="Employees"
          tooltip="Number of employees performing tasks that can be automated."
          type="number" 
          value={employees} 
          onChange={e => setEmployees(Number(e.target.value))} 
        />
        <InputWithTooltip 
          label="Benefits / Overhead (%)"
          tooltip="Additional costs associated with employment, such as benefits, office space, and equipment."
          type="number" 
          value={benefits} 
          onChange={e => setBenefits(Number(e.target.value))} 
        />
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-magenta/20 border border-white/10 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-neon-gold mb-2">Annual Savings with BotVibe Agents</div>
          <div className="text-6xl font-black text-white mb-2">${savings.toLocaleString()}</div>
          <p className="text-sm text-neon-green font-bold">~{savingsPercent}% Cost Reduction</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
            <div className="bg-white/5 px-2 py-1 rounded">24/7 Availability: YES</div>
            <div className="bg-white/5 px-2 py-1 rounded">Sick Days: 0</div>
            <div className="bg-white/5 px-2 py-1 rounded">Scale: Instant</div>
          </div>
        </div>
      </div>

      <div className="bg-neon-gold/10 border border-neon-gold/30 p-6 rounded-2xl text-center">
        <h4 className="text-neon-gold font-black mb-4 uppercase">Unlock Enterprise Scaling</h4>
        <a 
          href="https://BotVibe.tech" 
          target="_blank"
          className="inline-flex items-center gap-2 bg-neon-gold text-cyber-black px-6 py-3 rounded-xl font-black hover:scale-105 transition-transform"
        >
          EXPLORE CUSTOM AI AGENTS AT BOTVIBE.TECH <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

const AgentEfficiencyCalculator = () => {
  const [tasksPerHour, setTasksPerHour] = useState(10);
  const [botSpeedMultiplier, setBotSpeedMultiplier] = useState(5); // Bot is 5x faster

  const humanMonthlyCapacity = tasksPerHour * 40 * 4;
  const botMonthlyCapacity = tasksPerHour * botSpeedMultiplier * 168 * 4; // 168 hours in a week

  const lift = (botMonthlyCapacity / humanMonthlyCapacity).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <InputWithTooltip 
          label="Human Tasks / Hour"
          tooltip="Average number of tasks an employee can perform in an hour."
          type="number" 
          value={tasksPerHour} 
          onChange={e => setTasksPerHour(Number(e.target.value))} 
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2 flex items-center gap-1">
             AI Speed Multiplier
             <span className="group relative cursor-help">
               <Info className="w-3 h-3 text-white/30 hover:text-white transition-colors" />
               <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-white/10 text-center">
                 How much faster the AI agent operates compared to a human.
               </span>
             </span>
          </label>
          <input type="range" min="1" max="50" value={botSpeedMultiplier} onChange={e => setBotSpeedMultiplier(Number(e.target.value))} className="w-full accent-neon-magenta" />
          <div className="text-center font-mono font-bold text-neon-magenta mt-1">{botSpeedMultiplier}x Faster</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-6 rounded-xl border-white/5">
          <div className="text-xs text-white/30 uppercase mb-1">Human Capacity (Mo)</div>
          <div className="text-2xl font-bold">{humanMonthlyCapacity.toLocaleString()} Tasks</div>
        </div>
        <div className="bg-neon-magenta/10 border border-neon-magenta/30 p-6 rounded-xl">
          <div className="text-xs text-neon-magenta uppercase mb-1">AI Agent Capacity (Mo)</div>
          <div className="text-2xl font-bold text-neon-magenta">{botMonthlyCapacity.toLocaleString()} Tasks</div>
        </div>
      </div>

      <div className="p-8 rounded-2xl glass border border-neon-magenta/30 text-center">
        <div className="text-6xl font-black neon-text-magenta mb-2">{lift}x</div>
        <div className="text-sm font-bold text-white/60 uppercase tracking-widest">Efficiency Lift Factor</div>
        <p className="text-xs mt-4 text-white/30 italic">AI Agents don't sleep, take lunch breaks, or lose focus. 24/7 uptime is a fundamental advantage.</p>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-white/60">Ready for superhuman handling speed?</p>
        <a href="https://BotVibe.tech" target="_blank" className="bg-white text-cyber-black px-4 py-2 rounded-lg text-xs font-black hover:scale-105 transition-transform">ORDER AGENTS</a>
      </div>
    </div>
  );
};
const BMICalculator = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const bmi = useMemo(() => (weight / ((height / 100) ** 2)).toFixed(1), [weight, height]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Weight (kg)</label>
          <input 
            type="range" min="30" max="200" value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-neon-blue"
          />
          <div className="flex justify-between mt-2 font-mono text-sm">
            <span>30kg</span>
            <span className="text-neon-blue font-bold">{weight}kg</span>
            <span>200kg</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Height (cm)</label>
          <input 
            type="range" min="100" max="250" value={height} 
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full accent-neon-blue"
          />
          <div className="flex justify-between mt-2 font-mono text-sm">
            <span>100cm</span>
            <span className="text-neon-blue font-bold">{height}cm</span>
            <span>250cm</span>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-neon-blue mb-2">Your BMI Score</div>
        <div className="text-6xl font-black neon-text-blue mb-4">{bmi}</div>
        <div className="text-sm font-medium text-white/70">
          {Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal Weight' : Number(bmi) < 30 ? 'Overweight' : 'Obese'}
        </div>
      </div>
    </div>
  );
};

const MortgageCalculator = () => {
  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(30);

  const monthlyPayment = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) return (amount / n).toFixed(2);
    const payment = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return payment.toFixed(2);
  }, [amount, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Loan Amount ($)</label>
          <input 
            type="number" value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-blue outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Interest Rate (%)</label>
          <input 
            type="number" step="0.1" value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-blue outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Term (Years)</label>
          <input 
            type="number" value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-blue outline-none transition-colors"
          />
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-neon-blue/10 border border-neon-blue/30 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-neon-blue mb-2">Monthly Payment</div>
        <div className="text-6xl font-black neon-text-blue mb-4">${Number(monthlyPayment).toLocaleString()}</div>
        <div className="text-sm font-medium text-white/70">
          Total Payback: ${(Number(monthlyPayment) * years * 12).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const InferenceSimulator = () => {
  const [modelSize, setModelSize] = useState('70b');
  const [quantization, setQuantization] = useState('q4_k_m');
  const [inputTokens, setInputTokens] = useState(500);
  const [outputTokens, setOutputTokens] = useState(300);
  const [useCase, setUseCase] = useState('chat');

  const specs = useMemo(() => {
    switch(modelSize) {
      case '8b': return { params: 8, vramBase: 5, tpsBase: 120 };
      case '70b': return { params: 70, vramBase: 40, tpsBase: 15 };
      case '405b': return { params: 405, vramBase: 230, tpsBase: 2 };
      default: return { params: 70, vramBase: 40, tpsBase: 15 };
    }
  }, [modelSize]);

  const qFactor = useMemo(() => {
    switch(quantization) {
      case 'fp16': return { vram: 2.0, speed: 0.8 };
      case 'q8_0': return { vram: 1.1, speed: 1.0 };
      case 'q4_k_m': return { vram: 0.6, speed: 1.4 };
      default: return { vram: 0.6, speed: 1.4 };
    }
  }, [quantization]);

  const results = useMemo(() => {
    const vram = specs.vramBase * qFactor.vram;
    const tps = specs.tpsBase * qFactor.speed * (useCase === 'coding' ? 0.85 : 1.0);
    const latencyFirst = (inputTokens / 100) * (modelSize === '405b' ? 0.5 : 0.1);
    const latencyTotal = latencyFirst + (outputTokens / tps);
    const costStandard = (inputTokens + outputTokens) / 1000 * (specs.params * 0.0001);
    const costAICalc = costStandard * 0.28; // 72% savings

    return { vram, tps, latencyFirst, latencyTotal, costStandard, costAICalc };
  }, [specs, qFactor, inputTokens, outputTokens, useCase, modelSize]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Model Architecture</label>
            <div className="grid grid-cols-3 gap-2">
              {['8b', '70b', '405b'].map(size => (
                <button
                  key={size}
                  onClick={() => setModelSize(size)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${modelSize === size ? 'bg-neon-blue text-cyber-black border-neon-blue' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'}`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Quantization Level</label>
            <select 
              value={quantization}
              onChange={(e) => setQuantization(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-neon-blue outline-none text-white"
            >
              <option value="fp16">FP16 (Original Precision)</option>
              <option value="q8_0">Q8_0 (Near Lossless)</option>
              <option value="q4_k_m">Q4_K_M (Optimal Balance)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Input Tokens</label>
              <input 
                type="number" value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-neon-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Output Tokens</label>
              <input 
                type="number" value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-neon-blue outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-cyber-black/50 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Compute Speed</div>
              <div className="text-2xl font-black text-neon-blue">{results.tps.toFixed(1)} <span className="text-xs font-medium text-white/50">TPS</span></div>
            </div>
            <Cpu className="w-8 h-8 text-neon-blue/30" />
          </div>

          <div className="p-6 rounded-2xl bg-cyber-black/50 border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">VRAM Required</div>
              <div className="text-2xl font-black text-neon-magenta">{results.vram.toFixed(1)} <span className="text-xs font-medium text-white/50">GB</span></div>
            </div>
            <Server className="w-8 h-8 text-neon-magenta/30" />
          </div>

          <div className="p-6 rounded-2xl bg-neon-green/10 border border-neon-green/20">
             <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-neon-green">Inference Cost (Est.)</span>
               <span className="text-xs font-mono text-neon-green/50">vs Standard Providers</span>
             </div>
             <div className="flex items-baseline gap-2">
               <div className="text-3xl font-black text-white">${results.costAICalc.toFixed(4)}</div>
               <div className="text-sm text-white/30 line-through">${results.costStandard.toFixed(4)}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-neon-blue/5 border border-neon-blue/20">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-neon-blue">Performance Profile</h4>
        <div className="space-y-4">
           <div className="space-y-1">
             <div className="flex justify-between text-[10px] font-bold uppercase">
               <span className="text-white/50">Time to First Token (TTFT)</span>
               <span className="text-neon-blue">{results.latencyFirst.toFixed(2)}s</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '30%' }}
                className="h-full bg-neon-blue"
               />
             </div>
           </div>
           <div className="space-y-1">
             <div className="flex justify-between text-[10px] font-bold uppercase">
               <span className="text-white/50">Total Request Latency</span>
               <span className="text-neon-magenta">{results.latencyTotal.toFixed(2)}s</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                className="h-full bg-neon-magenta shadow-[0_0_10px_rgba(255,0,170,0.5)]"
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(10000);
  const [contribution, setContribution] = useState(500);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);

  const total = useMemo(() => {
    const r = rate / 100;
    const n = 12; // monthly compounding
    const t = years;
    const P = principal;
    const PMT = contribution;
    
    const futureValuePrincipal = P * Math.pow(1 + r/n, n*t);
    const futureValueSeries = PMT * ((Math.pow(1 + r/n, n*t) - 1) / (r/n));
    
    return (futureValuePrincipal + futureValueSeries).toFixed(2);
  }, [principal, contribution, rate, years]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Initial Investment ($)</label>
          <input 
            type="number" value={principal} 
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Monthly Contribution ($)</label>
          <input 
            type="number" value={contribution} 
            onChange={(e) => setContribution(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Annual Return (%)</label>
          <input 
            type="number" value={rate} 
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-gold outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Time Horizon (Years)</label>
          <input 
            type="number" value={years} 
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:border-neon-gold outline-none transition-colors"
          />
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-neon-gold/10 border border-neon-gold/30 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-neon-gold mb-2">Future Value</div>
        <div className="text-6xl font-black neon-text-gold mb-4">${Number(total).toLocaleString()}</div>
        <div className="text-sm font-medium text-white/70">
          Total Contributions: ${(principal + (contribution * years * 12)).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const LLMArbitrageCalculator = () => {
  const [tokens, setTokens] = useState(1000000);
  const [language, setLanguage] = useState('en');
  const standardCost = (tokens / 1000000) * 15; // $15 per 1M tokens (GPT-4o avg)
  const arbitrageCost = (tokens / 1000000) * 0.45; // $0.45 per 1M tokens (Llama 3 70B via CostImplodeAI)
  const savings = standardCost - arbitrageCost;
  const savingsPercent = ((savings / standardCost) * 100).toFixed(0);

  const langMultipliers: Record<string, number> = { en: 1, es: 1.2, fr: 1.3, de: 1.5, zh: 2.0 };
  const tokenTax = tokens * (langMultipliers[language] - 1) * 0.00001;

  const handleShare = () => {
    const text = `I analyzed my AI costs and saved $${savings.toLocaleString()} using the LLM Token & Arbitrage Cost Estimator on AICalculator.shop! Check it out.`;
    if (navigator.share) {
      navigator.share({
        title: 'My AI Cost Savings',
        text: text,
        url: 'https://aicalculator.shop',
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${text} https://aicalculator.shop`);
      alert('Copied results to clipboard!');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 glass rounded-2xl border border-neon-blue/30">
        <div>
          <div className="text-2xl font-black neon-text-blue">TokenTaxØ</div>
          <div className="text-xs font-bold text-white/50 italic">Leveling the playing field.</div>
        </div>
        <div className="flex gap-4">
          <a href="https://TokenTax0.site" target="_blank" className="text-sm font-bold text-neon-blue hover:underline">TokenTax0.site</a>
          <a href="https://CostImplodeAI.com" target="_blank" className="text-sm font-bold text-neon-magenta hover:underline">CostImplodeAI.com</a>
        </div>
      </div>
      
      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue font-bold text-sm transition-all border border-neon-blue/30"
      >
        <Share2 className="w-4 h-4" /> Share My Results
      </button>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Monthly Token Volume</label>
        <input 
          type="range" min="100000" max="100000000" step="100000" value={tokens} 
          onChange={(e) => setTokens(Number(e.target.value))}
          className="w-full accent-neon-magenta"
        />
        <div className="text-center mt-4 font-mono text-2xl font-bold text-neon-magenta">
          {tokens.toLocaleString()} Tokens
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs font-bold text-white/40 uppercase mb-2">Standard API Cost</div>
          <div className="text-3xl font-bold">${standardCost.toLocaleString()}</div>
          <div className="text-[10px] text-white/30 mt-1">Based on $15/1M tokens</div>
        </div>
        <div className="p-6 rounded-xl bg-neon-green/10 border border-neon-green/30">
          <div className="text-xs font-bold text-neon-green uppercase mb-2">CostImplodeAI Cost</div>
          <div className="text-3xl font-bold text-neon-green">${arbitrageCost.toLocaleString()}</div>
          <div className="text-[10px] text-neon-green/50 mt-1">Based on $0.45/1M tokens</div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-neon-magenta/20 to-neon-blue/20 border border-white/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative z-10">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-neon-gold mb-2">Total Monthly Savings</div>
          <div className="text-6xl font-black text-white mb-2">${savings.toLocaleString()}</div>
          <div className="inline-block bg-neon-green text-cyber-black px-3 py-1 rounded-full font-black text-sm">
            {savingsPercent}% REDUCTION
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <h4 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Detailed Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50">Input Tokens (60%)</span>
            <span className="font-mono">{(tokens * 0.6).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50">Output Tokens (40%)</span>
            <span className="font-mono">{(tokens * 0.4).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-neon-blue pt-2">
            <span>Total Savings (%)</span>
            <span>{savingsPercent}%</span>
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-neon-blue/20">
        <h4 className="text-xs font-black uppercase tracking-widest text-neon-blue mb-4">Token Tax Calculator (Per Language)</h4>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 mb-4 text-sm"
        >
          <option value="en">English (1.0x)</option>
          <option value="es">Spanish (1.2x)</option>
          <option value="fr">French (1.3x)</option>
          <option value="de">German (1.5x)</option>
          <option value="zh">Chinese (2.0x)</option>
        </select>
        <div className="text-center font-bold text-white/70">
          Estimated Token Tax: ${tokenTax.toFixed(2)} extra for {language.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---


const UserDashboard = ({ user, activities, setView }: { user: any, activities: any[], setView: (v: ViewState) => void }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl border-2 border-neon-blue p-1">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <div className="w-full h-full bg-neon-blue/20 rounded-2xl flex items-center justify-center text-neon-blue">
                <UserIcon className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">{user.displayName || 'Sovereign Agent'}</h1>
            <p className="text-white/40 font-mono text-sm uppercase tracking-widest">{user.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-neon-gold">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold">{user.points || 0} PTS</span>
              </div>
              <div className="flex items-center gap-1.5 text-neon-blue">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold">{user.credits || 0} CREDITS</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => setView({ type: 'premium' })}
            className="bg-neon-magenta text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
           >
            UPGRADE TO PRO
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass rounded-3xl p-8 border-white/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <History className="w-5 h-5 text-neon-blue" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neon-blue/10 rounded-lg flex items-center justify-center text-neon-blue">
                        {activity.action === 'share' ? <Share2 className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{activity.action} activity</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">
                          {activity.timestamp?.toDate ? activity.timestamp.toDate().toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    {activity.pointsEarned > 0 && (
                      <div className="text-neon-gold font-bold text-xs">+{activity.pointsEarned} PTS</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/20 uppercase tracking-widest text-xs">No activity logged yet</div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass rounded-3xl p-8 border-white/10">
            <h3 className="text-lg font-bold mb-6 uppercase tracking-tight">Saved Calculators</h3>
            <div className="space-y-3">
              {user.savedCalculators?.length > 0 ? (
                user.savedCalculators.map((id: string) => {
                  const tool = TOOLS.find(t => t.id === id);
                  if (!tool) return null;
                  return (
                    <div 
                      key={id}
                      onClick={() => setView({ type: 'tool', id })}
                      className="group p-3 bg-white/5 rounded-xl border border-white/5 hover:border-neon-blue/30 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span className="text-xs font-bold group-hover:text-neon-blue truncate">{tool.name}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-neon-blue" />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-white/30 uppercase tracking-widest text-center py-6">No tools saved</p>
              )}
              <button 
                onClick={() => setView({ type: 'all' })}
                className="w-full mt-4 py-2 text-[10px] font-black text-neon-blue uppercase tracking-widest hover:underline"
              >
                Browse directory
              </button>
            </div>
          </section>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-neon-blue/20 to-neon-magenta/20 border border-white/10 text-center">
            <Sparkles className="w-8 h-8 text-neon-gold mx-auto mb-4" />
            <h4 className="font-bold mb-2 uppercase">Pro Status: Inactive</h4>
            <p className="text-[10px] text-white/50 uppercase mb-6 tracking-widest">Upgrade to unlock <br /> predictable arbitrage</p>
            <button 
              onClick={() => setView({ type: 'premium' })}
              className="w-full py-3 bg-white text-cyber-black rounded-xl text-xs font-black"
            >
              FREE TRIAL AT COSTIMPLODEAI.COM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [points, setPoints] = useState(120);
  const [credits, setCredits] = useState(5);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'saver' | 'pro'>('free');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [lastAIResult, setLastAIResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toolTypeFilter, setToolTypeFilter] = useState<'all' | 'free' | 'premium'>('all');

  // Register WebMCP browser tools for agent discovery on load
  useEffect(() => {
    if (typeof (navigator as any).modelContext !== 'undefined') {
      try {
        (navigator as any).modelContext.provideContext({
          tools: [
            {
              name: "calculate_ai_savings",
              description: "Calculate employee vs AI agent savings based on hourly rate, employees, and work hours.",
              inputSchema: {
                type: "object",
                properties: {
                  hourlyRate: { type: "number", description: "Hourly wage cost per employee in USD" },
                  hoursPerWeek: { type: "number", description: "Average work hours per week" },
                  employees: { type: "number", description: "Number of employees automated" },
                  benefits: { type: "number", description: "Additional benefits/overhead percentage (default 25)" }
                },
                required: ["hourlyRate", "hoursPerWeek", "employees"]
              },
              async execute(args: any) {
                const rate = Number(args.hourlyRate);
                const hours = Number(args.hoursPerWeek);
                const num = Number(args.employees);
                const extra = Number(args.benefits || 25);
                const baseHumanCost = rate * hours * num * 52;
                const loadedHumanCost = baseHumanCost * (1 + extra / 100);
                const aiMonthlySubscription = 20 * num;
                const aiYearlyCost = aiMonthlySubscription * 12;
                const yearlySavings = loadedHumanCost - aiYearlyCost;
                return {
                  humanCostYearly: loadedHumanCost,
                  aiCostYearly: aiYearlyCost,
                  savingsYearly: yearlySavings,
                  summary: `Estimated annual savings of $${yearlySavings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} by deploying AI agents.`
                };
              }
            }
          ]
        });
        console.log("WebMCP tools registered successfully.");
      } catch (err) {
        console.warn("Failed to register WebMCP tools:", err);
      }
    }
  }, []);

  // Load local state initially
  useEffect(() => {
    const savedFavorites = localStorage.getItem('aicalc_favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    
    // Add mock daily reward
    setNotifications(prev => [...prev, {
      id: 'daily-reward-' + Date.now(),
      title: 'Daily Reward',
      message: 'You received 50 points for logging in today!',
      type: 'reward',
      isRead: false,
      createdAt: new Date()
    }]);

    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingUser(true);
      if (user) {
        setCurrentUser(user);
        const profile = await createUserProfile(user);
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setActivities([]);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Sync Listeners
  useEffect(() => {
    if (!currentUser) return;

    // Sync Profile
    const profileUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile(data);
        setPoints(data.points);
        setCredits(data.credits);
        setFavorites(data.savedCalculators || []);
      }
    });

    // Sync Activities
    const activitiesQuery = query(
      collection(db, 'users', currentUser.uid, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const activitiesUnsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      setActivities(docs);
    });

    return () => {
      profileUnsubscribe();
      activitiesUnsubscribe();
    };
  }, [currentUser]);

  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    const saved = localStorage.getItem('aicalc_recently_used');
    return saved ? JSON.parse(saved) : [];
  });

  const [suggestionForm, setSuggestionForm] = useState({ name: '', description: '', email: '' });
  const [suggestionStatus, setSuggestionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('aicalc_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist recently used
  useEffect(() => {
    localStorage.setItem('aicalc_recently_used', JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    let title = 'AICalculator.shop | 53+ Free AI & Native Tools';
    let description = 'Free online calculators for everyone. 100% Cloudflare native.';

    if (view.type === 'category') {
      const cat = CATEGORIES.find(c => c.id === view.id);
      if (cat) {
        title = `${cat.name} | AICalculator.shop`;
        description = `${cat.description} Explore our ${cat.name} tools at AICalculator.shop.`;
      }
    } else if (view.type === 'tool') {
      const tool = TOOLS.find(t => t.id === view.id);
      if (tool) {
        title = `${tool.name} | Free Online Calculator | AICalculator.shop`;
        description = `${tool.description} Use our free, high-precision ${tool.name} to optimize your workflow. 100% Cloudflare native.`;
      }
    } else if (view.type === 'favorites') {
      title = 'My Favorites | AICalculator.shop';
      description = 'Your personal collection of saved calculators at AICalculator.shop.';
    } else if (view.type === 'all') {
      title = 'All 53 Calculators | AICalculator.shop';
      description = 'Directory of 53+ free online calculators. Find the tool you need at AICalculator.shop.';
    }

    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Track recently used tool
    if (view.type === 'tool' && view.id) {
      setRecentlyUsed(prev => {
        const filtered = prev.filter(id => id !== view.id);
        const newRecentlyUsed = [view.id, ...filtered].slice(0, 8);
        return newRecentlyUsed;
      });
    }
  }, [view]);

  const chatbotContext = useMemo(() => {
    let context = `Viewing: ${view.type}`;
    
    if (view.type === 'tool') {
      const tool = TOOLS.find(t => t.id === view.id);
      if (tool) {
        const cat = CATEGORIES.find(c => c.id === tool.categoryId);
        context = `Active Tool: ${tool.name}. Description: ${tool.description}. Category: ${cat?.name}. Premium Status: ${tool.isPremium ? 'Yes' : 'No'}.`;
      }
    } else if (view.type === 'category') {
      const cat = CATEGORIES.find(c => c.id === view.id);
      if (cat) {
        context = `Browsing Category: ${cat.name}. Category Description: ${cat.description}.`;
      }
    } else if (view.type === 'all') {
      context = `Browsing All Tools. Current Filters - Search: "${searchQuery || 'none'}", Category: ${selectedCategory}, Tool Type: ${toolTypeFilter}.`;
    } else if (view.type === 'favorites') {
      context = `Viewing Personal Favorites. Total saved: ${favorites.length} tools.`;
    }
    
    return `${context} User Stats - Credits: ${credits}, Points: ${points}, Tier: ${subscriptionTier}.`;
  }, [view, searchQuery, selectedCategory, toolTypeFilter, favorites.length, credits, points, subscriptionTier]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setView({ type: 'dashboard' });
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView({ type: 'home' });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const toggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isFav = favorites.includes(id);
    
    if (currentUser) {
      await toggleToolFavorite(currentUser.uid, id, isFav);
      await logActivity(currentUser.uid, isFav ? 'unfavorite' : 'favorite', id);
    } else {
      setFavorites(prev => 
        prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
    }
  };

  const filteredTools = useMemo(() => {
    return TOOLS.filter(t => {
      const matchesSearch = !searchQuery || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.categoryId === selectedCategory;
      const matchesType = toolTypeFilter === 'all' || (toolTypeFilter === 'free' ? !t.isPremium : t.isPremium);
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, toolTypeFilter]);

  const handleShare = async () => {
    setShowConfetti(true);
    if (currentUser) {
      await logActivity(currentUser.uid, 'share', undefined, 20);
    } else {
      setPoints(prev => prev + 20);
    }
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionStatus('submitting');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'tool_suggestion',
          content: `Tool Name: ${suggestionForm.name}\nDescription: ${suggestionForm.description}`,
          email: suggestionForm.email
        }),
      });
      if (response.ok) {
        setSuggestionStatus('success');
        setSuggestionForm({ name: '', description: '', email: '' });
        setTimeout(() => setSuggestionStatus('idle'), 3000);
      } else {
        setSuggestionStatus('error');
      }
    } catch (error) {
      setSuggestionStatus('error');
    }
  };

  const usePremiumTool = async (toolId: string) => {
    if (credits <= 0 && subscriptionTier === 'free') {
      setView({ type: 'premium' });
      return;
    }

    setIsProcessingAI(true);
    setLastAIResult(null);

    // Simulate AI Processing (Gemini-style)
    setTimeout(async () => {
      setIsProcessingAI(false);
      if (currentUser) {
        await logActivity(currentUser.uid, 'calculation', toolId, 5);
        // We'll decrement credits manually in Firestore in a real app, here we simulate update
        const userRef = doc(db, 'users', currentUser.uid);
        import('firebase/firestore').then(({ updateDoc, increment }) => {
          updateDoc(userRef, { credits: increment(-1) });
        });
      } else {
        setCredits(prev => Math.max(0, prev - 1));
        setPoints(prev => prev + 5);
      }
      setLastAIResult(`Optimization complete. Gemini 1.5 Pro detected ${Math.floor(Math.random() * 15 + 85)}% efficiency across current data vectors.`);
    }, 1500);
  };

  const renderContent = () => {
    switch (view.type) {
      case 'home':
        const recentToolsData = TOOLS.filter(t => recentlyUsed.includes(t.id))
          .sort((a, b) => recentlyUsed.indexOf(a.id) - recentlyUsed.indexOf(b.id));

        return (
          <>
            <Hero onBrowse={() => setView({ type: 'all' })} />
            
            <div className="text-center py-8">
              <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-8 py-4">
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Total Value Estimated</p>
                <p className="text-3xl font-black text-neon-blue">$1,234,567.89</p>
              </div>
            </div>
            
            <FeaturedTools onSelectTool={(id) => setView({ type: 'tool', id })} />
            
            {recentToolsData.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 py-12 -mt-12 relative z-20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-blue" />
                    <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/40">Recently Used</h2>
                  </div>
                  <button 
                    onClick={() => setRecentlyUsed([])}
                    className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors uppercase tracking-widest"
                  >
                    Clear History
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentToolsData.map(tool => (
                    <div 
                      key={tool.id}
                      onClick={() => setView({ type: 'tool', id: tool.id })}
                      className="group p-4 rounded-xl glass border border-white/10 hover:border-neon-blue/50 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-neon-blue/20 transition-colors">
                        <Calculator className="w-4 h-4 text-white/40 group-hover:text-neon-blue" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate group-hover:text-neon-blue transition-colors">{tool.name}</h4>
                        <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{tool.categoryId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="max-w-7xl mx-auto px-4 py-20">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">Featured Categories</h2>
                  <p className="text-white/50">Explore our specialized toolkits.</p>
                </div>
                <button 
                  onClick={() => setView({ type: 'all' })}
                  className="hidden sm:flex items-center gap-2 text-neon-blue font-bold text-sm hover:underline"
                >
                  VIEW ALL TOOLS <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {CATEGORIES.map(category => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onClick={() => setView({ type: 'category', id: category.id })}
                  />
                ))}
              </div>
            </section>

            {/* Suggestion Form Section */}
            <section className="max-w-7xl mx-auto px-4 py-20 border-t border-white/5">
              <div className="text-center mb-16">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-neon-blue mb-4">Market Validation</h2>
                <h3 className="text-4xl font-black tracking-tight uppercase">USER FEEDBACK</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: "Alex R.", role: "SaaS Founder", text: "Saved $2,400/mo on inference costs using the LLM Arbitrage estimator. Absolute game changer.", rating: 5 },
                  { name: "Sarah J.", role: "Senior Developer", text: "Cleanest UI for a calculator app I've ever seen. The 100% Cloudflare stack makes it incredibly fast.", rating: 5 },
                  { name: "Marcus T.", role: "CTO", text: "The robots.txt and sitemap structure is clearly optimized for bots. Highly indexable logic hub.", rating: 5 }
                ].map((testimonial, i) => (
                  <div key={i} className="glass p-8 rounded-2xl border-white/10 relative group">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-neon-gold text-neon-gold" />
                      ))}
                    </div>
                    <p className="text-white/70 italic mb-6">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold text-neon-blue">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-tight">{testimonial.name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/30">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-20 border-t border-white/5">
              <div className="text-center mb-16">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-neon-magenta mb-4">The Logic Hub</h2>
                <h3 className="text-4xl font-black tracking-tight uppercase">FREQUENTLY ASKED</h3>
              </div>
              <div className="space-y-4">
                {[
                  { q: "What is AICalculator.shop?", a: "The world's first high-conversion sovereign calculator hub, hosting 53+ tools powered by Cloudflare Workers and Native Arbitrage." },
                  { q: "Are these tools really free?", a: "Yes. All native utilities are 100% free. Premium AI-powered tools require credits, which can be earned by sharing tools or upgrading to Pro." },
                  { q: "What is Native Arbitrage?", a: "It's our proprietary routing system that identifies the cheapest high-performance inference route for LLM tasks, saving users 70% Plus on costs." },
                  { q: "Can I suggest new calculators?", a: "Absolutely. Use the form above or join our roadmap via CostImplodeAI.com to influence the next tool builds." }
                ].map((faq, i) => (
                  <details key={i} className="group glass rounded-2xl border-white/10 overflow-hidden">
                    <summary className="list-none p-6 cursor-pointer flex items-center justify-between font-bold uppercase tracking-tight text-sm hover:bg-white/5 transition-colors">
                      {faq.q}
                      <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="p-6 pt-0 text-white/50 text-sm leading-relaxed border-t border-white/5 mt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section className="max-w-4xl mx-auto px-4 py-20">
              <div className="glass rounded-3xl p-8 md:p-12 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[80px] -ml-20 -mt-20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-neon-blue/20 rounded-xl flex items-center justify-center text-neon-blue">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Suggest a New Tool</h2>
                      <p className="text-sm text-white/50">Don't see what you need? We'll build it for you.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSuggestionSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="toolName" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Tool Name</label>
                        <input 
                          id="toolName"
                          required
                          type="text" 
                          placeholder="e.g. Pixel Aspect Ratio Calc" 
                          value={suggestionForm.name}
                          onChange={(e) => setSuggestionForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="emailAddress" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                        <input 
                          id="emailAddress"
                          required
                          type="email" 
                          placeholder="your@email.com" 
                          value={suggestionForm.email}
                          onChange={(e) => setSuggestionForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Description</label>
                      <textarea 
                        id="description"
                        required
                        placeholder="Tell us what this tool should calculate..." 
                        rows={4}
                        value={suggestionForm.description}
                        onChange={(e) => setSuggestionForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 transition-colors resize-none"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={suggestionStatus === 'submitting'}
                      className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${
                        suggestionStatus === 'success' 
                          ? 'bg-neon-green text-cyber-black' 
                          : suggestionStatus === 'error'
                          ? 'bg-red-500 text-white'
                          : 'bg-neon-blue text-cyber-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02]'
                      }`}
                    >
                      {suggestionStatus === 'submitting' && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap className="w-5 h-5" /></motion.div>}
                      {suggestionStatus === 'idle' && 'SUBMIT SUGGESTION'}
                      {suggestionStatus === 'submitting' && 'TRANSMITTING...'}
                      {suggestionStatus === 'success' && 'LOGGED SUCCESSFULLY!'}
                      {suggestionStatus === 'error' && 'TRANSMISSION FAILED. RETRY?'}
                    </button>
                    
                    {suggestionStatus === 'success' && (
                      <p className="text-center text-neon-green text-xs font-bold animate-pulse">
                        Our logic-engineers have been notified. Check your email for updates.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 py-20">
              <div className="glass rounded-[2rem] p-8 md:p-16 border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-neon-magenta/5 blur-[100px] -mr-20" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                      STOP OVERPAYING <br />
                      <span className="neon-text-magenta text-6xl md:text-7xl">FOR RAW INFERENCE</span>
                    </h2>
                    <p className="text-lg text-white/60 mb-8">
                      Our premium tools use CostImplodeAI routing to find the absolute cheapest path for your LLM tasks. Don't rent from Google or OpenAI when you can own the arbitrage.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-neon-green font-bold">
                        <CheckCircle2 className="w-6 h-6" /> Save 70% Plus on Token Costs
                      </div>
                      <div className="flex items-center gap-3 text-neon-green font-bold">
                        <CheckCircle2 className="w-6 h-6" /> 800+ Models via One API
                      </div>
                      <div className="flex items-center gap-3 text-neon-green font-bold">
                        <CheckCircle2 className="w-6 h-6" /> Zero Latency Overhead
                      </div>
                    </div>
                    <button 
                      onClick={() => setView({ type: 'premium' })}
                      className="mt-10 bg-neon-magenta text-white px-8 py-4 rounded-xl font-black text-lg shadow-[0_0_30px_rgba(255,0,170,0.4)] hover:scale-105 transition-transform"
                    >
                      UPGRADE TO PRO NOW
                    </button>
                  </div>
                  <div className="bg-cyber-black/50 rounded-2xl p-6 border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </div>
                      <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Live Arbitrage Stream</div>
                    </div>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between text-white/40">
                        <span>[SYSTEM] Routing task to Llama-3-70b...</span>
                        <span className="text-neon-green">SUCCESS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neon-blue">Standard Cost:</span>
                        <span className="text-red-400">$0.0150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neon-green">Arbitrage Cost:</span>
                        <span className="text-neon-green">$0.0004</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="text-neon-gold font-bold">SAVINGS DETECTED: 97.3%</div>
                      <div className="bg-neon-blue/10 p-3 rounded border border-neon-blue/20 text-neon-blue">
                        "Just saved $420/mo on my RAG pipeline using AICalculator.shop estimators."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        );

      case 'category':
        const category = CATEGORIES.find(c => c.id === view.id);
        const categoryTools = TOOLS.filter(t => 
          t.categoryId === view.id && 
          (!searchQuery || 
           t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        return (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
              <button onClick={() => setView({ type: 'home' })} className="hover:text-white">Home</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{category?.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <aside className="lg:col-span-1 space-y-8">
                <div className={`p-6 rounded-2xl bg-${category?.color}/10 border border-${category?.color}/30`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${category?.color}/20 text-${category?.color}`}>
                    {category?.icon}
                  </div>
                  <h1 className="text-2xl font-black mb-2">{category?.name}</h1>
                  <p className="text-sm text-white/50">{category?.description}</p>
                </div>

                <div className="hidden lg:block space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-4">In this Category</h4>
                  {TOOLS.filter(t => t.categoryId === view.id).map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setView({ type: 'tool', id: t.id })}
                      className="w-full text-left group py-2"
                    >
                      <h5 className="text-sm text-white/50 group-hover:text-neon-blue transition-colors truncate">{t.name}</h5>
                      <p className="text-[10px] text-white/20 uppercase tracking-tighter truncate">{t.description}</p>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="lg:col-span-3" data-testid="category-results">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight">Available Tools</h2>
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input 
                      type="text" 
                      placeholder={`Search ${category?.name}...`} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {categoryTools.length > 0 ? (
                    categoryTools.map(tool => (
                      <ToolListItem 
                        key={tool.id} 
                        tool={tool} 
                        isFavorite={favorites.includes(tool.id)}
                        onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
                        onShare={(e) => { e.stopPropagation(); handleShare(); }}
                        onClick={() => setView({ type: 'tool', id: tool.id })} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                      <Search className="w-10 h-10 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No tools match your scan</p>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-4 text-neon-blue text-[10px] font-black uppercase tracking-widest hover:underline"
                      >
                        Clear Search
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'all':
        return (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">All 53 Calculators</h1>
                <p className="text-white/50">The complete sovereign toolset for the modern builder.</p>
              </div>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input 
                  type="text" 
                  placeholder="Search tools & logic..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-blue/50 transition-colors"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="mb-12 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === 'all' ? 'bg-neon-blue text-cyber-black border-neon-blue' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'}`}
                >
                  ALL CATEGORIES
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat.id ? 'bg-neon-blue text-cyber-black border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'}`}
                  >
                    {cat.name.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setToolTypeFilter('all')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${toolTypeFilter === 'all' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/30 hover:text-white/60'}`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setToolTypeFilter('free')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${toolTypeFilter === 'free' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' : 'text-white/30 hover:text-neon-blue/50'}`}
                  >
                    Free Tools
                  </button>
                  <button
                    onClick={() => setToolTypeFilter('premium')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${toolTypeFilter === 'premium' ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30' : 'text-white/30 hover:text-neon-magenta/50'}`}
                  >
                    Premium
                  </button>
                </div>

                { (searchQuery || selectedCategory !== 'all' || toolTypeFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setToolTypeFilter('all');
                    }}
                    className="text-[10px] font-black text-white/20 hover:text-red-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reset Filters
                  </button>
                )}
              </div>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map(tool => (
                  <ToolListItem 
                    key={tool.id} 
                    tool={tool} 
                    isFavorite={favorites.includes(tool.id)}
                    onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
                    onShare={(e) => { e.stopPropagation(); handleShare(); }}
                    onClick={() => setView({ type: 'tool', id: tool.id })} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
                <ZapOff className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white/40">No tools found matching your specs.</h3>
                <p className="text-sm text-white/20 mt-2">Adjust your filters to scan more frequency bands.</p>
              </div>
            )}
          </div>
        );

      case 'favorites':
        const favoriteToolsList = TOOLS.filter(t => favorites.includes(t.id));
        return (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase flex items-center gap-3">
                  <Heart className="w-10 h-10 text-neon-magenta fill-current" /> My Favorites
                </h1>
                <p className="text-white/50">Your personal collection of sovereign tools.</p>
              </div>
            </div>

            {favoriteToolsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteToolsList.map(tool => (
                  <ToolListItem 
                    key={tool.id} 
                    tool={tool} 
                    isFavorite={true}
                    onToggleFavorite={(e) => toggleFavorite(tool.id, e)}
                    onShare={(e) => { e.stopPropagation(); handleShare(); }}
                    onClick={() => setView({ type: 'tool', id: tool.id })} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass rounded-3xl border-white/10">
                <Heart className="w-16 h-16 text-white/10 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">No favorites yet</h3>
                <p className="text-white/40 mb-8 max-w-sm mx-auto">Start exploring and save your most-used calculators for quick access.</p>
                <button 
                  onClick={() => setView({ type: 'all' })}
                  className="bg-neon-blue text-cyber-black px-8 py-3 rounded-xl font-bold"
                >
                  BROWSE ALL TOOLS
                </button>
              </div>
            )}
          </div>
        );

      case 'dashboard':
        return currentUser ? <UserDashboard user={userProfile || currentUser} activities={activities} setView={setView} /> : <div className="py-20 text-center"><button onClick={handleLogin}>Login to view Dashboard</button></div>;

      case 'terms':
        return <TermsOfService />;

      case 'privacy':
        return <PrivacyPolicy />;

      case 'tool':
        const tool = TOOLS.find(t => t.id === view.id);
        const toolCategory = CATEGORIES.find(c => c.id === tool?.categoryId);
        const relatedTools = TOOLS.filter(t => t.categoryId === tool?.categoryId && t.id !== tool?.id).slice(0, 5);
        
        return (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center gap-2 text-white/40 text-sm mb-8">
              <button onClick={() => setView({ type: 'home' })} className="hover:text-white flex items-center gap-1">
                <Home className="w-3 h-3" /> Home
              </button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => setView({ type: 'category', id: toolCategory?.id })} className="hover:text-white">{toolCategory?.name}</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">{tool?.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                <div className="glass rounded-3xl p-8 md:p-12 border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tool?.isPremium ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30 shadow-[0_0_10px_rgba(255,0,170,0.2)]' : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'}`}>
                          {tool?.isPremium ? <Sparkles className="w-3 h-3" /> : <Calculator className="w-3 h-3" />}
                          {tool?.isPremium ? 'Powered by Google Gemini' : 'Native Utility'}
                        </div>
                        {tool?.isPremium && (
                          <div className="flex items-center gap-1 bg-neon-gold/10 text-neon-gold border border-neon-gold/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <Cpu className="w-3 h-3" /> 1 Credit / Usage
                          </div>
                        )}
                        <motion.button 
                          whileTap={{ scale: 1.4 }}
                          onClick={(e) => tool && toggleFavorite(tool.id, e)}
                          className={`p-2 rounded-lg transition-all ${favorites.includes(tool?.id || '') ? 'text-neon-magenta bg-neon-magenta/10' : 'text-white/20 hover:text-neon-magenta hover:bg-white/5'}`}
                        >
                          <motion.div
                            animate={{ 
                              scale: favorites.includes(tool?.id || '') ? [1, 1.2, 1] : 1,
                              fill: favorites.includes(tool?.id || '') ? "currentColor" : "none"
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className={`w-6 h-6 ${favorites.includes(tool?.id || '') ? 'fill-current' : ''}`} />
                          </motion.div>
                        </motion.button>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">{tool?.name}</h1>
                      <p className="text-xl text-white/50">{tool?.description}</p>
                    </div>
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap"
                    >
                      <Share2 className="w-5 h-5" /> SHARE FOR +20 PTS
                    </button>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(`Check out this ${tool?.name} on AICalculator.shop!`);
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                        handleShare();
                      }}
                      className="flex items-center gap-2 bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 hover:bg-[#1DA1F2]/20 px-4 py-2 rounded-lg text-[#1DA1F2] text-sm font-bold transition-all"
                    >
                      <Twitter className="w-4 h-4" /> Twitter
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        handleShare();
                      }}
                      className="flex items-center gap-2 bg-[#4267B2]/10 border border-[#4267B2]/20 hover:bg-[#4267B2]/20 px-4 py-2 rounded-lg text-[#4267B2] text-sm font-bold transition-all"
                    >
                      <Facebook className="w-4 h-4" /> Facebook
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const title = encodeURIComponent(tool?.name || '');
                        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`, '_blank');
                        handleShare();
                      }}
                      className="flex items-center gap-2 bg-[#0077B5]/10 border border-[#0077B5]/20 hover:bg-[#0077B5]/20 px-4 py-2 rounded-lg text-[#0077B5] text-sm font-bold transition-all"
                    >
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </button>
                  </div>

                  <div className="min-h-[300px] flex flex-col justify-center bg-cyber-black/30 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    {isProcessingAI && (
                      <div className="absolute inset-0 z-50 bg-cyber-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-16 h-16 border-4 border-neon-magenta border-t-transparent rounded-full mb-6"
                        />
                        <div className="text-neon-magenta font-black tracking-widest text-sm uppercase animate-pulse">Consulting Gemini 1.5 Pro...</div>
                        <div className="text-white/30 text-[10px] mt-2 font-mono uppercase tracking-widest">Applying Predictive Slashing Algorithms</div>
                      </div>
                    )}

                    {tool?.slug === 'bmi-calculator' ? <BMICalculator /> : 
                     tool?.slug === 'llm-arbitrage-cost' ? <LLMArbitrageCalculator /> : 
                     tool?.slug === 'mortgage-payment' ? <MortgageCalculator /> :
                     tool?.slug === 'compound-interest' ? <CompoundInterestCalculator /> : 
                     tool?.slug === 'human-vs-ai-cost' ? <HumanVsAICostCalculator /> :
                     tool?.slug === 'agent-efficiency' ? <AgentEfficiencyCalculator /> :
                     tool?.slug === 'inference-simulator' ? <InferenceSimulator /> :
                     tool?.slug === 'botvibe-agent-roi' ? <HumanVsAICostCalculator /> : ( // Reuse logic for ROI
                      <div className="text-center py-20">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                           <ZapOff className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tool?.isPremium ? 'Live AI Interface Ready' : 'Interactive Prototype Mode'}</h3>
                        <p className="text-white/40 max-w-sm mx-auto mb-8">
                          {tool?.isPremium 
                            ? `This tool leverages Google Gemini for predictive analysis. Click the button below to run the simulation.`
                            : `This tool is ready for Cloudflare Worker deployment. In this prototype, we've implemented the BMI, Mortgage, and LLM Arbitrage calculators as live examples.`}
                        </p>
                        {tool?.isPremium ? (
                          <div className="space-y-4">
                            <button 
                              onClick={() => tool && usePremiumTool(tool.id)}
                              className="bg-neon-magenta text-white px-8 py-3 rounded-xl font-black shadow-[0_0_20px_rgba(255,0,170,0.4)] hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                            >
                              <Cpu className="w-5 h-5" /> EXECUTE AI INFERENCE
                            </button>
                            {lastAIResult && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-medium"
                              >
                                {lastAIResult}
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <button className="bg-neon-blue text-cyber-black px-6 py-3 rounded-xl font-bold">
                            DEPLOY TO WORKER
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-12 pt-12 border-t border-white/10">
                    <div className="bg-neon-green/10 border border-neon-green/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-neon-green font-black text-xl mb-1 uppercase tracking-tight">This tool uses Native Routing</h4>
                        <p className="text-sm text-neon-green/70">Get 800+ models + 70% Plus real savings with our arbitrage gateway.</p>
                      </div>
                      <a 
                        href="https://CostImplodeAI.com" 
                        target="_blank"
                        className="bg-neon-green text-cyber-black px-6 py-3 rounded-xl font-black whitespace-nowrap hover:scale-105 transition-transform shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                      >
                        COSTIMPLODEAI.COM (FREE PRO)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-2xl border-white/10">
                    <h4 className="font-bold mb-6 flex items-center gap-2 text-neon-blue uppercase tracking-widest text-sm">
                      <Info className="w-5 h-5" /> Answer Engine (AEO)
                    </h4>
                    <div className="space-y-6 text-sm text-white/60">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="font-bold text-white mb-2">What is the {tool?.name}?</p>
                        <p>{tool?.description} It is a high-precision tool designed for sovereign tech stacks and modern builders.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="font-bold text-white mb-2">How do I use this calculator?</p>
                        <p>Simply input your parameters into the fields above. The result is computed instantly using client-side logic or Cloudflare Workers AI.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="font-bold text-white mb-2">Is this tool free to use?</p>
                        <p>Yes, all native utilities on AICalculator.shop are free. Premium tools require a Pro subscription for unlimited access.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="glass p-8 rounded-2xl border-white/10">
                      <h4 className="font-bold mb-6 flex items-center gap-2 text-neon-green uppercase tracking-widest text-sm">
                        <Globe className="w-5 h-5" /> Popular in Bristol, VA
                      </h4>
                      <p className="text-sm text-white/60 mb-6">Builders in your area are currently optimizing their workflows with these tools:</p>
                      <div className="grid grid-cols-1 gap-3">
                        {TOOLS.slice(0, 3).map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => setView({ type: 'tool', id: t.id })}
                            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-blue/30 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold group-hover:text-neon-blue transition-colors">{t.name}</span>
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-neon-blue transition-colors" />
                            </div>
                            <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{t.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass p-8 rounded-2xl border-white/10">
                      <h4 className="font-bold mb-4 flex items-center gap-2 text-white/40 uppercase tracking-widest text-xs">
                        <Search className="w-4 h-4" /> Directory Schema
                      </h4>
                      <div className="space-y-4 text-[10px] font-mono text-white/30">
                        <div className="p-3 bg-cyber-black/50 rounded border border-white/5">
                          <p className="text-neon-blue">"@type": "Calculator"</p>
                          <p>"name": "{tool?.name}"</p>
                          <p>"category": "{toolCategory?.name}"</p>
                          <p>"url": "https://aicalculator.shop/tool/{tool?.slug}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass p-8 rounded-2xl border-white/10">
                  <h4 className="font-bold mb-4 flex items-center gap-2 text-white/40 uppercase tracking-widest text-xs">SEO Metadata Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                      <p className="text-white/30 mb-2 uppercase text-[10px] font-bold tracking-widest">Meta Title</p>
                      <p className="text-neon-blue font-mono p-3 bg-white/5 rounded border border-white/5">{tool?.name} | Free Online Calculator | AICalculator.shop</p>
                    </div>
                    <div>
                      <p className="text-white/30 mb-2 uppercase text-[10px] font-bold tracking-widest">Meta Description</p>
                      <p className="text-white/60 p-3 bg-white/5 rounded border border-white/5">{tool?.description} Use our free, high-precision {tool?.name} to optimize your workflow. 100% Cloudflare native.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-8">
                <div className="glass p-6 rounded-2xl border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">More in {toolCategory?.name}</h4>
                  <div className="space-y-4">
                    {relatedTools.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setView({ type: 'tool', id: t.id })}
                        className="group cursor-pointer"
                      >
                        <h5 className="text-sm font-bold group-hover:text-neon-blue transition-colors mb-1">{t.name}</h5>
                        <p className="text-[10px] text-white/40 line-clamp-1">{t.description}</p>
                      </div>
                    ))}
                    <button 
                      onClick={() => setView({ type: 'category', id: toolCategory?.id })}
                      className="w-full mt-4 py-2 text-xs font-bold text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/10 transition-all"
                    >
                      VIEW ALL {toolCategory?.name.toUpperCase()}
                    </button>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-6">Quick Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button 
                        key={c.id}
                        onClick={() => setView({ type: 'category', id: c.id })}
                        className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/10 hover:border-neon-blue transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-neon-magenta/20 to-neon-blue/20 border border-white/10 text-center">
                  <Zap className="w-8 h-8 text-neon-gold mx-auto mb-4 animate-pulse" />
                  <h4 className="font-bold mb-2">Need More Power?</h4>
                  <p className="text-xs text-white/60 mb-4">Get 3 months of Pro for free at CostImplodeAI.com</p>
                  <a 
                    href="https://CostImplodeAI.com" 
                    target="_blank"
                    className="block w-full py-2 bg-white text-cyber-black rounded-lg text-xs font-black hover:scale-105 transition-transform"
                  >
                    UPGRADE NOW
                  </a>
                </div>
              </aside>
            </div>
          </div>
        );

      case 'premium':
        return (
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-neon-magenta rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,0,170,0.5)]">
                <Star className="text-white w-12 h-12" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">MAXIMIZE YOUR <br /><span className="neon-text-magenta">PROFIT ARBITRAGE</span></h1>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                Scale your AI operations with enterprise-grade routing, unlimited native usage, and the highest token savings in the market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {/* Basic Plan */}
              <div className="glass p-8 rounded-[2rem] border-white/10 flex flex-col hover:border-white/20 transition-all">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">FREE</h3>
                  <div className="text-4xl font-black mb-4">$0 <span className="text-sm text-white/40 font-medium">/ forever</span></div>
                  <p className="text-sm text-white/40">The entry point for sovereign individual builders.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> 43+ Native Tools (Unlimited)</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> 5 AI Premium Credits / Day</li>
                  <li className="flex items-center gap-3 text-sm text-white/40"><X className="w-5 h-5" /> Live Arbitrage Routing</li>
                  <li className="flex items-center gap-3 text-sm text-white/40"><X className="w-5 h-5" /> Data Exports (.CSV)</li>
                </ul>
                <button 
                  disabled={subscriptionTier === 'free'}
                  onClick={() => setSubscriptionTier('free')}
                  className="w-full py-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/50"
                >
                  {subscriptionTier === 'free' ? 'CURRENT PLAN' : 'SWITCH TO FREE'}
                </button>
              </div>

              {/* Saver Plan */}
              <div className="glass p-8 rounded-[2rem] border-neon-blue/30 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                <div className="absolute top-0 right-0 bg-neon-blue text-cyber-black text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2 neon-text-blue">SAVER</h3>
                  <div className="text-4xl font-black mb-4">$19 <span className="text-sm text-white/40 font-medium">/ month</span></div>
                  <p className="text-sm text-white/40">For rising builders optimizing their small-scale flows.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> All Native Tools Unlimited</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> 500 AI Premium Credits / Mo</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> Basic Arbitrage Routing</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> Ad-Free Experience</li>
                </ul>
                <button 
                  onClick={() => setSubscriptionTier('saver')}
                  className="w-full py-4 rounded-xl font-bold bg-neon-blue text-cyber-black shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105 transition-transform"
                >
                  {subscriptionTier === 'saver' ? 'CURRENT PLAN' : 'GET SAVER ACCESS'}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="glass p-8 rounded-[2rem] border-neon-magenta/30 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(255,0,170,0.1)]">
                <div className="absolute top-0 right-0 bg-neon-magenta text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Growth Tier</div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2 neon-text-magenta">PRO</h3>
                  <div className="text-4xl font-black mb-4">$49 <span className="text-sm text-white/40 font-medium">/ month</span></div>
                  <p className="text-sm text-white/40">The powerhouse for agencies and high-volume builders.</p>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> 2,500 AI Premium Credits / Mo</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> Live Real-Time Arbitrage</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> Predictive Slashing Models</li>
                  <li className="flex items-center gap-3 text-sm text-white/70"><CheckCircle2 className="w-5 h-5 text-neon-green" /> Full Data API Access</li>
                </ul>
                <button 
                  onClick={() => setSubscriptionTier('pro')}
                  className="w-full py-4 rounded-xl font-bold bg-neon-magenta text-white shadow-[0_0_20px_rgba(255,0,170,0.3)] hover:scale-105 transition-transform"
                >
                  {subscriptionTier === 'pro' ? 'CURRENT PLAN' : 'GO PRO NOW'}
                </button>
              </div>
            </div>

            {/* Credit Packs Section */}
            <div className="glass p-12 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-gold/5 blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                  <div className="max-w-md text-left">
                    <div className="inline-flex items-center gap-2 bg-neon-gold/20 text-neon-gold border border-neon-gold/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      One-Time Top-Up
                    </div>
                    <h2 className="text-4xl font-black mb-4">NOT READY TO COMMIT?</h2>
                    <p className="text-lg text-white/50 mb-8">Purchase credit packs to unlock specific tools or reports as you go. No subscription required.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                    <div 
                      onClick={() => { setCredits(prev => prev + 100); handleShare(); }}
                      className="p-6 rounded-2xl bg-cyber-black/50 border border-white/10 hover:border-white/30 cursor-pointer transition-all group"
                    >
                      <div className="text-neon-gold font-bold mb-1">100 CREDITS</div>
                      <div className="text-2xl font-black mb-4">$10.00</div>
                      <div className="text-[10px] text-white/30 uppercase font-black group-hover:text-neon-gold transition-colors">BUY NOW <ChevronRight className="inline w-3 h-3" /></div>
                    </div>
                    <div 
                      onClick={() => { setCredits(prev => prev + 500); handleShare(); }}
                      className="p-6 rounded-2xl bg-cyber-black/50 border border-white/10 hover:border-white/30 cursor-pointer transition-all group"
                    >
                      <div className="text-neon-gold font-bold mb-1">500 CREDITS</div>
                      <div className="text-2xl font-black mb-4">$35.00</div>
                      <div className="text-[10px] text-white/30 uppercase font-black group-hover:text-neon-gold transition-colors">BUY NOW <ChevronRight className="inline w-3 h-3" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 text-center text-white/30 text-sm">
              <p>Prices in USD. All tools are 100% sovereign-hosted. Payment processed via secure payment gateway.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-neon-magenta selection:text-white">
      <Header 
        points={points} 
        credits={credits} 
        favoritesCount={favorites.length} 
        setView={setView} 
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        notifications={notifications}
        onShowNotifications={() => setShowNotifications(!showNotifications)}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />

      {showNotifications && (
        <div className="fixed top-20 right-4 w-80 max-h-[80vh] overflow-y-auto glass border border-white/10 rounded-2xl p-4 z-50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-4">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="p-3 bg-white/5 rounded-lg border border-white/5 mb-2">
                <p className="text-xs font-bold text-white">{n.title}</p>
                <p className="text-[10px] text-white/50 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.type + (view.id || '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer setView={setView} />

      <Chatbot context={chatbotContext} />

      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-neon-blue text-cyber-black px-6 py-3 rounded-full font-black shadow-[0_0_50px_rgba(0,240,255,0.8)]"
          >
            +20 POINTS!
          </motion.div>
        </div>
      )}
    </div>
  );
}
