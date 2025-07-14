# WebCraft - Drag & Drop Website Builder

## Overview

WebCraft is a client-side drag-and-drop website builder that allows users to create websites visually by dragging elements onto a canvas. The application is built entirely with vanilla JavaScript, HTML, and CSS, providing a lightweight and responsive web-based design tool with real-time preview, export capabilities, and design quality rating.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

WebCraft follows a modular client-side architecture with clear separation of concerns:

- **Frontend-Only Architecture**: Pure client-side application with no backend dependencies
- **Modular Design**: Object-oriented JavaScript classes for different functionality areas
- **Event-Driven Architecture**: Extensive use of DOM events and custom event handling
- **Local Storage**: Browser localStorage for project persistence and auto-save
- **Responsive Design**: CSS-based responsive canvas with multiple viewport sizes

## Key Components

### 1. Application Core
- **WebCraftApp** (`js/app.js`): Main application controller that coordinates all modules
- **CanvasManager** (`js/canvas.js`): Manages the design canvas, element placement, and selection
- **DragDropManager** (`js/dragdrop.js`): Handles drag-and-drop functionality between sidebar and canvas

### 2. UI Management
- **PropertiesManager** (`js/properties.js`): Dynamic properties panel for element customization
- **ElementsLibrary** (`js/elements.js`): Defines available UI elements with their properties and behaviors
- **ExportManager** (`js/export.js`): Handles HTML/CSS code generation and download functionality

### 3. Quality & Storage
- **RatingManager** (`js/rating.js`): Real-time design quality assessment based on layout, colors, typography
- **StorageManager** (`js/storage.js`): Local project persistence, auto-save, and settings management

### 4. Styling Architecture
- **Modular CSS**: Separate stylesheets for different UI components
- **Responsive Canvas**: Multiple viewport sizes (desktop, tablet, mobile)
- **Modern Design System**: Clean, Apple-inspired interface with smooth animations

## Data Flow

1. **Element Creation**: User drags element from sidebar → DragDropManager creates element → CanvasManager places it → ElementsLibrary applies default properties
2. **Element Editing**: User selects element → PropertiesManager shows dynamic property panel → Changes update element and trigger rating recalculation
3. **Project Management**: StorageManager auto-saves to localStorage → Changes tracked in history for undo/redo
4. **Export Process**: ExportManager generates clean HTML/CSS → Provides download options for individual files or complete project

## External Dependencies

- **Font Awesome 6.0.0**: Icon library for UI elements and toolbar buttons
- **Browser APIs**: localStorage, File API for downloads, DOM manipulation
- **No Framework Dependencies**: Pure vanilla JavaScript implementation

## Deployment Strategy

**Static Hosting Ready**: 
- No build process required
- All assets are client-side
- Can be deployed to any static hosting service (GitHub Pages, Netlify, Vercel)
- Works entirely in the browser with no server requirements

**Local Development**:
- Simply serve files through any local web server
- No compilation or preprocessing needed
- Direct file editing and refresh workflow

The architecture prioritizes simplicity and portability while providing a full-featured website building experience. The modular design allows for easy extension of functionality, and the client-side nature ensures fast performance and easy deployment.