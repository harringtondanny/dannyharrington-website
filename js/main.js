/**
 * MAIN INTERACTION SCRIPT
 * Danny Harrington — Scalable Systems & Operations
 * Obsidian & Warm Amber / Bronze Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  initRadialThemeSwitcher();
  initChaosOrderLens();
  initCopyEmail();
  initScrollReveal();
});

/**
 * 1. Persistent Floating Sun/Moon Theme Switcher (Bottom-Left)
 * Circular Light Theme Emanation & Collapse:
 * - Dark -> Light: The light theme emanates OUTWARD from the circular button.
 * - Light -> Dark: The light theme collapses back INTO the circular button.
 */
function initRadialThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-radial-toggle');
  const overlay = document.getElementById('theme-radial-overlay');
  const halo = document.getElementById('theme-radial-halo');
  if (!toggleBtn) return;

  // Restore saved preference (default is Obsidian Dark)
  const savedTheme = localStorage.getItem('danny_portfolio_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
  }

  toggleBtn.addEventListener('click', () => {
    const isCurrentlyDark = !document.body.classList.contains('theme-light');
    const targetTheme = isCurrentlyDark ? 'light' : 'dark';

    // Calculate exact center coordinates and radius of the round button
    const rect = toggleBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const buttonRadius = rect.width / 2;

    // Furthest corner distance to guarantee 100% screen coverage
    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    ) + 30;

    // Trigger glowing boundary halo animation
    triggerHaloAnimation(halo, originX, originY, buttonRadius, maxRadius, isCurrentlyDark);

    // Native View Transition API (Chrome, Edge, Safari 18+)
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (targetTheme === 'light') {
        // DARK -> LIGHT: Light view expands OUTWARD from the round button
        document.documentElement.classList.add('transition-expanding-to-light');
        document.documentElement.classList.remove('transition-collapsing-to-dark');

        const transition = document.startViewTransition(() => {
          document.body.classList.add('theme-light');
          localStorage.setItem('danny_portfolio_theme', 'light');
        });

        transition.ready.then(() => {
          const anim = document.documentElement.animate(
            {
              clipPath: [
                `circle(${buttonRadius}px at ${originX}px ${originY}px)`,
                `circle(${maxRadius}px at ${originX}px ${originY}px)`
              ]
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-new(root)'
            }
          );

          anim.onfinish = () => {
            document.documentElement.classList.remove('transition-expanding-to-light');
          };
        });

      } else {
        // LIGHT -> DARK: Light view collapses BACK INTO the round button
        document.documentElement.classList.add('transition-collapsing-to-dark');
        document.documentElement.classList.remove('transition-expanding-to-light');

        const transition = document.startViewTransition(() => {
          document.body.classList.remove('theme-light');
          localStorage.setItem('danny_portfolio_theme', 'dark');
        });

        transition.ready.then(() => {
          const anim = document.documentElement.animate(
            {
              clipPath: [
                `circle(${maxRadius}px at ${originX}px ${originY}px)`,
                `circle(${buttonRadius}px at ${originX}px ${originY}px)`
              ]
            },
            {
              duration: 650,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
              pseudoElement: '::view-transition-old(root)'
            }
          );

          anim.onfinish = () => {
            document.documentElement.classList.remove('transition-collapsing-to-dark');
          };
        });
      }
      return;
    }

    // Fallback for browsers without View Transitions
    if (overlay) {
      overlay.style.setProperty('--origin-x', `${originX}px`);
      overlay.style.setProperty('--origin-y', `${originY}px`);

      if (targetTheme === 'light') {
        overlay.classList.remove('animating-to-dark');
        void overlay.offsetWidth;
        overlay.classList.add('animating-to-light');

        setTimeout(() => {
          document.body.classList.add('theme-light');
          localStorage.setItem('danny_portfolio_theme', 'light');
          overlay.classList.remove('animating-to-light');
        }, 650);
      } else {
        // Switch body to dark underneath, and collapse light overlay into the button
        document.body.classList.remove('theme-light');
        localStorage.setItem('danny_portfolio_theme', 'dark');

        overlay.classList.remove('animating-to-light');
        void overlay.offsetWidth;
        overlay.classList.add('animating-to-dark');

        setTimeout(() => {
          overlay.classList.remove('animating-to-dark');
        }, 650);
      }
    } else {
      if (targetTheme === 'light') {
        document.body.classList.add('theme-light');
      } else {
        document.body.classList.remove('theme-light');
      }
      localStorage.setItem('danny_portfolio_theme', targetTheme);
    }
  });
}

/**
 * Helper to animate glowing boundary halo at the edge of the circular fill
 */
function triggerHaloAnimation(halo, originX, originY, buttonRadius, maxRadius, isExpanding) {
  if (!halo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  halo.style.left = `${originX}px`;
  halo.style.top = `${originY}px`;

  const startSize = buttonRadius * 2;
  const endSize = maxRadius * 2;

  if (isExpanding) {
    // Expanding halo from button out to screen
    halo.animate(
      [
        { width: `${startSize}px`, height: `${startSize}px`, opacity: 0.9 },
        { width: `${endSize}px`, height: `${endSize}px`, opacity: 0 }
      ],
      {
        duration: 650,
        easing: 'cubic-bezier(0.2, 0, 0, 1)'
      }
    );
  } else {
    // Contracting halo from screen edges back into the button
    halo.animate(
      [
        { width: `${endSize}px`, height: `${endSize}px`, opacity: 0.8 },
        { width: `${startSize}px`, height: `${startSize}px`, opacity: 0 }
      ],
      {
        duration: 650,
        easing: 'cubic-bezier(0.2, 0, 0, 1)'
      }
    );
  }
}

/**
 * 2. Interactive "Chaos vs. Order" Lens (Hero Section)
 * Tracks mouse position or touch to dynamically reveal the before & after contrast
 */
function initChaosOrderLens() {
  const lens = document.getElementById('chaos-order-lens');
  if (!lens) return;

  let isDragging = false;
  let targetPercent = 50;
  let currentPercent = 50;
  let animationFrameId = null;

  function setLensPosition(percent) {
    const clamped = Math.max(10, Math.min(90, percent));
    targetPercent = clamped;
  }

  function handlePointer(clientX) {
    const rect = lens.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setLensPosition(pct);
  }

  lens.addEventListener('mousemove', (e) => {
    handlePointer(e.clientX);
  });

  lens.addEventListener('mousedown', (e) => {
    isDragging = true;
    handlePointer(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  lens.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      handlePointer(e.touches[0].clientX);
    }
  }, { passive: true });

  // Smooth lerp loop for buttery motion
  function updateLensRender() {
    currentPercent += (targetPercent - currentPercent) * 0.18;
    lens.style.setProperty('--clip-pos', `${currentPercent.toFixed(2)}%`);
    animationFrameId = requestAnimationFrame(updateLensRender);
  }

  animationFrameId = requestAnimationFrame(updateLensRender);

  lens.addEventListener('mouseleave', () => {
    if (!isDragging) {
      targetPercent = 50;
    }
  });
}

/**
 * 3. 1-Click Email Copy with Tactile Tooltip
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const tooltip = document.getElementById('copy-tooltip');
  if (!copyBtn || !tooltip) return;

  const email = copyBtn.getAttribute('data-email') || 'danny@example.com';

  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      tooltip.textContent = 'Copied to clipboard!';
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 2200);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  });
}

/**
 * 4. Staggered Scroll Entrances via IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
