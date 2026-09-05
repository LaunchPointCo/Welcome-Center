import { DEPARTMENTS, DAYS_MAP } from './data.js';

// Application State
const state = {
  selectedDayIndex: 'today', // 'today' or integer 0-6
  activeModes: {},           // deptId -> modeId ('in-person' or 'zoom')
  searchQuery: '',
  simulatedTime: null,       // null or { day: number, time: 'HH:MM' }
  deferredPrompt: null,
  desktopGrid: false
};

// Initialize active modes for departments
DEPARTMENTS.forEach(dept => {
  if (dept.modes && dept.modes.length > 0) {
    state.activeModes[dept.id] = dept.modes[0].id;
  }
});

// DOM Elements
const cardsContainer = document.getElementById('cards-container');
const daysBar = document.getElementById('days-bar');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const liveTimeDisplay = document.getElementById('live-time-display');
const resultsCountEl = document.getElementById('feed-results-count');
const feedHeadingEl = document.getElementById('feed-status-heading');
const toastNotice = document.getElementById('toast-notice');
const toastMsg = document.getElementById('toast-msg');

// Modal Elements
const installModal = document.getElementById('install-modal');
const openInstallBtn = document.getElementById('open-install-guide');
const bottomInstallBtn = document.getElementById('bottom-install-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const tabIos = document.getElementById('tab-ios');
const tabAndroid = document.getElementById('tab-android');
const stepsIos = document.getElementById('steps-ios');
const stepsAndroid = document.getElementById('steps-android');

// Desktop Toggle
const desktopToggleBtn = document.getElementById('desktop-view-toggle');
const viewToggleText = document.getElementById('view-toggle-text');

// Simulator Elements
const simToggleBtn = document.getElementById('sim-toggle-btn');
const simPanel = document.getElementById('time-simulator-panel');
const simDaySelect = document.getElementById('sim-day-select');
const simTimeInput = document.getElementById('sim-time-input');
const simApplyBtn = document.getElementById('sim-apply-btn');
const simResetBtn = document.getElementById('sim-reset-btn');

/**
 * Get current effective Pacific Time and Day
 */
function getPacificDateTime() {
  if (state.simulatedTime) {
    const parts = state.simulatedTime.time.split(':').map(Number);
    const hours = parts[0];
    const minutes = parts[1];
    return {
      dayOfWeek: state.simulatedTime.day,
      hours,
      minutes,
      timeStr: state.simulatedTime.time,
      isSimulated: true,
      displayTime: `${format12Hour(state.simulatedTime.time)} (Simulated)`
    };
  }

  // Get Pacific Time using Intl API
  const now = new Date();
  const options = {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
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

  // Map weekdayShort to day index (0=Sun, 1=Mon, ..., 6=Sat)
  const shortMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = shortMap[weekdayShort] ?? now.getDay();
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const displayTime = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit'
  });

  return {
    dayOfWeek,
    hours,
    minutes,
    timeStr,
    isSimulated: false,
    displayTime
  };
}

/**
 * Format 24h "HH:MM" to "h:mm AM/PM"
 */
