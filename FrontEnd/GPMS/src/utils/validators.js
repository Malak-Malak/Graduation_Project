// ── Domains ───────────────────────────────────────────────────────────────────
const STUDENT_DOMAIN = "@students.ptuk.edu.ps";
const SUPERVISOR_DOMAIN = "@supervisors.ptuk.edu.ps";
// ── Helpers ───────────────────────────────────────────────────────────────────
export const isValidEmailFormat = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isStudentEmail = (email) =>
  email.trim().toLowerCase().endsWith(STUDENT_DOMAIN);

export const isSupervisorEmail = (email) =>
  email.trim().toLowerCase().endsWith(SUPERVISOR_DOMAIN);

// ══════════════════════════════════════════════════════════════════════════════
// Validator لصفحة Request Access
// طالب:   h.n.awad@students.ptuk.edu.ps
// مشرف:   t.sammar@ptuk.edu.ps
// ══════════════════════════════════════════════════════════════════════════════
export const validateRequestAccessEmail = (email) => {
  if (!email?.trim())
    return "Please enter your university email.";
  if (!isValidEmailFormat(email))
    return "Please enter a valid email address.";
  if (!isStudentEmail(email) && !isSupervisorEmail(email))
    return "Email must be a university email (e.g. h.n.awad@students.ptuk.edu.ps)";
  return null; // ✅
};

// ══════════════════════════════════════════════════════════════════════════════
// Validators لصفحة Login
// username = الجزء قبل الـ @ من الإيميل
// مثال: h.n.awad@students.ptuk.edu.ps → username: h.n.awad
// ══════════════════════════════════════════════════════════════════════════════
export const validateUsername = (username) => {
  if (!username?.trim())
    return "Please enter your username.";
  if (username.trim().length < 3)
    return "Username must be at least 3 characters.";
  return null; // ✅
};

export const validatePassword = (password) => {
  if (!password)
    return "Please enter your password.";
  return null; // ✅ — الباسوورد تبع البورتال ما نعرف قيوده
};