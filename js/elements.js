// Elements Library
class ElementsLibrary {
    static elements = {
        text: {
            name: 'Text',
            tag: 'p',
            icon: 'fas fa-font',
            category: 'content',
            defaultContent: 'Edit this text',
            defaultProps: {
                'style.fontSize': '16px',
                'style.color': '#333333',
                'style.fontFamily': 'Arial, sans-serif',
                'style.lineHeight': '1.4',
                'style.margin': '0',
                'style.padding': '8px'
            },
            properties: [
                { name: 'content', type: 'textarea', label: 'Text Content' },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 10, max: 72, unit: 'px' },
                { name: 'fontFamily', type: 'select', label: 'Font Family', options: [
                    'Arial, sans-serif',
                    'Georgia, serif',
                    'Times New Roman, serif',
                    'Courier New, monospace',
                    'Verdana, sans-serif',
                    'Helvetica, sans-serif'
                ]},
                { name: 'color', type: 'color', label: 'Text Color' },
                { name: 'textAlign', type: 'select', label: 'Text Align', options: ['left', 'center', 'right', 'justify'] },
                { name: 'fontWeight', type: 'select', label: 'Font Weight', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
                { name: 'fontStyle', type: 'select', label: 'Font Style', options: ['normal', 'italic', 'oblique'] },
                { name: 'textDecoration', type: 'select', label: 'Text Decoration', options: ['none', 'underline', 'overline', 'line-through'] }
            ]
        },
        
        heading: {
            name: 'Heading',
            tag: 'h2',
            icon: 'fas fa-heading',
            category: 'content',
            defaultContent: 'Your Heading Here',
            defaultProps: {
                'style.fontSize': '32px',
                'style.color': '#1d1d1f',
                'style.fontFamily': 'Arial, sans-serif',
                'style.fontWeight': 'bold',
                'style.lineHeight': '1.2',
                'style.margin': '0',
                'style.padding': '8px'
            },
            properties: [
                { name: 'content', type: 'text', label: 'Heading Text' },
                { name: 'level', type: 'select', label: 'Heading Level', options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 16, max: 72, unit: 'px' },
                { name: 'fontFamily', type: 'select', label: 'Font Family', options: [
                    'Arial, sans-serif',
                    'Georgia, serif',
                    'Times New Roman, serif',
                    'Helvetica, sans-serif'
                ]},
                { name: 'color', type: 'color', label: 'Text Color' },
                { name: 'textAlign', type: 'select', label: 'Text Align', options: ['left', 'center', 'right'] },
                { name: 'fontWeight', type: 'select', label: 'Font Weight', options: ['normal', 'bold', '300', '400', '500', '600', '700', '800', '900'] }
            ]
        },
        
        button: {
            name: 'Button',
            tag: 'button',
            icon: 'fas fa-hand-pointer',
            category: 'interactive',
            defaultContent: 'Click Me',
            defaultProps: {
                'style.backgroundColor': '#007aff',
                'style.color': 'white',
                'style.border': 'none',
                'style.borderRadius': '6px',
                'style.padding': '12px 24px',
                'style.fontSize': '14px',
                'style.fontWeight': '500',
                'style.cursor': 'pointer',
                'style.transition': 'all 0.2s ease'
            },
            properties: [
                { name: 'content', type: 'text', label: 'Button Text' },
                { name: 'backgroundColor', type: 'color', label: 'Background Color' },
                { name: 'color', type: 'color', label: 'Text Color' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 10, max: 24, unit: 'px' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'boxShadow', type: 'text', label: 'Box Shadow' },
                { name: 'href', type: 'text', label: 'Link URL (optional)' }
            ]
        },
        
        image: {
            name: 'Image',
            tag: 'img',
            icon: 'fas fa-image',
            category: 'media',
            defaultContent: 'Image Placeholder',
            defaultProps: {
                'style.width': '200px',
                'style.height': '150px',
                'style.objectFit': 'cover',
                'style.borderRadius': '4px',
                'alt': 'Image description'
            },
            properties: [
                { name: 'src', type: 'text', label: 'Image URL' },
                { name: 'alt', type: 'text', label: 'Alt Text' },
                { name: 'objectFit', type: 'select', label: 'Object Fit', options: ['cover', 'contain', 'fill', 'scale-down', 'none'] },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'boxShadow', type: 'text', label: 'Box Shadow' },
                { name: 'opacity', type: 'range', label: 'Opacity', min: 0, max: 1, step: 0.1 }
            ]
        },
        
        container: {
            name: 'Container',
            tag: 'div',
            icon: 'fas fa-square',
            category: 'layout',
            defaultContent: '',
            defaultProps: {
                'style.backgroundColor': '#f8f9fa',
                'style.border': '2px dashed #dee2e6',
                'style.borderRadius': '8px',
                'style.padding': '16px',
                'style.minHeight': '100px'
            },
            properties: [
                { name: 'backgroundColor', type: 'color', label: 'Background Color' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'margin', type: 'spacing', label: 'Margin' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'boxShadow', type: 'text', label: 'Box Shadow' },
                { name: 'opacity', type: 'range', label: 'Opacity', min: 0, max: 1, step: 0.1 }
            ]
        },
        
        input: {
            name: 'Input',
            tag: 'input',
            icon: 'fas fa-edit',
            category: 'forms',
            defaultContent: 'Enter text here...',
            defaultProps: {
                'type': 'text',
                'style.padding': '8px 12px',
                'style.border': '1px solid #d2d2d7',
                'style.borderRadius': '4px',
                'style.fontSize': '14px',
                'style.width': '200px'
            },
            properties: [
                { name: 'type', type: 'select', label: 'Input Type', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
                { name: 'placeholder', type: 'text', label: 'Placeholder' },
                { name: 'value', type: 'text', label: 'Default Value' },
                { name: 'required', type: 'toggle', label: 'Required' },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 10, max: 24, unit: 'px' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 20, unit: 'px' }
            ]
        },
        
