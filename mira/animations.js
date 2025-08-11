// Lightweight reveal-on-scroll and stagger animations
// Initializes once per page

if (!window.__revealInit) {
  window.__revealInit = true;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OBSERVE_ATTR = 'data-animate';
  const STAGGER_ATTR = 'data-stagger';
  const SLIDE_ATTR = 'data-slide';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        target.classList.add('is-visible');

        // If the target is a stagger container, reveal its children with delays
        if (target.hasAttribute(STAGGER_ATTR)) {
          const selector = target.getAttribute(STAGGER_ATTR) || ':scope > *';
          const children = target.querySelectorAll(selector);
          children.forEach((el, index) => {
            el.style.setProperty('--d', `${index * 90}ms`);
            el.classList.add('is-visible');
          });
        }

        observer.unobserve(target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
  );

  function applyStaggerDelays() {
    document.querySelectorAll(`[${STAGGER_ATTR}]`).forEach((container) => {
      const selector = container.getAttribute(STAGGER_ATTR) || ':scope > *';
      const children = container.querySelectorAll(selector);
      children.forEach((el, index) => {
        if (!el.style.getPropertyValue('--d')) {
          el.style.setProperty('--d', `${index * 90}ms`);
        }
      });
    });
  }

  function init() {
    // Theme toggle (Olive Luxe) runs regardless of motion preference
    const THEME_KEY = 'mira-theme';
    const root = document.body;
    const toggleBtn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'olive') root.setAttribute('data-theme', 'olive');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'olive'));
      toggleBtn.addEventListener('click', () => {
        const isOlive = root.getAttribute('data-theme') === 'olive';
        if (isOlive) {
          root.removeAttribute('data-theme');
          localStorage.removeItem(THEME_KEY);
          toggleBtn.setAttribute('aria-pressed', 'false');
        } else {
          root.setAttribute('data-theme', 'olive');
          localStorage.setItem(THEME_KEY, 'olive');
          toggleBtn.setAttribute('aria-pressed', 'true');
        }
      });
    }

    if (prefersReduced) return;
    applyStaggerDelays();

    document.querySelectorAll(`[${OBSERVE_ATTR}]`).forEach((el) => observer.observe(el));
    document.querySelectorAll(`[${STAGGER_ATTR}]`).forEach((el) => observer.observe(el));
    document.querySelectorAll(`[${SLIDE_ATTR}]`).forEach((el) => observer.observe(el));

    // Loader hide logic
    (function handleLoader(){
      const loader = document.getElementById('site-loader');
      if (!loader) return;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hide = () => loader.classList.add('is-hidden');
      if (document.readyState === 'complete' || prefersReduced) {
        requestAnimationFrame(hide);
      } else {
        window.addEventListener('load', () => setTimeout(hide, 300));
      }
    })();

    // mobile menu interactions
    const burger = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-backdrop');
    if (burger && menu && backdrop) {
      const close = () => {
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
        backdrop.classList.remove('is-open');
        menu.hidden = true; backdrop.hidden = true;
      }
      const open = () => {
        burger.classList.add('is-active');
        burger.setAttribute('aria-expanded', 'true');
        menu.hidden = false; backdrop.hidden = false;
        requestAnimationFrame(() => { menu.classList.add('is-open'); backdrop.classList.add('is-open'); });
      }
      const toggle = () => {
        if (menu.classList.contains('is-open')) close(); else open();
      }
      burger.addEventListener('click', toggle);
      backdrop.addEventListener('click', close);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
      menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
    }

    // --- Enhance buttons/links behavior across site ---
    const isOnIndex = !!document.querySelector('.contact');

    // Assign stable IDs to sections on index for deep links
    if (isOnIndex) {
      const sectionMap = [
        ['about', '.about'],
        ['services', '.services'],
        ['projects', '.projects'],
        ['process', '.process'],
        ['contact', '.contact'],
      ];
      sectionMap.forEach(([id, sel]) => {
        const el = document.querySelector(sel);
        if (el && !el.id) el.id = id;
      });
    }

    function smoothScrollTo(selector) {
      const el = document.querySelector(selector);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    }

    // Contact-related CTAs
    document.querySelectorAll('a, button').forEach((el) => {
      const label = (el.textContent || '').trim().toLowerCase();

      // Contact me / Get in touch
      if (
        label.includes('contact') ||
        label.includes('get in touch') ||
        label.includes('get started') ||
        el.classList.contains('mobile-cta')
      ) {
        el.addEventListener('click', (e) => {
          // If anchor uses '#', prevent default
          if (el.tagName === 'A' && (el.getAttribute('href') || '#').startsWith('#')) {
            e.preventDefault();
          }
          if (isOnIndex) {
            if (!smoothScrollTo('#contact')) {
              // fallback mailto
              window.location.href = 'mailto:hello@example.com?subject=Project%20Inquiry&body=Hi%20Mira,';
            }
          } else {
            window.location.href = 'mira/index.html#contact';
          }
        });
      }

      // About link (supports "About" and "About me")
      if (label === 'about' || label.includes('about')) {
        el.addEventListener('click', (e) => {
          if (el.tagName === 'A' && (el.getAttribute('href') || '#').startsWith('#')) {
            e.preventDefault();
          }
          if (isOnIndex) {
            smoothScrollTo('#about');
          } else {
            window.location.href = 'mira/index.html#about';
          }
        });
      }

      // Home link when href is '#'
      if (label === 'home' && el.tagName === 'A' && (el.getAttribute('href') || '#') === '#') {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          if (isOnIndex) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.location.href = 'mira/index.html';
          }
        });
      }

      // Book a call -> mailto
      if (label.includes('book a call')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = 'mailto:hello@example.com?subject=Book%20a%20call&body=Hi%20Mira,%20I%27d%20like%20to%20book%20a%20call.';
        });
      }
    });

    // Category + buttons: provide a simple highlight toggle for user feedback
    document.querySelectorAll('.category-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.category-row');
        if (!row) return;
        const isActive = row.dataset.active === '1';
        row.dataset.active = isActive ? '0' : '1';
        // simple inline highlight feedback
        if (!isActive) {
          row.style.backgroundColor = '#101010';
          row.style.borderRadius = '12px';
          row.style.border = '1px solid #242424';
        } else {
          row.style.backgroundColor = '';
          row.style.borderRadius = '';
          row.style.border = '';
        }
      });
    });

    // Projects: lightweight modal for placeholder details
    function ensureLightbox() {
      let overlay = document.getElementById('lightbox-overlay');
      if (overlay) return overlay;
      overlay = document.createElement('div');
      overlay.id = 'lightbox-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:1000;';
      const panel = document.createElement('div');
      panel.id = 'lightbox-panel';
      panel.style.cssText = 'max-width:560px;width:90%;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:14px;padding:18px;color:#eaeaea;box-shadow:0 10px 28px rgba(0,0,0,.35)';
      overlay.appendChild(panel);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) hideLightbox(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideLightbox(); });
      document.body.appendChild(overlay);
      return overlay;
    }
    function showLightbox(titleText) {
      const overlay = ensureLightbox();
      const panel = overlay.querySelector('#lightbox-panel');
      panel.innerHTML = `<h3 style="margin:0 0 10px">${titleText || 'Project'}</h3><p style="margin:0 0 12px;color:#bdbdbd">Case study coming soon. Get in touch for details.</p><div style="display:flex;gap:10px"><a href="mailto:hello@example.com?subject=Project%20Inquiry" class="btn btn--light" style="text-decoration:none">Contact me</a><button id="lb-close" class="btn btn--ghost">Close</button></div>`;
      overlay.style.display = 'flex';
      const closeBtn = panel.querySelector('#lb-close');
      if (closeBtn) closeBtn.addEventListener('click', hideLightbox, { once: true });
    }
    function hideLightbox() {
      const overlay = document.getElementById('lightbox-overlay');
      if (overlay) overlay.style.display = 'none';
    }
    document.querySelectorAll('.project-card, .project-card__media, .project-card__title a').forEach((el) => {
      el.addEventListener('click', (e) => {
        const href = el.getAttribute('href');
        if (href === '#' || !href) {
          e.preventDefault();
          const card = el.closest('.project-card');
          const title = card ? card.querySelector('.project-card__title')?.textContent?.trim() : 'Project';
          showLightbox(title);
        }
      });
    });

    // Contact form handling (index page)
    const contactForm = document.querySelector('.contact__form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // simple UX feedback
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          const original = submitBtn.textContent;
          submitBtn.textContent = 'Sent ✓';
          setTimeout(() => (submitBtn.textContent = original), 1800);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}


