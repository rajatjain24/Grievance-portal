// script.js — Shared JS for validation, auth checks, UX, alerts

// ===============================
// User Session Management
// ===============================
function isLoggedIn() {
  return !!localStorage.getItem('token');
}
function isAdmin() {
  return localStorage.getItem('role') === "admin";
}
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
// Use this to protect routes
function protectPage(adminOnly = false) {
  if(!isLoggedIn()) { window.location.href="login.html"; return false; }
  if(adminOnly && !isAdmin()) { window.location.href="login.html"; return false; }
  return true;
}

// ===============================
// In-Page Alert Helpers
// ===============================
function showAlert(msg, type="error", duration=2600) {
  let alertDiv = document.getElementById('alert');
  if(!alertDiv) {
    alertDiv = document.createElement('div');
    alertDiv.id = 'alert';
    alertDiv.className = "alert";
    document.body.appendChild(alertDiv);
  }
  alertDiv.className = "alert " + (type==="success" ? "msg success" : "msg error");
  alertDiv.textContent = msg;
  alertDiv.style.display = "";
  setTimeout(()=>{alertDiv.style.display='none'}, duration);
}

// ===============================
// Attach logout handler if present
// ===============================
window.addEventListener('DOMContentLoaded', ()=>{
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.onclick = function(e){ e.preventDefault(); logout(); };
});

// ===============================
// Utility: Copy to clipboard
// ===============================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(()=>showAlert("Copied!", "success", 1200));
}

// ===============================
// Utility: Format date
// ===============================
function formatDate(dstr) {
  if(!dstr) return "";
  return (new Date(dstr)).toLocaleString();
}

// ===============================
// Additional helpers, validation, or AJAX wrappers can be added here!

// ===============================
// Password Live Validation (Signup Page)
// ===============================

function checkPasswordStrength(pwd) {
  const rules = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
  };
  // These lines update DOM on signup.html
  if(document.getElementById('pass-length')) {
    document.getElementById('pass-length').textContent = rules.length ? '✔️' : '❌';
  }
  if(document.getElementById('pass-uppercase')) {
    document.getElementById('pass-uppercase').textContent = rules.uppercase ? '✔️' : '❌';
  }
  if(document.getElementById('pass-special')) {
    document.getElementById('pass-special').textContent = rules.special ? '✔️' : '❌';
  }
  return Object.values(rules).every(Boolean);
}

function isPasswordValid(pwd) {
  return (
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  );
}

// ===============================
// Improved Copy to Clipboard (ID)
// ===============================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showAlert("Complaint ID copied!", "success", 1200))
    .catch(() => showAlert("Could not copy!", "error", 1200));
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => showAlert("Complaint ID copied!", "success", 1200))
    .catch(() => showAlert("Could not copy!", "error", 1200));
}
