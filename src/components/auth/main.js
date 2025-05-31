// Clerk Integration - Using your publishable key
let clerk;
import { inject } from '@vercel/analytics';
 
inject();
window.addEventListener('load', async function () {
    try {
        // Wait for Clerk to be available
        if (typeof window.Clerk === 'undefined') {
            console.error('Clerk is not loaded');
            showErrorState();
            return;
        }
        
        // Clerk is auto-initialized with the data-clerk-publishable-key attribute
        clerk = window.Clerk;
        await clerk.load();

        console.log('Clerk loaded successfully', clerk);

        // Hide loading, show auth
        const loadingElement = document.getElementById('auth-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (clerk.user) {
            console.log('User is signed in:', clerk.user);
            showSignedInState();
            showTrainerNavButton();
            showProgressNavButton();
        } else {
            console.log('User is not signed in');
            showAuthOptions();
            hideTrainerNavButton();
            hideProgressNavButton();
        }
        
    } catch (error) {
        console.error('Error initializing Clerk:', error);
        showErrorState();
    }
});

function showErrorState() {
    const loadingElement = document.getElementById('auth-loading');
    if (loadingElement) {
        loadingElement.innerHTML = '<p style="color: #ff6b6b;">Error loading authentication. Please refresh the page.</p>';
    }
}

