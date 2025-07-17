
// Drag and Drop Manager
class DragDropManager {
    constructor(canvasManager) {
        this.canvas = canvasManager;
        this.draggedElement = null;
        this.dragPreview = null;
        this.dropZones = [];
        
        this.init();
    }
    
    init() {
        this.setupElementDragging();
        this.setupCanvasDropping();
        this.createDragPreview();
    }
    
    setupElementDragging() {
        const elementItems = document.querySelectorAll('.element-item');
        
        elementItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }
    
    setupCanvasDropping() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('dragover', (e) => this.handleDragOver(e));
        canvas.addEventListener('drop', (e) => this.handleDrop(e));
        canvas.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        canvas.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }
    
    createDragPreview() {
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'drag-preview';
        document.body.appendChild(this.dragPreview);
    }
    
    handleDragStart(e) {
        const elementType = e.target.closest('.element-item').dataset.element;
        this.draggedElement = elementType;
        
        // Add dragging class
        e.target.classList.add('dragging');
        
        // Set drag data
        e.dataTransfer.setData('text/plain', elementType);
        e.dataTransfer.effectAllowed = 'copy';
        
        // Update drag preview
        this.updateDragPreview(elementType);
        
        // Use custom drag image
        e.dataTransfer.setDragImage(this.dragPreview, 0, 0);
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        this.hideDragPreview();
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Update drop zones
        this.updateDropZones(e.clientX, e.clientY);
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        const canvas = document.getElementById('canvas');
        canvas.classList.add('drag-over');
        
        // Show drop zones
        this.showDropZones();
    }
    
    handleDragLeave(e) {
        const canvas = document.getElementById('canvas');
        const rect = canvas.getBoundingClientRect();
        
        // Check if mouse is actually outside canvas
        if (e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom) {
            canvas.classList.remove('drag-over');
            this.hideDropZones();
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        const canvas = document.getElementById('canvas');
        canvas.classList.remove('drag-over');
        this.hideDropZones();
        
        const elementType = e.dataTransfer.getData('text/plain');
        if (elementType) {
            // Calculate position relative to canvas
            const canvasRect = canvas.getBoundingClientRect();
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;
            
            // Create and add element to canvas
            this.canvas.addElement(elementType, x, y);
        }
    }
    
    updateDragPreview(elementType) {
        const elementConfig = ElementsLibrary.getElementConfig(elementType);
        this.dragPreview.textContent = elementConfig.name;
        this.dragPreview.style.visibility = 'visible';
    }
    
    hideDragPreview() {
        this.dragPreview.style.visibility = 'hidden';
    }
    
    showDropZones() {
        const canvas = document.getElementById('canvas');
        const elements = canvas.querySelectorAll('.canvas-element');
        
        // Clear existing drop zones
        this.hideDropZones();
        
        // Create drop zones around existing elements
        elements.forEach(element => {
            this.createDropZone(element);
        });
        
        // Create main canvas drop zone if empty
        if (elements.length === 0) {
            this.createMainDropZone();
        }
    }
    
    hideDropZones() {
        this.dropZones.forEach(zone => {
            if (zone.parentNode) {
                zone.parentNode.removeChild(zone);
            }
        });
        this.dropZones = [];
    }
    
    createDropZone(element) {
        const rect = element.getBoundingClientRect();
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.style.left = (rect.left - canvasRect.left - 10) + 'px';
        dropZone.style.top = (rect.top - canvasRect.top - 10) + 'px';
        dropZone.style.width = (rect.width + 20) + 'px';
        dropZone.style.height = (rect.height + 20) + 'px';
        
        canvas.appendChild(dropZone);
        this.dropZones.push(dropZone);
    }
    
    createMainDropZone() {
        const canvas = document.getElementById('canvas');
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone main-drop-zone';
        dropZone.style.left = '20px';
        dropZone.style.top = '20px';
        dropZone.style.width = 'calc(100% - 40px)';
        dropZone.style.height = 'calc(100% - 40px)';
        
        canvas.appendChild(dropZone);
        this.dropZones.push(dropZone);
    }
    
    updateDropZones(mouseX, mouseY) {
        // Highlight nearest drop zone
        let nearestZone = null;
        let nearestDistance = Infinity;
        
        this.dropZones.forEach(zone => {
            const rect = zone.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestZone = zone;
            }
        });
        
        // Update active state
        this.dropZones.forEach(zone => {
            zone.classList.toggle('active', zone === nearestZone);
        });
    }
    
    // Enable drag and drop for canvas elements
    enableElementDragging(element) {
        element.addEventListener('mousedown', (e) => this.startElementDrag(e));
    }
    
    startElementDrag(e) {
        if (e.target.closest('.resize-handle')) return;
        
        const element = e.target.closest('.canvas-element');
        if (!element) return;
        
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const elementRect = element.getBoundingClientRect();
        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const offsetX = startX - elementRect.left;
        const offsetY = startY - elementRect.top;
        
        const onMouseMove = (e) => {
            const newX = e.clientX - canvasRect.left - offsetX;
            const newY = e.clientY - canvasRect.top - offsetY;
            
            // Constrain to canvas bounds
            const maxX = canvas.offsetWidth - element.offsetWidth;
            const maxY = canvas.offsetHeight - element.offsetHeight;
            
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));
            
            element.style.left = constrainedX + 'px';
            element.style.top = constrainedY + 'px';
            
            // Dispatch update event
            document.dispatchEvent(new CustomEvent('elementUpdated', {
                detail: { element, property: 'position' }
            }));
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Snap to grid if enabled
            this.snapToGrid(element);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    snapToGrid(element, gridSize = 10) {
        const left = parseInt(element.style.left);
        const top = parseInt(element.style.top);
        
        const snappedLeft = Math.round(left / gridSize) * gridSize;
        const snappedTop = Math.round(top / gridSize) * gridSize;
        
        element.style.left = snappedLeft + 'px';
        element.style.top = snappedTop + 'px';
    }
}