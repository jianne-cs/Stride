// darkmode.js

// Initialize dark mode on page load
function initDarkMode() {
    console.log("Initializing dark mode..."); // Debug log
    const savedMode = localStorage.getItem('darkMode');
    console.log("Saved mode:", savedMode); // Debug log
    
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        console.log("Dark mode enabled"); // Debug log
    } else {
        document.body.classList.remove('dark-mode');
        console.log("Dark mode disabled"); // Debug log
    }
}

// Toggle dark mode (called from profile.html)
function toggleDarkMode(element) {
    element.classList.toggle('active');
    
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        console.log("Dark mode disabled"); // Debug log
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        console.log("Dark mode enabled"); // Debug log
    }
}

// Update stress indicator dots
function updateStressIndicator() {
    const savedStress = localStorage.getItem('stressLevel');
    const dots = document.querySelectorAll('.dot');
    const stressLevel = savedStress ? parseInt(savedStress) : 3;
    
    dots.forEach((dot, index) => {
        if (index < stressLevel) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// Toggle any setting switch
function toggleSetting(element) {
    element.classList.toggle('active');
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing..."); // Debug log
    initDarkMode();
    updateStressIndicator();
});

// Also run when page loads (backup)
window.onload = function() {
    console.log("Window loaded, initializing..."); // Debug log
    initDarkMode();
    updateStressIndicator();
};