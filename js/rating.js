// Rating Manager
class RatingManager {
    constructor() {
        this.ratingDisplay = document.getElementById('design-rating');
        this.metricsDisplay = document.getElementById('rating-metrics');
        this.currentRating = 0;
        this.metrics = {
            layout: 0,
            colors: 0,
            typography: 0,
            spacing: 0,
            consistency: 0
        };
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
    }
    
    calculateRating(elements) {
        if (!elements || elements.length === 0) {
            this.resetRating();
            return;
        }
        
        // Calculate individual metrics
        this.metrics.layout = this.calculateLayoutScore(elements);
        this.metrics.colors = this.calculateColorScore(elements);
        this.metrics.typography = this.calculateTypographyScore(elements);
        this.metrics.spacing = this.calculateSpacingScore(elements);
        this.metrics.consistency = this.calculateConsistencyScore(elements);
        
        // Calculate overall rating (weighted average)
        const weights = {
            layout: 0.25,
            colors: 0.20,
            typography: 0.20,
            spacing: 0.20,
            consistency: 0.15
        };
        
        this.currentRating = Math.round(
            this.metrics.layout * weights.layout +
            this.metrics.colors * weights.colors +
            this.metrics.typography * weights.typography +
            this.metrics.spacing * weights.spacing +
            this.metrics.consistency * weights.consistency
        );
        
        this.updateDisplay();
        
        console.log('Design rating calculated:', this.currentRating, this.metrics);
    }
    
