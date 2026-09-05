/**
 * Gavilan College Student Services Database
 * Updated as of Fall 2026 (Effective 9/1/2026)
 * 
 * Time format: 24-hour "HH:MM" for computational accuracy.
 * Days: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday, 0 = Sunday
 */

export const DEPARTMENTS = [
  {
    id: "welcome-center",
    name: "Welcome Center",
    shortName: "Welcome Center",
    category: "Student Navigation & First Stop",
    icon: "fa-door-open",
    badge: "Core Service",
    isCore: true,
    isTBA: false,
    description: "Your primary hub for campus directions, student ID cards, general assistance, and navigation support.",
    location: "Student Center, Gilroy Campus (SC 100)",
    modes: [
      {
        id: "in-person",
        label: "On-Campus Desk",
        icon: "fa-building-columns",
        schedule: {
          1: { open: "08:00", close: "18:00", display: "8:00 AM – 6:00 PM" },
          2: { open: "08:00", close: "18:00", display: "8:00 AM – 6:00 PM" },
          3: { open: "08:00", close: "17:00", display: "8:00 AM – 5:00 PM" },
          4: { open: "08:00", close: "17:00", display: "8:00 AM – 5:00 PM" },
          5: { open: "08:00", close: "14:00", display: "8:00 AM – 2:00 PM" },
          6: null,
          0: null
        },
        notes: "Walk-ins welcome during open hours."
      },
      {
        id: "zoom",
        label: "Virtual Zoom Desk",
        icon: "fa-video",
        schedule: {
          1: { open: "08:00", close: "18:00", display: "8:00 AM – 6:00 PM" },
          2: { open: "08:00", close: "18:00", display: "8:00 AM – 6:00 PM" },
          3: { open: "08:00", close: "17:00", display: "8:00 AM – 5:00 PM" },
          4: { open: "08:00", close: "17:00", display: "8:00 AM – 5:00 PM" },
          5: { open: "08:00", close: "14:00", display: "8:00 AM – 2:00 PM" },
          6: null,
          0: null
        },
        notes: "Drop-in Zoom lobby mirrors standard Welcome Center desk hours."
      }
    ],
    searchKeywords: ["welcome", "info", "front desk", "directions", "student id", "orientation", "help"]
  },
  {
    id: "admissions-records",
    name: "Admissions & Records",
    shortName: "A & R",
    category: "Enrollment & Transcripts",
    icon: "fa-id-card-clip",
    badge: "Core Service",
    isCore: true,
    isTBA: false,
    description: "Application processing, class registration, official transcript requests, residency reclassification, and graduation evaluations.",
    location: "Student Center, Gilroy Campus (SC 106)",
    modes: [
      {
        id: "in-person",
        label: "On-Campus Counter",
        icon: "fa-building-columns",
        schedule: {
          1: { open: "08:30", close: "18:00", display: "8:30 AM – 6:00 PM" },
          2: { open: "08:30", close: "18:00", display: "8:30 AM – 6:00 PM" },
          3: { open: "08:30", close: "17:00", display: "8:30 AM – 5:00 PM" },
          4: { open: "08:30", close: "17:00", display: "8:30 AM – 5:00 PM" },
          5: { open: "08:30", close: "14:00", display: "8:30 AM – 2:00 PM" },
          6: null,
          0: null
        },
        notes: "In-person registration and records counter."
      },
      {
        id: "zoom",
        label: "Virtual Zoom Counter",
        icon: "fa-video",
        schedule: {
          1: { open: "10:00", close: "15:00", display: "10:00 AM – 3:00 PM" },
          2: { open: "10:00", close: "15:00", display: "10:00 AM – 3:00 PM" },
          3: { open: "10:00", close: "15:00", display: "10:00 AM – 3:00 PM" },
          4: { open: "10:00", close: "15:00", display: "10:00 AM – 3:00 PM" },
          5: null,
          6: null,
          0: null
        },
        notes: "Virtual Zoom desk available Monday through Thursday only. Closed / Not Available on Fridays."
      }
    ],
    searchKeywords: ["admissions", "records", "transcripts", "register", "classes", "enroll", "graduation", "residency", "a&r"]
  },
  {
    id: "financial-aid",
    name: "Financial Aid",
    shortName: "Financial Aid",
    category: "Grants, FAFSA & Scholarships",
    icon: "fa-hand-holding-dollar",
    badge: "Core Service",
    isCore: true,
    isTBA: false,
    description: "FAFSA, California Dream Act (CADAA), California College Promise Grant (CCPG fee waiver), student loans, and federal work-study.",
    location: "Student Center, Gilroy Campus (SC 110)",
    modes: [
      {
        id: "in-person",
        label: "Office Hours",
        icon: "fa-building-columns",
        schedule: {
          1: { open: "08:30", close: "17:30", display: "8:30 AM – 5:30 PM" },
          2: { open: "08:30", close: "17:30", display: "8:30 AM – 5:30 PM" },
          3: { open: "08:30", close: "17:00", display: "8:30 AM – 5:00 PM" },
          4: { open: "08:30", close: "17:00", display: "8:30 AM – 5:00 PM" },
          5: { 
            open: "08:30", 
            close: "14:00", 
            display: "8:30 AM – 12:00 PM (Drop-in)\n12:00 PM – 2:00 PM (Appt only)" 
          },
          6: null,
          0: null
        },
        notes: "Friday schedule: Drop-in available 8:30 AM – 12:00 PM. From 12:00 PM – 2:00 PM service is strictly by appointment only."
      }
    ],
    searchKeywords: ["financial aid", "fafsa", "dream act", "scholarship", "grants", "promise grant", "tuition", "loans", "money"]
  },
  {
    id: "counseling",
    name: "Counseling",
    shortName: "Counseling",
    category: "Academic Planning & Career",
    icon: "fa-user-graduate",
    badge: "Core Service",
    isCore: true,
    isTBA: true,
    description: "Educational planning (Ed Plans), transfer advising to CSU/UC, career counseling, graduation checks, and personal guidance.",
    location: "Student Center, Gilroy Campus",
    tbaNotice: {
      title: "Hours Under Construction / TBA",
      subtitle: "Fall 2026 Schedule Being Finalized",
      message: "The official Fall 2026 counseling appointment & drop-in schedule is currently being finalized. For immediate advising triage or referral, please contact the Welcome Center.",
      actionText: "Inquire via Welcome Center",
      actionTarget: "welcome-center"
    },
    modes: [
      {
        id: "in-person",
        label: "Schedule",
        icon: "fa-clock",
        schedule: {
          1: { open: null, close: null, display: "TBA (Under Construction)" },
          2: { open: null, close: null, display: "TBA (Under Construction)" },
          3: { open: null, close: null, display: "TBA (Under Construction)" },
          4: { open: null, close: null, display: "TBA (Under Construction)" },
          5: { open: null, close: null, display: "TBA (Under Construction)" },
          6: null,
          0: null
        },
        notes: "Counseling appointments and drop-in schedule will be posted as soon as finalized."
      }
    ],
    searchKeywords: ["counseling", "counselor", "ed plan", "transfer", "advising", "career", "classes", "counsel"]
  }
];

export const DAYS_MAP = [
  { index: 0, key: "Sun", fullName: "Sunday", isWeekend: true },
  { index: 1, key: "Mon", fullName: "Monday", isWeekend: false },
  { index: 2, key: "Tue", fullName: "Tuesday", isWeekend: false },
  { index: 3, key: "Wed", fullName: "Wednesday", isWeekend: false },
  { index: 4, key: "Thu", fullName: "Thursday", isWeekend: false },
  { index: 5, key: "Fri", fullName: "Friday", isWeekend: false },
  { index: 6, key: "Sat", fullName: "Saturday", isWeekend: true }
];
