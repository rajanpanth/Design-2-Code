// Export Manager
class ExportManager {
    constructor(canvasManager) {
        this.canvas = canvasManager;
        this.modal = document.getElementById('export-modal');
        this.closeModalBtn = document.getElementById('close-export-modal');
        this.exportHtmlBtn = document.getElementById('export-html');
        this.exportCssBtn = document.getElementById('export-css');
        this.exportCompleteBtn = document.getElementById('export-complete');
        this.codeDisplay = document.getElementById('code-display');
        this.codeTabs = document.querySelectorAll('.code-tab');
        
        this.generatedHTML = '';
        this.generatedCSS = '';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Modal controls
        this.closeModalBtn.addEventListener('click', () => this.hideExportModal());
        
        // Export buttons
        this.exportHtmlBtn.addEventListener('click', () => this.downloadHTML());
        this.exportCssBtn.addEventListener('click', () => this.downloadCSS());
        this.exportCompleteBtn.addEventListener('click', () => this.downloadComplete());
        
        // Code tabs
        this.codeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabType = e.target.dataset.tab;
                this.switchCodeTab(tabType);
            });
        });
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideExportModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hideExportModal();
            }
        });
    }
    
    showExportModal() {
        // Generate code
        this.generateCode();
        
        // Show HTML by default
        this.switchCodeTab('html');
        
        // Show modal
        this.modal.classList.add('active');
        
        console.log('Export modal opened');
    }
    
    hideExportModal() {
        this.modal.classList.remove('active');
    }
    
    generateCode() {
        const elements = this.canvas.getAllElements();
        const canvasSize = this.getCanvasSize();
        
        // Generate HTML
        this.generatedHTML = this.generateHTML(elements, canvasSize);
        
        // Generate CSS
        this.generatedCSS = this.generateCSS(elements, canvasSize);
        
        console.log('Code generated successfully');
    }
    
    generateHTML(elements, canvasSize) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container ${canvasSize}">
${this.generateElementsHTML(elements)}
    </div>
</body>
</html>`;
        
        return html;
    }
    
    generateElementsHTML(elements) {
        let html = '';
        
        // Sort elements by z-index for proper layering
        const sortedElements = elements.sort((a, b) => {
            const zIndexA = parseInt(a.element.style.zIndex) || 1;
            const zIndexB = parseInt(b.element.style.zIndex) || 1;
            return zIndexA - zIndexB;
        });
        
        sortedElements.forEach(elementData => {
            const element = elementData.element;
            const type = elementData.type;
            const elementId = element.id.replace('element_', 'gen_');
            
            html += this.generateSingleElementHTML(element, type, elementId);
        });
        
        return html;
    }
    
    generateSingleElementHTML(element, type, elementId) {
        const tag = element.tagName.toLowerCase();
        const classes = `element ${type}`;
        let attributes = '';
        let content = '';
        
        // Get element attributes
        const attrs = this.getElementAttributes(element, type);
        attributes = Object.entries(attrs)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
        
        // Get element content
        content = this.getElementContent(element, type);
        
        // Generate HTML based on element type
        if (tag === 'img') {
            return `        <${tag} id="${elementId}" class="${classes}" ${attributes} />\n`;
        } else if (tag === 'input') {
            return `        <${tag} id="${elementId}" class="${classes}" ${attributes} />\n`;
        } else if (this.isSelfClosingTag(tag)) {
            return `        <${tag} id="${elementId}" class="${classes}" ${attributes} />\n`;
        } else {
            return `        <${tag} id="${elementId}" class="${classes}" ${attributes}>${content}</${tag}>\n`;
        }
    }
    
    getElementAttributes(element, type) {
        const attrs = {};
        
        // Common attributes
        if (element.href && element.href !== '#') attrs.href = element.href;
        if (element.src) attrs.src = element.src;
        if (element.alt) attrs.alt = element.alt;
        if (element.placeholder) attrs.placeholder = element.placeholder;
        if (element.type && element.tagName === 'INPUT') attrs.type = element.type;
        if (element.target && element.target !== '_self') attrs.target = element.target;
        if (element.required) attrs.required = 'required';
        
        return attrs;
    }
    
    getElementContent(element, type) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return element.value || '';
        } else if (element.tagName === 'IMG') {
            return '';
        } else {
            return this.escapeHtml(element.textContent || '');
        }
    }
    
    generateCSS(elements, canvasSize) {
        let css = this.getBaseCSSStyles(canvasSize);
        
        // Generate styles for each element
        elements.forEach(elementData => {
            const element = elementData.element;
            const type = elementData.type;
            const elementId = element.id.replace('element_', 'gen_');
            
            css += this.generateElementCSS(element, type, elementId);
        });
        
        // Add responsive styles
        css += this.getResponsiveStyles();
        
        return css;
    }
    
    getBaseCSSStyles(canvasSize) {
        const containerWidth = this.getContainerWidth(canvasSize);
        
        return `/* Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #ffffff;
}

.container {
    position: relative;
    max-width: ${containerWidth}px;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
}

.element {
    position: absolute;
}

/* Element Type Styles */
.element.text {
    line-height: 1.4;
}

.element.heading {
    font-weight: bold;
    line-height: 1.2;
}

.element.button {
    border: none;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    text-align: center;
    transition: all 0.2s ease;
}

.element.button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.element.image {
    object-fit: cover;
}

.element.container {
    display: block;
}

.element.input,
.element.textarea {
    outline: none;
    transition: border-color 0.2s ease;
}

