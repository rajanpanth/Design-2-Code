
// Main Application Controller
class WebCraftApp {
    constructor() {
        this.canvas = null;
        this.dragDrop = null;
        this.properties = null;
        this.exporter = null;
        this.rating = null;
        this.storage = null;
        this.selectedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.isPreviewMode = false;
        
        this.init();
    }
    
    init() {
        // Initialize all modules
        this.canvas = new CanvasManager();
        this.dragDrop = new DragDropManager(this.canvas);
        this.properties = new PropertiesManager();
        this.exporter = new ExportManager(this.canvas);
        this.rating = new RatingManager();
        this.storage = new StorageManager();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load saved project if exists
        this.loadProject();
        
        // Initial rating calculation
        this.updateRating();
        
        console.log('WebCraft application initialized');
    }
    
    setupEventListeners() {
        // Header controls
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());
        document.getElementById('preview-btn').addEventListener('click', () => this.togglePreview());
        document.getElementById('save-btn').addEventListener('click', () => this.saveProject());
        document.getElementById('export-btn').addEventListener('click', () => this.exporter.showExportModal());
        
        // Canvas size control
        document.getElementById('canvas-size').addEventListener('change', (e) => {
            this.canvas.setCanvasSize(e.target.value);
        });
        
        // Canvas events
        document.addEventListener('elementSelected', (e) => {
            this.selectedElement = e.detail.element;
            this.properties.showProperties(this.selectedElement);
            this.updateRating();
        });
        
        document.addEventListener('elementDeselected', () => {
            this.selectedElement = null;
            this.properties.hideProperties();
        });
        
        document.addEventListener('elementAdded', (e) => {
            this.addToHistory('Element Added');
            this.updateRating();
        });
        
        document.addEventListener('elementUpdated', (e) => {
            this.addToHistory('Element Updated');
            this.updateRating();
        });
        
        document.addEventListener('elementRemoved', (e) => {
            this.addToHistory('Element Removed');
            this.updateRating();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }
    
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exporter.showExportModal();
                    break;
            }
        }
        
        if (e.key === 'Delete' && this.selectedElement) {
            this.canvas.removeElement(this.selectedElement);
        }
        
        if (e.key === 'Escape') {
            this.canvas.deselectAllElements();
        }
    }
    
    addToHistory(action) {
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        const state = {
            action: action,
            timestamp: Date.now(),
            canvasState: this.canvas.getCanvasState()
        };
        
        this.history.push(state);
        this.historyIndex++;
        
        // Limit history to 50 items
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateHistoryButtons();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.canvas.restoreCanvasState(state.canvasState);
            this.updateHistoryButtons();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.canvas.restoreCanvasState(state.canvasState);
            this.updateHistoryButtons();
        }
    }
    
    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
    
    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        const canvasArea = document.querySelector('.canvas-area');
        const previewBtn = document.getElementById('preview-btn');
        
        if (this.isPreviewMode) {
            canvasArea.classList.add('preview-mode');
            previewBtn.classList.add('active');
            previewBtn.title = 'Exit Preview';
            this.canvas.deselectAllElements();
        } else {
            canvasArea.classList.remove('preview-mode');
            previewBtn.classList.remove('active');
            previewBtn.title = 'Preview';
        }
    }
    
    updateRating() {
        const elements = this.canvas.getAllElements();
        this.rating.calculateRating(elements);
    }
    
    saveProject() {
        try {
            const projectData = {
                canvasState: this.canvas.getCanvasState(),
                timestamp: Date.now(),
                version: '1.0'
            };
            
            this.storage.saveProject(projectData);
            this.showNotification('Project saved successfully', 'success');
        } catch (error) {
            console.error('Error saving project:', error);
            this.showNotification('Error saving project', 'error');
        }
    }
    
    loadProject() {
        try {
            const projectData = this.storage.loadProject();
            if (projectData && projectData.canvasState) {
                this.canvas.restoreCanvasState(projectData.canvasState);
                this.addToHistory('Project Loaded');
                console.log('Project loaded successfully');
            }
        } catch (error) {
            console.error('Error loading project:', error);
        }
    }
    
    autoSave() {
        if (this.canvas.getAllElements().length > 0) {
            this.saveProject();
            console.log('Auto-saved project');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.webCraftApp = new WebCraftApp();
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: #34c759;
    }
    
    .notification-error {
        background: #ff3b30;
    }
    
    .notification-info {
        background: #007aff;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);