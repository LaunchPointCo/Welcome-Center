/**
 * Gavilan College Student Services Directory Script
 * Modern, responsive, and works 100% locally on file:// and http://
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const liveClockEl = document.getElementById('live-pacific-clock');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const dayTabs = document.querySelectorAll('.day-tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');
  const noResultsEl = document.getElementById('no-results');
  const resetSearchBtn = document.getElementById('btn-reset-search');
  const resultsCountEl = document.getElementById('results-count');
  const toastPopup = document.getElementById('toast-popup');
  const toastText = document.getElementById('toast-text');
  const counselingReferralBtn = document.getElementById('counseling-referral-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');

  // =========================================================================
  // Theme Management (Defaults to Sleek Dark Mode)
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
  // Operating Schedules for Real-Time Status Calculation
  // =========================================================================
  const SCHEDULE_RULES = {
    'welcome-center': {
      'inperson': {
        1: { open: 480, close: 1080, closeStr: '6:00 PM', openStr: '8:00 AM' }, // Mon: 8am-6pm
        2: { open: 480, close: 1080, closeStr: '6:00 PM', openStr: '8:00 AM' }, // Tue: 8am-6pm
        3: { open: 480, close: 1020, closeStr: '5:00 PM', openStr: '8:00 AM' }, // Wed: 8am-5pm
        4: { open: 480, close: 1020, closeStr: '5:00 PM', openStr: '8:00 AM' }, // Thu: 8am-5pm
        5: { open: 480, close: 840,  closeStr: '2:00 PM', openStr: '8:00 AM' }  // Fri: 8am-2pm
      },
      'zoom': {
        1: { open: 480, close: 1080, closeStr: '6:00 PM', openStr: '8:00 AM' },
        2: { open: 480, close: 1080, closeStr: '6:00 PM', openStr: '8:00 AM' },
        3: { open: 480, close: 1020, closeStr: '5:00 PM', openStr: '8:00 AM' },
        4: { open: 480, close: 1020, closeStr: '5:00 PM', openStr: '8:00 AM' },
        5: { open: 480, close: 840,  closeStr: '2:00 PM', openStr: '8:00 AM' }
      }
    },
    'admissions-records': {
      'inperson': {
        1: { open: 510, close: 1080, closeStr: '6:00 PM', openStr: '8:30 AM' }, // Mon: 8:30am-6pm
        2: { open: 510, close: 1080, closeStr: '6:00 PM', openStr: '8:30 AM' }, // Tue: 8:30am-6pm
        3: { open: 510, close: 1020, closeStr: '5:00 PM', openStr: '8:30 AM' }, // Wed: 8:30am-5pm
        4: { open: 510, close: 1020, closeStr: '5:00 PM', openStr: '8:30 AM' }, // Thu: 8:30am-5pm
        5: { open: 510, close: 840,  closeStr: '2:00 PM', openStr: '8:30 AM' }  // Fri: 8:30am-2pm
      },
      'zoom': {
        1: { open: 600, close: 900, closeStr: '3:00 PM', openStr: '10:00 AM' }, // Mon: 10am-3pm
        2: { open: 600, close: 900, closeStr: '3:00 PM', openStr: '10:00 AM' }, // Tue: 10am-3pm
        3: { open: 600, close: 900, closeStr: '3:00 PM', openStr: '10:00 AM' }, // Wed: 10am-3pm
        4: { open: 600, close: 900, closeStr: '3:00 PM', openStr: '10:00 AM' }  // Thu: 10am-3pm
        // Fri: Closed
      }
    },
    'financial-aid': {
      'inperson': {
        1: { open: 510, close: 1050, closeStr: '5:30 PM', openStr: '8:30 AM' }, // Mon: 8:30am-5:30pm
        2: { open: 510, close: 1050, closeStr: '5:30 PM', openStr: '8:30 AM' }, // Tue: 8:30am-5:30pm
        3: { open: 510, close: 1020, closeStr: '5:00 PM', openStr: '8:30 AM' }, // Wed: 8:30am-5pm
        4: { open: 510, close: 1020, closeStr: '5:00 PM', openStr: '8:30 AM' }, // Thu: 8:30am-5pm
        5: { open: 510, close: 840,  closeStr: '2:00 PM', openStr: '8:30 AM' }  // Fri: 8:30am-2pm
      }
    }
  };

  const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Current active delivery mode for cards
  const activeModes = {
    'welcome-center': 'inperson',
    'admissions-records': 'inperson',
    'financial-aid': 'inperson'
  };

  /**
   * Helper: Get Pacific Date & Time
   */
  function getPacificTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const partsFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short'
    });
    
    const parts = partsFormatter.formatToParts(now);
    let hours = 0;
    let minutes = 0;
    let weekdayShort = '';

    for (const part of parts) {
      if (part.type === 'hour') hours = parseInt(part.value, 10);
      if (part.type === 'minute') minutes = parseInt(part.value, 10);
      if (part.type === 'weekday') weekdayShort = part.value;
    }

    const shortToNum = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const dayOfWeek = shortToNum[weekdayShort] ?? now.getDay();
    const totalMinutes = hours * 60 + minutes;

    return {
      dayOfWeek,
      totalMinutes,
      displayTime: formatter.format(now)
    };
  }

  /**
   * Update Live Pacific Clock in Header
   */
  function updateClock() {
    const pt = getPacificTime();
    if (liveClockEl) {
      liveClockEl.textContent = `${pt.displayTime} PT`;
    }
  }

  /**
   * Find next opening day for a schedule
   */
  function getNextOpening(ruleSet, currentDay) {
    for (let offset = 1; offset <= 7; offset++) {
      const nextDay = (currentDay + offset) % 7;
      if (ruleSet[nextDay]) {
        const dayLabel = offset === 1 ? 'Tomorrow' : DAYS_NAMES[nextDay];
        return `${dayLabel} at ${ruleSet[nextDay].openStr}`;
      }
    }
    return 'Monday at 8:00 AM';
  }

  /**
   * Calculate Real-Time Status for All Status Pills
   */
  function updateLiveStatusPills() {
    const pt = getPacificTime();
    const currentDay = pt.dayOfWeek;
    const curMin = pt.totalMinutes;

    document.querySelectorAll('.status-calc').forEach(pill => {
      const deptId = pill.getAttribute('data-dept');
      const deptRules = SCHEDULE_RULES[deptId];
      if (!deptRules) return;

      const activeMode = activeModes[deptId] || 'inperson';
      const modeRules = deptRules[activeMode] || deptRules['inperson'];
      const todayHours = modeRules[currentDay];

      const text = pill.querySelector('.status-text');

      pill.className = 'live-status-pill status-calc';

      if (todayHours) {
        if (curMin < todayHours.open) {
          pill.classList.add('status-closed');
          text.textContent = `Closed • Opens ${todayHours.openStr}`;
        } else if (curMin >= todayHours.open && curMin < todayHours.close) {
          const remaining = todayHours.close - curMin;
          if (remaining <= 45) {
            pill.classList.add('status-closing-soon');
            text.textContent = `Closing Soon • ${todayHours.closeStr} (${remaining}m left)`;
          } else {
            pill.classList.add('status-open');
            text.textContent = `Open Now • Closes ${todayHours.closeStr}`;
          }
        } else {
          pill.classList.add('status-closed');
          const nextOpen = getNextOpening(modeRules, currentDay);
          text.textContent = `Closed • Opens ${nextOpen}`;
        }
      } else {
        pill.classList.add('status-closed');
        const nextOpen = getNextOpening(modeRules, currentDay);
        text.textContent = `Closed Today • Opens ${nextOpen}`;
      }
    });
  }

  /**
   * Delivery Mode Switcher Tabs (Campus Desk vs Zoom)
   */
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentCard = btn.closest('.service-card');
      const targetPanelId = btn.getAttribute('data-target');
      const deptId = parentCard.querySelector('.status-calc')?.getAttribute('data-dept');

      // Set active button
      parentCard.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Toggle panels
      parentCard.querySelectorAll('.schedule-panel').forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.style.display = 'block';
          panel.classList.add('active');
        } else {
          panel.style.display = 'none';
          panel.classList.remove('active');
        }
      });

      // Update active mode tracking and recalculate pill
      if (deptId) {
        activeModes[deptId] = targetPanelId.includes('zoom') ? 'zoom' : 'inperson';
        updateLiveStatusPills();
      }
    });
  });

  /**
   * Day Selection Tabs (Highlight specified day row)
   */
  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedDay = tab.getAttribute('data-day');

      document.querySelectorAll('.day-row').forEach(row => {
        const rowDay = row.getAttribute('data-day');
        if (selectedDay === 'all') {
          row.classList.remove('highlighted-row', 'dimmed-row');
        } else if (rowDay === selectedDay) {
          row.classList.add('highlighted-row');
          row.classList.remove('dimmed-row');
        } else {
          row.classList.remove('highlighted-row');
          row.classList.add('dimmed-row');
        }
      });
    });
  });

  /**
   * Live Search Filtering
   */
  function filterServices() {
    const query = (searchInput.value || '').trim().toLowerCase();
    let matchCount = 0;

    if (query.length > 0) {
      searchClearBtn.classList.add('visible');
    } else {
      searchClearBtn.classList.remove('visible');
    }

    serviceCards.forEach(card => {
      const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const textContent = card.innerText.toLowerCase();

      if (!query || keywords.includes(query) || textContent.includes(query)) {
        card.style.display = 'flex';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    resultsCountEl.innerHTML = `Showing <strong>${matchCount}</strong> ${matchCount === 1 ? 'Department' : 'Core Departments'}`;

    if (matchCount === 0) {
      noResultsEl.style.display = 'block';
    } else {
      noResultsEl.style.display = 'none';
    }
  }

    if (searchInput) {
      searchInput.addEventListener('input', filterServices);
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchClearBtn.classList.remove('visible');
          filterServices();
          searchInput.focus();
        }
      });
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          if (searchClearBtn) searchClearBtn.classList.remove('visible');
          filterServices();
        }
      });
    }

  /**
   * Copy Hours to Clipboard
   */
  let toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toastText.textContent = msg;
    toastPopup.classList.add('show');
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove('show');
    }, 2800);
  }

  document.querySelectorAll('.btn-copy-hours').forEach(btn => {
    btn.addEventListener('click', () => {
      const cardId = btn.getAttribute('data-card');
      const card = document.getElementById(cardId);
      if (!card) return;

      const deptName = card.querySelector('.dept-name')?.textContent || 'Department';
      const activePanel = card.querySelector('.schedule-panel.active') || card.querySelector('.schedule-panel');
      const rows = activePanel.querySelectorAll('.schedule-row');

      let hoursText = `Gavilan College - ${deptName} (Fall 2026 Hours)\n`;
      const DAY_MAP = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat–Sun': 'Saturday & Sunday',
        'Sat-Sun': 'Saturday & Sunday'
      };

      rows.forEach(r => {
        const rawDay = r.querySelector('.day-badge')?.textContent?.trim() || r.querySelector('.day-full-name')?.textContent?.trim() || '';
        const day = DAY_MAP[rawDay] || rawDay || 'Day';
        const splitItems = r.querySelectorAll('.split-slot-row');
        if (splitItems.length > 0) {
          const times = Array.from(splitItems).map(item => {
            const t = item.querySelector('.time-slot')?.textContent?.trim() || '';
            const b = item.querySelector('.badge-tag')?.textContent?.trim() || '';
            return b ? `${t} [${b}]` : t;
          }).join('; ');
          hoursText += `• ${day}: ${times}\n`;
        } else {
          const time = r.querySelector('.time-slot')?.textContent?.trim() || '';
          const badge = r.querySelector('.badge-tag')?.textContent?.trim() || '';
          const formatted = (time === '—' || !time) ? badge : (badge ? `${time} [${badge}]` : time);
          hoursText += `• ${day}: ${formatted}\n`;
        }
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hoursText).then(() => {
          showToast(`Copied ${deptName} hours to clipboard!`);
        });
      } else {
        showToast(`Copied ${deptName} hours!`);
      }
    });
  });

  /**
   * Counseling Referral Button
   */
  if (counselingReferralBtn) {
    counselingReferralBtn.addEventListener('click', (e) => {
      e.preventDefault();
      teleportToCard('card-welcome-center', 'referral');
    });
  }

  /**
   * Helper: Set active button in floating dock
   */
  function setActiveDockBtn(cardId) {
    document.querySelectorAll('.dock-btn').forEach(btn => {
      if (btn.getAttribute('data-target') === cardId) {
        btn.classList.add('active');
      } else if (!btn.classList.contains('dock-top-btn')) {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Quick Select & Teleport Navigation Handler
   */
  let isTeleporting = false;
  let teleportTimer = null;

  function teleportToCard(cardId, triggerOrigin = '') {
    if (!cardId) return;

    // 1. If search is hiding cards, clear and show all cards
    if (searchInput && searchInput.value.trim() !== '') {
      searchInput.value = '';
      if (searchClearBtn) searchClearBtn.classList.remove('visible');
      filterServices();
    }

    const targetCard = document.getElementById(cardId);
    if (!targetCard) return;

    // Prevent scrollspy from conflicting during smooth scroll animation
    isTeleporting = true;
    clearTimeout(teleportTimer);

    // 2. Set active dock button immediately
    setActiveDockBtn(cardId);

    // 3. Smoothly scroll directly to the card
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 4. Trigger pulse highlight animation
    targetCard.classList.remove('card-teleport-pulse', 'card-highlight-pulse');
    // Force DOM reflow to restart animation
    void targetCard.offsetWidth;
    targetCard.classList.add('card-teleport-pulse');

    // 5. Toast notification
    const deptName = targetCard.querySelector('.dept-name')?.textContent || 'Department';
    showToast(`⚡ Teleported to ${deptName}`);

    // Clean up animation class
    setTimeout(() => {
      targetCard.classList.remove('card-teleport-pulse');
    }, 2400);

    // Resume scrollspy after smooth scrolling settles
    teleportTimer = setTimeout(() => {
      isTeleporting = false;
    }, 850);
  }

  // Bind Top Quick Jump Cards (if present)
  document.querySelectorAll('.quick-jump-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      teleportToCard(targetId, 'top-grid');
    });
  });

  // Bind Universal Floating Dock Buttons
  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (btn.id === 'dock-btn-top') {
        isTeleporting = true;
        clearTimeout(teleportTimer);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('⬆️ Back to Top');
        setActiveDockBtn('card-welcome-center');
        teleportTimer = setTimeout(() => {
          isTeleporting = false;
          updateScrollSpy();
        }, 850);
      } else {
        const targetId = btn.getAttribute('data-target');
        teleportToCard(targetId, 'dock');
      }
    });
  });

  /**
   * Deterministic ScrollSpy for Desktop (2-column & 1-column) and Mobile
   * Smoothly navigates through Welcome Center -> Admissions -> Financial Aid -> Counseling
   */
  let scrollTicking = false;

  function updateScrollSpy() {
    if (isTeleporting) return;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // 1. If user is at or near the very top of the page
    if (scrollY < 50) {
      setActiveDockBtn('card-welcome-center');
      return;
    }

    // 2. If user is near the bottom of the page
    if ((viewportHeight + scrollY) >= (docHeight - 60)) {
      setActiveDockBtn('card-counseling');
      return;
    }

    const cardWelcome = document.getElementById('card-welcome-center');
    const cardAdmissions = document.getElementById('card-admissions-records');
    const cardFinAid = document.getElementById('card-financial-aid');
    const cardCounseling = document.getElementById('card-counseling');

    if (!cardWelcome || !cardAdmissions || !cardFinAid || !cardCounseling) return;

    const rectWelcome = cardWelcome.getBoundingClientRect();
    const rectAdmissions = cardAdmissions.getBoundingClientRect();
    const rectFinAid = cardFinAid.getBoundingClientRect();
    const rectCounseling = cardCounseling.getBoundingClientRect();

    // Check if cards are rendered in 2-column layout (Desktop)
    const isTwoColumn = Math.abs(rectWelcome.top - rectAdmissions.top) < 40;

    if (isTwoColumn) {
      // 2-Column Desktop Grid
      const focusY = viewportHeight * 0.35;
      const row1Top = rectWelcome.top;
      const row1Height = Math.max(rectWelcome.height, rectAdmissions.height);
      const row2Top = rectFinAid.top;
      const row2Height = Math.max(rectFinAid.height, rectCounseling.height);

      if (row2Top > focusY) {
        // Row 1 (Welcome Center & Admissions & Records) is in focal zone
        const progress1 = (focusY - row1Top) / (row1Height + 60);
        if (progress1 < 0.45) {
          setActiveDockBtn('card-welcome-center');
        } else {
          setActiveDockBtn('card-admissions-records');
        }
      } else {
        // Row 2 (Financial Aid & Counseling) is in focal zone
        const progress2 = (focusY - row2Top) / (row2Height + 60);
        if (progress2 < 0.45) {
          setActiveDockBtn('card-financial-aid');
        } else {
          setActiveDockBtn('card-counseling');
        }
      }
    } else {
      // 1-Column Layout (Mobile / Tablet)
      const focusY = viewportHeight * 0.32;
      const cards = [cardWelcome, cardAdmissions, cardFinAid, cardCounseling];
      
      let bestCardId = 'card-welcome-center';
      let highestScore = -Infinity;

      cards.forEach(card => {
        if (card.style.display === 'none') return;
        const rect = card.getBoundingClientRect();
        if (rect.bottom <= 40 || rect.top >= viewportHeight - 40) return;

        let score = 0;
        if (rect.top <= focusY && rect.bottom >= focusY) {
          score = 10000 - Math.abs(rect.top - 80);
        } else {
          const cardCenterY = rect.top + (rect.height / 2);
          score = 1000 - Math.abs(cardCenterY - focusY);
        }

        if (score > highestScore) {
          highestScore = score;
          bestCardId = card.id;
        }
      });

      setActiveDockBtn(bestCardId);
    }
  }

  // Add interactive hover highlights for desktop cards
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      if (!isTeleporting) {
        setActiveDockBtn(card.id);
      }
    });
  });

  // Smooth rAF-throttled scroll listener
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollSpy();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updateScrollSpy();
  }, { passive: true });

  // Initial Boot
  updateClock();
  updateLiveStatusPills();
  setTimeout(updateScrollSpy, 250);

  // Tick clock every second, update status every 30 seconds
  setInterval(updateClock, 1000);
  setInterval(updateLiveStatusPills, 30000);

  // Check URL hash for direct teleport on load
  if (window.location.hash) {
    const rawHash = window.location.hash.substring(1);
    const possibleCard = document.getElementById(rawHash) || document.getElementById(`card-${rawHash}`);
    if (possibleCard) {
      setTimeout(() => {
        teleportToCard(possibleCard.id, 'hash');
      }, 350);
    }
  }
});
