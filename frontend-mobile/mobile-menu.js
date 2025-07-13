// Mobile Menu Functions
function toggleMobileMenu() {
  const mobileNav = document.getElementById("mobileNav");
  const toggle = document.querySelector(".mobile-menu-toggle");

  mobileNav.classList.toggle("active");
  toggle.classList.toggle("active");
}

function closeMobileMenu(event) {
  if (event && event.target.classList.contains("mobile-nav-content")) {
    return;
  }

  const mobileNav = document.getElementById("mobileNav");
  const toggle = document.querySelector(".mobile-menu-toggle");

  mobileNav.classList.remove("active");
  toggle.classList.remove("active");
}

// Admin Mobile Menu Functions
function toggleAdminMobileMenu() {
  const adminMobileNav = document.getElementById("adminMobileNav");
  const toggle = document.querySelector(".admin-mobile-menu-toggle");

  adminMobileNav.classList.toggle("active");
  toggle.classList.toggle("active");
}

function closeAdminMobileMenu(event) {
  if (event && event.target.classList.contains("admin-mobile-nav-content")) {
    return;
  }

  const adminMobileNav = document.getElementById("adminMobileNav");
  const toggle = document.querySelector(".admin-mobile-menu-toggle");

  adminMobileNav.classList.remove("active");
  toggle.classList.remove("active");
}

// Close menu when clicking on links or pressing Escape
document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMobileMenu();
      closeAdminMobileMenu();
    }
  });
});