        textarea: {
            name: 'Textarea',
            tag: 'textarea',
            icon: 'fas fa-align-left',
            category: 'forms',
            defaultContent: 'Enter your message here...',
            defaultProps: {
                'style.padding': '8px 12px',
                'style.border': '1px solid #d2d2d7',
                'style.borderRadius': '4px',
                'style.fontSize': '14px',
                'style.width': '200px',
                'style.height': '80px',
                'style.resize': 'vertical'
            },
            properties: [
                { name: 'placeholder', type: 'text', label: 'Placeholder' },
                { name: 'rows', type: 'number', label: 'Rows', min: 2, max: 20 },
                { name: 'cols', type: 'number', label: 'Columns', min: 10, max: 100 },
                { name: 'required', type: 'toggle', label: 'Required' },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 10, max: 24, unit: 'px' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 20, unit: 'px' }
            ]
        },
        
        link: {
            name: 'Link',
            tag: 'a',
            icon: 'fas fa-link',
            category: 'content',
            defaultContent: 'Click this link',
            defaultProps: {
                'href': '#',
                'style.color': '#007aff',
                'style.textDecoration': 'underline',
                'style.fontSize': '16px',
                'style.cursor': 'pointer'
            },
            properties: [
                { name: 'content', type: 'text', label: 'Link Text' },
                { name: 'href', type: 'text', label: 'URL' },
                { name: 'target', type: 'select', label: 'Target', options: ['_self', '_blank', '_parent', '_top'] },
                { name: 'color', type: 'color', label: 'Text Color' },
                { name: 'fontSize', type: 'range', label: 'Font Size', min: 10, max: 32, unit: 'px' },
                { name: 'textDecoration', type: 'select', label: 'Text Decoration', options: ['none', 'underline', 'overline', 'line-through'] },
                { name: 'fontWeight', type: 'select', label: 'Font Weight', options: ['normal', 'bold', '300', '400', '500', '600', '700'] }
            ]
        },
        
        flexbox: {
            name: 'Flexbox',
            tag: 'div',
            icon: 'fas fa-grip-horizontal',
            category: 'layout',
            defaultContent: 'Flex Container',
            defaultProps: {
                'style.display': 'flex',
                'style.flexDirection': 'row',
                'style.justifyContent': 'center',
                'style.alignItems': 'center',
                'style.gap': '10px',
                'style.padding': '16px',
                'style.backgroundColor': '#f8f9ff',
                'style.border': '1px solid #e5e5e7',
                'style.borderRadius': '8px',
                'style.minHeight': '120px'
            },
            properties: [
                { name: 'flexDirection', type: 'select', label: 'Direction', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
                { name: 'justifyContent', type: 'select', label: 'Justify Content', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
                { name: 'alignItems', type: 'select', label: 'Align Items', options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
                { name: 'gap', type: 'range', label: 'Gap', min: 0, max: 50, unit: 'px' },
                { name: 'backgroundColor', type: 'color', label: 'Background Color' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' }
            ]
        },
        
        grid: {
            name: 'Grid',
            tag: 'div',
            icon: 'fas fa-th',
            category: 'layout',
            defaultContent: '',
            defaultProps: {
                'style.display': 'grid',
                'style.gridTemplateColumns': 'repeat(3, 1fr)',
                'style.gridTemplateRows': 'auto',
                'style.gap': '10px',
                'style.padding': '16px',
                'style.backgroundColor': '#f8f9fa',
                'style.border': '2px dashed #dee2e6',
                'style.borderRadius': '8px',
                'style.minHeight': '200px'
            },
            properties: [
                { name: 'gridTemplateColumns', type: 'text', label: 'Grid Columns', placeholder: 'repeat(3, 1fr)' },
                { name: 'gridTemplateRows', type: 'text', label: 'Grid Rows', placeholder: 'auto' },
                { name: 'gap', type: 'range', label: 'Gap', min: 0, max: 50, unit: 'px' },
                { name: 'backgroundColor', type: 'color', label: 'Background Color' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' }
            ]
        },
        
        section: {
            name: 'Section',
            tag: 'section',
            icon: 'fas fa-layer-group',
            category: 'layout',
            defaultContent: 'Section Content',
            defaultProps: {
                'style.padding': '20px',
                'style.backgroundColor': '#ffffff',
                'style.border': '1px solid #e5e5e7',
                'style.borderRadius': '8px',
                'style.boxShadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
                'style.minHeight': '150px'
            },
            properties: [
                { name: 'backgroundColor', type: 'color', label: 'Background Color' },
                { name: 'padding', type: 'spacing', label: 'Padding' },
                { name: 'margin', type: 'spacing', label: 'Margin' },
                { name: 'border', type: 'border', label: 'Border' },
                { name: 'borderRadius', type: 'range', label: 'Border Radius', min: 0, max: 50, unit: 'px' },
                { name: 'boxShadow', type: 'text', label: 'Box Shadow' }
            ]
        }
    };
    
    static getElementConfig(type) {
        return this.elements[type] || null;
    }
    
    static getAllElements() {
        return this.elements;
    }
    
    static getElementsByCategory(category) {
        return Object.entries(this.elements)
            .filter(([key, config]) => config.category === category)
            .reduce((obj, [key, config]) => {
                obj[key] = config;
                return obj;
            }, {});
    }
    
    static getCategories() {
        const categories = new Set();
        Object.values(this.elements).forEach(config => {
            categories.add(config.category);
        });
        return Array.from(categories);
    }
}
