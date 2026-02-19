
export enum PropertyType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  INDUSTRIAL = 'Industrial'
}

export enum JobStatus {
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived'
}

export interface Photo {
  id: string;
  url: string;
  timestamp: number;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface TimeLog {
  id: string;
  startTime: number;
  endTime?: number;
}

export interface AIAnalysis {
  summary: string;
  causes: string[];
  steps: string[];
}

export interface VoiceNote {
  id: string;
  transcript: string;
  analysis?: AIAnalysis;
  timestamp: number;
}

export interface SafetyChecklist {
  ppeWorn: boolean;
  voltageTested: boolean;
  lockoutTagout: boolean;
  hazardsNoted: boolean;
}

export interface Job {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  propertyType: PropertyType;
  status: JobStatus;
  createdAt: number;
  photos: Photo[];
  parts: Part[];
  timeLogs: TimeLog[];
  techNotes: string;
  customerNotes: string;
  voiceNotes: VoiceNote[];
  safetyChecklist: SafetyChecklist;
  hourlyRate: number;
}

export interface UserSettings {
  name: string;
  company: string;
  defaultHourlyRate: number;
  darkMode: boolean;
}
