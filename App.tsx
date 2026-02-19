
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, 
  Settings, 
  Zap, 
  Plus, 
  ChevronRight,
  User,
  Clock,
  LogOut,
  WifiOff,
  CloudOff
} from 'lucide-react';
import { Job, UserSettings, JobStatus, PropertyType } from './types';
import { STORAGE_KEY_JOBS, STORAGE_KEY_SETTINGS } from './constants.tsx';
import JobsPage from './pages/JobsPage';
import ActiveJobPage from './pages/ActiveJobPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'settings'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Technician',
    company: 'Pro Volt Electric',
    defaultHourlyRate: 85,
    darkMode: true // Defaulting to dark mode as per user preference for acceptability
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const savedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.error("Failed to load jobs", e);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const addJob = (newJob: Omit<Job, 'id' | 'status' | 'createdAt' | 'photos' | 'parts' | 'timeLogs' | 'techNotes' | 'customerNotes' | 'voiceNotes' | 'safetyChecklist' | 'hourlyRate'>) => {
    const job: Job = {
      ...newJob,
      id: crypto.randomUUID(),
      status: JobStatus.ACTIVE,
      createdAt: Date.now(),
      photos: [],
      parts: [],
      timeLogs: [],
      techNotes: '',
      customerNotes: '',
      voiceNotes: [],
      hourlyRate: settings.defaultHourlyRate,
      safetyChecklist: {
        ppeWorn: false,
        voltageTested: false,
        lockoutTagout: false,
        hazardsNoted: false
      }
    };
    setJobs(prev => [job, ...prev]);
    setActiveJobId(job.id);
    setActiveTab('active');
  };

  const updateJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const toggleArchiveJob = (id: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === id) {
        const isArchived = j.status === JobStatus.ARCHIVED;
        return { 
          ...j, 
          status: isArchived ? JobStatus.ACTIVE : JobStatus.ARCHIVED 
        };
      }
      return j;
    }));
  };

  const deleteJob = (id: string) => {
    if (window.confirm("Permanently delete this job and all its data? This cannot be undone.")) {
      setJobs(prev => prev.filter(j => j.id !== id));
      if (activeJobId === id) setActiveJobId(null);
    }
  };

  const activeJob = jobs.find(j => j.id === activeJobId);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${settings.darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <Zap className="fill-amber-400 text-amber-400" size={24} />
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">ElectricAI</h1>
            {!isOnline && (
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 uppercase tracking-widest animate-pulse">
                <WifiOff size={10} />
                <span>Offline Mode</span>
              </div>
            )}
          </div>
        </div>
        
        {activeTab === 'active' && activeJob ? (
          <div className="flex flex-col items-end text-xs">
            <span className="font-bold uppercase truncate max-w-[120px] text-white">{activeJob.customerName}</span>
            <span className="text-indigo-100 opacity-80">{activeJob.propertyType}</span>
          </div>
        ) : (
          !isOnline && (
             <div className="bg-amber-500/20 px-3 py-1 rounded-full flex items-center gap-2 border border-amber-500/30">
               <CloudOff size={14} className="text-amber-400" />
               <span className="text-[10px] font-black uppercase tracking-tighter text-amber-200">Local Only</span>
             </div>
          )
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'jobs' && (
          <JobsPage 
            jobs={jobs} 
            onSelectJob={(id) => { setActiveJobId(id); setActiveTab('active'); }} 
            onAddJob={addJob} 
            onDeleteJob={deleteJob}
            onToggleArchive={toggleArchiveJob}
          />
        )}
        {activeTab === 'active' && (
          activeJob ? (
            <ActiveJobPage 
              job={activeJob} 
              onUpdateJob={updateJob} 
              onToggleArchive={() => { toggleArchiveJob(activeJob.id); setActiveTab('jobs'); }}
              onBack={() => setActiveTab('jobs')}
            />
          ) : (
            <div className="p-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">No active job selected.</p>
              <button 
                onClick={() => setActiveTab('jobs')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-all"
              >
                Go to Jobs List
              </button>
            </div>
          )
        )}
        {activeTab === 'settings' && (
          <SettingsPage settings={settings} onUpdateSettings={setSettings} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 h-22 flex items-center justify-around px-6 pb-6 pt-3 z-50">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'jobs' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Briefcase size={26} strokeWidth={activeTab === 'jobs' ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Jobs</span>
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'active' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Zap size={26} strokeWidth={activeTab === 'active' ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Active</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'settings' ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Settings size={26} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="text-[11px] font-bold">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
