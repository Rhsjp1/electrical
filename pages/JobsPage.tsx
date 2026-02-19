
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  ChevronRight, 
  Trash2,
  Calendar,
  Briefcase,
  Archive,
  RefreshCcw,
  ArchiveX,
  Filter
} from 'lucide-react';
import { Job, PropertyType, JobStatus } from '../types';

interface JobsPageProps {
  jobs: Job[];
  onSelectJob: (id: string) => void;
  onAddJob: (data: { customerName: string, phone: string, address: string, propertyType: PropertyType }) => void;
  onDeleteJob: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

const JobsPage: React.FC<JobsPageProps> = ({ jobs, onSelectJob, onAddJob, onDeleteJob, onToggleArchive }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    propertyType: PropertyType.RESIDENTIAL
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.address.toLowerCase().includes(searchTerm.toLowerCase());
    const isArchived = job.status === JobStatus.ARCHIVED;
    
    if (view === 'archived') {
      return matchesSearch && isArchived;
    } else {
      // In 'active' view, show non-archived jobs
      if (isArchived) return false;
      
      // Secondary status filter
      if (statusFilter === 'in-progress') return matchesSearch && job.status === JobStatus.ACTIVE;
      if (statusFilter === 'completed') return matchesSearch && job.status === JobStatus.COMPLETED;
      
      return matchesSearch;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJob(formData);
    setFormData({
      customerName: '',
      phone: '',
      address: '',
      propertyType: PropertyType.RESIDENTIAL
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Jobs</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your field service requests</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-90"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Segmented Control / View Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6">
        <button 
          onClick={() => setView('active')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            view === 'active' 
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Briefcase size={16} />
          Active
        </button>
        <button 
          onClick={() => setView('archived')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            view === 'archived' 
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Archive size={16} />
          Archived
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${view} jobs...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Status Filters (Only for Active View) */}
        {view === 'active' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                statusFilter === 'all' 
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Status
            </button>
            <button 
              onClick={() => setStatusFilter('in-progress')}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                statusFilter === 'in-progress' 
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              In Progress
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                statusFilter === 'completed' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              Completed
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div 
              key={job.id}
              onClick={() => onSelectJob(job.id)}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between active:scale-[0.97] hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer overflow-hidden relative"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-black text-lg truncate text-slate-800 dark:text-slate-100">{job.customerName}</h3>
                  {job.status !== JobStatus.ARCHIVED && (
                    <span className={`text-[10px] uppercase px-2.5 py-1 rounded-lg font-black tracking-wider ${
                      job.status === JobStatus.COMPLETED 
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      {job.status}
                    </span>
                  )}
                  {job.status === JobStatus.ARCHIVED && (
                    <span className="text-[10px] uppercase px-2.5 py-1 rounded-lg font-black tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Archived
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
                  <MapPin size={14} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  <span className="truncate">{job.address}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase">
                    <Calendar size={12} />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  <span className="text-indigo-500 dark:text-indigo-400 text-[11px] font-black uppercase tracking-widest">{job.propertyType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {view === 'active' ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleArchive(job.id); }}
                    className="p-3 text-slate-300 dark:text-slate-700 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-slate-950 rounded-xl"
                    title="Archive Job"
                  >
                    <Archive size={20} />
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleArchive(job.id); }}
                    className="p-3 text-slate-300 dark:text-slate-700 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-slate-950 rounded-xl"
                    title="Restore Job"
                  >
                    <RefreshCcw size={20} />
                  </button>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
                  className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 transition-colors bg-slate-50 dark:bg-slate-950 rounded-xl"
                  title="Delete Forever"
                >
                  <Trash2 size={20} />
                </button>
                <ChevronRight className="text-slate-300 dark:text-slate-700" size={24} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              {view === 'active' ? <Briefcase size={40} className="text-slate-300 dark:text-slate-700" /> : <ArchiveX size={40} className="text-slate-300 dark:text-slate-700" />}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold mb-2">No {view} jobs found</p>
            <p className="text-slate-400 dark:text-slate-600 text-sm">
              {searchTerm ? 'Try a different search term.' : (view === 'active' ? 'Tap the plus button to create your first job.' : 'Completed jobs you archive will appear here.')}
            </p>
          </div>
        )}
      </div>

      {/* New Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 border border-white/20 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                 <Plus size={28} />
               </div>
               <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">New Job</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Customer Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                  placeholder="e.g. Martha Stewart"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                  placeholder="(919) 555-0123"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Property Address</label>
                <input 
                  required
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                  placeholder="404 Voltage Circle, Raleigh NC"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Property Type</label>
                <select 
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value as PropertyType})}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-bold appearance-none"
                >
                  <option value={PropertyType.RESIDENTIAL}>Residential</option>
                  <option value={PropertyType.COMMERCIAL}>Commercial</option>
                  <option value={PropertyType.INDUSTRIAL}>Industrial</option>
                </select>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all"
                >
                  Create Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
