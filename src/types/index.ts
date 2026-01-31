// ============================================================
// AUTOHUB ERP - TypeScript Type Definitions
// ============================================================

// ============================================================
// CORE DATA TYPES
// ============================================================

export interface Page {
    id: number;
    pageNo: number;
    itemName: string;
}

export interface Entry {
    id: number;
    pageId: number;
    car: string;
    qty: number;
    itemName?: string;
    image?: string;
}

export interface Bill {
    id: number;
    date: string;
    image: string | null;
    path?: string | null;
    uploading?: boolean;
    progress?: number;
    originalFile?: File;
    previewUrl?: string;
    tempBlob?: Blob;
    uploadFailed?: boolean;
}

export interface SalesEvent {
    id: number;
    timestamp: number;
    entryId: number;
    qty: number;
    type: 'sale' | 'restock';
}

export interface Settings {
    limit: number;
    theme: string;
    accentColor: string;
    shakeToSearch: boolean;
    productPassword: string;
    shopName: string;
    pinnedTools: string[];
    fontSize?: string;
    fuzzySearch?: boolean;
    voiceAI?: boolean;
    aiPredictions?: boolean;
    widgets?: boolean;
}

export interface GpsReminder {
    id: number;
    carNumber: string;
    customerName: string;
    mobileNumber: string;
    expiryDate: string; // ISO date string
    status: 'active' | 'expired' | 'renewed';
}

export interface AppData {
    pages: Page[];
    entries: Entry[];
    bills: Bill[];
    salesEvents: SalesEvent[];
    gpsReminders: GpsReminder[];
    settings: Settings;
    appStatus: string;
}

// ============================================================
// COMPONENT PROP TYPES
// ============================================================

export interface ToastMessageProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDanger?: boolean;
    t: TranslateFunction;
    isDark: boolean;
}

export interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'privacy' | 'faq' | 'terms';
    t: TranslateFunction;
    isDark: boolean;
}

export interface ImageModalProps {
    src: string | null;
    onClose: () => void;
    onDelete: () => void;
}

export interface GhostMicProps {
    inventory: Entry[];
    pages: Page[];
    onClose: () => void;
    onNavigate: (pageId: number, entryId?: number) => void;
    allowAI?: boolean;
    useFuzzySearch?: boolean;
}

export interface VoiceInputProps {
    onResult: (text: string) => void;
    isDark: boolean;
}

export interface EntryRowProps {
    entry: Entry;
    t: TranslateFunction;
    isDark: boolean;
    onUpdateBuffer: (id: number, amount: number, currentRealQty: number) => void;
    onEdit: (entry: Entry) => void;
    limit: number;
    tempQty: Record<number, number>;
    index: number;
}

export interface QuickStatsProps {
    data: AppData;
    onNavigate: (view: string, pageId?: number) => void;
}

export interface AIInsightsWidgetProps {
    data: AppData;
    t: TranslateFunction;
    isDark: boolean;
}

export interface NavBtnProps {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
    active: boolean;
    onClick: () => void;
    alert?: boolean;
    isDark: boolean;
    accentHex: string;
}

// ============================================================
// CONFIRM DIALOG CONFIG
// ============================================================

export interface ConfirmConfig {
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    onConfirm: () => void;
}

// ============================================================
// TOAST TYPE
// ============================================================

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info';
}

// ============================================================
// INPUT STATE
// ============================================================

export interface InputState {
    itemName: string;
    carName: string;
    qty: string;
}

// ============================================================
// SEARCH RESULT
// ============================================================

export interface SearchResult {
    match: boolean;
    items: Entry[];
    interpretedAs?: string;
}

// ============================================================
// FUNCTION TYPES
// ============================================================

export type TranslateFunction = (key: string) => string;
export type ShowToastFunction = (message: string, type?: 'success' | 'error' | 'info') => void;

// ============================================================
// COLOR MAPS
// ============================================================

export interface ThemePreset {
    bg: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    input: string;
    isDark: boolean;
    meta: string;
}

export type AccentColorId = 'blue' | 'purple' | 'red' | 'yellow' | 'green' | 'gray' | 'indigo';

export const ACCENT_COLOR_HEX: Record<AccentColorId, string> = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    red: '#ef4444',
    yellow: '#f59e0b',
    green: '#10b981',
    gray: '#6b7280',
    indigo: '#6366f1'
};
