// =====================================================================
// SPARK localStorage utility functions
// =====================================================================

import { DEPARTMENTS } from './mockData';

const KEYS = {
  USERS: 'spark_users',
  CURRENT_USER: 'spark_current_user',
  SUBMISSIONS: 'spark_submissions',
  LOGS: 'spark_logs',
  COLLEGES: 'spark_colleges',
  REGISTERED: 'spark_registered',
  THEME: 'spark_theme',
};

// ---- INIT ----
export const initDB = () => {
  // Initialise empty stores if not yet present — no dummy data seeded
  if (!localStorage.getItem(KEYS.USERS))       localStorage.setItem(KEYS.USERS, '[]');
  if (!localStorage.getItem(KEYS.SUBMISSIONS)) localStorage.setItem(KEYS.SUBMISSIONS, '[]');
  if (!localStorage.getItem(KEYS.LOGS))        localStorage.setItem(KEYS.LOGS, '[]');
  if (!localStorage.getItem(KEYS.COLLEGES))    localStorage.setItem(KEYS.COLLEGES, '[]');
};

// ---- USERS ----
export const getUsers = () => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
export const saveUsers = (users) => localStorage.setItem(KEYS.USERS, JSON.stringify(users));

export const getUserById = (id) => getUsers().find(u => u.id === id) || null;
export const getUsersByRole = (role) => getUsers().filter(u => u.role === role);

export const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const updateUser = (id, updates) => {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsers(users);
  // Also update current session if it's the same user
  const current = getCurrentUser();
  if (current && current.id === id) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ ...current, ...updates }));
  }
};

export const isEmailRegistered = (email) => getUsers().some(u => u.email === email);

// ---- AUTH ----
export const getCurrentUser = () => {
  const data = localStorage.getItem(KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const login = (email, password, role) => {
  const e = email.trim().toLowerCase();
  const p = password;

  const users = getUsers();
  const user = role
    ? users.find(u => u.email?.toLowerCase() === e && u.password === p && u.role === role)
    : users.find(u => u.email?.toLowerCase() === e && u.password === p);

  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }

  return { success: false, error: 'Invalid credentials' };
};


export const adminLogin = (email, password, adminId) => {
  const e = email.trim().toLowerCase();
  const p = password;
  const a = adminId.trim().toUpperCase();

  const users = getUsers();
  const user = users.find(u =>
    u.email?.toLowerCase() === e &&
    u.password === p &&
    u.adminId?.toUpperCase() === a
  );
  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }

  return { success: false, error: 'Invalid admin credentials' };
};


export const logout = () => {
  clearCurrentUser();
};

export const isRegistered = () => localStorage.getItem(KEYS.REGISTERED) === 'true';
export const setRegistered = () => localStorage.setItem(KEYS.REGISTERED, 'true');

// ---- SUBMISSIONS ----
export const getSubmissions = () => JSON.parse(localStorage.getItem(KEYS.SUBMISSIONS) || '[]');
export const saveSubmissions = (subs) => localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(subs));

export const getSubmissionsByStudent = (studentId) =>
  getSubmissions().filter(s => s.studentId === studentId);

export const getSubmissionsByMentor = (mentorId) =>
  getSubmissions().filter(s => s.mentorId === mentorId);

export const addSubmission = (submission) => {
  const subs = getSubmissions();
  subs.push(submission);
  saveSubmissions(subs);
};

export const updateSubmission = (id, updates) => {
  const subs = getSubmissions().map(s => s.id === id ? { ...s, ...updates } : s);
  saveSubmissions(subs);
};

export const getTotalCredits = (studentId) => {
  return getSubmissionsByStudent(studentId)
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.credits || 0), 0);
};

// ---- LOGS ----
export const getLogs = () => JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
export const saveLogs = (logs) => localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));

export const getLogsByStudent = (studentId) =>
  getLogs().filter(l => l.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date));

export const getLogsByMentor = (mentorId) => {
  const students = getUsers().filter(u => u.mentorId === mentorId);
  const studentMap = Object.fromEntries(students.map(s => [s.id, s.name]));
  const studentIds = new Set(students.map(s => s.id));
  return getLogs()
    .filter(l => studentIds.has(l.studentId))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(l => ({ ...l, studentName: studentMap[l.studentId] || 'Unknown' }));
};

export const updateLog = (id, updates) => {
  const logs = getLogs().map(l => l.id === id ? { ...l, ...updates } : l);
  saveLogs(logs);
};

export const addLog = (log) => {
  const logs = getLogs();
  logs.push(log);
  saveLogs(logs);
};

// ---- COLLEGES ----
export const getColleges = () => JSON.parse(localStorage.getItem(KEYS.COLLEGES) || '[]');
export const saveColleges = (cols) => localStorage.setItem(KEYS.COLLEGES, JSON.stringify(cols));

export const addCollege = (college) => {
  const cols = getColleges();
  cols.push(college);
  saveColleges(cols);
};

// Returns departments for a specific college name.
// Falls back to global DEPARTMENTS list if college not found in DB.
export const getDepartmentsByCollege = (collegeName) => {
  const cols = getColleges();
  const col = cols.find(c => c.name === collegeName);
  if (col && col.departments && col.departments.length > 0) {
    return col.departments;
  }
  // Fallback: return global default departments
  return DEPARTMENTS;
};

// Adds a new department to a specific college in the DB.
// If the college doesn't exist in DB yet, creates a lightweight entry for it.
export const addDepartmentToCollege = (collegeName, departmentName) => {
  const cols = getColleges();
  const idx = cols.findIndex(c => c.name === collegeName);
  if (idx !== -1) {
    if (!cols[idx].departments) cols[idx].departments = [...DEPARTMENTS];
    if (!cols[idx].departments.includes(departmentName)) {
      cols[idx].departments.push(departmentName);
    }
  } else {
    // College not in DB yet — create a lightweight record
    cols.push({
      id: `col_${Date.now()}`,
      name: collegeName,
      departments: [...DEPARTMENTS, departmentName],
    });
  }
  saveColleges(cols);
};

// ---- THEME ----
export const getTheme = () => localStorage.getItem(KEYS.THEME) || 'dark';
export const setTheme = (theme) => localStorage.setItem(KEYS.THEME, theme);

// ---- DYNAMIC CATEGORIES ----
export const getCustomCategories = () => {
  try {
    return JSON.parse(localStorage.getItem('spark_custom_categories') || '{}');
  } catch (e) {
    return {};
  }
};

export const saveCustomCategories = (cats) => {
  localStorage.setItem('spark_custom_categories', JSON.stringify(cats));
};

export const addCustomCategory = (name, achievementType, points) => {
  const custom = getCustomCategories();
  const trimmedName = name.trim();
  if (!custom[trimmedName]) {
    custom[trimmedName] = [];
  }
  const exists = custom[trimmedName].some(s => s.label === achievementType);
  if (!exists) {
    custom[trimmedName].push({ label: achievementType.trim(), points: Number(points) || 15 });
    saveCustomCategories(custom);
  }
};

// ---- HELPERS ----
export const generateId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const generateAdminId = () =>
  'CA' + Math.random().toString().substr(2, 6).toUpperCase();

export const simulateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // In a real app, this would be sent via email
  console.log(`[SPARK OTP Simulation] Your OTP is: ${otp}`);
  return otp;
};
