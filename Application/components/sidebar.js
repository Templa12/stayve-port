// Inject the sidebar HTML, then wire up behavior, icons, and a11y
document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("sidebar-root");
  if (!root) return;

  try {
    const res = await fetch("/components/sidebar.html", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    root.insertAdjacentHTML("afterbegin", html);

    // After injection, get elements
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-btn");
    const overlay = document.getElementById("overlay");
    const main = document.querySelector("main") || document.body;
    if (!sidebar || !menuBtn || !overlay) return;

    // Treat "/" as "index.html"
    const current = (() => {
      const p = (location.pathname || "").toLowerCase();
      const file = p.split("/").pop();
      if (!file || file === "") return "index.html";
      return file;
    })();

    // Activate current page link
    document.querySelectorAll("#sidebar nav a").forEach((a) => {
      const route = (a.getAttribute("data-route") || "").toLowerCase();
      if (!route) return;
      if (route === current) a.classList.add("active");
      // Also allow matches like "index" vs "index.html"
      if ((route === "index" && current === "index.html") ||
          (route + ".html" === current)) {
        a.classList.add("active");
      }
    });

    // Helpers
    const prefersNoMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const TRANSITION_MS = prefersNoMotion ? 0 : 300;

    let lastFocused = null;

    const lockScroll = () => document.body.classList.add("no-scroll");
    const unlockScroll = () => document.body.classList.remove("no-scroll");

    // Focusable elements for trap
    const focusSelectors = [
      "a[href]", "button", "input", "select", "textarea",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    const trapFocus = (e) => {
      if (!sidebar.classList.contains("open")) return;
      const focusables = sidebar.querySelectorAll(focusSelectors);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    // Toggle handlers
    const openSidebar = () => {
      lastFocused = document.activeElement;
      sidebar.classList.add("open");
      overlay.classList.add("active");
      overlay.hidden = false;
      menuBtn.setAttribute("aria-expanded", "true");
      sidebar.setAttribute("aria-hidden", "false");
      lockScroll();

      // Move focus inside
      const firstFocusable = sidebar.querySelector(focusSelectors);
      (firstFocusable || sidebar).focus();
      document.addEventListener("keydown", trapFocus);
    };

    const closeSidebar = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      setTimeout(() => { overlay.hidden = true; }, TRANSITION_MS);
      menuBtn.setAttribute("aria-expanded", "false");
      sidebar.setAttribute("aria-hidden", "true");
      unlockScroll();
      document.removeEventListener("keydown", trapFocus);

      // Restore focus to the menu button
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      } else {
        menuBtn.focus();
      }
    };

    menuBtn.addEventListener("click", () => {
      if (sidebar.classList.contains("open")) closeSidebar();
      else openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && sidebar.classList.contains("open")) closeSidebar();
    });

    // Initialize Lucide icons now that nodes exist
    if (window.lucide?.createIcons) window.lucide.createIcons();

    // Auto-render Lucide icons for any future dynamic DOM insertions (optional)
    // Auto-render Lucide icons for any future dynamic DOM insertions (optional)
// Render icons once after sidebar is injected
  if (window.lucide?.createIcons) window.lucide.createIcons();



  } catch (err) {
    console.error("Failed to load sidebar:", err);
  }
});
