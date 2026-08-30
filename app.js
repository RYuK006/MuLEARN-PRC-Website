// --- Theme Initialization (Run immediately to prevent flash) ---
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle Logic ---
  const themeToggles = [document.getElementById('themeToggle'), document.getElementById('mobileThemeToggle')];
  
  const updateThemeUI = (theme) => {
    const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#6e0e9e"><circle cx="12" cy="12" r="9"/></svg>`;
    const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#6e0e9e"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    
    const icon = theme === 'dark' ? sunSvg : moonSvg;
    const text = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    
    themeToggles.forEach(toggle => {
      if (!toggle) return;
      const iconSpan = toggle.querySelector('.theme-icon');
      if (iconSpan) iconSpan.innerHTML = icon;
      // If there is text node in mobile toggle
      if (toggle.childNodes.length > 1 && toggle.id === 'mobileThemeToggle') {
        toggle.lastChild.nodeValue = ' ' + text;
      }
    });
  };
  
  updateThemeUI(savedTheme);

  themeToggles.forEach(toggle => {
    if (toggle) {
      toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);
        
        // Dispatch custom event so the canvas can listen to theme changes
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
      });
    }
  });
  // --- Mobile Navigation Drawer Toggle ---
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    document.body.style.overflow = ''; // Restore background scrolling
  };

  if (mobileMenuToggle && mobileDrawer && mobileCloseBtn) {
    mobileMenuToggle.addEventListener('click', openDrawer);
    mobileCloseBtn.addEventListener('click', closeDrawer);
  }

  // Close drawer when clicking a mobile nav item
  mobileNavItems.forEach(item => {
    item.addEventListener('click', closeDrawer);
  });

  // Close drawer when clicking outside it
  document.addEventListener('click', (event) => {
    if (mobileDrawer.classList.contains('open')) {
      const isClickInsideDrawer = mobileDrawer.contains(event.target);
      const isClickOnToggle = mobileMenuToggle.contains(event.target);
      
      if (!isClickInsideDrawer && !isClickOnToggle) {
        closeDrawer();
      }
    }
  });

  // --- Active Nav Item On Scroll ---
  const navItems = document.querySelectorAll('.nav-item');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');

  const updateActiveLink = () => {
    const scrollPosition = window.scrollY + 120; // Offset for sticky navbar

    // Explicitly define all sections in their vertical page order
    const sectionIds = ['home', 'execom', 'karma', 'events', 'gallery', 'about', 'contact'];
    const sections = [];
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) sections.push(el);
    });

    // Find the current active section
    let currentSectionId = '';
    
    // Check if we are at the bottom of the page
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
      currentSectionId = 'contact';
    } else {
      // Standard scroll spy: find the last section whose top is above the scroll position
      sections.forEach(section => {
        const sectionTop = section.offsetTop || getElementOffsetTop(section);
        // We use a slight offset so it activates right as it comes into view
        if (scrollPosition >= sectionTop - 100) {
          currentSectionId = section.getAttribute('id');
        }
      });
    }

    if (currentSectionId) {
      // Desktop nav
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSectionId}`) {
          item.classList.add('active');
        }
      });
      
      // Mobile nav
      mobileNavLinks.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${currentSectionId}`) {
          item.classList.add('active');
        }
      });
    }
  };

  // Helper to get absolute offset top
  function getElementOffsetTop(el) {
    let top = 0;
    while (el) {
      top += el.offsetTop;
      el = el.offsetParent;
    }
    return top;
  }

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink(); // Trigger initially on page load

  // --- Smooth Scrolling for Anchor Links ---
  const allNavLinks = document.querySelectorAll('a[href^="#"]');
  allNavLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offsetPosition = getElementOffsetTop(targetElement) - 80; // Account for navbar height
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else {
        alert('This section is coming soon!');
      }
    });
  });

  // --- Micro-interaction: Count Up animation for Karma points (Optional) ---
  const karmaPoints = document.querySelectorAll('.lb-points');
  
  const animateCountUp = (element) => {
    const target = parseInt(element.innerText, 10);
    if (isNaN(target)) return;
    
    let count = 0;
    const duration = 1200; // ms
    const increment = Math.ceil(target / (duration / 16)); // ~60fps
    
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        element.innerText = target;
        clearInterval(timer);
      } else {
        element.innerText = count;
      }
    }, 16);
  };

  // Simple IntersectionObserver to trigger animations when leaderboard is in view
  const leaderboardTable = document.querySelector('.leaderboard-table');
  if (leaderboardTable && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          karmaPoints.forEach(pointElement => {
            animateCountUp(pointElement);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(leaderboardTable);
  }

  // --- Canvas Image Sequence Logic with GSAP ---
  // --- Background Video Scrubbing (Tutorial Method) ---
  const video = document.getElementById('scrollVideo');
  
  if (video && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    let scrollTween;
    let currentBlobUrl = null;

    const initScrollScrub = () => {
      // The exact duration of both Lightmode and Darkmode videos is 10 seconds.
      // By hardcoding this (like the tutorial does), we completely bypass the Chromium Infinity 
      // duration bug and avoid the Edge crash hacks.
      // We set it to 9.9 instead of exactly 10.0 to ensure the player never hits EOF (End of File)
      // which can cause playback freezing when scrolling to the very bottom.
      const videoDuration = 9.9; 

      if (scrollTween) {
        scrollTween.kill();
      }

      scrollTween = gsap.to(video, {
        currentTime: videoDuration,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Tutorial uses 1 for maximum smoothness
        }
      });
      
      ScrollTrigger.refresh();
    };

    const loadVideoForTheme = async (theme) => {
      const folder = theme === 'dark' ? 'Darkmode' : 'Lightmode';
      const videoPath = `assets/${folder}/${folder}_smooth.mp4`;
      
      try {
        const response = await fetch(videoPath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
        }
        
        currentBlobUrl = URL.createObjectURL(blob);
        video.src = currentBlobUrl;
        video.load(); // Explicit load call often required by Edge/Safari for Blobs
        
        const setupScrub = () => {
          video.onloadedmetadata = null;
          video.onloadeddata = null;
          video.pause();
          initScrollScrub();
        };

        // If metadata is already loaded, setup immediately, else wait for event
        if (video.readyState >= 1) { 
          setupScrub();
        } else {
          video.onloadedmetadata = setupScrub;
          video.onloadeddata = setupScrub; // Fallback
        }
      } catch (err) {
        console.error("Failed to load video:", err);
      }
    };

    // Initialize with current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    loadVideoForTheme(currentTheme);

    // Listen for theme changes from the toggle buttons
    window.addEventListener('themeChanged', (e) => {
      loadVideoForTheme(e.detail);
    });

    // Refresh ScrollTrigger on load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

});