function format12Hour(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Calculate Real-Time Department Status
 */
function computeDeptStatus(dept, mode, pt) {
  if (dept.isTBA) {
    return {
      statusClass: 'status-tba',
      badgeText: 'Hours TBA',
      nextInfo: 'Fall 2026 finalizing'
    };
  }

  const todaySched = mode.schedule ? mode.schedule[pt.dayOfWeek] : null;

  // If department mode has hours today
  if (todaySched && todaySched.open && todaySched.close) {
    const curMinutes = pt.hours * 60 + pt.minutes;
    const [openH, openM] = todaySched.open.split(':').map(Number);
    const [closeH, closeM] = todaySched.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (curMinutes < openMinutes) {
      return {
        statusClass: 'status-closed',
        badgeText: 'Closed',
        nextInfo: `Opens today at ${format12Hour(todaySched.open)}`
      };
    } else if (curMinutes >= openMinutes && curMinutes < closeMinutes) {
      const remainingMinutes = closeMinutes - curMinutes;
      if (remainingMinutes <= 45) {
        return {
          statusClass: 'status-closing-soon',
          badgeText: 'Closing Soon',
          nextInfo: `Closes at ${format12Hour(todaySched.close)} (${remainingMinutes}m left)`
        };
      }
      return {
        statusClass: 'status-open',
        badgeText: 'Open Now',
        nextInfo: `Until ${format12Hour(todaySched.close)}`
      };
    } else {
      // Closed for the day, find next open day
      const nextOpen = findNextOpenDay(mode, pt.dayOfWeek);
      return {
        statusClass: 'status-closed',
        badgeText: 'Closed',
        nextInfo: nextOpen ? `Opens ${nextOpen}` : 'Closed today'
      };
    }
  }

  // Not open today (e.g. weekend or Friday Zoom for A&R)
  const nextOpen = findNextOpenDay(mode, pt.dayOfWeek);
  return {
    statusClass: 'status-closed',
    badgeText: 'Closed Today',
    nextInfo: nextOpen ? `Opens ${nextOpen}` : 'Closed'
  };
}

/**
 * Find next open day & time string
 */
function findNextOpenDay(mode, currentDay) {
  if (!mode.schedule) return null;
  for (let i = 1; i <= 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const sched = mode.schedule[checkDay];
    if (sched && sched.open) {
      const dayName = checkDay === (currentDay + 1) % 7 ? 'Tomorrow' : DAYS_MAP.find(d => d.index === checkDay)?.fullName;
      return `${dayName} at ${format12Hour(sched.open)}`;
    }
  }
  return null;
}

/**
 * Render Day Selector Tabs
 */
function renderDaysBar(pt) {
  const effectiveDay = state.selectedDayIndex === 'today' ? pt.dayOfWeek : state.selectedDayIndex;
  
  // Tabs to show: Today, Mon, Tue, Wed, Thu, Fri
  const tabs = [
    { id: 'today', label: 'Today', sub: DAYS_MAP.find(d => d.index === pt.dayOfWeek)?.key || 'Now' },
    { id: 1, label: 'Mon', sub: 'Sept' },
    { id: 2, label: 'Tue', sub: 'Sept' },
    { id: 3, label: 'Wed', sub: 'Sept' },
    { id: 4, label: 'Thu', sub: 'Sept' },
    { id: 5, label: 'Fri', sub: 'Sept' }
  ];

  daysBar.innerHTML = tabs.map(tab => {
    const isActive = state.selectedDayIndex === tab.id;
    return `
      <button class="day-pill ${isActive ? 'active' : ''}" data-day="${tab.id}">
        <span>${tab.label}</span>
        <span class="day-sub">${tab.sub}</span>
      </button>
    `;
  }).join('');

  // Event listeners for day pills
  daysBar.querySelectorAll('.day-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-day');
      state.selectedDayIndex = val === 'today' ? 'today' : parseInt(val, 10);
      renderDaysBar(getPacificDateTime());
      renderCards();
    });
  });
}

/**
 * Render Department Cards
 */
