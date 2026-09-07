// ===== Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    htmlElement.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== Smooth scroll for in-page links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMobileNav();
        }
    });
});

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

function closeMobileNav() {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
});

// ===== Scroll progress bar =====
const scrollProgress = document.getElementById('scroll-progress');
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
}

// ===== Active nav link + back-to-top visibility =====
const sections = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const backToTop = document.getElementById('back-to-top');

function updateActiveNav() {
    let currentId = sections[0]?.id;
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
        if (section.offsetTop <= scrollPos) {
            currentId = section.id;
        }
    });
    navAnchors.forEach(a => {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + currentId);
    });

    if (window.scrollY > 500) {
        backToTop.classList.add('is-visible');
    } else {
        backToTop.classList.remove('is-visible');
    }
}

window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateActiveNav();
});
updateScrollProgress();
updateActiveNav();

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Hero role cycling text =====
const roleCycle = document.getElementById('role-cycle');
const roles = ['machine learning', 'cybersecurity', 'actuarial modeling', 'data science'];
let roleIndex = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (roleCycle && !prefersReducedMotion) {
    setInterval(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleCycle.style.opacity = '0';
        setTimeout(() => {
            roleCycle.textContent = roles[roleIndex];
            roleCycle.style.opacity = '1';
        }, 200);
    }, 2600);
    roleCycle.style.transition = 'opacity 0.2s ease';
}

// ===== Hero network canvas background =====
const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    let nodes = [];
    let animationId = null;

    function getAccentColor() {
        return getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#2563eb';
    }

    function hexToRgb(hex) {
        const parsed = hex.replace('#', '');
        const bigint = parseInt(parsed.length === 3
            ? parsed.split('').map(c => c + c).join('')
            : parsed, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    function resizeCanvas() {
        const rect = heroSection.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        initNodes(rect.width, rect.height);
    }

    function initNodes(width, height) {
        const count = Math.min(46, Math.round((width * height) / 22000));
        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25
        }));
    }

    function drawFrame() {
        const rect = heroSection.getBoundingClientRect();
        const [r, g, b] = hexToRgb(getAccentColor());
        ctx.clearRect(0, 0, rect.width, rect.height);

        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 0 || node.x > rect.width) node.vx *= -1;
            if (node.y < 0 || node.y > rect.height) node.vy *= -1;
        });

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.12 * (1 - dist / 140)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        nodes.forEach(node => {
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        animationId = requestAnimationFrame(drawFrame);
    }

    if (!prefersReducedMotion) {
        resizeCanvas();
        drawFrame();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(animationId);
            resizeCanvas();
            drawFrame();
        });
    }
}

// ===== Project filters =====
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const filterEmpty = document.getElementById('filter-empty');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('is-active'));
        button.classList.add('is-active');
        const filter = button.dataset.filter;
        let visibleCount = 0;

        projectCards.forEach(card => {
            const matches = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('is-hidden', !matches);
            if (matches) visibleCount++;
        });

        filterEmpty.hidden = visibleCount !== 0;
    });
});

// ===== Project details expand/collapse =====
document.querySelectorAll('.details-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
        const card = toggle.closest('.project-card');
        const isExpanded = card.classList.toggle('is-expanded');
        toggle.setAttribute('aria-expanded', String(isExpanded));
        toggle.firstChild.textContent = isExpanded ? 'Hide ' : 'Details ';
    });
});

// ===== Skill -> project cross-link =====
document.querySelectorAll('.skill-list li[data-skill]').forEach(item => {
    const activate = () => {
        const skill = item.dataset.skill;

        // Reset any active filter to "all" so matches are visible
        filterButtons.forEach(b => b.classList.remove('is-active'));
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('is-active');
        projectCards.forEach(card => card.classList.remove('is-hidden'));
        filterEmpty.hidden = true;

        let firstMatch = null;
        projectCards.forEach(card => {
            const badges = card.querySelectorAll('.tech-badge');
            let matched = false;
            badges.forEach(badge => {
                const isMatch = badge.textContent.trim().toLowerCase().includes(skill.toLowerCase());
                badge.classList.toggle('is-matched', isMatch);
                if (isMatch) matched = true;
            });
            card.classList.toggle('is-highlighted', matched);
            if (matched && !firstMatch) firstMatch = card;
        });

        if (firstMatch) {
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                projectCards.forEach(card => card.classList.remove('is-highlighted'));
                document.querySelectorAll('.tech-badge.is-matched').forEach(b => b.classList.remove('is-matched'));
            }, 2400);
        }
    };

    item.addEventListener('click', activate);
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
        }
    });
});

// ===== Copy email + toast =====
const copyEmailBtn = document.getElementById('copy-email');
const toast = document.getElementById('toast');
let toastTimeout = null;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
        const email = copyEmailBtn.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copied to clipboard');
        } catch (err) {
            showToast('Copy failed — email is ' + email);
        }
    });
}