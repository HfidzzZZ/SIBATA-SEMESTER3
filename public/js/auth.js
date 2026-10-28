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

// Inisialisasi tampilan Navbar dan menu mobile
export function initNavbarAuth() {
  const adminNavLink = document.getElementById("nav-admin-link");
  const authSlot = document.getElementById("nav-auth-slot");

  const loggedIn = isLoggedIn();

  // 1. Tampilkan atau sembunyikan link "Panel Admin" jika elemen ada
  if (adminNavLink) {
    if (loggedIn) {
      adminNavLink.style.display = "";
    } else {
      adminNavLink.style.display = "none";
    }
  }

  // 2. Render tombol di slot navigasi kedua
  if (authSlot) {
    if (loggedIn) {
      authSlot.innerHTML = `
        <div class="auth-logged-group">
          <a href="admin.html" class="btn-primary btn-nav-login" title="Buka Panel Admin">Panel Admin</a>
          <button type="button" id="btn-navbar-logout" class="btn-logout-pill" title="Keluar dari sesi admin">Keluar</button>
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
        <a href="login.html" class="btn-primary btn-nav-login" title="Masuk ke Panel Admin">
          Login Admin
        </a>
      `;
    }
  }

  // 3. Pasang toggle untuk navigasi mobile (HP)
  const mobileToggle = document.getElementById("btn-mobile-menu");
  const mainNav = document.getElementById("main-nav-menu");
  if (mobileToggle && mainNav && !mobileToggle.dataset.initialized) {
    mobileToggle.dataset.initialized = "true";
    mobileToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
      
      const iconMenu = mobileToggle.querySelector(".icon-menu");
      const iconClose = mobileToggle.querySelector(".icon-close");
      if (iconMenu && iconClose) {
        iconMenu.style.display = isOpen ? "none" : "block";
        iconClose.style.display = isOpen ? "block" : "none";
      }
    });
  }
}

// Route Guard untuk halaman yang memerlukan otentikasi (admin.html)
export function protectAdminPage() {
  if (!isLoggedIn()) {
    // Redirect ke halaman login jika belum login
    window.location.replace("login.html?redirect=admin.html");
  }
}

