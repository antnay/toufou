// Initializes the UI system and hides default HTML elements
export function initUI(): void {
    const title = document.getElementById('title');
    const btn = document.getElementById('btn');
    
    if (title) {
        title.style.display = 'none';
    }
    if (btn) {
        btn.style.display = 'none';
    }
}

// Initialize UI when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUI);
    } else {
        initUI();
    }
}