/**
 * Enhanced JavaScript for Rajasthan Seva Portal
 * Features: Theme switching, particle animations, typing effects, 3D interactions
 */

// ================================
// GLOBAL VARIABLES & INITIALIZATION
// ================================

const PortalApp = {
    theme: localStorage.getItem('theme') || 'light',
    particles: [],
    stats: [],
    isAnimating: false,
    
    init() {
        this.initTheme();
        this.initNavigation();
        this.initParticleSystem();
        this.initTypingEffect();
        this.initScrollAnimations();
        this.initStatCounters();
        this.initTiltEffects();
        this.initProgressBars();
        this.bindEvents();
    }
};

// ================================
// THEME SYSTEM
// ================================

PortalApp.initTheme = function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon(themeIcon);
    
    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.updateThemeIcon(themeIcon);
        this.animateThemeTransition();
    });
};

PortalApp.updateThemeIcon = function(icon) {
    icon.className = this.theme === 'light' ? 'fas fa-moon theme-icon' : 'fas fa-sun theme-icon';
};

PortalApp.animateThemeTransition = function() {
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
};

// ================================
// NAVIGATION SYSTEM
// ================================

PortalApp.initNavigation = function() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    // Navbar scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        // Add/remove glassmorphism effect
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Mobile menu toggle
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            this.animateMobileMenuOpen();
        });
        
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
        
        // Close on link click
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

PortalApp.animateMobileMenuOpen = function() {
    const menuItems = document.querySelectorAll('.mobile-nav-link');
    menuItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-50px)';
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 100);
    });
};

// ================================
// PARTICLE SYSTEM
// ================================

PortalApp.initParticleSystem = function() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    this.resizeCanvas(canvas);
    
    // Create particles
    this.createParticles(canvas);
    
    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.updateParticles(ctx, canvas);
        this.drawParticles(ctx);
        requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        this.resizeCanvas(canvas);
    });
    
    // Mouse interaction
    this.initParticleInteraction(canvas);
};

PortalApp.resizeCanvas = function(canvas) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
};

PortalApp.createParticles = function(canvas) {
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    this.particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        this.particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: this.getParticleColor()
        });
    }
};

PortalApp.getParticleColor = function() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    return colors[Math.floor(Math.random() * colors.length)];
};

PortalApp.updateParticles = function(ctx, canvas) {
    this.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Pulse effect
        particle.opacity = 0.2 + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.3;
    });
};

PortalApp.drawParticles = function(ctx) {
    this.particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Draw connections
        this.drawConnections(ctx, particle);
    });
};

PortalApp.drawConnections = function(ctx, particle) {
    this.particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (100 - distance) / 100 * 0.1;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.stroke();
        }
    });
};

PortalApp.initParticleInteraction = function(canvas) {
    let mouseX = 0;
    let mouseY = 0;
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        // Attract particles to mouse
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                particle.vx += dx * 0.00005;
                particle.vy += dy * 0.00005;
            }
        });
    });
};

// ================================
// TYPING EFFECT
// ================================

PortalApp.initTypingEffect = function() {
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;
    
    const texts = [
        "Experience transparent, efficient governance with our modern digital platform.",
        "Submit complaints, track progress, and engage with government services seamlessly.",
        "Your voice matters - help us build a better Rajasthan together.",
        "Fast, secure, and citizen-centric digital solutions for everyone."
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const typeSpeed = 50;
    const deleteSpeed = 30;
    const pauseDuration = 2000;
    
    const type = () => {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 500);
                return;
            }
        } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentText.length) {
                setTimeout(() => {
                    isDeleting = true;
                    type();
                }, pauseDuration);
                return;
            }
        }
        
        setTimeout(type, isDeleting ? deleteSpeed : typeSpeed);
    };
    
    // Start typing effect after a delay
    setTimeout(type, 1000);
};

// ================================
// SCROLL ANIMATIONS
// ================================

PortalApp.initScrollAnimations = function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Trigger specific animations
                if (entry.target.classList.contains('stat-card-modern')) {
                    this.animateStatCard(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.animate-fadeInUp, .stat-card-modern, .card').forEach(el => {
        observer.observe(el);
    });
};

PortalApp.animateStatCard = function(card) {
    const progressBar = card.querySelector('.progress-bar');
    const progress = progressBar.dataset.progress;
    
    setTimeout(() => {
        progressBar.style.width = progress + '%';
    }, 500);
};

// ================================
// STATISTIC COUNTERS
// ================================

PortalApp.initStatCounters = function() {
    const statNumbers = document.querySelectorAll('.stat-number-modern[data-count]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                this.animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
};

PortalApp.animateCounter = function(element) {
    const target = parseFloat(element.dataset.count);
    const isDecimal = element.dataset.decimal === 'true';
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
        current += increment;
        step++;
        
        if (step >= steps) {
            current = target;
            clearInterval(timer);
        }
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        // Add suffix for percentage
        if (element.parentElement.querySelector('.stat-label-modern').textContent.includes('Satisfaction')) {
            element.textContent += '%';
        }
    }, duration / steps);
};

