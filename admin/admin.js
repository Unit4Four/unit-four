/* ============================================================
   UNIT FOUR — admin.js
   Login gate + submissions table.

   SECURITY NOTE (read this before relying on this page):
   This is a client-side-only gate. The username/password below are
   readable by anyone who views this file's source — there is no
   server checking them. It stops a casual visitor from browsing the
   dashboard, but it will not stop someone who opens dev tools.
   Likewise, the submissions table can only read data because the
   Supabase table's row-level-security policy allows public SELECT
   (see js/supabase-config.js) — the same anon key this page uses is
   visible to anyone, admin or not, so that data is only as private as
   that policy makes it. If these submissions ever include sensitive
   information, replace this with real Supabase Auth (email/password
   sign-in tied to an RLS policy on auth.uid()) instead of a hardcoded
   password.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'unitfour2026';
  const AUTH_KEY = 'u4_admin_auth';

  const loginSection = document.getElementById('adminLogin');
  const dashboardSection = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  function showDashboard () {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    loadSubmissions();
  }

  function showLogin () {
    dashboardSection.hidden = true;
    loginSection.hidden = false;
  }

  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    showDashboard();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      loginError.hidden = true;
      loginForm.reset();
      showDashboard();
    } else {
      loginError.hidden = false;
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    showLogin();
  });

  async function loadSubmissions () {
    const status = document.getElementById('adminStatus');
    const table = document.getElementById('submissionsTable');
    const tbody = document.getElementById('submissionsBody');

    status.hidden = false;
    table.hidden = true;
    status.removeAttribute('data-state');
    status.textContent = 'Loading submissions...';

    if (!supabaseClient) {
      status.textContent = 'Supabase is not configured yet. See js/supabase-config.js for setup steps.';
      status.dataset.state = 'error';
      return;
    }

    const { data, error } = await supabaseClient
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      status.textContent = 'Could not load submissions: ' + error.message;
      status.dataset.state = 'error';
      return;
    }

    if (!data || data.length === 0) {
      status.textContent = 'No submissions yet.';
      return;
    }

    tbody.innerHTML = data.map((row) => `
      <tr>
        <td>${formatDate(row.created_at)}</td>
        <td>${escapeHtml(row.full_name)}</td>
        <td>${escapeHtml(row.business_name)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.phone) || 'Not provided'}</td>
        <td class="admin-table__message">${escapeHtml(row.message)}</td>
      </tr>
    `).join('');

    status.hidden = true;
    table.hidden = false;
  }

  function formatDate (iso) {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  }

  function escapeHtml (str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