    calculateLayoutScore(elements) {
        let score = 50; // Base score
        
        // Check for proper element distribution
        const positions = elements.map(el => ({
            x: parseInt(el.element.style.left) || 0,
            y: parseInt(el.element.style.top) || 0,
            width: el.element.offsetWidth,
            height: el.element.offsetHeight
        }));
        
        // Bonus for good spacing between elements
        let overlapPenalty = 0;
        let distributionBonus = 0;
        
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const distance = this.calculateDistance(positions[i], positions[j]);
                
                // Check for overlaps
                if (this.isOverlapping(positions[i], positions[j])) {
                    overlapPenalty += 10;
                } else if (distance > 50 && distance < 200) {
                    // Good spacing
                    distributionBonus += 5;
                }
            }
        }
        
        score = score + distributionBonus - overlapPenalty;
        
        // Bonus for using layout containers (flexbox, grid)
        const layoutElements = elements.filter(el => 
            el.type === 'flexbox' || el.type === 'grid' || el.type === 'section'
        );
        if (layoutElements.length > 0) {
            score += layoutElements.length * 10;
        }
        
        // Bonus for hierarchical structure
        const headings = elements.filter(el => el.type === 'heading').length;
        const texts = elements.filter(el => el.type === 'text').length;
        if (headings > 0 && texts > 0) {
            score += 15;
        }
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    calculateColorScore(elements) {
        let score = 60; // Base score
        
        const colors = this.extractColors(elements);
        const uniqueColors = [...new Set(colors)];
        
        // Optimal color count (2-5 colors)
        if (uniqueColors.length >= 2 && uniqueColors.length <= 5) {
            score += 20;
        } else if (uniqueColors.length > 5) {
            score -= (uniqueColors.length - 5) * 5; // Penalty for too many colors
        }
        
        // Check color harmony
        const harmonyScore = this.calculateColorHarmony(uniqueColors);
        score += harmonyScore;
        
        // Bonus for consistent color usage
        const consistencyBonus = this.calculateColorConsistency(elements);
        score += consistencyBonus;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    calculateTypographyScore(elements) {
        let score = 50; // Base score
        
        const textElements = elements.filter(el => 
            el.type === 'text' || el.type === 'heading' || el.type === 'button' || el.type === 'link'
        );
        
        if (textElements.length === 0) {
            return score;
        }
        
        const fontSizes = textElements.map(el => 
            parseInt(el.element.style.fontSize) || 16
        );
        const fontFamilies = textElements.map(el => 
            el.element.style.fontFamily || 'Arial, sans-serif'
        );
        
        // Font size hierarchy
        const uniqueSizes = [...new Set(fontSizes)].sort((a, b) => b - a);
        if (uniqueSizes.length >= 2 && uniqueSizes.length <= 4) {
            score += 20;
        }
        
        // Proper size differences (at least 4px difference between levels)
        let hierarchyBonus = 0;
        for (let i = 0; i < uniqueSizes.length - 1; i++) {
            if (uniqueSizes[i] - uniqueSizes[i + 1] >= 4) {
                hierarchyBonus += 5;
            }
        }
        score += Math.min(hierarchyBonus, 15);
        
        // Font family consistency (max 2 font families)
        const uniqueFonts = [...new Set(fontFamilies)];
        if (uniqueFonts.length <= 2) {
            score += 15;
        } else {
            score -= (uniqueFonts.length - 2) * 5;
        }
        
        // Readability check
        const readabilityBonus = this.calculateReadability(textElements);
        score += readabilityBonus;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    calculateSpacingScore(elements) {
        let score = 60; // Base score
        
        // Check padding consistency
        const paddingValues = elements.map(el => 
            parseInt(el.element.style.padding) || 0
        ).filter(p => p > 0);
        
        if (paddingValues.length > 0) {
            const consistentPadding = this.isConsistentSpacing(paddingValues);
            if (consistentPadding) {
                score += 20;
            }
        }
        
        // Check margin consistency
        const marginValues = elements.map(el => 
            parseInt(el.element.style.margin) || 0
        ).filter(m => m > 0);
        
        if (marginValues.length > 0) {
            const consistentMargin = this.isConsistentSpacing(marginValues);
            if (consistentMargin) {
                score += 15;
            }
        }
        
        // Check for proper white space
        const whiteSpaceScore = this.calculateWhiteSpaceScore(elements);
        score += whiteSpaceScore;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    calculateConsistencyScore(elements) {
        let score = 50; // Base score
        
        // Button consistency
        const buttons = elements.filter(el => el.type === 'button');
        if (buttons.length > 1) {
            const buttonConsistency = this.calculateElementConsistency(buttons, ['backgroundColor', 'color', 'borderRadius', 'fontSize']);
            score += buttonConsistency * 0.3;
        }
        
        // Input consistency
        const inputs = elements.filter(el => el.type === 'input' || el.type === 'textarea');
        if (inputs.length > 1) {
            const inputConsistency = this.calculateElementConsistency(inputs, ['border', 'borderRadius', 'fontSize']);
            score += inputConsistency * 0.2;
        }
        
        // Container consistency
        const containers = elements.filter(el => el.type === 'container' || el.type === 'section');
        if (containers.length > 1) {
            const containerConsistency = this.calculateElementConsistency(containers, ['backgroundColor', 'borderRadius', 'padding']);
            score += containerConsistency * 0.2;
        }
        
        // Overall style consistency
        const overallConsistency = this.calculateOverallConsistency(elements);
        score += overallConsistency * 0.3;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    // Utility functions
    calculateDistance(pos1, pos2) {
        const dx = (pos1.x + pos1.width / 2) - (pos2.x + pos2.width / 2);
        const dy = (pos1.y + pos1.height / 2) - (pos2.y + pos2.height / 2);
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    isOverlapping(pos1, pos2) {
        return !(pos1.x + pos1.width < pos2.x || 
                pos2.x + pos2.width < pos1.x || 
                pos1.y + pos1.height < pos2.y || 
                pos2.y + pos2.height < pos1.y);
    }
    
    extractColors(elements) {
        const colors = [];
        
        elements.forEach(el => {
            const element = el.element;
            const bgColor = element.style.backgroundColor;
            const textColor = element.style.color;
            
            if (bgColor && bgColor !== 'transparent') {
                colors.push(this.normalizeColor(bgColor));
            }
            if (textColor) {
                colors.push(this.normalizeColor(textColor));
            }
        });
        
        return colors.filter(color => color && color !== '#ffffff' && color !== '#000000');
    }
    
    normalizeColor(color) {
        if (!color) return null;
        
        // Convert RGB to hex if needed
        if (color.startsWith('rgb')) {
            const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
        }
        
        return color.toLowerCase();
    }
    
    calculateColorHarmony(colors) {
        if (colors.length < 2) return 10;
        
        // Simple harmony check based on color relationships
        let harmonyScore = 0;
        
        for (let i = 0; i < colors.length; i++) {
            for (let j = i + 1; j < colors.length; j++) {
                const relationship = this.getColorRelationship(colors[i], colors[j]);
                if (relationship === 'complementary' || relationship === 'analogous') {
                    harmonyScore += 5;
                }
            }
        }
        
        return Math.min(harmonyScore, 20);
    }
    
    getColorRelationship(color1, color2) {
        // Simplified color relationship detection
        const hue1 = this.getHue(color1);
        const hue2 = this.getHue(color2);
        
        if (hue1 === null || hue2 === null) return 'unknown';
        
        const hueDiff = Math.abs(hue1 - hue2);
        
        if (hueDiff > 150 && hueDiff < 210) {
            return 'complementary';
        } else if (hueDiff < 60) {
            return 'analogous';
        }
        
        return 'other';
    }
    
    getHue(hexColor) {
        if (!hexColor || !hexColor.startsWith('#')) return null;
        
        const r = parseInt(hexColor.substr(1, 2), 16) / 255;
        const g = parseInt(hexColor.substr(3, 2), 16) / 255;
        const b = parseInt(hexColor.substr(5, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        if (diff === 0) return 0;
        
        let hue;
        if (max === r) {
            hue = ((g - b) / diff) % 6;
        } else if (max === g) {
            hue = (b - r) / diff + 2;
        } else {
            hue = (r - g) / diff + 4;
        }
        
        return hue * 60;
    }
    
    calculateColorConsistency(elements) {
        const colorUsage = new Map();
        
        elements.forEach(el => {
            const bgColor = this.normalizeColor(el.element.style.backgroundColor);
            const textColor = this.normalizeColor(el.element.style.color);
            
            if (bgColor) {
                colorUsage.set(bgColor, (colorUsage.get(bgColor) || 0) + 1);
            }
            if (textColor) {
                colorUsage.set(textColor, (colorUsage.get(textColor) || 0) + 1);
            }
        });
        
        const totalUsage = Array.from(colorUsage.values()).reduce((sum, count) => sum + count, 0);
        const repeatedUsage = Array.from(colorUsage.values()).filter(count => count > 1).reduce((sum, count) => sum + count, 0);
        
        return totalUsage > 0 ? (repeatedUsage / totalUsage) * 20 : 0;
    }
    
    calculateReadability(textElements) {
        let score = 0;
        
        textElements.forEach(el => {
            const fontSize = parseInt(el.element.style.fontSize) || 16;
            const color = el.element.style.color;
            const bgColor = el.element.style.backgroundColor;
            
            // Font size check
            if (fontSize >= 14) {
                score += 2;
            }
            
            // Contrast check (simplified)
            if (this.hasGoodContrast(color, bgColor)) {
                score += 3;
            }
        });
        
        return Math.min(score, 15);
    }
    
    hasGoodContrast(textColor, bgColor) {
        // Simplified contrast check
        if (!textColor || !bgColor) return true;
        
        const textLuminance = this.getLuminance(textColor);
        const bgLuminance = this.getLuminance(bgColor);
        
        if (textLuminance === null || bgLuminance === null) return true;
        
        const ratio = textLuminance > bgLuminance ? 
            (textLuminance + 0.05) / (bgLuminance + 0.05) :
            (bgLuminance + 0.05) / (textLuminance + 0.05);
        
        return ratio >= 4.5; // WCAG AA standard
    }
    
    getLuminance(color) {
        const hex = this.normalizeColor(color);
        if (!hex || !hex.startsWith('#')) return null;
        
        const r = parseInt(hex.substr(1, 2), 16) / 255;
        const g = parseInt(hex.substr(3, 2), 16) / 255;
        const b = parseInt(hex.substr(5, 2), 16) / 255;
        
        const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        
        return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
    }
    
    isConsistentSpacing(values) {
        if (values.length < 2) return true;
        
        const tolerance = 4; // 4px tolerance
        const baseValue = values[0];
        
        return values.every(value => Math.abs(value - baseValue) <= tolerance);
    }
    
    calculateWhiteSpaceScore(elements) {
        // Check if elements have breathing room
        let score = 0;
        const canvasArea = 1200 * 800; // Approximate canvas area
        const elementArea = elements.reduce((total, el) => {
            return total + (el.element.offsetWidth * el.element.offsetHeight);
        }, 0);
        
        const density = elementArea / canvasArea;
        
        if (density < 0.3) {
            score = 15; // Good white space
        } else if (density < 0.5) {
            score = 10; // Acceptable
        } else if (density < 0.7) {
            score = 5; // Crowded
        } else {
            score = 0; // Too crowded
        }
        
        return score;
    }
    
    calculateElementConsistency(elements, properties) {
        if (elements.length < 2) return 0;
        
        let consistencyScore = 0;
        
        properties.forEach(prop => {
            const values = elements.map(el => el.element.style[prop] || '').filter(v => v);
            const uniqueValues = [...new Set(values)];
            
            if (uniqueValues.length === 1 && values.length > 1) {
                consistencyScore += 20 / properties.length;
            }
        });
        
        return consistencyScore;
    }
    
    calculateOverallConsistency(elements) {
        // Check for consistent styling patterns across all elements
        let score = 0;
        
        // Border radius consistency
        const borderRadii = elements.map(el => parseInt(el.element.style.borderRadius) || 0);
        const uniqueRadii = [...new Set(borderRadii)];
        if (uniqueRadii.length <= 3) {
            score += 10;
        }
        
        // Consistent use of shadows
        const shadows = elements.map(el => el.element.style.boxShadow || '').filter(s => s);
        if (shadows.length === 0 || shadows.length === elements.length) {
            score += 5;
        }
        
        return score;
    }
    
    updateDisplay() {
        // Update score display
        const scoreElement = this.ratingDisplay.querySelector('.score');
        if (scoreElement) {
            scoreElement.textContent = this.currentRating;
        }
        
        // Update stars
        const stars = this.ratingDisplay.querySelectorAll('.stars i');
        const filledStars = Math.round(this.currentRating / 20);
        
        stars.forEach((star, index) => {
            if (index < filledStars) {
                star.className = 'fas fa-star';
            } else {
                star.className = 'far fa-star';
            }
        });
        
        // Update metrics
        this.updateMetricsDisplay();
    }
    
    updateMetricsDisplay() {
        const metrics = this.metricsDisplay.querySelectorAll('.metric');
        
        metrics.forEach(metric => {
            const label = metric.querySelector('.metric-label').textContent.toLowerCase();
            const valueElement = metric.querySelector('.metric-value');
            
            let score = 0;
            let ratingText = 'Fair';
            
            switch (label) {
                case 'layout:':
                    score = this.metrics.layout;
                    break;
                case 'colors:':
                    score = this.metrics.colors;
                    break;
                case 'typography:':
                    score = this.metrics.typography;
                    break;
            }
            
            // Determine rating text and class
            if (score >= 80) {
                ratingText = 'Excellent';
                valueElement.className = 'metric-value excellent';
            } else if (score >= 60) {
                ratingText = 'Good';
                valueElement.className = 'metric-value good';
            } else {
                ratingText = 'Fair';
                valueElement.className = 'metric-value fair';
            }
            
            valueElement.textContent = ratingText;
        });
    }
    
    resetRating() {
        this.currentRating = 0;
        this.metrics = {
            layout: 0,
            colors: 0,
            typography: 0,
            spacing: 0,
            consistency: 0
        };
        this.updateDisplay();
    }
    
    getRating() {
        return {
            overall: this.currentRating,
            metrics: { ...this.metrics }
        };
    }
}
