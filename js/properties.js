// Properties Panel Manager
class PropertiesManager {
    constructor() {
        this.panel = document.getElementById('properties-panel');
        this.content = document.getElementById('properties-content');
        this.closeBtn = document.getElementById('close-properties');
        this.currentElement = null;
        this.currentElementData = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.hideProperties());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.panel.classList.contains('open')) {
                this.hideProperties();
            }
        });
    }
    
    showProperties(element) {
        this.currentElement = element;
        this.currentElementData = window.webCraftApp.canvas.elements.get(element.id);
        
        if (!this.currentElementData) {
            console.error('Element data not found for:', element.id);
            return;
        }
        
        // Generate properties UI
        this.generatePropertiesUI();
        
        // Show panel
        this.panel.classList.add('open');
    }
    
    hideProperties() {
        this.panel.classList.remove('open');
        this.currentElement = null;
        this.currentElementData = null;
    }
    
    generatePropertiesUI() {
        const config = this.currentElementData.config;
        const element = this.currentElement;
        
        // Clear existing content
        this.content.innerHTML = '';
        
        // Element info section
        const infoSection = this.createPropertyGroup('Element Info');
        infoSection.appendChild(this.createPropertyItem({
            name: 'type',
            type: 'text',
            label: 'Element Type',
            value: config.name,
            readOnly: true
        }));
        
        infoSection.appendChild(this.createPropertyItem({
            name: 'id',
            type: 'text',
            label: 'Element ID',
            value: element.id,
            readOnly: true
        }));
        
        this.content.appendChild(infoSection);
        
        // Position and Size section
        const layoutSection = this.createPropertyGroup('Layout & Position');
        
        // Position controls
        const positionGrid = document.createElement('div');
        positionGrid.className = 'property-grid';
        
        positionGrid.appendChild(this.createPropertyItem({
            name: 'left',
            type: 'number',
            label: 'Left (px)',
            value: parseInt(element.style.left) || 0
        }));
        
        positionGrid.appendChild(this.createPropertyItem({
            name: 'top',
            type: 'number',
            label: 'Top (px)',
            value: parseInt(element.style.top) || 0
        }));
        
        layoutSection.appendChild(positionGrid);
        
        // Size controls
        const sizeGrid = document.createElement('div');
        sizeGrid.className = 'property-grid';
        
        sizeGrid.appendChild(this.createPropertyItem({
            name: 'width',
            type: 'number',
            label: 'Width (px)',
            value: parseInt(element.style.width) || element.offsetWidth
        }));
        
        sizeGrid.appendChild(this.createPropertyItem({
            name: 'height',
            type: 'number',
            label: 'Height (px)',
            value: parseInt(element.style.height) || element.offsetHeight
        }));
        
        layoutSection.appendChild(sizeGrid);
        
        // Z-index
        layoutSection.appendChild(this.createPropertyItem({
            name: 'zIndex',
            type: 'number',
            label: 'Z-Index',
            value: parseInt(element.style.zIndex) || 1,
            min: 1,
            max: 9999
        }));
        
        this.content.appendChild(layoutSection);
        
        // Element-specific properties
        if (config.properties && config.properties.length > 0) {
            const elementSection = this.createPropertyGroup('Element Properties');
            
            config.properties.forEach(propConfig => {
                const propItem = this.createPropertyItem({
                    ...propConfig,
                    value: this.getPropertyValue(propConfig.name)
                });
                elementSection.appendChild(propItem);
            });
            
            this.content.appendChild(elementSection);
        }
        
        // Style properties
        const styleSection = this.createPropertyGroup('Appearance');
        
        // Background color
        styleSection.appendChild(this.createPropertyItem({
            name: 'backgroundColor',
            type: 'color',
            label: 'Background Color',
            value: this.rgbToHex(element.style.backgroundColor) || '#ffffff'
        }));
        
        // Text color (if applicable)
        if (this.isTextElement()) {
            styleSection.appendChild(this.createPropertyItem({
                name: 'color',
                type: 'color',
                label: 'Text Color',
                value: this.rgbToHex(element.style.color) || '#333333'
            }));
        }
        
        // Border radius
        styleSection.appendChild(this.createPropertyItem({
            name: 'borderRadius',
            type: 'range',
            label: 'Border Radius',
            value: parseInt(element.style.borderRadius) || 0,
            min: 0,
            max: 50,
            unit: 'px'
        }));
        
        // Opacity
        styleSection.appendChild(this.createPropertyItem({
            name: 'opacity',
            type: 'range',
            label: 'Opacity',
            value: parseFloat(element.style.opacity) || 1,
            min: 0,
            max: 1,
            step: 0.1
        }));
        
        this.content.appendChild(styleSection);
        
        // Actions section
        const actionsSection = this.createActionsSection();
        this.content.appendChild(actionsSection);
    }
    
    createPropertyGroup(title) {
        const group = document.createElement('div');
        group.className = 'property-group';
        
        const heading = document.createElement('h4');
        heading.textContent = title;
        group.appendChild(heading);
        
        return group;
    }
    
    createPropertyItem(config) {
        const item = document.createElement('div');
        item.className = 'property-item';
        
        // Label
        if (config.label) {
            const label = document.createElement('label');
            label.className = 'property-label';
            label.textContent = config.label;
            item.appendChild(label);
        }
        
        // Input based on type
        let input;
        
        switch (config.type) {
            case 'text':
            case 'number':
                input = document.createElement('input');
                input.type = config.type;
                input.className = 'property-input';
                input.value = config.value || '';
                if (config.placeholder) input.placeholder = config.placeholder;
                if (config.min !== undefined) input.min = config.min;
                if (config.max !== undefined) input.max = config.max;
                if (config.step !== undefined) input.step = config.step;
                if (config.readOnly) input.readOnly = true;
                break;
                
            case 'textarea':
                input = document.createElement('textarea');
                input.className = 'property-textarea';
                input.value = config.value || '';
                if (config.placeholder) input.placeholder = config.placeholder;
                break;
                
            case 'select':
                input = document.createElement('select');
                input.className = 'property-select';
                config.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    if (option === config.value) optionElement.selected = true;
                    input.appendChild(optionElement);
                });
                break;
                
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.className = 'property-input';
                input.value = config.value || '#000000';
                break;
                
            case 'range':
                const rangeContainer = document.createElement('div');
                rangeContainer.className = 'range-container';
                
                input = document.createElement('input');
                input.type = 'range';
                input.className = 'property-input';
                input.value = config.value || config.min || 0;
                input.min = config.min || 0;
                input.max = config.max || 100;
                input.step = config.step || 1;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'range-value';
                valueDisplay.textContent = input.value + (config.unit || '');
                
                rangeContainer.appendChild(input);
                rangeContainer.appendChild(valueDisplay);
                
                input.addEventListener('input', () => {
                    valueDisplay.textContent = input.value + (config.unit || '');
                });
                
                item.appendChild(rangeContainer);
                break;
                
            case 'toggle':
                const toggleContainer = document.createElement('div');
                toggleContainer.className = 'property-toggle';
                
                input = document.createElement('div');
                input.className = 'toggle-switch';
                if (config.value) input.classList.add('active');
                
                const toggleLabel = document.createElement('span');
                toggleLabel.textContent = config.label;
                
                toggleContainer.appendChild(input);
                toggleContainer.appendChild(toggleLabel);
                
                input.addEventListener('click', () => {
                    input.classList.toggle('active');
                    this.updateProperty(config.name, input.classList.contains('active'));
                });
                
                item.appendChild(toggleContainer);
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'property-input';
                input.value = config.value || '';
        }
        
        if (input && config.type !== 'toggle') {
            item.appendChild(input);
            
            // Add event listener for property updates
            const eventType = config.type === 'range' ? 'input' : 'change';
            input.addEventListener(eventType, (e) => {
                this.updateProperty(config.name, e.target.value, config.unit);
            });
        }
        
        return item;
    }
    
    createActionsSection() {
        const section = this.createPropertyGroup('Actions');
        const actions = document.createElement('div');
        actions.className = 'property-actions';
        
        // Duplicate button
        const duplicateBtn = document.createElement('button');
        duplicateBtn.className = 'property-btn';
        duplicateBtn.innerHTML = '<i class="fas fa-copy"></i> Duplicate';
        duplicateBtn.addEventListener('click', () => this.duplicateElement());
        actions.appendChild(duplicateBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'property-btn danger';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', () => this.deleteElement());
        actions.appendChild(deleteBtn);
        
        section.appendChild(actions);
        return section;
    }
    
    updateProperty(propertyName, value, unit = '') {
        if (!this.currentElement) return;
        
        const element = this.currentElement;
        const fullValue = unit ? value + unit : value;
        
        // Handle different property types
        switch (propertyName) {
            case 'left':
                element.style.left = value + 'px';
                break;
            case 'top':
                element.style.top = value + 'px';
                break;
            case 'width':
                element.style.width = value + 'px';
                break;
            case 'height':
                element.style.height = value + 'px';
                break;
            case 'content':
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = value;
                } else if (element.tagName === 'IMG') {
                    element.src = value;
                } else {
                    element.textContent = value;
                }
                break;
            case 'backgroundColor':
                element.style.backgroundColor = value;
                break;
            case 'color':
                element.style.color = value;
                break;
            case 'fontSize':
                element.style.fontSize = fullValue;
                break;
            case 'fontFamily':
                element.style.fontFamily = value;
                break;
            case 'textAlign':
                element.style.textAlign = value;
                break;
            case 'fontWeight':
                element.style.fontWeight = value;
                break;
            case 'borderRadius':
                element.style.borderRadius = fullValue;
                break;
            case 'opacity':
                element.style.opacity = value;
                break;
            case 'zIndex':
                element.style.zIndex = value;
                break;
            case 'padding':
                element.style.padding = fullValue;
                break;
            case 'margin':
                element.style.margin = fullValue;
                break;
            case 'href':
                if (element.tagName === 'A') {
                    element.href = value;
                }
                break;
            case 'alt':
                if (element.tagName === 'IMG') {
                    element.alt = value;
                }
                break;
            case 'placeholder':
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                }
                break;
            default:
                // Handle CSS properties
                if (propertyName.startsWith('style.')) {
                    const cssProperty = propertyName.replace('style.', '');
                    element.style[cssProperty] = fullValue;
                } else {
                    element.setAttribute(propertyName, value);
                }
        }
        
        // Update stored element data
        if (this.currentElementData) {
            this.currentElementData.properties[propertyName] = value;
        }
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('elementUpdated', {
            detail: { element, property: propertyName, value }
        }));
        
        console.log(`Updated ${propertyName} to ${value} for element ${element.id}`);
    }
    
    getPropertyValue(propertyName) {
        if (!this.currentElement) return '';
        
        const element = this.currentElement;
        
        switch (propertyName) {
            case 'content':
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    return element.value;
                } else if (element.tagName === 'IMG') {
                    return element.src;
                } else {
                    return element.textContent;
                }
            case 'backgroundColor':
                return this.rgbToHex(element.style.backgroundColor) || '#ffffff';
            case 'color':
                return this.rgbToHex(element.style.color) || '#333333';
            case 'fontSize':
                return parseInt(element.style.fontSize) || 16;
            case 'fontFamily':
                return element.style.fontFamily || 'Arial, sans-serif';
            case 'href':
                return element.href || '#';
            case 'alt':
                return element.alt || '';
            case 'placeholder':
                return element.placeholder || '';
            default:
                // Check stored properties first
                if (this.currentElementData && this.currentElementData.properties[propertyName]) {
                    return this.currentElementData.properties[propertyName];
                }
                
                // Fallback to computed style or attribute
                const computedStyle = window.getComputedStyle(element);
                return computedStyle[propertyName] || element.getAttribute(propertyName) || '';
        }
    }
    
    isTextElement() {
        if (!this.currentElement) return false;
        
        const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON'];
        return textTags.includes(this.currentElement.tagName);
    }
    
    rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#ffffff';
        
        // If it's already a hex color, return it
        if (rgb.startsWith('#')) return rgb;
        
        // Parse RGB values
        const rgbMatch = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!rgbMatch) return '#ffffff';
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    duplicateElement() {
        if (!this.currentElement) return;
        
        const canvas = window.webCraftApp.canvas;
        canvas.duplicateElement(this.currentElement);
        this.hideProperties();
    }
    
    deleteElement() {
        if (!this.currentElement) return;
        
        const canvas = window.webCraftApp.canvas;
        canvas.removeElement(this.currentElement);
        this.hideProperties();
    }
}
