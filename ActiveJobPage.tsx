
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Camera, 
  Package, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  DollarSign,
  ArrowLeft,
  X,
  Play,
  Square,
  Zap,
  User,
  ShieldAlert,
  ChevronRight,
  Archive,
  AlertTriangle,
  ListChecks,
  Quote,
  ShieldCheck,
  Info,
  History,
  Activity,
  Keyboard,
  Send,
  Search,
  ShoppingCart,
  Tags,
  Eraser
} from 'lucide-react';
import { Job, Photo, Part, TimeLog, VoiceNote, AIAnalysis, JobStatus } from '../types';
import { analyzeJobDescription } from '../services/geminiService';
import { ELECTRICAL_CATALOG, CatalogItem } from '../constants.tsx';

interface ActiveJobPageProps {
  job: Job;
  onUpdateJob: (job: Job) => void;
  onToggleArchive: () => void;
  onBack: () => void;
}

const ActiveJobPage: React.FC<ActiveJobPageProps> = ({ job, onUpdateJob, onToggleArchive, onBack }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'photos' | 'parts' | 'time' | 'notes'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false);
  const [speechResult, setSpeechResult] = useState('');
  const [manualText, setManualText] = useState('');
  
  // Catalog State
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingPart, setEditingPart] = useState<{item: CatalogItem, qty: number, cost: number} | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          }
        }
        if (final) setSpeechResult(prev => prev + ' ' + final);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  const processDiagnosticEntry = async (text: string) => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeJobDescription(text);
      const newVoiceNote: VoiceNote = {
        id: crypto.randomUUID(),
        transcript: text,
        analysis,
        timestamp: Date.now()
      };
      onUpdateJob({
        ...job,
        voiceNotes: [newVoiceNote, ...job.voiceNotes]
      });
      return true;
    } catch (error) {
      console.error("AI Analysis failed", error);
      const newVoiceNote: VoiceNote = {
        id: crypto.randomUUID(),
        transcript: text,
        timestamp: Date.now()
      };
      onUpdateJob({ ...job, voiceNotes: [newVoiceNote, ...job.voiceNotes] });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      setSpeechResult('');
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      
      const transcript = speechResult.trim();
      if (transcript) {
        await processDiagnosticEntry(transcript);
        setSpeechResult('');
      }
    }
  };

  const handleManualSubmit = async () => {
    if (manualText.trim() && !isAnalyzing) {
      const success = await processDiagnosticEntry(manualText);
      if (success) setManualText('');
    }
  };

  const handleToggleChecklist = (key: keyof typeof job.safetyChecklist) => {
    onUpdateJob({
      ...job,
      safetyChecklist: {
        ...job.safetyChecklist,
        [key]: !job.safetyChecklist[key]
      }
    });
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          url: reader.result as string,
          timestamp: Date.now()
        };
        onUpdateJob({ ...job, photos: [newPhoto, ...job.photos] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCatalogItem = (item: CatalogItem) => {
    setEditingPart({
      item,
      qty: 1,
      cost: item.defaultCost
    });
  };

  const finalizeAddPart = () => {
    if (!editingPart) return;
    const newPart: Part = { 
      id: crypto.randomUUID(), 
      name: editingPart.item.name, 
      quantity: editingPart.qty, 
      cost: editingPart.cost 
    };
    onUpdateJob({ ...job, parts: [...job.parts, newPart] });
    setEditingPart(null);
    setIsCatalogOpen(false);
  };

  const handleToggleTime = () => {
    const now = Date.now();
    const activeLogIndex = job.timeLogs.findIndex(log => !log.endTime);
    if (activeLogIndex !== -1) {
      const updatedLogs = [...job.timeLogs];
      updatedLogs[activeLogIndex] = { ...updatedLogs[activeLogIndex], endTime: now };
      onUpdateJob({ ...job, timeLogs: updatedLogs });
    } else {
      const newLog: TimeLog = { id: crypto.randomUUID(), startTime: now };
      onUpdateJob({ ...job, timeLogs: [...job.timeLogs, newLog] });
    }
  };

  const calculateTotalTime = () => {
    return job.timeLogs.reduce((acc, log) => {
      const end = log.endTime || Date.now();
      return acc + (end - log.startTime);
    }, 0);
  };

  const calculateLaborCost = () => {
    const totalHours = calculateTotalTime() / (1000 * 60 * 60);
    return totalHours * job.hourlyRate;
  };

  const calculatePartsCost = () => {
    return job.parts.reduce((acc, part) => acc + (part.cost * part.quantity), 0);
  };

  const isClockedIn = job.timeLogs.some(log => !log.endTime);
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const filteredCatalog = ELECTRICAL_CATALOG.filter(cat => 
    !selectedCategory || cat.id === selectedCategory
  ).map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(catalogSearch.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="flex flex-col min-h-full pb-20 animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950">
      {/* Safety Banner */}
      <div className="bg-amber-100 dark:bg-amber-950/40 p-4 flex items-center justify-between border-b border-amber-200 dark:border-amber-900/50 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-amber-600 dark:text-amber-400" size={20} />
          <span className="text-[11px] font-black text-amber-800 dark:text-amber-200 uppercase tracking-widest">NEC Safety Check</span>
        </div>
        <div className="flex gap-2.5">
           {Object.keys(job.safetyChecklist).map((key) => (
             <button
               key={key}
               onClick={() => handleToggleChecklist(key as any)}
               title={key}
               className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                 job.safetyChecklist[key as keyof typeof job.safetyChecklist] 
                   ? 'bg-emerald-500 text-white scale-110 shadow-emerald-500/30' 
                   : 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-700'
               }`}
             >
               <CheckCircle2 size={18} />
             </button>
           ))}
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar sticky top-[65px] z-20 px-2 shadow-sm">
        {[
          { id: 'voice', icon: Activity, label: 'Diagnostics' },
          { id: 'photos', icon: Camera, label: 'Photos' },
          { id: 'parts', icon: Package, label: 'Parts' },
          { id: 'time', icon: Clock, label: 'Time' },
          { id: 'notes', icon: FileText, label: 'Notes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center py-4 px-3 gap-1.5 border-b-4 transition-all min-w-[70px] ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-400'
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 flex-1 max-w-2xl mx-auto w-full">
        {activeTab === 'voice' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Unified Capture Hub */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Zap className="text-indigo-500" size={14} />
                  <h4 className="font-black text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Diagnostic Command Center</h4>
                </div>
                <button 
                  onClick={() => setIsHandsFree(!isHandsFree)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    isHandsFree 
                      ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Zap size={10} fill={isHandsFree ? "black" : "none"} />
                  {isHandsFree ? 'Hands-Free Active' : 'Go Hands-Free'}
                </button>
              </div>
              
              <div className={`grid grid-cols-1 ${isHandsFree ? '' : 'lg:grid-cols-2'} gap-4 transition-all duration-500`}>
                {/* Verbal Mode */}
                <div className={`flex flex-col items-center justify-center py-10 rounded-[3rem] border transition-all duration-500 relative overflow-hidden group ${
                  isHandsFree 
                    ? 'bg-zinc-900 border-yellow-400/50 shadow-2xl shadow-yellow-400/10' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}>
                  {isHandsFree && (
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-yellow-400'}`} />
                      <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">
                        {isRecording ? 'Capturing Report...' : 'System: Standby'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 mb-6 px-4">
                    <Mic size={14} className={isHandsFree ? "text-yellow-400" : "text-rose-500"} />
                    <h4 className={`font-black text-[9px] uppercase tracking-widest ${isHandsFree ? 'text-zinc-500' : 'text-slate-400'}`}>
                      {isHandsFree ? 'SparkySolve Voice' : 'Verbal Capture'}
                    </h4>
                  </div>
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isAnalyzing}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${
                      isRecording 
                        ? 'bg-red-600 animate-pulse scale-110 shadow-red-600/40' 
                        : isAnalyzing 
                          ? 'bg-slate-400' 
                          : isHandsFree
                            ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-yellow-400/20'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                    } ${!isRecording && !isAnalyzing && !isHandsFree ? 'text-white' : ''}`}
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={32} /> : (isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />)}
                  </button>
                  <div className="mt-6 text-center px-6">
                    <p className={`font-black uppercase tracking-tighter text-[10px] ${isHandsFree ? 'text-yellow-400/70' : 'text-slate-400'}`}>
                      {isRecording ? 'Listening to problem...' : 'Tap mic to start voice report'}
                    </p>
                  </div>
                  {isRecording && (
                    <div className={`mt-4 p-3 rounded-xl max-w-xs mx-auto border ${
                      isHandsFree 
                        ? 'bg-zinc-800 border-yellow-400/20 text-yellow-400' 
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
                    }`}>
                      <p className="text-xs italic text-center">"{speechResult || '...'}"</p>
                    </div>
                  )}
                </div>

                {!isHandsFree && (
                  <>
                    {/* Keyboard Mode */}
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <Keyboard size={14} className="text-indigo-500" />
                          <h4 className="font-black text-[9px] text-slate-400 uppercase tracking-widest">Manual Entry</h4>
                        </div>
                        {manualText && (
                          <button onClick={() => setManualText('')} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <Eraser size={14} />
                          </button>
                        )}
                      </div>
                      <div className="relative flex-1 min-h-[140px]">
                        <textarea 
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={isAnalyzing}
                          placeholder="Input technical data: e.g. 'Main breaker tripping, 240V present, insulation smell near panel...'"
                          className="w-full h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                        />
                      </div>
                      <button 
                        onClick={handleManualSubmit}
                        disabled={isAnalyzing || !manualText.trim()}
                        className={`w-full py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 ${
                          manualText.trim() && !isAnalyzing 
                            ? 'bg-indigo-600 text-white shadow-indigo-500/30 active:scale-95' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : (
                          <>
                            <span className="text-[10px] font-black uppercase tracking-widest">Run AI Analysis</span>
                            <Zap size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {isAnalyzing && (
                <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 animate-pulse shadow-xl ${
                  isHandsFree ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white'
                }`}>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isHandsFree ? 'SPARKYSOLVE: RUNNING DIAGNOSTIC...' : 'Consulting NEC Database...'}
                  </span>
                </div>
              )}
            </div>

            {/* Diagnostic History List */}
            <div className="space-y-12">
              <div className="flex items-center gap-3 px-2">
                <History className="text-slate-400" size={18} />
                <h4 className="font-black text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-[0.2em]">Diagnostic Case Reports</h4>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              
              {job.voiceNotes.map((note) => (
                <div key={note.id} className="relative animate-in slide-in-from-left-4 duration-500">
                  {/* Case Header */}
                  <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Activity size={18} />
                      </div>
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Case ID: {note.id.split('-')[0].toUpperCase()}</span>
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transcript Display */}
                  <div className="bg-slate-100/60 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 relative mb-6">
                    <Quote className="absolute -top-3 -left-1 text-indigo-500/20" size={40} />
                    <div className="flex items-center gap-2 mb-3">
                       <User size={12} className="text-slate-400" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Field Tech Input</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic pl-2">
                      "{note.transcript}"
                    </p>
                  </div>
                  
                  {note.analysis && (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Summary Section - The "Verdict" */}
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-t-8 border-t-indigo-600 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <ShieldCheck size={18} />
                            </div>
                            <h5 className="font-black text-[11px] text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">NEC Analysis Verdict</h5>
                          </div>
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
                            <p className="text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-100">{note.analysis.summary}</p>
                          </div>
                          <div className="mt-4 flex items-center gap-2 px-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Safe Compliance Route Identified</span>
                          </div>
                        </div>
                      </div>

                      {/* Causes Section - The "Alert" */}
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-t-8 border-t-rose-500 border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-500 dark:text-rose-400">
                              <AlertTriangle size={18} />
                            </div>
                            <h5 className="font-black text-[11px] text-rose-700 dark:text-rose-300 uppercase tracking-widest">Critical Root Causes</h5>
                          </div>
                          <div className="space-y-3">
                            {note.analysis.causes.map((c, i) => (
                              <div key={i} className="flex gap-4 items-center bg-rose-50/40 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-900/30">
                                <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Steps Section - The "Action" */}
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-t-8 border-t-emerald-500 border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                              <ListChecks size={18} />
                            </div>
                            <h5 className="font-black text-[11px] text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Compliant Action Plan</h5>
                          </div>
                          <div className="space-y-4">
                            {note.analysis.steps.map((s, i) => (
                              <div key={i} className="flex gap-4 items-start group">
                                <div className="flex-none w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                                  {i+1}
                                </div>
                                <div className="flex-1 pt-0.5">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-100 leading-normal">{s}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {note.analysis.parts && note.analysis.parts.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-t-8 border-t-yellow-400 border border-slate-200 dark:border-slate-800 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                          <div className="p-6">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                <Package size={18} />
                              </div>
                              <h5 className="font-black text-[11px] text-yellow-700 dark:text-yellow-300 uppercase tracking-widest">Required Materials</h5>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {note.analysis.parts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{p.name}</span>
                                  <span className="text-[10px] font-black bg-yellow-400 text-black px-2 py-1 rounded-lg">QTY: {p.quantity}</span>
                                </div>
                              ))}
                            </div>
                            {note.analysis.estimatedCost && (
                              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Material Cost</span>
                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{note.analysis.estimatedCost}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-center mt-12 mb-4">
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full opacity-50" />
                  </div>
                </div>
              ))}
              {job.voiceNotes.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity size={32} className="text-slate-200 dark:text-slate-700" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No diagnostic logs found for this job</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-2 font-bold uppercase">Record or type an issue description above to start AI analysis</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photos Section */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <label className="aspect-square bg-white dark:bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Add Evidence</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAddPhoto} />
              </label>
              {job.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-[2rem] overflow-hidden shadow-sm group border border-slate-200 dark:border-slate-800">
                  <img src={photo.url} className="w-full h-full object-cover" alt="Job document" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={() => onUpdateJob({ ...job, photos: job.photos.filter(p => p.id !== photo.id) })}
                      className="p-3 bg-rose-500 text-white rounded-2xl shadow-xl active:scale-90 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-tighter">
                    {new Date(photo.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parts Section */}
        {activeTab === 'parts' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">Inventory Log</h4>
                <button 
                  onClick={() => setIsCatalogOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Plus size={14} /> Add Material
                </button>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {job.parts.map((part) => (
                  <div key={part.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-black text-sm text-slate-800 dark:text-slate-100">{part.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {part.quantity} • Unit: ${part.cost.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="font-black text-indigo-600 dark:text-indigo-400">${(part.cost * part.quantity).toFixed(2)}</span>
                      <button 
                        onClick={() => onUpdateJob({ ...job, parts: job.parts.filter(p => p.id !== part.id) })}
                        className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center active:scale-90 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {job.parts.length === 0 && (
                  <div className="p-12 text-center text-slate-300 dark:text-slate-700 font-bold uppercase tracking-widest text-[10px]">No materials listed</div>
                )}
              </div>
              <div className="p-8 bg-indigo-50/50 dark:bg-indigo-950/30 flex justify-between items-center">
                <span className="font-black text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Total Materials</span>
                <span className="font-black text-2xl text-slate-900 dark:text-white">${calculatePartsCost().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Time Tracking Section */}
        {activeTab === 'time' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-8 shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                  <Clock size={24} />
                </div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Service Duration</span>
                <span className="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
                  {formatDuration(calculateTotalTime())}
                </span>
              </div>
              
              <button
                onClick={handleToggleTime}
                className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 font-black text-xl shadow-2xl transition-all active:scale-95 ${
                  isClockedIn 
                    ? 'bg-rose-500 text-white shadow-rose-500/30' 
                    : 'bg-emerald-500 text-white shadow-emerald-500/30'
                }`}
              >
                {isClockedIn ? (
                  <> <Square size={28} fill="currentColor" /> CLOCK OUT </>
                ) : (
                  <> <Play size={28} fill="currentColor" /> CLOCK IN </>
                )}
              </button>

              <div className="w-full grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</div>
                  <div className="text-xl font-black text-slate-800 dark:text-slate-100">${job.hourlyRate}<span className="text-xs opacity-50">/hr</span></div>
                </div>
                <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/30">
                  <div className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Labor Total</div>
                  <div className="text-xl font-black text-indigo-700 dark:text-indigo-300">${calculateLaborCost().toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-slate-400 dark:text-slate-600 text-[10px] uppercase tracking-widest px-2">Recent Intervals</h4>
              {job.timeLogs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <Zap size={18} className="text-slate-300" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 dark:text-slate-100">{new Date(log.startTime).toLocaleTimeString()} - {log.endTime ? new Date(log.endTime).toLocaleTimeString() : 'Current Session'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.startTime).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    {formatDuration((log.endTime || Date.now()) - log.startTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {activeTab === 'notes' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3">
                  <Zap size={16} fill="currentColor" /> Internal Tech Notes
                </label>
                <textarea 
                  value={job.techNotes}
                  onChange={(e) => onUpdateJob({ ...job, techNotes: e.target.value })}
                  className="w-full h-40 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all resize-none text-sm font-medium leading-relaxed shadow-sm"
                  placeholder="Record diagnostic data, NEC code sections referenced, or internal shop notes..."
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">
                  <User size={16} fill="currentColor" /> Customer Instructions
                </label>
                <textarea 
                  value={job.customerNotes}
                  onChange={(e) => onUpdateJob({ ...job, customerNotes: e.target.value })}
                  className="w-full h-40 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-sm font-medium leading-relaxed shadow-sm"
                  placeholder="Service description for the customer, safety advice, and next steps..."
                />
              </div>
            </div>

            {/* Premium Invoice Summary Card */}
            <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 dark:shadow-none space-y-6 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 border-b border-white/20 pb-5">
                <DollarSign size={20} /> Invoice Overview
              </h4>
              <div className="space-y-4 font-bold text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Labor ({formatDuration(calculateTotalTime())})</span>
                  <span className="font-black">${calculateLaborCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Materials</span>
                  <span className="font-black">${calculatePartsCost().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-white/20">
                  <span className="font-black text-xl uppercase tracking-tighter">Net Total</span>
                  <span className="font-black text-3xl tabular-nums">${(calculateLaborCost() + calculatePartsCost()).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <button 
                  onClick={() => onUpdateJob({...job, status: job.status === JobStatus.COMPLETED ? JobStatus.ACTIVE : JobStatus.COMPLETED})}
                  className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                    job.status === JobStatus.COMPLETED ? 'bg-white/10 hover:bg-white/20' : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {job.status === JobStatus.COMPLETED ? 'Re-Open Job' : 'Complete Job'}
                </button>
                {job.status === JobStatus.COMPLETED && (
                  <button 
                    onClick={onToggleArchive}
                    className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2"
                  >
                    <Archive size={16} /> Archive Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legal Disclaimer Footer */}
        <div className="mt-12 p-6 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldAlert size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Compliance Notice</span>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-tight leading-relaxed">
            AI analysis is provided for reference only and does not replace the judgment of a licensed NC professional. 
            All work must comply with NC General Statutes Chapter 87, Article 4 and the National Electrical Code.
          </p>
        </div>
      </div>

      {/* Material Catalog Modal */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex-1 overflow-hidden flex flex-col max-w-2xl mx-auto w-full bg-white dark:bg-slate-900 sm:my-8 sm:rounded-[3rem] shadow-2xl relative border border-white/10 dark:border-slate-800">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ShoppingCart size={22} />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Material Catalog</h3>
              </div>
              <button 
                onClick={() => {setIsCatalogOpen(false); setEditingPart(null);}}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Editing Step (If item selected) */}
            {editingPart ? (
              <div className="p-8 space-y-8 animate-in zoom-in-95 duration-200 flex-1 overflow-y-auto">
                 <div className="flex items-center gap-4 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-800 dark:text-slate-100 leading-tight">{editingPart.item.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Unit: {editingPart.item.unit}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quantity</label>
                     <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800">
                       <button 
                        onClick={() => setEditingPart({...editingPart, qty: Math.max(1, editingPart.qty - 1)})}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-black text-slate-600 active:scale-90 shadow-sm"
                       >-</button>
                       <input 
                        type="number" 
                        value={editingPart.qty}
                        onChange={(e) => setEditingPart({...editingPart, qty: Math.max(1, parseFloat(e.target.value) || 1)})}
                        className="flex-1 bg-transparent text-center font-black text-2xl text-slate-800 dark:text-slate-100 outline-none"
                       />
                       <button 
                        onClick={() => setEditingPart({...editingPart, qty: editingPart.qty + 1})}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl font-black text-slate-600 active:scale-90 shadow-sm"
                       >+</button>
                     </div>
                   </div>

                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Price ($)</label>
                     <div className="relative">
                       <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input 
                        type="number" 
                        value={editingPart.cost}
                        onChange={(e) => setEditingPart({...editingPart, cost: Math.max(0, parseFloat(e.target.value) || 0)})}
                        className="w-full pl-12 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                       />
                     </div>
                   </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                    <div className="flex justify-between items-center px-4">
                      <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Subtotal</span>
                      <span className="font-black text-3xl text-indigo-600 dark:text-indigo-400">${(editingPart.qty * editingPart.cost).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setEditingPart(null)}
                        className="flex-1 py-5 font-black text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all uppercase tracking-widest text-xs"
                      >
                        Back to List
                      </button>
                      <button 
                        onClick={finalizeAddPart}
                        className="flex-[2] py-5 font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} /> Add to Inventory
                      </button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Search & Categories */}
                <div className="p-6 space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search parts catalog..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-100 font-bold"
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        !selectedCategory 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      All Items
                    </button>
                    {ELECTRICAL_CATALOG.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                          selectedCategory === cat.id 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catalog List */}
                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-10">
                  {filteredCatalog.map(category => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Tags size={14} className="text-indigo-500" />
                        <h4 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em]">{category.name}</h4>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {category.items.map((item, idx) => (
                          <button 
                            key={idx}
                            onClick={() => handleSelectCatalogItem(item)}
                            className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 active:scale-[0.98] transition-all group text-left"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="block font-black text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">{item.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per {item.unit}</span>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                              <span className="font-black text-slate-800 dark:text-slate-200 tabular-nums">${item.defaultCost.toFixed(2)}</span>
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Plus size={18} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Manual Entry Button */}
                  <div className="py-10 border-t border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <button 
                      onClick={() => {
                        const name = prompt("Custom Item Name:");
                        if (name) handleSelectCatalogItem({ name, defaultCost: 0, unit: 'ea' });
                      }}
                      className="px-8 py-4 bg-slate-50 dark:bg-slate-950 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-slate-200 dark:border-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      + Add Custom Material Not in List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Back Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-28 left-6 bg-white dark:bg-slate-800 w-14 h-14 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 z-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90"
      >
        <ArrowLeft size={28} />
      </button>
    </div>
  );
};

export default ActiveJobPage;
