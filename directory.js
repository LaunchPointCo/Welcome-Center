/**
 * Gavilan College Staff Phone Directory Script
 * Real-time instant search, category filtering, clipboard copy, and theme sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('dir-search-input');
  const searchClearBtn = document.getElementById('dir-search-clear');
  const categoryTabs = document.querySelectorAll('.dir-chip');
  const cardsGrid = document.getElementById('dir-cards-grid');
  const noResultsEl = document.getElementById('dir-no-results');
  const noResultsMsg = document.getElementById('no-results-query-msg');
  const btnResetSearch = document.getElementById('btn-dir-reset');
  const statsCounter = document.getElementById('dir-stats-counter');
  const toastPopup = document.getElementById('toast-popup');
  const toastText = document.getElementById('toast-text');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const liveClockEl = document.getElementById('live-pacific-clock');

  // Complete Database of 21 Departments & 38 Staff Contacts
  const DEPARTMENTS_DATA = [
    {
      id: "finaid",
      name: "Financial Aid Dept.",
      category: "core",
      icon: "fa-hand-holding-dollar",
      colorClass: "dept-green",
      location: "Student Center SC 110",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4727", isFrontDesk: true },
        { role: "Staff", name: "Alyssa Munoz", ext: "2813" },
        { role: "Staff", name: "Elizabeth Ramon", ext: "4729" },
        { role: "Staff", name: "Gladys Elizondo", ext: "4734" },
        { role: "Staff", name: "Irma Banuelos", ext: "4728" },
        { role: "Staff", name: "Kelli Bostwick", ext: "4725" },
        { role: "Staff", name: "Kimberly Benjamin", ext: "4763" },
        { role: "Staff", name: "Rocio De Reza", ext: "2810" }
      ]
    },
    {
      id: "admissions",
      name: "Admissions & Records",
      category: "core",
      icon: "fa-id-card-clip",
      colorClass: "dept-blue",
      location: "Student Center SC 106",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4954", isFrontDesk: true },
        { role: "Staff", name: "Cassandra Soto", ext: "4935" },
        { role: "Staff", name: "Debra Casella", ext: "4935" },
        { role: "Staff", name: "Irene Haneta", ext: "4754" },
        { role: "Staff", name: "Mandy Jabr", ext: "4733" },
        { role: "Staff", name: "Mellanie De Leon", ext: "4737" }
      ]
    },
    {
      id: "counseling",
      name: "Counseling Dept.",
      category: "core",
      icon: "fa-user-graduate",
      colorClass: "dept-coral",
      location: "Student Center, Gilroy Campus",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "2895", isFrontDesk: true },
        { role: "Counselor", name: "Diana Padilla Urias", ext: "2895" },
        { role: "Counselor", name: "Sarah Garcia", ext: "4723" }
      ]
    },
    {
      id: "welcome",
      name: "Welcome Center / Outreach",
      category: "core",
      icon: "fa-door-open",
      colorClass: "dept-red",
      location: "Student Center SC 100",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4804", isFrontDesk: true },
        { role: "Staff", name: "Michele Castro", ext: "2849" },
        { role: "Staff", name: "Stacey Porteur", ext: "2840" },
        { role: "Staff", name: "Nancy Barrera", ext: "2840" }
      ]
    },
    {
      id: "stem_mesa",
      name: "STEM / MESA",
      category: "programs",
      icon: "fa-atom",
      colorClass: "dept-pink",
      location: "Math & Science Building",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "0152", isFrontDesk: true }
      ]
    },
    {
      id: "eops",
      name: "EOPS",
      category: "programs",
      icon: "fa-book-open-reader",
      colorClass: "dept-orange",
      location: "Student Center SC 101",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4740", isFrontDesk: true }
      ]
    },
    {
      id: "aec",
      name: "AEC (Accessible Education)",
      category: "programs",
      icon: "fa-universal-access",
      colorClass: "dept-navy",
      location: "Library LI 117",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4865", isFrontDesk: true }
      ]
    },
    {
      id: "el_centro",
      name: "El Centro / El Mercado",
      category: "programs",
      icon: "fa-basket-shopping",
      colorClass: "dept-gold",
      location: "Student Center SC 103",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "2855", isFrontDesk: true }
      ]
    },
    {
      id: "career_ed",
      name: "Career Education",
      category: "programs",
      icon: "fa-briefcase",
      colorClass: "dept-charcoal",
      location: "Business Building BU 118",
      contacts: [
        { role: "Coordinator", name: "Adriana Servin", ext: "4816" }
      ]
    },
    {
      id: "career_transfer",
      name: "Career & Transfer Center",
      category: "programs",
      icon: "fa-arrow-trend-up",
      colorClass: "dept-sage",
      location: "Student Center SC 112",
      contacts: [
        { role: "Specialist", name: "Daisy Lopez Jimenez", ext: "2897" }
      ]
    },
    {
      id: "veterans",
      name: "Veterans Center",
      category: "programs",
      icon: "fa-flag-usa",
      colorClass: "dept-brightred",
      location: "Student Center SC 105",
      contacts: [
        { role: "Coordinator", name: "Katrina Guzman", ext: "4787" }
      ]
    },
    {
      id: "calworks",
      name: "CalWorks / Fresh Success",
      category: "programs",
      icon: "fa-seedling",
      colorClass: "dept-forest",
      location: "Student Center SC 104",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "2838", isFrontDesk: true }
      ]
    },
    {
      id: "noncredit",
      name: "Non-Credit Program",
      category: "programs",
      icon: "fa-chalkboard-user",
      colorClass: "dept-cyan",
      location: "Community Education Center",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4859", isFrontDesk: true }
      ]
    },
    {
      id: "undocu",
      name: "UndocuLiaison",
      category: "programs",
      icon: "fa-handshake-angle",
      colorClass: "dept-maroon",
      location: "Student Services SC 100",
      contacts: [
        { role: "Liaison", name: "Omar Macias", ext: "4837" }
      ]
    },
    {
      id: "health",
      name: "Student Health Advisors",
      category: "support",
      icon: "fa-heart-pulse",
      colorClass: "dept-purple",
      location: "Student Center SC 118",
      contacts: [
        { role: "Health Advisor", name: "Josh Ramirez", ext: "4807" },
        { role: "Health Advisor", name: "Ryan Shook", ext: "4898" }
      ]
    },
    {
      id: "stu_admin",
      name: "Stu. Services / Administration",
      category: "support",
      icon: "fa-users-gear",
      colorClass: "dept-lime",
      location: "Administration Building AD 100",
      contacts: [
        { role: "Staff", name: "Jennifer Dinis", ext: "2803" },
        { role: "Staff", name: "Michelle Jones", ext: "4711" },
        { role: "Staff", name: "Miressa Lira", ext: "4744" },
        { role: "Staff", name: "Victoria Masey", ext: "4761" }
      ]
    },
    {
      id: "library",
      name: "Library",
      category: "support",
      icon: "fa-book-bookmark",
      colorClass: "dept-steelblue",
      location: "Library Building LI 100",
      contacts: [
        { role: "Front Desk", name: "Front Desk", ext: "4810", isFrontDesk: true }
      ]
    },
    {
      id: "repro",
      name: "Reprographics",
      category: "support",
      icon: "fa-print",
      colorClass: "dept-violet",
      location: "Student Center SC 115",
      contacts: [
        { role: "Specialist", name: "Prince Asana", ext: "4750" }
      ]
    },
    {
      id: "hr",
      name: "Human Resources",
      category: "support",
      icon: "fa-user-tie",
      colorClass: "dept-dark",
      location: "Administration Building AD 102",
      contacts: [
        { role: "Main Desk", name: "Main Desk", ext: "2823", isFrontDesk: true }
      ]
    },
    {
      id: "hollister",
      name: "Hollister Site Directory",
      category: "site",
      icon: "fa-map-location-dot",
      colorClass: "dept-amber",
      location: "Briggs Building, 365 4th St, Hollister",
      contacts: [
        { role: "Front Desk", name: "WC Front Desk", ext: "3783", isFrontDesk: true },
        { role: "Security", name: "Security", ext: "5447" },
        { role: "Staff", name: "Judy Rodriguez", ext: "3783" }
      ]
    },
    {
      id: "security",
      name: "Campus Security",
      category: "site",
      icon: "fa-shield-halved",
      colorClass: "dept-navyblue",
      location: "Security Office / 24-7 Dispatch",
      contacts: [
        { role: "Direct Line", name: "Gilroy Security", ext: "(408) 710-7490", isDirectPhone: true, rawNumber: "4087107490" },
        { role: "Speed Dial", name: "WC Phone Dial 10", ext: "Dial 10", isSpeedDial: true }
      ]
    }
  ];

  // =========================================================================
  // Theme Management (Synced with localStorage)
  // =========================================================================
  const savedTheme = localStorage.getItem('gav_theme') || 'dark';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gav_theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeToggleBtn.title = 'Switch to Light Mode';
      } else {
        themeIcon.className = 'fas fa-moon';
        themeToggleBtn.title = 'Switch to Dark Mode';
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(newTheme === 'dark' ? 'Switched to Sleek Dark Mode' : 'Switched to Light Mode');
    });
  }

  // =========================================================================
  // Live Pacific Time Clock
  // =========================================================================
  function updateClock() {
    if (!liveClockEl) return;
    try {
      const now = new Date();
      const options = {
        timeZone: 'America/Los_Angeles',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      };
      const ptString = new Intl.DateTimeFormat('en-US', options).format(now);
      liveClockEl.textContent = `${ptString} PT`;
    } catch (e) {
      liveClockEl.textContent = 'Pacific Time';
    }
  }
  updateClock();
  setInterval(updateClock, 1000);

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastText.textContent = msg;
    toastPopup.classList.add('show');
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove('show');
    }, 2500);
  }

  // =========================================================================
  // Render & Filter Directory
  // =========================================================================
  let currentCategory = 'all';

  function renderDirectory() {
    const rawQuery = (searchInput.value || '').trim();
    const query = rawQuery.toLowerCase();

    // Toggle clear search button
    if (query.length > 0) {
      searchClearBtn.classList.add('visible');
    } else {
      searchClearBtn.classList.remove('visible');
    }

    let visibleDeptCount = 0;
    let visibleContactCount = 0;
    cardsGrid.innerHTML = '';

    DEPARTMENTS_DATA.forEach(dept => {
      // 1. Filter by category
      if (currentCategory !== 'all' && dept.category !== currentCategory) {
        return;
      }

      // 2. Filter contacts by search query
      const matchingContacts = dept.contacts.filter(contact => {
        if (!query) return true;
        const nameMatch = contact.name.toLowerCase().includes(query);
        const extMatch = contact.ext.toLowerCase().includes(query);
        const deptMatch = dept.name.toLowerCase().includes(query);
        const roleMatch = (contact.role || '').toLowerCase().includes(query);
        const locationMatch = (dept.location || '').toLowerCase().includes(query);
        return nameMatch || extMatch || deptMatch || roleMatch || locationMatch;
      });

      if (matchingContacts.length > 0) {
        visibleDeptCount++;
        visibleContactCount += matchingContacts.length;

        // Create Department Card
        const card = document.createElement('article');
        card.className = `dir-card ${dept.colorClass}`;
        card.setAttribute('data-dept-id', dept.id);

        let contactsHtml = '';
        matchingContacts.forEach(contact => {
          const isFullPhone = contact.isDirectPhone;
          const displayExt = isFullPhone ? contact.ext : `X${contact.ext.replace(/^X/i, '')}`;

          contactsHtml += `
            <div class="dir-contact-row">
              <div class="contact-info">
                <span class="contact-name">${highlightMatch(contact.name, query)}</span>
                ${contact.isFrontDesk ? `<span class="contact-role-badge">Front Desk</span>` : ''}
              </div>
              <div class="contact-ext-group">
                <button 
                  class="btn-copy-ext" 
                  data-ext="${displayExt}" 
                  data-name="${contact.name}"
                  data-dept="${dept.name}"
                  title="Click to copy ${displayExt}" 
                  aria-label="Copy ${contact.name} extension ${displayExt}"
                >
                  <span class="ext-label">${highlightMatch(displayExt, query)}</span>
                  <i class="far fa-copy copy-icon"></i>
                </button>
              </div>
            </div>
          `;
        });

        card.innerHTML = `
          <div class="dir-card-header">
            <div class="dir-title-box">
              <div class="dir-icon-badge">
                <i class="fas ${dept.icon}"></i>
              </div>
              <div>
                <h2 class="dir-dept-name">${highlightMatch(dept.name, query)}</h2>
                <span class="dir-dept-location"><i class="fas fa-location-dot"></i> ${dept.location}</span>
              </div>
            </div>
            <span class="dir-badge-count">${matchingContacts.length} ${matchingContacts.length === 1 ? 'line' : 'lines'}</span>
          </div>
          <div class="dir-contacts-list">
            ${contactsHtml}
          </div>
        `;

        cardsGrid.appendChild(card);
      }
    });

    // Update Stats Counter
    if (visibleContactCount > 0) {
      statsCounter.innerHTML = `Showing <strong>${visibleContactCount}</strong> contacts across <strong>${visibleDeptCount}</strong> departments`;
      noResultsEl.style.display = 'none';
      cardsGrid.style.display = 'grid';
    } else {
      statsCounter.innerHTML = `Showing <strong>0</strong> matching contacts`;
      noResultsEl.style.display = 'block';
      cardsGrid.style.display = 'none';
      if (noResultsMsg) {
        noResultsMsg.textContent = `No results found for "${rawQuery}". Try searching with another name or extension.`;
      }
    }

    // Attach copy event listeners
    attachCopyEvents();
  }

  // Helper to highlight matching text
  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark class="highlight-query">$1</mark>');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Attach clipboard copy events
  function attachCopyEvents() {
    document.querySelectorAll('.btn-copy-ext').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const ext = btn.getAttribute('data-ext') || '';
        const name = btn.getAttribute('data-name') || 'Contact';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ext).then(() => {
            showToast(`📋 Copied ${name} (${ext}) to clipboard!`);
          }).catch(() => {
            fallbackCopy(ext, name);
          });
        } else {
          fallbackCopy(ext, name);
        }

        // Button pulse effect
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 1500);
      });
    });
  }

  function fallbackCopy(text, name) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(`📋 Copied ${name} (${text})!`);
  }

  // Floating Bottom Search Dock Elements
  const floatingDock = document.getElementById('floating-search-dock');
  const dockSearchInput = document.getElementById('dock-search-input');
  const dockSearchClear = document.getElementById('dock-search-clear');
  const dockBtnTop = document.getElementById('dock-btn-top');
  const topSearchWrap = document.querySelector('.dir-search-wrap');

  // Search input listeners (Top Search Bar)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (dockSearchInput) {
        dockSearchInput.value = searchInput.value;
      }
      renderDirectory();
    });
  }

  // Search input listeners (Floating Bottom Search Dock)
  if (dockSearchInput) {
    dockSearchInput.addEventListener('input', () => {
      if (searchInput) {
        searchInput.value = dockSearchInput.value;
      }
      renderDirectory();
    });
  }

  // Clear Top Search
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (dockSearchInput) dockSearchInput.value = '';
      searchClearBtn.classList.remove('visible');
      if (dockSearchClear) dockSearchClear.classList.remove('visible');
      renderDirectory();
      searchInput.focus();
    });
  }

  // Clear Dock Search
  if (dockSearchClear) {
    dockSearchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (dockSearchInput) dockSearchInput.value = '';
      if (searchClearBtn) searchClearBtn.classList.remove('visible');
      dockSearchClear.classList.remove('visible');
      renderDirectory();
      dockSearchInput.focus();
    });
  }

  // Reset Search Button (from empty state)
  if (btnResetSearch) {
    btnResetSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (dockSearchInput) dockSearchInput.value = '';
      if (searchClearBtn) searchClearBtn.classList.remove('visible');
      if (dockSearchClear) dockSearchClear.classList.remove('visible');
      currentCategory = 'all';
      categoryTabs.forEach(t => {
        if (t.getAttribute('data-category') === 'all') {
          t.classList.add('active');
          t.setAttribute('aria-selected', 'true');
        } else {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        }
      });
      renderDirectory();
    });
  }

  // Floating Dock Back-to-Top Button
  if (dockBtnTop) {
    dockBtnTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 400);
    });
  }

  // Category tab listeners
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentCategory = tab.getAttribute('data-category');
      renderDirectory();
    });
  });

  // =========================================================================
  // Smooth Scroll Listener for Floating Bottom Search Dock
  // =========================================================================
  let scrollTicking = false;

  function handleDockScroll() {
    if (!floatingDock) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    // Check if user has scrolled past the top search bar
    if (topSearchWrap) {
      const rect = topSearchWrap.getBoundingClientRect();
      if (rect.bottom < 10) {
        floatingDock.classList.add('visible');
      } else {
        floatingDock.classList.remove('visible');
      }
    } else if (scrollY > 150) {
      floatingDock.classList.add('visible');
    } else {
      floatingDock.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleDockScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial Render & Scroll Check
  renderDirectory();
  handleDockScroll();
});