function showAuthOptions() {
    const container = document.getElementById('clerk-auth-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="auth-buttons">
            <button id="signup-btn" class="rainbow-button" style="width: 100%; margin-bottom: 15px;">
                Sign Up for Free Training
            </button>
            <button id="signin-btn" class="cta-primary" style="width: 100%;">
                <i class="fas fa-sign-in-alt"></i>
                Already have an account? Sign In
            </button>
        </div>
    `;

    // Add event listeners
    document.getElementById('signup-btn').addEventListener('click', () => showSignUpModal());
    document.getElementById('signin-btn').addEventListener('click', () => showSignInModal());
}

function showSignUpModal() {
    const container = document.getElementById('clerk-auth-container');
    if (!container) return;
    
    container.innerHTML = '<div id="clerk-sign-up"></div>';
    
    clerk.mountSignUp(document.getElementById('clerk-sign-up'), {
        appearance: {
            theme: 'dark',
            variables: {
                colorPrimary: '#f59e0b', // Orange/gold to match your theme
                colorBackground: '#0c1429', // Dark blue background
                colorText: '#ffffff',
                colorTextSecondary: 'rgba(255,255,255,0.7)',
                colorInputBackground: 'rgba(255,255,255,0.05)',
                colorInputText: '#ffffff',
                colorNeutral: '#1e293b',
                borderRadius: '8px',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '14px',
                fontWeight: '400'
            },
            elements: {
                card: {
                    backgroundColor: '#0c1429',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    padding: '2rem'
                },
                headerTitle: {
                    color: '#f59e0b',
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                },
                headerSubtitle: {
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                },
                formButtonPrimary: {
                    backgroundColor: '#f59e0b',
                    color: '#0c1429',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#d97706',
                        transform: 'translateY(-1px)'
                    }
                },
                formFieldInput: {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    '&:focus': {
                        borderColor: '#f59e0b',
                        boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
                    }
                },
                formFieldLabel: {
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px'
                },
                socialButtonsBlockButton: {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '12px',
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(245, 158, 11, 0.3)'
                    }
                },
                dividerLine: {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                },
                dividerText: {
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px'
                },
                footerActionLink: {
                    color: '#f59e0b',
                    '&:hover': {
                        color: '#d97706'
                    }
                }
            }
        },
        afterSignUpUrl: 'trainer.html',
        signInUrl: '#'
    });

    addBackButton();
}

function showSignInModal() {
    const container = document.getElementById('clerk-auth-container');
    if (!container) return;
    
    container.innerHTML = '<div id="clerk-sign-in"></div>';
    
    clerk.mountSignIn(document.getElementById('clerk-sign-in'), {
        appearance: {
            theme: 'dark',
            variables: {
                colorPrimary: '#f59e0b', // Orange/gold to match your theme
                colorBackground: '#0c1429', // Dark blue background
                colorText: '#ffffff',
                colorTextSecondary: 'rgba(255,255,255,0.7)',
                colorInputBackground: 'rgba(255,255,255,0.05)',
                colorInputText: '#ffffff',
                colorNeutral: '#1e293b',
                borderRadius: '8px',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '14px',
                fontWeight: '400'
            },
            elements: {
                card: {
                    backgroundColor: '#0c1429',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    padding: '2rem'
                },
                headerTitle: {
                    color: '#f59e0b',
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: '0.5rem'
                },
                headerSubtitle: {
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                },
                formButtonPrimary: {
                    backgroundColor: '#f59e0b',
                    color: '#0c1429',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: '#d97706',
                        transform: 'translateY(-1px)'
                    }
                },
                formFieldInput: {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontSize: '14px',
                    '&:focus': {
                        borderColor: '#f59e0b',
                        boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)'
                    }
                },
                formFieldLabel: {
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '6px'
                },
                socialButtonsBlockButton: {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '12px',
                    '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(245, 158, 11, 0.3)'
                    }
                },
                dividerLine: {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                },
                dividerText: {
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px'
                },
                footerActionLink: {
                    color: '#f59e0b',
                    '&:hover': {
                        color: '#d97706'
                    }
                }
            }
        },
        afterSignInUrl: 'trainer.html',
        signUpUrl: '#'
    });

    addBackButton();
}

function addBackButton() {
    const container = document.getElementById('clerk-auth-container');
    if (!container) return;
    
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '← Back to options';
    backBtn.className = 'cta-primary';
    backBtn.style.cssText = 'margin-top: 15px; width: 100%; background: rgba(255,255,255,0.1);';
    backBtn.onclick = showAuthOptions;
    container.appendChild(backBtn);
}

function showSignedInState() {
    const container = document.getElementById('clerk-auth-container');
    if (!container) return;
    
    const user = clerk.user;
    const firstName = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];
    
    container.innerHTML = `
        <div class="signed-in-state" style="text-align: center;">
            <div style="margin-bottom: 20px;">
                <h3 style="color: #4ecdc4; margin: 0;">Welcome back, ${firstName}! 👋</h3>
                <p style="margin: 10px 0; opacity: 0.8;">Ready to continue your training?</p>
            </div>
            <a href="trainer.html" class="rainbow-button" style="display: inline-block; width: 100%; margin-bottom: 15px; text-decoration: none;">
                Continue Training
            </a>
            <button id="sign-out-btn" class="cta-primary" style="width: 100%; background: rgba(255,107,107,0.2); border: 1px solid #ff6b6b;">
                Sign Out
            </button>
        </div>
    `;

    document.getElementById('sign-out-btn').addEventListener('click', async () => {
        await clerk.signOut();
        hideTrainerNavButton();
        showAuthOptions();
    });
}

// Helper functions to control trainer navigation button visibility
function showTrainerNavButton() {
    const trainerNavBtn = document.getElementById('trainer-nav-btn');
    if (trainerNavBtn) {
        trainerNavBtn.style.display = 'flex';
    }
}

function hideTrainerNavButton() {
    const trainerNavBtn = document.getElementById('trainer-nav-btn');
    if (trainerNavBtn) {
        trainerNavBtn.style.display = 'none';
    }
}

function showProgressNavButton() {
    const progressNavBtn = document.getElementById('progress-nav-btn');
    if (progressNavBtn) {
        progressNavBtn.style.display = 'flex';
    }
}

function hideProgressNavButton() {
    const progressNavBtn = document.getElementById('progress-nav-btn');
    if (progressNavBtn) {
        progressNavBtn.style.display = 'none';
    }
} 