// ===================================
// NAVIGATION
// ===================================
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Active nav link on scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===================================
// HERO SECTION - TYPING EFFECT
// ===================================
const typedText = document.querySelector('.typed-text');
const words = ['Developer', 'Designer', 'Freelancer', 'Creator'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
        typedText.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedText.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeEffect, 2000);
        return;
    }

    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
    }

    const typingSpeed = isDeleting ? 50 : 100;
    setTimeout(typeEffect, typingSpeed);
}

// Start typing effect
setTimeout(typeEffect, 1000);

// ===================================
// COUNTER ANIMATION
// ===================================
const statNumbers = document.querySelectorAll('.stat-number');

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
}

// Intersection Observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    counterObserver.observe(stat);
});

// ===================================
// SKILLS SECTION - TAB SWITCHING
// ===================================
const skillCategoryBtns = document.querySelectorAll('.skill-category-btn');
const skillCategoryContents = document.querySelectorAll('.skill-category-content');

skillCategoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');

        // Remove active class from all buttons and contents
        skillCategoryBtns.forEach(b => b.classList.remove('active'));
        skillCategoryContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.querySelector(`.skill-category-content[data-category="${category}"]`).classList.add('active');
    });
});

// Animate skill bars when in view
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const width = entry.target.style.width;
            entry.target.style.width = '0';
            setTimeout(() => {
                entry.target.style.width = width;
            }, 100);
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// ===================================
// PROJECTS SECTION - FILTERING
// ===================================
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter projects
        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    });
});

// ===================================
// CONTACT FORM
// ===================================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Create success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #DC143C 0%, #FF1744 100%);
        color: white;
        padding: 2rem 3rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(220, 20, 60, 0.4);
        z-index: 10000;
        text-align: center;
        animation: fadeInUp 0.5s ease;
    `;
    successMessage.innerHTML = `
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Message Sent! ✓</h3>
        <p style="opacity: 0.9;">Thank you for reaching out. I'll get back to you soon!</p>
    `;

    document.body.appendChild(successMessage);

    // Reset form
    contactForm.reset();

    // Remove success message after 3 seconds
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);

    // Log form data (in real application, send to backend)
    console.log('Form submitted:', { name, email, subject, message });
});

// ===================================
// SCROLL ANIMATIONS
// ===================================
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .project-card, .testimonial-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';

                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Initialize scroll animations
animateOnScroll();

// ===================================
// SMOOTH SCROLL ENHANCEMENT
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// CURSOR EFFECT (Optional Enhancement)
// ===================================
const cursor = document.createElement('div');
cursor.style.cssText = `
    width: 20px;
    height: 20px;
    border: 2px solid #DC143C;
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.2s ease, opacity 0.2s ease;
    opacity: 0;
`;
document.body.appendChild(cursor);

const cursorDot = document.createElement('div');
cursorDot.style.cssText = `
    width: 6px;
    height: 6px;
    background: #DC143C;
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 10000;
    transition: transform 0.1s ease;
    opacity: 0;
`;
document.body.appendChild(cursorDot);

document.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    cursorDot.style.left = (e.clientX - 3) + 'px';
    cursorDot.style.top = (e.clientY - 3) + 'px';
});

// Cursor hover effects
const interactiveElements = document.querySelectorAll('a, button, .service-card, .project-card');

interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
        cursorDot.style.transform = 'scale(1.5)';
    });

    element.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursorDot.style.transform = 'scale(1)';
    });
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
});

// ===================================
// PARALLAX EFFECT FOR HERO
// ===================================
window.addEventListener('scroll', () => {
    // Only apply parallax on desktop screens
    if (window.innerWidth > 768) {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');

        if (heroContent && heroImage) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    } else {
        // Reset transforms on mobile if they were set
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        if (heroContent) heroContent.style.transform = 'none';
        if (heroImage) heroImage.style.transform = 'none';
    }
});

// ===================================
// LOADING ANIMATION
// ===================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

console.log('Portfolio website loaded successfully! 🚀');
