export interface User {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}

export interface ShopDetails {
    shopName?: string;
    shopAddress?: string;
    shopCity?: string;
    shopPincode?: string;
    gstNumber?: string;
    shopPhone?: string;
    ownerName?: string;
    mobile?: string;
    address?: string; // Sometimes used interchangeably with shopAddress
}

export interface NotificationSettings {
    lowStockAlert?: boolean;
    expiryAlert?: boolean;
    [key: string]: boolean | undefined;
}

export interface PerformanceSettings {
    batterySaver?: boolean;
    lowDataMode?: boolean;
    offlineFirst?: boolean;
    [key: string]: boolean | undefined;
}

export interface Settings {
    shopName?: string;
    shopAddress?: string;
    shopCity?: string;
    shopPincode?: string;
    gstNumber?: string;
    shopPhone?: string;
    theme?: string;
    fontSize?: string;
    soundEffects?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    notifications?: NotificationSettings;
    limit?: number;
    productPassword?: string;
    autoLockTime?: string;
    autoBackup?: string;
    performance?: PerformanceSettings;
    [key: string]: any; // Allow extensibility for now
}

export interface AppData {
    settings?: Settings;
    entries?: any[]; // Todo: Define Entry type
    bills?: any[];   // Todo: Define Bill type
    pages?: any[];   // Used in QuotationMaker
    [key: string]: any;
}

export interface ThemePreset {
    bg: string;
    meta: string;
    isDark: boolean;
    id?: string;
    name?: string;
    colors?: string[];
}

export interface ThemeOption {
    id: string;
    name: string;
    colors: string[];
}
