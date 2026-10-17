// Modul Manajemen Otentikasi SIBATA

const AUTH_STORAGE_KEY = "sibata_auth_state";

export function isLoggedIn() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getAuthUser() {
  if (!isLoggedIn()) return null;
  return {
    username: localStorage.getItem("sibata_auth_username") || "admin",
    name: localStorage.getItem("sibata_auth_name") || "Administrator SIBATA",
    role: "Admin Tata Ruang"
  };
}

export function login(username, password) {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Kredensial default: admin / admin atau admin / admin123
  if (
    cleanUsername === "admin" &&
    (cleanPassword === "admin" || cleanPassword === "admin123")
  ) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem("sibata_auth_username", cleanUsername);
    localStorage.setItem("sibata_auth_name", "Administrator SIBATA");
    return { success: true };
  }

  return {
    success: false,
    message: "Username atau kata sandi tidak valid. Gunakan 'admin' dan 'admin'."
  };
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("sibata_auth_username");
  localStorage.removeItem("sibata_auth_name");
  window.location.href = "index.html";
}

// Inisialisasi tampilan Navbar berdasarkan status login
export function initNavbarAuth() {
  const adminNavLink = document.getElementById("nav-admin-link");
  const authSlot = document.getElementById("nav-auth-slot");

  const loggedIn = isLoggedIn();

  // 1. Tampilkan atau sembunyikan link "Panel Admin"
  if (adminNavLink) {
    if (loggedIn) {
      adminNavLink.style.display = "";
    } else {
      adminNavLink.style.display = "none";
    }
  }

  // 2. Render tombol di sisi kanan navbar
  if (authSlot) {
    if (loggedIn) {
      authSlot.innerHTML = `
        <div class="auth-logged-wrapper">
          <span class="auth-badge-user" title="Masuk sebagai Administrator">
            <span class="auth-dot"></span>
            <span class="auth-name">Admin</span>
          </span>
          <button type="button" id="btn-navbar-logout" class="btn-nav-logout" title="Keluar dari akun admin">Keluar</button>
        </div>
      `;

      const logoutBtn = document.getElementById("btn-navbar-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          if (confirm("Apakah Anda yakin ingin keluar dari Panel Admin?")) {
            logout();
          }
        });
      }
    } else {
      authSlot.innerHTML = `
        <a href="login.html" class="btn-nav-login">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>Masuk Admin</span>
        </a>
      `;
    }
  }
}

// Route Guard untuk halaman yang memerlukan otentikasi (admin.html)
export function protectAdminPage() {
  if (!isLoggedIn()) {
    // Redirect ke halaman login jika belum login
    window.location.replace("login.html?redirect=admin.html");
  }
}
