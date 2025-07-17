// Canvas Manager
class CanvasManager {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvasContainer = document.getElementById('canvas-container');
        this.elements = new Map();
        this.elementCounter = 0;
        this.selectedElement = null;
        this.clipboardData = null;
        
        this.init();
    }
    
    init() {
        this.setupCanvasEvents();
        this.setCanvasSize('desktop');
    }
    
    setupCanvasEvents() {
        // Canvas click handling
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) {
                this.deselectAllElements();
            }
        });
        
        // Prevent default drag behavior on canvas
        this.canvas.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    setCanvasSize(size) {
        // Remove existing size classes
        this.canvasContainer.classList.remove('desktop', 'tablet', 'mobile');
        
        // Add new size class
        this.canvasContainer.classList.add(size);
        
        // Update canvas dimensions
        const dimensions = {
            desktop: { width: 1200, height: 800 },
            tablet: { width: 768, height: 1024 },
            mobile: { width: 375, height: 667 }
        };
        
        const dim = dimensions[size];
        this.canvas.style.minHeight = dim.height + 'px';
        
        console.log(`Canvas size set to ${size}: ${dim.width}x${dim.height}`);
    }
    
    addElement(type, x, y) {
        const elementId = `element_${++this.elementCounter}`;
        const elementConfig = ElementsLibrary.getElementConfig(type);
        
        if (!elementConfig) {
            console.error('Unknown element type:', type);
            return null;
        }
        
        // Create element
        const element = document.createElement(elementConfig.tag);
        element.id = elementId;
        element.className = `canvas-element ${type}`;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        
        // Set default content and styles
        this.applyElementDefaults(element, elementConfig);
        
        // Add to canvas
        this.canvas.appendChild(element);
        
        // Add animation class
        element.classList.add('new-element');
        setTimeout(() => element.classList.remove('new-element'), 300);
        
        // Store element data
        this.elements.set(elementId, {
            type: type,
            element: element,
            config: elementConfig,
            properties: { ...elementConfig.defaultProps }
        });
        
        // Setup element interactions
        this.setupElementInteractions(element);
        
        // Select the new element
        this.selectElement(element);
        
        // Update canvas state
        this.updateCanvasState();
        
        // Remove placeholder if this is the first element
        if (this.elements.size === 1) {
            this.canvas.classList.add('has-elements');
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('elementAdded', {
            detail: { element, type, elementId }
        }));
        
        console.log(`Added ${type} element at (${x}, ${y})`);
        return element;
    }
    
    applyElementDefaults(element, config) {
        // Apply default content
        if (config.defaultContent) {
            if (element.tagName === 'IMG') {
                element.alt = config.defaultContent;
                element.src = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
                        <rect width="200" height="150" fill="#f0f0f0"/>
                        <text x="100" y="75" text-anchor="middle" fill="#666" font-family="Arial" font-size="14">
                            Image Placeholder
                        </text>
                    </svg>
                `);
            } else if (element.tagName === 'INPUT') {
                element.placeholder = config.defaultContent;
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = config.defaultContent;
            } else {
                element.textContent = config.defaultContent;
            }
        }
        
        // Apply default styles
        if (config.defaultProps) {
            Object.entries(config.defaultProps).forEach(([key, value]) => {
                if (key.startsWith('style.')) {
                    const styleProperty = key.replace('style.', '');
                    element.style[styleProperty] = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
        }
    }
    
    setupElementInteractions(element) {
        // Click to select
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });
        
        // Double click to edit
        element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.enterEditMode(element);
        });
        
        // Context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(element, e.clientX, e.clientY);
        });
        
        // Enable dragging through drag manager
        if (window.webCraftApp && window.webCraftApp.dragDrop) {
            window.webCraftApp.dragDrop.enableElementDragging(element);
        }
        
        // Setup resize handles
        this.addResizeHandles(element);
    }
    
    addResizeHandles(element) {
        const handles = ['nw', 'ne', 'sw', 'se'];
        
        handles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${direction}`;
            handle.addEventListener('mousedown', (e) => this.startResize(e, element, direction));
            element.appendChild(handle);
        });
    }
    
    startResize(e, element, direction) {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;
        const startLeft = element.offsetLeft;
        const startTop = element.offsetTop;
        
        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            
            if (direction.includes('e')) newWidth += deltaX;
            if (direction.includes('w')) {
                newWidth -= deltaX;
                newLeft += deltaX;
            }
            if (direction.includes('s')) newHeight += deltaY;
            if (direction.includes('n')) {
                newHeight -= deltaY;
                newTop += deltaY;
            }
            
            // Apply minimum dimensions
            newWidth = Math.max(newWidth, 30);
            newHeight = Math.max(newHeight, 20);
            
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Update element properties
            this.updateElementProperties(element);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    selectElement(element) {
        // Deselect previous element
        this.deselectAllElements();
        
        // Select new element
        element.classList.add('selected');
        this.selectedElement = element;
        
        // Show resize handles
        const handles = element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.style.display = 'block');
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('elementSelected', {
            detail: { element }
        }));
    }
    
    deselectAllElements() {
        if (this.selectedElement) {
            this.selectedElement.classList.remove('selected');
            
            // Hide resize handles
            const handles = this.selectedElement.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.style.display = 'none');
            
            this.selectedElement = null;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('elementDeselected'));
        }
    }
    
    removeElement(element) {
        const elementId = element.id;
        
        if (this.elements.has(elementId)) {
            // Remove from DOM
            element.remove();
            
            // Remove from storage
            this.elements.delete(elementId);
            
            // Update canvas state
            this.updateCanvasState();
            
            // Remove placeholder if no elements
            if (this.elements.size === 0) {
                this.canvas.classList.remove('has-elements');
            }
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('elementRemoved', {
                detail: { elementId }
            }));
            
            console.log(`Removed element: ${elementId}`);
        }
    }
    
    enterEditMode(element) {
        const elementData = this.elements.get(element.id);
        if (!elementData) return;
        
        const type = elementData.type;
        
        if (type === 'text' || type === 'heading') {
            // Make text editable
            element.contentEditable = true;
            element.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Exit edit mode on blur or enter
            const exitEdit = () => {
                element.contentEditable = false;
                element.removeEventListener('blur', exitEdit);
                element.removeEventListener('keydown', exitKeyHandler);
                this.updateElementProperties(element);
            };
            
            const exitKeyHandler = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    exitEdit();
                }
            };
            
            element.addEventListener('blur', exitEdit);
            element.addEventListener('keydown', exitKeyHandler);
        }
    }
    
    updateElementProperties(element) {
        const elementId = element.id;
        const elementData = this.elements.get(elementId);
        
        if (elementData) {
            // Update stored properties
            const computedStyle = window.getComputedStyle(element);
            elementData.properties = {
                ...elementData.properties,
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height,
                content: element.textContent || element.value || element.src
            };
            
            // Dispatch update event
            document.dispatchEvent(new CustomEvent('elementUpdated', {
                detail: { element, properties: elementData.properties }
            }));
        }
    }
    
    showContextMenu(element, x, y) {
        // Remove existing context menu
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        const menuItems = [
            { label: 'Copy', action: () => this.copyElement(element) },
            { label: 'Duplicate', action: () => this.duplicateElement(element) },
            { label: 'Delete', action: () => this.removeElement(element) },
            { separator: true },
            { label: 'Bring to Front', action: () => this.bringToFront(element) },
            { label: 'Send to Back', action: () => this.sendToBack(element) }
        ];
        
        menuItems.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('hr');
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = item.label;
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            }
        });
        
        document.body.appendChild(menu);
        
        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 0);
    }
    
    copyElement(element) {
        const elementData = this.elements.get(element.id);
        if (elementData) {
            this.clipboardData = {
                type: elementData.type,
                properties: { ...elementData.properties },
                content: element.textContent || element.value || element.src,
                styles: {
                    width: element.style.width,
                    height: element.style.height
                }
            };
            console.log('Element copied to clipboard');
        }
    }
    
    duplicateElement(element) {
        const elementData = this.elements.get(element.id);
        if (elementData) {
            const newX = element.offsetLeft + 20;
            const newY = element.offsetTop + 20;
            const newElement = this.addElement(elementData.type, newX, newY);
            
            // Copy properties
            if (newElement) {
                Object.assign(newElement.style, {
                    width: element.style.width,
                    height: element.style.height
                });
                
                if (element.textContent) {
                    newElement.textContent = element.textContent;
                }
            }
        }
    }
    
    bringToFront(element) {
        element.style.zIndex = (this.getMaxZIndex() + 1).toString();
        this.updateElementProperties(element);
    }
    
    sendToBack(element) {
        element.style.zIndex = '1';
        this.updateElementProperties(element);
    }
    
    getMaxZIndex() {
        let maxZ = 1;
        this.elements.forEach(data => {
            const z = parseInt(data.element.style.zIndex) || 1;
            if (z > maxZ) maxZ = z;
        });
        return maxZ;
    }
    
    getAllElements() {
        return Array.from(this.elements.values());
    }
    
    getCanvasState() {
        const state = {
            elements: [],
            canvasSize: this.canvasContainer.className.split(' ').find(cls => 
                ['desktop', 'tablet', 'mobile'].includes(cls)
            ) || 'desktop'
        };
        
        this.elements.forEach((data, id) => {
            const element = data.element;
            state.elements.push({
                id: id,
                type: data.type,
                position: {
                    left: element.style.left,
                    top: element.style.top
                },
                size: {
                    width: element.style.width,
                    height: element.style.height
                },
                properties: { ...data.properties },
                content: element.textContent || element.value || element.src,
                styles: {
                    zIndex: element.style.zIndex || '1'
                }
            });
        });
        
        return state;
    }
    
    restoreCanvasState(state) {
        // Clear current canvas
        this.clearCanvas();
        
        // Set canvas size
        if (state.canvasSize) {
            this.setCanvasSize(state.canvasSize);
            document.getElementById('canvas-size').value = state.canvasSize;
        }
        
        // Restore elements
        state.elements.forEach(elementState => {
            const element = this.addElement(
                elementState.type,
                parseInt(elementState.position.left) || 0,
                parseInt(elementState.position.top) || 0
            );
            
            if (element) {
                // Restore size
                if (elementState.size.width) element.style.width = elementState.size.width;
                if (elementState.size.height) element.style.height = elementState.size.height;
                
                // Restore content
                if (elementState.content) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = elementState.content;
                    } else if (element.tagName === 'IMG') {
                        element.src = elementState.content;
                    } else {
                        element.textContent = elementState.content;
                    }
                }
                
                // Restore styles
                if (elementState.styles) {
                    Object.assign(element.style, elementState.styles);
                }
                
                // Update counter to avoid ID conflicts
                const idNum = parseInt(elementState.id.split('_')[1]);
                if (idNum >= this.elementCounter) {
                    this.elementCounter = idNum;
                }
            }
        });
        
        console.log('Canvas state restored');
    }
    
    clearCanvas() {
        // Remove all elements
        this.elements.forEach((data, id) => {
            data.element.remove();
        });
        
        this.elements.clear();
        this.elementCounter = 0;
        this.selectedElement = null;
        this.canvas.classList.remove('has-elements');
    }
    
    updateCanvasState() {
        // This method can be used for real-time updates
        // Currently just logs for debugging
        // console.log('Canvas state updated, total elements:', this.elements.size);
    }
}