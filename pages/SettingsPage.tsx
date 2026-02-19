
import React from 'react';
import { 
  User, 
  Building2, 
  DollarSign, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          {/* Fix: Added missing Settings icon import from lucide-react */}
          <Settings size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Preferences</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">v1.0.4 PRO</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">Identity & Company</h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-black mb-2 opacity-50 uppercase tracking-widest">
                <User size={14} /> Full Legal Name
              </label>
              <input 
                type="text" 
                value={settings.name}
                onChange={(e) => onUpdateSettings({...settings, name: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-black mb-2 opacity-50 uppercase tracking-widest">
                <Building2 size={14} /> Organization
              </label>
              <input 
                type="text" 
                value={settings.company}
                onChange={(e) => onUpdateSettings({...settings, company: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-bold"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">Financial Defaults</h3>
          <div>
            <label className="flex items-center gap-2 text-xs font-black mb-2 opacity-50 uppercase tracking-widest">
              <DollarSign size={14} /> Standard Hourly Rate
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
              <input 
                type="number" 
                value={settings.defaultHourlyRate}
                onChange={(e) => onUpdateSettings({...settings, defaultHourlyRate: parseFloat(e.target.value) || 0})}
                className="w-full pl-10 pr-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-black"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-1">App Appearance</h3>
          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                {settings.darkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div>
                <div className="font-black text-sm text-slate-800 dark:text-slate-100 uppercase tracking-widest">High Contrast Dark</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Optimized for outdoor use</div>
              </div>
            </div>
            <button 
              onClick={() => onUpdateSettings({...settings, darkMode: !settings.darkMode})}
              className={`w-14 h-8 rounded-full transition-all relative ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${settings.darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-sm group cursor-pointer hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-black text-sm text-slate-800 dark:text-slate-100 uppercase tracking-widest">NC Classification</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Unlimited / Intermediate / Limited</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] flex items-center justify-between border border-slate-200 dark:border-slate-800 shadow-sm group cursor-pointer hover:border-indigo-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500">
              <Zap size={20} />
            </div>
            <div>
              <span className="font-black text-sm text-slate-800 dark:text-slate-100 uppercase tracking-widest">NEC Knowledge Base</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Documentation & Field Handbooks</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <div className="pt-10 flex flex-col items-center gap-6">
        <button className="w-full py-5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs active:scale-95 transition-all shadow-sm">
          <LogOut size={20} /> Terminate Session
        </button>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">ElectricAI PRO v1.0.4</p>
          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase max-w-xs mx-auto leading-relaxed">
            Aligned with NC GS Chapter 87 & NEC Standards. 
            All AI insights verified against NC Electrical Board rules.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
