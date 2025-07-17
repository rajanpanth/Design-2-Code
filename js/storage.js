// Storage Manager for saving and loading project
class StorageManager {
    constructor() {
        this.storageKey = 'webcraft_project';
        this.autoSaveKey = 'webcraft_autosave';
        this.settingsKey = 'webcraft_settings';
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
        
        this.init();
    }
    
    init() {
        // Check localStorage availability
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage is not available. Projects cannot be saved.');
            return;
        }
        
        // Load user settings
        this.loadSettings();
        
        // Setup storage event listeners
        this.setupStorageEvents();
        
        console.log('Storage manager initialized');
    }
    
    isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    setupStorageEvents() {
        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('Project updated in another tab');
                this.handleExternalProjectUpdate();
            }
        });
        
        // Handle beforeunload to save current state
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    }
    
    saveProject(projectData) {
        if (!this.isLocalStorageAvailable()) {
            throw new Error('Local storage is not available');
        }
        
        try {
            // Add metadata
            const saveData = {
                ...projectData,
                savedAt: new Date().toISOString(),
                version: projectData.version || '1.0',
                id: this.generateProjectId()
            };
            
            // Compress data if needed
            const compressedData = this.compressProjectData(saveData);
            
            // Check size limits
            this.checkStorageSize(compressedData);
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(compressedData));
            
            // Also save as recent project
            this.saveToRecentProjects(saveData);
            
            console.log('Project saved successfully');
            return saveData.id;
            
        } catch (error) {
            console.error('Failed to save project:', error);
            throw error;
        }
    }
    
    loadProject() {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }
        
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                return null;
            }
            
            const projectData = JSON.parse(savedData);
            
            // Decompress if needed
            const decompressedData = this.decompressProjectData(projectData);
            
            // Validate project data
            if (this.validateProjectData(decompressedData)) {
                console.log('Project loaded successfully');
                return decompressedData;
            } else {
                console.warn('Invalid project data found');
                return null;
            }
            
        } catch (error) {
            console.error('Failed to load project:', error);
            return null;
        }
    }
    
    autoSave() {
        if (!window.webCraftApp || !window.webCraftApp.canvas) {
            return;
        }
        
        try {
            const canvasState = window.webCraftApp.canvas.getCanvasState();
            const autoSaveData = {
                canvasState: canvasState,
                timestamp: Date.now(),
                version: '1.0',
                isAutoSave: true
            };
            
            localStorage.setItem(this.autoSaveKey, JSON.stringify(autoSaveData));
            console.log('Auto-saved project');
            
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
    
    loadAutoSave() {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }
        
        try {
            const autoSaveData = localStorage.getItem(this.autoSaveKey);
            if (!autoSaveData) {
                return null;
            }
            
            const data = JSON.parse(autoSaveData);
            
            // Check if auto-save is recent (within last hour)
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            if (data.timestamp > oneHourAgo) {
                return data;
            } else {
                // Remove old auto-save
                this.clearAutoSave();
                return null;
            }
            
        } catch (error) {
            console.error('Failed to load auto-save:', error);
            return null;
        }
    }
    
    clearAutoSave() {
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.autoSaveKey);
        }
    }
    
    exportProject() {
        const projectData = this.loadProject();
        if (!projectData) {
            throw new Error('No project to export');
        }
        
        const exportData = {
            ...projectData,
            exportedAt: new Date().toISOString(),
            exportVersion: '1.0'
        };
        
        return exportData;
    }
    
    importProject(importData) {
        try {
            // Validate import data
            if (!this.validateProjectData(importData)) {
                throw new Error('Invalid project data');
            }
            
            // Convert import data to current format
            const convertedData = this.convertProjectData(importData);
            
            // Save as current project
            return this.saveProject(convertedData);
            
        } catch (error) {
            console.error('Failed to import project:', error);
            throw error;
        }
    }
    
    saveToRecentProjects(projectData) {
        try {
            const recentKey = 'webcraft_recent_projects';
            let recentProjects = [];
            
            const existingRecent = localStorage.getItem(recentKey);
            if (existingRecent) {
                recentProjects = JSON.parse(existingRecent);
            }
            
            // Create recent project entry
            const recentEntry = {
                id: projectData.id,
                savedAt: projectData.savedAt,
                version: projectData.version,
                elementCount: projectData.canvasState?.elements?.length || 0,
                preview: this.generateProjectPreview(projectData)
            };
            
            // Remove existing entry with same ID
            recentProjects = recentProjects.filter(p => p.id !== projectData.id);
            
            // Add to beginning
            recentProjects.unshift(recentEntry);
            
            // Keep only last 10 projects
            recentProjects = recentProjects.slice(0, 10);
            
            localStorage.setItem(recentKey, JSON.stringify(recentProjects));
            
        } catch (error) {
            console.error('Failed to save to recent projects:', error);
        }
    }
    
    getRecentProjects() {
        try {
            const recentKey = 'webcraft_recent_projects';
            const recentData = localStorage.getItem(recentKey);
            
            if (recentData) {
                return JSON.parse(recentData);
            }
            
            return [];
            
        } catch (error) {
            console.error('Failed to load recent projects:', error);
            return [];
        }
    }
    
    deleteProject(projectId) {
        try {
            // Remove from recent projects
            const recentProjects = this.getRecentProjects();
            const updatedRecent = recentProjects.filter(p => p.id !== projectId);
            
            const recentKey = 'webcraft_recent_projects';
            localStorage.setItem(recentKey, JSON.stringify(updatedRecent));
            
            // If it's the current project, clear it
            const currentProject = this.loadProject();
            if (currentProject && currentProject.id === projectId) {
                localStorage.removeItem(this.storageKey);
            }
            
            console.log('Project deleted:', projectId);
            
        } catch (error) {
            console.error('Failed to delete project:', error);
            throw error;
        }
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            console.log('Settings saved');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    loadSettings() {
        try {
            const settingsData = localStorage.getItem(this.settingsKey);
            if (settingsData) {
                const settings = JSON.parse(settingsData);
                this.applySettings(settings);
                return settings;
            }
            
            // Return default settings
            return this.getDefaultSettings();
            
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }
    
    getDefaultSettings() {
        return {
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            gridSnap: false,
            gridSize: 10,
            showGrid: false,
            theme: 'light',
            language: 'en'
        };
    }
    
    applySettings(settings) {
        // Apply settings to the application
        if (settings.theme) {
            document.body.setAttribute('data-theme', settings.theme);
        }
        
        // Other setting applications would go here
    }
    
    // Utility functions
    generateProjectId() {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    generateProjectPreview(projectData) {
        // Generate a simple preview description
        const elements = projectData.canvasState?.elements || [];
        const elementTypes = [...new Set(elements.map(el => el.type))];
        
        return {
            elementCount: elements.length,
            elementTypes: elementTypes,
            canvasSize: projectData.canvasState?.canvasSize || 'desktop',
            hasContent: elements.length > 0
        };
    }
    
    compressProjectData(data) {
        // Simple compression - remove unnecessary whitespace and redundant data
        const compressed = {
            ...data,
            canvasState: {
                ...data.canvasState,
                elements: data.canvasState.elements.map(el => ({
                    id: el.id,
                    type: el.type,
                    position: el.position,
                    size: el.size,
                    content: el.content,
                    styles: this.compressStyles(el.styles)
                }))
            }
        };
        
        return compressed;
    }
    
    decompressProjectData(data) {
        // Decompress and restore full data structure
        return data; // For now, just return as-is
    }
    
    compressStyles(styles) {
        // Remove default values and empty styles
        const compressed = {};
        
        Object.entries(styles || {}).forEach(([key, value]) => {
            if (value && value !== '0px' && value !== 'auto' && value !== 'transparent') {
                compressed[key] = value;
            }
        });
        
        return compressed;
    }
    
    validateProjectData(data) {
        // Basic validation
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        if (!data.canvasState || typeof data.canvasState !== 'object') {
            return false;
        }
        
        if (!Array.isArray(data.canvasState.elements)) {
            return false;
        }
        
        // Validate each element
        return data.canvasState.elements.every(element => {
            return element.id && element.type && element.position;
        });
    }
    
    convertProjectData(data) {
        // Convert older versions to current format
        if (data.version === '1.0') {
            return data; // Current version, no conversion needed
        }
        
        // Add version conversion logic here for future versions
        return data;
    }
    
    checkStorageSize(data) {
        const dataSize = JSON.stringify(data).length;
        
        if (dataSize > this.maxStorageSize) {
            throw new Error(`Project too large (${Math.round(dataSize / 1024)}KB). Maximum size is ${Math.round(this.maxStorageSize / 1024)}KB.`);
        }
        
        // Check total localStorage usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage.getItem(key).length;
            }
        }
        
        // Warn if approaching limit (assume 10MB localStorage limit)
        const storageLimit = 10 * 1024 * 1024;
        if (totalSize > storageLimit * 0.8) {
            console.warn('Approaching localStorage limit. Consider cleaning up old projects.');
        }
    }
    
    handleExternalProjectUpdate() {
        // Handle when project is updated in another tab
        if (window.webCraftApp) {
            const confirmed = confirm('Project was updated in another tab. Reload the current project?');
            if (confirmed) {
                const updatedProject = this.loadProject();
                if (updatedProject) {
                    window.webCraftApp.canvas.restoreCanvasState(updatedProject.canvasState);
                }
            }
        }
    }
    
    clearAllData() {
        // Clear all WebCraft related data
        const keys = [
            this.storageKey,
            this.autoSaveKey,
            this.settingsKey,
            'webcraft_recent_projects'
        ];
        
        keys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('All WebCraft data cleared');
    }
    
    getStorageInfo() {
        // Get information about storage usage
        const info = {
            available: this.isLocalStorageAvailable(),
            currentProject: !!localStorage.getItem(this.storageKey),
            autoSave: !!localStorage.getItem(this.autoSaveKey),
            recentProjects: this.getRecentProjects().length,
            totalSize: 0
        };
        
        // Calculate total size
        for (let key in localStorage) {
            if (key.startsWith('webcraft_')) {
                info.totalSize += localStorage.getItem(key).length;
            }
        }
        
        info.totalSizeKB = Math.round(info.totalSize / 1024);
        
        return info;
    }
}