.element.input:focus,
.element.textarea:focus {
    border-color: #007aff;
}

.element.link {
    text-decoration: underline;
    transition: color 0.2s ease;
}

.element.link:hover {
    opacity: 0.8;
}

.element.flexbox {
    display: flex;
}

.element.grid {
    display: grid;
}

.element.section {
    display: block;
}

`;
    }
    
    generateElementCSS(element, type, elementId) {
        const styles = this.getElementStyles(element);
        let css = `#${elementId} {\n`;
        
        Object.entries(styles).forEach(([property, value]) => {
            css += `    ${this.camelToKebab(property)}: ${value};\n`;
        });
        
        css += `}\n\n`;
        
        return css;
    }
    
    getElementStyles(element) {
        const styles = {};
        const computedStyle = window.getComputedStyle(element);
        
        // Position and size
        styles.left = element.style.left || '0px';
        styles.top = element.style.top || '0px';
        
        if (element.style.width) styles.width = element.style.width;
        if (element.style.height) styles.height = element.style.height;
        if (element.style.zIndex) styles.zIndex = element.style.zIndex;
        
        // Typography
        if (this.isTextElement(element)) {
            if (element.style.fontSize) styles.fontSize = element.style.fontSize;
            if (element.style.fontFamily) styles.fontFamily = element.style.fontFamily;
            if (element.style.fontWeight) styles.fontWeight = element.style.fontWeight;
            if (element.style.fontStyle) styles.fontStyle = element.style.fontStyle;
            if (element.style.textAlign) styles.textAlign = element.style.textAlign;
            if (element.style.textDecoration) styles.textDecoration = element.style.textDecoration;
            if (element.style.lineHeight) styles.lineHeight = element.style.lineHeight;
            if (element.style.color) styles.color = element.style.color;
        }
        
        // Appearance
        if (element.style.backgroundColor) styles.backgroundColor = element.style.backgroundColor;
        if (element.style.border) styles.border = element.style.border;
        if (element.style.borderRadius) styles.borderRadius = element.style.borderRadius;
        if (element.style.boxShadow) styles.boxShadow = element.style.boxShadow;
        if (element.style.opacity) styles.opacity = element.style.opacity;
        
        // Spacing
        if (element.style.padding) styles.padding = element.style.padding;
        if (element.style.margin) styles.margin = element.style.margin;
        
        // Layout specific
        if (element.style.display) styles.display = element.style.display;
        if (element.style.flexDirection) styles.flexDirection = element.style.flexDirection;
        if (element.style.justifyContent) styles.justifyContent = element.style.justifyContent;
        if (element.style.alignItems) styles.alignItems = element.style.alignItems;
        if (element.style.gap) styles.gap = element.style.gap;
        if (element.style.gridTemplateColumns) styles.gridTemplateColumns = element.style.gridTemplateColumns;
        if (element.style.gridTemplateRows) styles.gridTemplateRows = element.style.gridTemplateRows;
        
        return styles;
    }
    
    getResponsiveStyles() {
        return `/* Responsive Styles */
@media (max-width: 768px) {
    .container {
        max-width: 100%;
        padding: 10px;
    }
    
    .element {
        position: relative !important;
        left: auto !important;
        top: auto !important;
        margin-bottom: 10px;
    }
    
    .element.button {
        width: 100%;
        max-width: 300px;
    }
    
    .element.input,
    .element.textarea {
        width: 100%;
        max-width: 400px;
    }
}

@media (max-width: 480px) {
    .element.heading {
        font-size: 24px !important;
    }
    
    .element.text {
        font-size: 14px !important;
    }
}
`;
    }
    
    switchCodeTab(tabType) {
        // Update tab states
        this.codeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabType);
        });
        
        // Show corresponding code
        if (tabType === 'html') {
            this.codeDisplay.textContent = this.generatedHTML;
        } else if (tabType === 'css') {
            this.codeDisplay.textContent = this.generatedCSS;
        }
    }
    
    downloadHTML() {
        this.downloadFile('index.html', this.generatedHTML, 'text/html');
    }
    
    downloadCSS() {
        this.downloadFile('styles.css', this.generatedCSS, 'text/css');
    }
    
    downloadComplete() {
        // Create a zip-like structure by downloading multiple files
        this.downloadHTML();
        setTimeout(() => this.downloadCSS(), 100);
        
        // Also create a readme file
        const readme = `# Generated Website

This website was created using WebCraft - Drag & Drop Website Builder.

## Files:
- index.html - Main HTML file
- styles.css - Stylesheet

## To use:
1. Open index.html in a web browser
2. Make sure styles.css is in the same directory

Generated on: ${new Date().toLocaleString()}
`;
        
        setTimeout(() => this.downloadFile('README.md', readme, 'text/markdown'), 200);
    }
    
    downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`Downloaded: ${filename}`);
    }
    
    // Utility functions
    getCanvasSize() {
        const container = this.canvas.canvasContainer;
        if (container.classList.contains('desktop')) return 'desktop';
        if (container.classList.contains('tablet')) return 'tablet';
        if (container.classList.contains('mobile')) return 'mobile';
        return 'desktop';
    }
    
    getContainerWidth(size) {
        const widths = {
            desktop: 1200,
            tablet: 768,
            mobile: 375
        };
        return widths[size] || 1200;
    }
    
    isTextElement(element) {
        const textTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON'];
        return textTags.includes(element.tagName);
    }
    
    isSelfClosingTag(tag) {
        const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
        return selfClosingTags.includes(tag.toLowerCase());
    }
    
    camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
