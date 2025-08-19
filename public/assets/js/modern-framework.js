// Modern JavaScript Framework for Rajasthan Seva Portal

class ModernFramework {
  constructor() {
    this.init();
    this.setupNavbar();
    this.setupAnimations();
    this.setupParticles();
    this.setupCounters();
    this.setupFormValidation();
    this.setupNotifications();
    this.setupTheme();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }

  onDOMReady() {
    this.setupScrollEffects();
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
    this.setupTypewriter();
  }

  // Navbar functionality
  setupNavbar() {
    const navbar = document.querySelector('.navbar-modern');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (!navbar) return;

    // Scroll effect for navbar
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollY = currentScrollY;
    });

    // Mobile menu toggle
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
      });

      // Close mobile menu when clicking on a link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          mobileToggle.classList.remove('active');
        });
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
          navMenu.classList.remove('active');
          mobileToggle.classList.remove('active');
        }
      });
    }
  }

  // Scroll effects and parallax
  setupScrollEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const rate = scrolled * -0.5;
        element.style.transform = `translateY(${rate}px)`;
      });
    });
  }

  // Intersection Observer for animations
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          
          // Trigger counter animation if it's a counter element
          if (entry.target.hasAttribute('data-count')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('[class*="animate-"], [data-count]').forEach(el => {
      // Remove animation class initially
      el.classList.remove('animate-fadeInUp');
      observer.observe(el);
    });
  }

  // Smooth scrolling for anchor links
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for fixed navbar
          
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Particle system
  setupParticles() {
    const particleContainer = document.getElementById('particleCanvas');
    if (!particleContainer) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    particleContainer.appendChild(canvas);

    let particles = [];
    const particleCount = 50;

    function resize() {
      canvas.width = particleContainer.offsetWidth;
      canvas.height = particleContainer.offsetHeight;
    }

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = Math.random() * 3 + 1;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    Particle.prototype.update = function() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    };

    Particle.prototype.draw = function() {
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    };

    function init() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100 * 0.2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    resize();
    init();
    animate();

    window.addEventListener('resize', () => {
      resize();
      init();
    });
  }

  // Counter animations
  setupCounters() {
    // This will be triggered by intersection observer
  }

  animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      if (element.hasAttribute('data-decimal')) {
        element.textContent = current.toFixed(1);
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  // Typewriter effect
  setupTypewriter() {
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    
    typewriterElements.forEach(element => {
      const text = element.textContent;
      element.textContent = '';
      
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
        }
      }, 50);
    });
  }

  // Form validation
  setupFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
      
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    // Minimum length validation
    if (field.hasAttribute('minlength') && value) {
      const minLength = parseInt(field.getAttribute('minlength'));
      if (value.length < minLength) {
        isValid = false;
        errorMessage = `Minimum ${minLength} characters required`;
      }
    }

    this.showFieldValidation(field, isValid, errorMessage);
    return isValid;
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  showFieldValidation(field, isValid, message) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    if (!isValid) {
      field.classList.add('error');
      const errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.textContent = message;
      field.parentNode.appendChild(errorElement);
    } else {
      field.classList.remove('error');
      field.classList.add('success');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error', 'success');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  // Notification system
  setupNotifications() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.className = 'notification-container';
    this.notificationContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.notificationContainer);
  }

  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: ${this.getNotificationColor(type)};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 10px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      pointer-events: all;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 400px;
    `;

    const icon = this.getNotificationIcon(type);
    notification.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
      <button onclick="this.parentNode.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; margin-left: auto;">×</button>
    `;

    this.notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  getNotificationColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };
    return colors[type] || colors.info;
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
  }

  // Theme system
  setupTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Loading states
  showLoading(element, text = 'Loading...') {
    element.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
        <div class="loading"></div>
        <span>${text}</span>
      </div>
    `;
  }

  hideLoading(element, originalContent) {
    element.innerHTML = originalContent;
  }

  // Modal system
  createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      backdrop-filter: blur(5px);
    `;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;

    modalContent.innerHTML = `
      <div class="modal-header" style="margin-bottom: 16px;">
        <h3 style="margin: 0; color: var(--gray-800);">${title}</h3>
        <button class="modal-close" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--gray-500);">×</button>
      </div>
      <div class="modal-body" style="margin-bottom: 24px;">
        ${content}
      </div>
      <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
        ${actions.map(action => `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick}">${action.text}</button>`).join('')}
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Animate in
    setTimeout(() => {
      modalContent.style.transform = 'scale(1)';
    }, 100);

    // Close handlers
    const closeModal = () => {
      modalContent.style.transform = 'scale(0.9)';
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    return modal;
  }

  // Utility functions
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  throttle(func, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func.apply(this, args);
      }
    };
  }

  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options
    }).format(new Date(date));
  }

  formatNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
  }

  // API helper
  async apiCall(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (localStorage.getItem('token')) {
      defaultOptions.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }

    try {
      const response = await fetch(endpoint, { ...defaultOptions, ...options });
      
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login.html';
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.showNotification('Network error occurred. Please try again.', 'error');
      throw error;
    }
  }
}

// Initialize the framework
window.ModernFramework = new ModernFramework();

// Add some global utilities
window.showNotification = (message, type, duration) => {
  window.ModernFramework.showNotification(message, type, duration);
};

window.createModal = (title, content, actions) => {
  return window.ModernFramework.createModal(title, content, actions);
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernFramework;
}