function renderCards() {
  const pt = getPacificDateTime();
  const activeDayIndex = state.selectedDayIndex === 'today' ? pt.dayOfWeek : state.selectedDayIndex;
  const activeDayObj = DAYS_MAP.find(d => d.index === activeDayIndex);

  // Filter departments by search
  const query = state.searchQuery.toLowerCase().trim();
  const filteredDepts = DEPARTMENTS.filter(dept => {
    if (!query) return true;
    const inName = dept.name.toLowerCase().includes(query);
    const inCategory = dept.category.toLowerCase().includes(query);
    const inDesc = dept.description.toLowerCase().includes(query);
    const inKeywords = dept.searchKeywords && dept.searchKeywords.some(kw => kw.toLowerCase().includes(query));
    return inName || inCategory || inDesc || inKeywords;
  });

  // Update counts and title
  resultsCountEl.textContent = `${filteredDepts.length} ${filteredDepts.length === 1 ? 'Service' : 'Services'}`;
  if (state.selectedDayIndex === 'today') {
    feedHeadingEl.textContent = `Today's Schedule (${activeDayObj?.fullName || ''})`;
  } else {
    feedHeadingEl.textContent = `${activeDayObj?.fullName}'s Schedule`;
  }

  if (filteredDepts.length === 0) {
    cardsContainer.innerHTML = `
      <div class="no-results-box card-fade-in">
        <i class="fas fa-search-minus"></i>
        <h3>No services match "${query}"</h3>
        <p>Try searching for Welcome Center, Admissions, Financial Aid, or Counseling.</p>
        <button class="btn-card-action" id="reset-search-btn" style="color: var(--gold-400); border-color: var(--gold-500);">
          <i class="fas fa-rotate-left"></i> Clear Search
        </button>
      </div>
    `;
    const resetBtn = document.getElementById('reset-search-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.searchQuery = '';
        searchInput.value = '';
        searchClearBtn.classList.remove('visible');
        renderCards();
      });
    }
    return;
  }

  cardsContainer.innerHTML = filteredDepts.map(dept => {
    const activeModeId = state.activeModes[dept.id] || (dept.modes[0] ? dept.modes[0].id : 'in-person');
    const currentMode = dept.modes ? dept.modes.find(m => m.id === activeModeId) || dept.modes[0] : null;
    const status = computeDeptStatus(dept, currentMode, pt);

    // Get schedule for selected day
    let selectedDayDisplay = 'Closed';
    let selectedDayBadge = 'Closed';

    if (dept.isTBA) {
      selectedDayDisplay = 'Hours TBA (Under Construction)';
      selectedDayBadge = 'TBA';
    } else if (currentMode && currentMode.schedule && currentMode.schedule[activeDayIndex]) {
      selectedDayDisplay = currentMode.schedule[activeDayIndex].display;
      selectedDayBadge = currentMode.schedule[activeDayIndex].open ? 'Scheduled' : 'Closed';
    } else {
      selectedDayDisplay = 'Closed on this day';
      selectedDayBadge = 'Closed';
    }

    // Has multiple modes (e.g. In-Person and Zoom)
    const hasMultipleModes = dept.modes && dept.modes.length > 1;

    return `
      <article class="dept-card card-fade-in ${dept.isTBA ? 'card-tba' : ''}" id="card-${dept.id}" data-dept-id="${dept.id}">
        
        <!-- Header -->
        <div class="card-header-bar">
          <div class="dept-icon-box">
            <i class="fas ${dept.icon}"></i>
          </div>
          <div class="dept-header-details">
            <div class="dept-meta-row">
              <span class="dept-badge">${dept.badge}</span>
              <span class="dept-category">${dept.category}</span>
            </div>
            <h2 class="dept-title">${dept.name}</h2>
            <div class="dept-location">
              <i class="fas fa-location-dot"></i>
              <span>${dept.location}</span>
            </div>
          </div>
        </div>

        <!-- Segmented In-Person vs Zoom Mode Tabs (if available) -->
        ${hasMultipleModes ? `
          <div class="mode-segmented-tabs" role="tablist" aria-label="${dept.name} Delivery Modes">
            ${dept.modes.map(mode => `
              <button 
                class="mode-tab-btn ${mode.id === activeModeId ? 'active' : ''}" 
                data-dept="${dept.id}" 
                data-mode="${mode.id}"
                role="tab"
                aria-selected="${mode.id === activeModeId}"
              >
                <i class="fas ${mode.icon}"></i>
                <span>${mode.label}</span>
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Real-Time Status Pill -->
        <div class="card-status-bar ${status.statusClass}">
          <div class="status-left">
            <span class="status-dot"></span>
            <span>${status.badgeText}</span>
          </div>
          <div class="status-next-info">${status.nextInfo}</div>
        </div>

        <!-- Selected Day Hours Box -->
        ${!dept.isTBA ? `
          <div class="selected-day-hours-box">
            <div class="day-hours-left">
              <span class="day-hours-label">${activeDayObj.fullName} Hours</span>
              <span class="day-hours-time">${selectedDayDisplay}</span>
            </div>
            <span class="day-hours-badge">${selectedDayBadge}</span>
          </div>
        ` : ''}

        <!-- Notes / Special Instructions -->
        ${currentMode && currentMode.notes && !dept.isTBA ? `
          <div class="card-note-box">
            <i class="fas fa-circle-info"></i>
            <div>${currentMode.notes}</div>
          </div>
        ` : ''}

        <!-- Counseling TBA Callout -->
        ${dept.isTBA ? `
          <div class="tba-box">
            <div class="tba-icon-ring">
              <i class="fas fa-person-digging"></i>
            </div>
            <h4>${dept.tbaNotice.title}</h4>
            <p>${dept.tbaNotice.message}</p>
            <button class="btn-tba-action" data-target="${dept.tbaNotice.actionTarget}">
              <i class="fas fa-comments"></i>
              <span>${dept.tbaNotice.actionText}</span>
            </button>
          </div>
        ` : ''}

        <!-- Collapsible Full Week Schedule Drawer -->
        ${!dept.isTBA && currentMode ? `
          <div class="week-accordion">
            <button class="accordion-trigger" data-target="drawer-${dept.id}" aria-expanded="false">
              <span><i class="far fa-calendar-alt"></i> View Full Fall 2026 Week</span>
              <i class="fas fa-chevron-down chevron"></i>
            </button>
            <div class="week-schedule-drawer" id="drawer-${dept.id}">
              <div class="week-rows-list">
                ${[1, 2, 3, 4, 5].map(dayNum => {
                  const dayMapItem = DAYS_MAP.find(d => d.index === dayNum);
                  const isCurActive = activeDayIndex === dayNum;
                  const sched = currentMode.schedule[dayNum];
                  const timeText = sched ? sched.display : 'Closed';
                  return `
                    <div class="week-day-row ${isCurActive ? 'active-day' : ''}">
                      <span class="day-name">${dayMapItem.fullName}</span>
                      <span class="day-time-slot">${timeText}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Footer Actions -->
        <div class="card-footer-actions">
          <button class="btn-card-action btn-copy-hours" data-dept="${dept.id}">
            <i class="far fa-copy"></i>
            <span>Copy Hours</span>
          </button>
          <button class="btn-card-action btn-share-dept" data-dept="${dept.id}">
            <i class="fas fa-share-nodes"></i>
            <span>Share</span>
          </button>
        </div>

      </article>
    `;
  }).join('');

  attachCardEvents();
}

/**
 * Attach Card Click Events
 */
function attachCardEvents() {
  // Mode Switchers
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const deptId = btn.getAttribute('data-dept');
      const modeId = btn.getAttribute('data-mode');
      state.activeModes[deptId] = modeId;
      renderCards();
    });
  });

  // Week Drawer Accordions
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-target');
      const drawer = document.getElementById(targetId);
      const isExpanded = trigger.classList.contains('expanded');

      if (isExpanded) {
        trigger.classList.remove('expanded');
        trigger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('open');
      } else {
        trigger.classList.add('expanded');
        trigger.setAttribute('aria-expanded', 'true');
        drawer.classList.add('open');
      }
    });
  });

  // Counseling TBA action button
  document.querySelectorAll('.btn-tba-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetCard = document.getElementById(`card-${targetId}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.style.boxShadow = '0 0 0 3px var(--gold-500)';
        setTimeout(() => {
          targetCard.style.boxShadow = '';
        }, 1800);
      }
    });
  });

  // Copy Hours Action
  document.querySelectorAll('.btn-copy-hours').forEach(btn => {
    btn.addEventListener('click', () => {
      const deptId = btn.getAttribute('data-dept');
      const dept = DEPARTMENTS.find(d => d.id === deptId);
      if (!dept) return;

      const activeModeId = state.activeModes[dept.id] || (dept.modes[0] ? dept.modes[0].id : 'in-person');
      const mode = dept.modes.find(m => m.id === activeModeId);

      let textToCopy = `${dept.name} (${mode.label}) - Fall 2026 Hours\n`;
      if (dept.isTBA) {
        textToCopy += `Status: Hours Under Construction / TBA\nInquiries: Contact Welcome Center`;
      } else {
        [1, 2, 3, 4, 5].forEach(dayNum => {
          const dayName = DAYS_MAP.find(d => d.index === dayNum)?.fullName;
          const sched = mode.schedule[dayNum];
          textToCopy += `${dayName}: ${sched ? sched.display : 'Closed'}\n`;
        });
        if (mode.notes) textToCopy += `Note: ${mode.notes}\n`;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied ${dept.name} hours to clipboard!`);
        });
      } else {
        showToast(`Copied ${dept.name} hours!`);
      }
    });
  });

  // Share Action
  document.querySelectorAll('.btn-share-dept').forEach(btn => {
    btn.addEventListener('click', () => {
      const deptId = btn.getAttribute('data-dept');
      const dept = DEPARTMENTS.find(d => d.id === deptId);
      if (!dept) return;

      if (navigator.share) {
        navigator.share({
          title: `Gavilan College - ${dept.name} Hours`,
          text: `Check Fall 2026 hours for Gavilan College ${dept.name}`,
          url: window.location.href
        }).catch(() => {});
      } else {
        showToast(`URL ready to share!`);
      }
    });
  });
}

/**
 * Toast Notification Utility
 */
let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  toastMsg.textContent = msg;
  toastNotice.classList.add('show');
  toastTimeout = setTimeout(() => {
    toastNotice.classList.remove('show');
  }, 2600);
}

/**
 * Live Clock Update
 */
function updateClock() {
  const pt = getPacificDateTime();
  liveTimeDisplay.textContent = pt.displayTime;
}

/**
 * Search Handler
 */
searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  if (state.searchQuery.length > 0) {
    searchClearBtn.classList.add('visible');
  } else {
    searchClearBtn.classList.remove('visible');
  }
  renderCards();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  searchClearBtn.classList.remove('visible');
  searchInput.focus();
  renderCards();
});

/**
 * Desktop Wide View Toggle
 */
desktopToggleBtn.addEventListener('click', () => {
  state.desktopGrid = !state.desktopGrid;
  if (state.desktopGrid) {
    document.body.classList.add('desktop-grid-mode');
    viewToggleText.textContent = 'Mobile View';
    desktopToggleBtn.querySelector('i').className = 'fas fa-mobile-screen';
  } else {
    document.body.classList.remove('desktop-grid-mode');
    viewToggleText.textContent = 'Wide View';
    desktopToggleBtn.querySelector('i').className = 'fas fa-table-columns';
  }
});

/**
 * Time Simulator Panel Handlers
 */
simToggleBtn.addEventListener('click', () => {
  simPanel.classList.toggle('active');
});

simApplyBtn.addEventListener('click', () => {
  const day = parseInt(simDaySelect.value, 10);
  const time = simTimeInput.value || '10:00';
  state.simulatedTime = { day, time };
  showToast(`Simulating ${DAYS_MAP.find(d => d.index === day)?.fullName} at ${format12Hour(time)}`);
  updateClock();
  renderDaysBar(getPacificDateTime());
  renderCards();
});

simResetBtn.addEventListener('click', () => {
  state.simulatedTime = null;
  simPanel.classList.remove('active');
  showToast('Reset to real-time clock');
  updateClock();
  renderDaysBar(getPacificDateTime());
  renderCards();
});

/**
 * Modal & PWA Installation Guide
 */
function openModal() {
  installModal.classList.add('active');
  installModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  installModal.classList.remove('active');
  installModal.setAttribute('aria-hidden', 'true');
}

openInstallBtn.addEventListener('click', openModal);
bottomInstallBtn.addEventListener('click', () => {
  if (state.deferredPrompt) {
    state.deferredPrompt.prompt();
    state.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('App added to home screen!');
      }
      state.deferredPrompt = null;
    });
  } else {
    openModal();
  }
});

modalCloseBtn.addEventListener('click', closeModal);
installModal.addEventListener('click', (e) => {
  if (e.target === installModal) closeModal();
});

// Platform Tab Switcher inside Modal
tabIos.addEventListener('click', () => {
  tabIos.classList.add('active');
  tabAndroid.classList.remove('active');
  stepsIos.style.display = 'flex';
  stepsAndroid.style.display = 'none';
});

tabAndroid.addEventListener('click', () => {
  tabAndroid.classList.add('active');
  tabIos.classList.remove('active');
  stepsAndroid.style.display = 'flex';
  stepsIos.style.display = 'none';
});

// Capture PWA Install Prompt if browser supports it
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  state.deferredPrompt = e;
  // Make bottom bar stand out
  const dock = document.getElementById('bottom-dock');
  if (dock) dock.style.display = 'flex';
});

/**
 * App Initialization
 */
function init() {
  const pt = getPacificDateTime();
  updateClock();
  renderDaysBar(pt);
  renderCards();

  // Tick clock every 10 seconds to keep live status accurate
  setInterval(() => {
    if (!state.simulatedTime) {
      updateClock();
      renderCards();
    }
  }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
