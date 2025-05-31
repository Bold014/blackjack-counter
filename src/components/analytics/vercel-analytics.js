// Vercel Analytics Integration
// This script initializes Vercel Analytics for the HTML-based project

(function() {
    // Only initialize analytics in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Vercel Analytics: Skipping analytics in development environment');
        return;
    }

    // Check if analytics is already loaded
    if (window.va) {
        console.log('Vercel Analytics: Already loaded');
        return;
    }

    // Dynamically load the Vercel Analytics script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vercel/analytics@1.5.0/dist/index.js';
    script.async = true;
    script.onload = function() {
        // Initialize analytics after script loads
        if (window.va) {
            console.log('Vercel Analytics: Initialized successfully');
            
            // Track initial page view
            window.va('pageview', {
                path: window.location.pathname,
                title: document.title
            });
        }
    };
    script.onerror = function() {
        console.error('Vercel Analytics: Failed to load analytics script');
    };

    // Add script to head
    document.head.appendChild(script);

    // Track navigation events for SPAs (if applicable)
    let currentPath = window.location.pathname;
    
    // Override pushState and replaceState to track programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
        originalPushState.apply(history, arguments);
        trackPageView();
    };
    
    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        trackPageView();
    };
    
    // Track back/forward navigation
    window.addEventListener('popstate', trackPageView);
    
    function trackPageView() {
        const newPath = window.location.pathname;
        if (newPath !== currentPath && window.va) {
            currentPath = newPath;
            window.va('pageview', {
                path: newPath,
                title: document.title
            });
        }
    }

    // Track custom events (utility function)
    window.trackEvent = function(eventName, properties = {}) {
        if (window.va) {
            window.va('event', eventName, properties);
        } else {
            console.log('Vercel Analytics: Event queued -', eventName, properties);
        }
    };

    console.log('Vercel Analytics: Initialization script loaded');
})(); 