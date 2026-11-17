'use strict';

/**
 * Helper untuk menambahkan event listener ke sekumpulan elemen
 */
const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(eventType, callback);
    }
};

/**
 * MOBILE NAVBAR TOGGLE
 */
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

/**
 * ACTIVE HEADER SAAT SCROLL
 */
const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }
}, { passive: true });

/**
 * REVERSIBLE SNAPPY SCROLL REVEAL (INTERSECTION OBSERVER)
 */
const revealElements = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const el = entry.target;

            if (entry.isIntersecting) {
                const delay = el.dataset.revealDelay || "0s";
                el.style.transitionDelay = delay;
                el.classList.add("revealed");

                const delayMs = parseFloat(delay) * 1000 || 0;
                clearTimeout(el._revealTimer);
                el._revealTimer = setTimeout(() => {
                    el.style.transitionDelay = "0s";
                }, delayMs + 500);
            } else if (entry.boundingClientRect.top > 0) {
                clearTimeout(el._revealTimer);
                el.style.transitionDelay = "0s";
                el.classList.remove("revealed");
            }
        });
    },
    {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
    }
);

revealElements.forEach((el) => revealObserver.observe(el));

/**
 * 3D INTERACTIVE TILT & SPECULAR GLARE ENGINE (ANTI-JITTER)
 */
const projectCards = document.querySelectorAll(".project-card");

projectCards.forEach((card) => {
    const maxTilt = 5.5;
    let rafId = null;

    card.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        card.classList.add("is-tilting");
    });

    card.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty("--glare-x", `${((x / rect.width) * 100).toFixed(1)}%`);
            card.style.setProperty("--glare-y", `${((y / rect.height) * 100).toFixed(1)}%`);

            if (e.target.closest(".btn-text, .status-badge")) {
                return;
            }

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -maxTilt;
            const rotateY = ((x - centerX) / centerX) * maxTilt;

            card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
        });
    });

    card.addEventListener("pointerleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.classList.remove("is-tilting");
        card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
});

/**
 * PROJECT CATEGORY FILTER, AUTO COUNT BADGES & URL HASH SYNC
 */
const filterButtons = document.querySelectorAll(".filter-btn");
const projectListItems = document.querySelectorAll(".projects-grid .card-3d-wrapper");
const projectCounter = document.getElementById("projectCounter");
let filterTimer = null;

function updateFilterBadges() {
    const totalItems = projectListItems.length;

    filterButtons.forEach((btn) => {
        const badge = btn.querySelector(".filter-count");
        if (!badge) return;

        const category = btn.getAttribute("data-filter");
        if (category === "all") {
            badge.textContent = totalItems;
            return;
        }

        let count = 0;
        projectListItems.forEach((listItem) => {
            const card = listItem.querySelector(".project-card");
            if (!card) return;
            const categories = (card.getAttribute("data-category") || "").trim().split(/\s+/);
            if (categories.includes(category)) count++;
        });

        badge.textContent = count;
    });
}

function updateProjectCounter(visibleCount, totalCount) {
    if (!projectCounter) return;
    projectCounter.textContent = `Showing ${visibleCount} of ${totalCount} Project${totalCount !== 1 ? "s" : ""}`;
}

function filterProjects(filterValue, instant = false) {
    clearTimeout(filterTimer);

    const totalCount = projectListItems.length;
    let visibleCount = 0;

    projectListItems.forEach((listItem) => {
        const card = listItem.querySelector(".project-card");
        if (!card) return;
        const categories = (card.getAttribute("data-category") || "").trim().split(/\s+/);
        const matches = filterValue === "all" || categories.includes(filterValue);
        if (matches) visibleCount++;
    });

    updateProjectCounter(visibleCount, totalCount);

    if (instant) {
        projectListItems.forEach((listItem) => {
            const card = listItem.querySelector(".project-card");
            if (!card) return;
            const categories = (card.getAttribute("data-category") || "").trim().split(/\s+/);
            const matches = filterValue === "all" || categories.includes(filterValue);

            listItem.style.display = matches ? "block" : "none";
            listItem.style.opacity = matches ? "1" : "0";
            listItem.style.transform = "translateY(0)";
        });
        return;
    }

    projectListItems.forEach((listItem) => {
        listItem.style.opacity = "0";
        listItem.style.transform = "translateY(14px)";
    });

    filterTimer = setTimeout(() => {
        projectListItems.forEach((listItem) => {
            const card = listItem.querySelector(".project-card");
            if (!card) return;
            const categories = (card.getAttribute("data-category") || "").trim().split(/\s+/);
            const matches = filterValue === "all" || categories.includes(filterValue);

            if (matches) {
                listItem.style.display = "block";
                requestAnimationFrame(() => {
                    listItem.style.opacity = "1";
                    listItem.style.transform = "translateY(0)";
                });
            } else {
                listItem.style.display = "none";
            }
        });
    }, 200);
}

function applyFilter(filterValue, updateUrl = true, instant = false) {
    const validFilters = Array.from(filterButtons).map((btn) => btn.getAttribute("data-filter"));
    const resolvedFilter = validFilters.includes(filterValue) ? filterValue : "all";

    if (updateUrl) {
        if (resolvedFilter === "all") {
            if (window.location.hash) {
                window.history.pushState(null, "", window.location.pathname);
            }
        } else {
            window.history.pushState(null, "", `#${resolvedFilter}`);
        }
    }

    filterButtons.forEach((btn) => {
        const isActive = btn.getAttribute("data-filter") === resolvedFilter;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });

    filterProjects(resolvedFilter, instant);
}

filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const filterValue = button.getAttribute("data-filter");
        applyFilter(filterValue, true, false);
    });
});

window.addEventListener("popstate", () => {
    const hash = window.location.hash.substring(1);
    applyFilter(hash || "all", false, false);
});

// Hitung badge kategori & terapkan filter awal tanpa kedip saat halaman dimuat
updateFilterBadges();
const initialHash = window.location.hash.substring(1);
applyFilter(initialHash || "all", false, true);

/**
 * UNDER CONSTRUCTION TOAST NOTIFICATION
 */
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".under-construction");

    if (btn) {
        e.preventDefault();

        const toastNotification = document.getElementById("toast-notification");
        if (toastNotification) {
            toastNotification.classList.add("show");

            clearTimeout(window.toastTimer);
            window.toastTimer = setTimeout(() => {
                toastNotification.classList.remove("show");
            }, 5000);
        }
    }
});