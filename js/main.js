/**
 * MAIN INTERACTION SCRIPT
 * Danny Harrington — AI-Native Automation & Operations Specialist
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initCopyEmail();
  initScrollReveal();
});

/**
 * Palette Switcher Helper
 * Allows Danny to easily cycle through the 3 curated test palettes live:
 * 1. Alabaster Cobalt (Default Light)
 * 2. Warm Stone Navy (.theme-warm-navy)
 * 3. Mediterranean Azure (.theme-azure)
 * 4. Midnight Cobalt (.theme-dark-cobalt)
 */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const themes = [
    { name: 'Alabaster Cobalt', class: '' },
    { name: 'Alpine Emerald', class: 'theme-emerald' },
    { name: 'Botanical Sage', class: 'theme-sage' },
    { name: 'Warm Stone Navy', class: 'theme-warm-navy' },
    { name: 'Midnight Cobalt', class: 'theme-dark-cobalt' }
  ];

  let currentIdx = 0;

  toggleBtn.addEventListener('click', () => {
    // Remove current class
    if (themes[currentIdx].class) {
      document.body.classList.remove(themes[currentIdx].class);
    }

    currentIdx = (currentIdx + 1) % themes.length;

    // Add next class
    if (themes[currentIdx].class) {
      document.body.classList.add(themes[currentIdx].class);
    }

    toggleBtn.textContent = `🎨 Look: ${themes[currentIdx].name}`;
  });
}

/**
 * 1-Click Email Copy with Tactile Tooltip
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
        // Fallback for older browsers or non-https local dev
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
 * Staggered Scroll Entrances via IntersectionObserver
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

