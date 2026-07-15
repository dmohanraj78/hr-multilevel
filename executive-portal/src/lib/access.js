// Central RBAC allow-list for the Aviators portals.
//
// Login is restricted to Google accounts on the @mondee.com domain, and every
// email is granted access ONLY to the portals listed for it here. A user may
// have access to several portals (e.g. admins), so access is a list, not a
// single role.
//
// To change who can access what: edit ACCESS below and redeploy the apps.
// Keep this file identical across all five apps (sso + the four portals).

export const PORTAL_URLS = {
  master: 'https://aviators-master.vercel.app',
  recruiter: 'https://aviators-recruiter.vercel.app',
  evaluator: 'https://aviators-evaluator.vercel.app',
  executive: 'https://aviators-executive.vercel.app',
};

export const PORTAL_LABELS = {
  master: 'Master Portal',
  recruiter: 'Recruiter Portal',
  evaluator: 'Evaluator Portal',
  executive: 'Executive Portal',
};

export const PORTAL_ACCENTS = {
  master: '#800020',
  recruiter: '#ea580c',
  evaluator: '#0d9488',
  executive: '#7c3aed',
};

const ALL = ['master', 'recruiter', 'executive', 'evaluator'];

export const ACCESS = {
  // Full access to every portal (admins). In the evaluator portal these four
  // are not scoped to a queue (not in EVALUATOR_NAMES), so they see all queues.
  'mgoel@mondee.com': ALL, // Mayank
  'dmohanraj@mondee.com': ALL, // Dhanush
  'ggupta@mondee.com': ALL, // Geetika
  'prasad@mondee.com': ALL, // Prasad

  // Technical reviewers -> Evaluator portal only
  'ayalla@mondee.com': ['evaluator'], // Akash
  'ashrivastava@mondee.com': ['evaluator'], // Aman
  'amungalapara@mondee.com': ['evaluator'], // Ankita
  'asahu@mondee.com': ['evaluator'], // Anmol
  'bpatil@mondee.com': ['evaluator'], // Basavraj
  'pbaradkar@mondee.com': ['evaluator'], // Pushkaraj
  'smehndiratta@mondee.com': ['evaluator'], // Sachin
  'shanagandi@mondee.com': ['evaluator'], // Sohan
  'tkambaiahgari@mondee.com': ['evaluator'], // Tejaswini
  'vranade@mondee.com': ['evaluator'], // Vedant
};

// Maps each technical reviewer's login email to their evaluation-queue name
// (the `eval_group` value candidates are assigned to). Used by the evaluator
// portal to scope a reviewer to only their own assigned candidates. Admins
// (mgoel, dmohanraj) are intentionally absent — they see every queue.
export const EVALUATOR_NAMES = {
  'ayalla@mondee.com': 'Akash',
  'ashrivastava@mondee.com': 'Aman',
  'dmohanraj@mondee.com': 'Dhanush',
  'amungalapara@mondee.com': 'Ankita',
  'asahu@mondee.com': 'Anmol',
  'bpatil@mondee.com': 'Basvaraj',
  'pbaradkar@mondee.com': 'Pushkaraj',
  'smehndiratta@mondee.com': 'Sachin',
  'shanagandi@mondee.com': 'Sohan',
  'tkambaiahgari@mondee.com': 'Tejaswini',
  'vranade@mondee.com': 'Vedant',
};

export const normalizeEmail = (email) => (email || '').toLowerCase().trim();

// Returns the reviewer's queue name if the email is a scoped technical
// reviewer, or null for admins (who may see all queues).
export const getEvaluatorName = (email) => EVALUATOR_NAMES[normalizeEmail(email)] || null;

export const isMondeeEmail = (email) =>
  normalizeEmail(email).endsWith('@mondee.com');

export const getUserPortals = (email) => ACCESS[normalizeEmail(email)] || [];

export const hasPortalAccess = (email, portal) =>
  getUserPortals(email).includes(portal);