// ================================
// 3D TILT EFFECTS
// ================================

PortalApp.initTiltEffects = function() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            this.handleTiltEnter(e.target);
        });
        
        element.addEventListener('mousemove', (e) => {
            this.handleTiltMove(e, e.target);
        });
        
        element.addEventListener('mouseleave', (e) => {
            this.handleTiltLeave(e.target);
        });
    });
};

PortalApp.handleTiltEnter = function(element) {
    element.style.transition = 'none';
};

PortalApp.handleTiltMove = function(event, element) {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
};

PortalApp.handleTiltLeave = function(element) {
    element.style.transition = 'transform 0.3s ease';
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
};

// ================================
// PROGRESS BARS
// ================================

PortalApp.initProgressBars = function() {
    const progressBars = document.querySelectorAll('.progress-bar[data-progress]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                const progress = entry.target.dataset.progress;
                setTimeout(() => {
                    entry.target.style.width = progress + '%';
                    entry.target.classList.add('animated');
                }, 500);
            }
        });
    }, observerOptions);
    
    progressBars.forEach(bar => observer.observe(bar));
};

// ================================
// EVENT BINDINGS
// ================================

PortalApp.bindEvents = function() {
    // Notification button
    const notificationBtn = document.getElementById('notifications');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', this.showNotificationPanel);
    }
    
    // CTA button ripple effect
    document.querySelectorAll('.cta-primary').forEach(button => {
        button.addEventListener('click', this.createRippleEffect);
    });
    
    // Card hover effects
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', this.cardHoverEnter);
        card.addEventListener('mouseleave', this.cardHoverLeave);
    });
    
    // Scroll to top functionality
    this.initScrollToTop();
    
    // Keyboard accessibility
    this.initKeyboardNavigation();
    
    // Initialize AI Chatbot
    this.initChatbot();
};

PortalApp.showNotificationPanel = function() {
    // Create notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="notification-list">
            <div class="notification-item">
                <i class="fas fa-check-circle text-green-500"></i>
                <span>Your complaint #GRV2024001 has been resolved</span>
            </div>
            <div class="notification-item">
                <i class="fas fa-info-circle text-blue-500"></i>
                <span>New feature: Track complaint status in real-time</span>
            </div>
            <div class="notification-item">
                <i class="fas fa-bell text-yellow-500"></i>
                <span>System maintenance scheduled for tonight</span>
            </div>
        </div>
    `;
    
    // Add styles
    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 350px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 16px;
        padding: 0;
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        box-shadow: var(--shadow-3d);
    `;
    
    document.body.appendChild(panel);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (panel.parentElement) {
            panel.remove();
        }
    }, 5000);
};

PortalApp.createRippleEffect = function(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
};

PortalApp.cardHoverEnter = function(event) {
    const card = event.currentTarget;
    card.style.transform = 'translateY(-5px) scale(1.02)';
    card.style.boxShadow = 'var(--shadow-3d-hover)';
};

PortalApp.cardHoverLeave = function(event) {
    const card = event.currentTarget;
    card.style.transform = 'translateY(0) scale(1)';
    card.style.boxShadow = '';
};

PortalApp.initScrollToTop = function() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-gradient);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: var(--transition-smooth);
        z-index: 1000;
        box-shadow: var(--shadow-3d);
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

PortalApp.initKeyboardNavigation = function() {
    document.addEventListener('keydown', (e) => {
        // Theme toggle with 'T' key
        if (e.key === 't' || e.key === 'T') {
            document.getElementById('themeToggle').click();
        }
        
        // Mobile menu toggle with 'M' key
        if (e.key === 'm' || e.key === 'M') {
            document.getElementById('mobileToggle').click();
        }
        
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            }
        }
    });
};

// ================================
// UTILITY FUNCTIONS
// ================================

PortalApp.utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },
    
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
};

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

// Preload critical resources
PortalApp.preloadResources = function() {
    const criticalImages = [
        'https://images.unsplash.com/photo-1594736797933-d0801ba2fe65'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

// Lazy load non-critical content
PortalApp.lazyLoadContent = function() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.src = element.dataset.lazy;
                element.removeAttribute('data-lazy');
                lazyObserver.unobserve(element);
            }
        });
    });
    
    lazyElements.forEach(element => lazyObserver.observe(element));
};

// ================================
// CSS KEYFRAMES FOR ANIMATIONS
// ================================

const addCSSAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-panel {
            overflow: hidden;
        }
        
        .notification-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notification-list {
            padding: 1rem;
        }
        
        .notification-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification-item:last-child {
            border-bottom: none;
        }
        
        .close-btn {
            background: none;
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
        }
        
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    `;
    document.head.appendChild(style);
};

// ================================
// AI CHATBOT
// ================================

PortalApp.initChatbot = function() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatClose = document.getElementById('chatClose');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatNotification = document.getElementById('chatNotification');
    
    if (!chatbotToggle) return;
    
    let isOpen = false;
    
    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => this.toggleChatbot());
    chatClose?.addEventListener('click', () => this.toggleChatbot());
    
    // Send message functionality
    sendBtn?.addEventListener('click', () => this.sendMessage());
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    });
    
    this.chatbotState = {
        isOpen: false,
        chatbotWindow,
        chatInput,
        chatMessages,
        chatNotification
    };
};

PortalApp.toggleChatbot = function() {
    this.chatbotState.isOpen = !this.chatbotState.isOpen;
    if (this.chatbotState.isOpen) {
        this.chatbotState.chatbotWindow?.classList.add('active');
        this.chatbotState.chatNotification?.style.setProperty('display', 'none');
        this.chatbotState.chatInput?.focus();
    } else {
        this.chatbotState.chatbotWindow?.classList.remove('active');
    }
};

PortalApp.sendMessage = function() {
    const message = this.chatbotState.chatInput?.value.trim();
    if (!message || !this.chatbotState.chatMessages) return;
    
    // Add user message
    this.addMessage(message, 'user');
    this.chatbotState.chatInput.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Simulate AI response
    setTimeout(() => {
        this.hideTypingIndicator();
        const response = this.generateAIResponse(message);
        this.addMessage(response, 'bot');
    }, 1500 + Math.random() * 1000);
};

PortalApp.addMessage = function(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textP = document.createElement('p');
    textP.textContent = text;
    contentDiv.appendChild(textP);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    this.chatbotState.chatMessages.appendChild(messageDiv);
    this.chatbotState.chatMessages.scrollTop = this.chatbotState.chatMessages.scrollHeight;
};

PortalApp.showTypingIndicator = function() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span style="animation: typing 1.4s infinite ease-in-out"></span>
                <span style="animation: typing 1.4s infinite ease-in-out; animation-delay: 0.2s"></span>
                <span style="animation: typing 1.4s infinite ease-in-out; animation-delay: 0.4s"></span>
            </div>
        </div>
    `;
    
    this.chatbotState.chatMessages.appendChild(typingDiv);
    this.chatbotState.chatMessages.scrollTop = this.chatbotState.chatMessages.scrollHeight;
};

PortalApp.hideTypingIndicator = function() {
    const typingIndicator = this.chatbotState.chatMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
};

PortalApp.generateAIResponse = function(userMessage) {
    const responses = {
        'hello': 'Hello! How can I assist you with your grievance today?',
        'hi': 'Hi there! I\'m here to help you with any questions about the portal.',
        'help': 'I can help you with filing complaints, tracking status, understanding the process, and more. What would you like to know?',
        'complaint': 'To file a new complaint, click on "File Complaint" button. You\'ll need to provide details about the issue, select the appropriate department, and upload any supporting documents.',
        'track': 'You can track your complaint status by clicking "Track Status" and entering your complaint ID or reference number.',
        'status': 'To check your complaint status, you\'ll need your complaint ID. Go to the "Track Status" section and enter the ID you received when filing.',
        'documents': 'You may need identity proof, address proof, and relevant documents related to your complaint. Photos or videos can also be uploaded as evidence.',
        'time': 'Most complaints are resolved within 7-15 working days, depending on the department and complexity of the issue.',
        'contact': 'You can reach us at 181 (toll-free) or email help@rajasthan.gov.in for urgent assistance.',
        'departments': 'We handle complaints for Roads & Transport, Electricity, Water Supply, Education, Healthcare, Police, Revenue, and other government departments.',
        'emergency': 'For emergencies, please call 100 (Police), 102 (Ambulance), or 101 (Fire). For urgent government matters, call 181.',
        'hours': 'Our portal is available 24/7 online. Phone support is available from 9 AM to 6 PM, Monday to Saturday.',
        'thanks': 'You\'re welcome! Is there anything else I can help you with?',
        'thank you': 'You\'re welcome! Feel free to ask if you have more questions.'
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(responses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }
    
    // Default responses
    const defaultResponses = [
        'I understand your concern. Could you please provide more specific details so I can assist you better?',
        'For specific issues like this, I recommend filing a complaint through our portal or contacting our support team at 181.',
        'That\'s a good question! You might find the answer in our FAQ section, or feel free to contact our support team for detailed guidance.',
        'I\'d be happy to help with that. Could you clarify what specific information you\'re looking for?',
        'For complex queries like this, our human support team at 181 would be better equipped to assist you comprehensively.'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Quick reply function for chatbot
window.sendQuickReply = function(message) {
    const chatInput = document.getElementById('chatInput');
    if (chatInput && PortalApp.chatbotState) {
        chatInput.value = message;
        PortalApp.sendMessage();
    }
};

// ================================
// INITIALIZATION
// ================================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addCSSAnimations();
    PortalApp.preloadResources();
    PortalApp.init();
    
    // Show loading completion
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        PortalApp.isAnimating = false;
    } else {
        // Resume animations when tab becomes visible
        PortalApp.isAnimating = true;
    }
});

// Export for global access
window.PortalApp = PortalApp;
