// Modul Manajemen Otentikasi SIBATA

const AUTH_STORAGE_KEY = "sibata_auth_state";
const SESSION_ID_KEY = "sibata_session_id";

export function isLoggedIn() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getSessionId() {
  return localStorage.getItem(SESSION_ID_KEY) || null;
}

export function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json"
  };
  const sessionId = getSessionId();
  if (sessionId) {
    headers["X-Sesion-ID"] = sessionId;
  }
  return headers;
}

export function getAuthUser() {
  if (!isLoggedIn()) return null;
  return {
    username: localStorage.getItem("sibata_auth_username") || "admin",
    name: localStorage.getItem("sibata_auth_name") || "Administrator SIBATA",
    role: "Admin Tata Ruang",
    sessionId: getSessionId()
  };
}

export async function login(username, password) {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  // 1. Coba otentikasi ke server melalui fetch HTTP POST /api/login
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: cleanUsername,
        password: cleanPassword
      })
    });

    if (response.ok) {
      const data = await response.json();
      const sessionId = data.seesionId || data.sessionId;

      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      localStorage.setItem("sibata_auth_username", cleanUsername);
      localStorage.setItem(
        "sibata_auth_name",
        cleanUsername === "joko" ? "Joko (Staff Ahli Tata Ruang)" : cleanUsername
      );
      if (sessionId) {
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }

      return {
        success: true,
        mode: "server",
        sessionId: sessionId,
        message: "Login server berhasil."
      };
    }

    if (response.status === 401) {
      // Periksa fallback lokal jika server menolak kredensial
      if (
        cleanUsername.toLowerCase() === "admin" &&
        (cleanPassword === "admin" || cleanPassword === "admin123")
      ) {
        localStorage.setItem(AUTH_STORAGE_KEY, "true");
        localStorage.setItem("sibata_auth_username", "admin");
        localStorage.setItem("sibata_auth_name", "Administrator SIBATA");
        localStorage.removeItem(SESSION_ID_KEY);
        return {
          success: true,
          mode: "local",
          message: "Login offline/lokal berhasil."
        };
      }

      return {
        success: false,
        message: "Username atau kata sandi tidak cocok di server."
      };
    }
  } catch (err) {
    console.warn("Gagal terhubung ke endpoint /api/login, beralih ke fallback offline:", err);
  }

  // 2. Fallback offline: admin / admin atau admin / admin123
  if (
    cleanUsername.toLowerCase() === "admin" &&
    (cleanPassword === "admin" || cleanPassword === "admin123")
  ) {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem("sibata_auth_username", "admin");
    localStorage.setItem("sibata_auth_name", "Administrator SIBATA");
    localStorage.removeItem(SESSION_ID_KEY);
    return {
      success: true,
      mode: "local",
      message: "Login mode offline berhasil."
    };
  }

  return {
    success: false,
    message: "Username atau kata sandi tidak valid. Coba akun 'joko' / 'uong' (server) atau 'admin' / 'admin' (lokal)."
  };
}

export async function logout() {
  const sessionId = getSessionId();
  if (sessionId) {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sesionId: sessionId
        })
      });
    } catch (e) {
      console.warn("Gagal memanggil endpoint logout server:", e);
    }
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
  localStorage.removeItem("sibata_auth_username");
  localStorage.removeItem("sibata_auth_name");
  window.location.href = "index.html";
}

export async function extendSession() {
  const sessionId = getSessionId();
  if (!sessionId) return false;

  try {
    const res = await fetch("/api/extendSesion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sesionId: sessionId
      })
    });
    return res.ok;
  } catch (err) {
    console.warn("Gagal memperpanjang sesi:", err);
    return false;
  }
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

