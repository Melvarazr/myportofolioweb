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
 * Muncul saat di-scroll ke bawah masuk ke layar, dan menutup kembali
 * saat user scroll ke atas hingga elemen keluar di bagian bawah viewport.
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
 * INTERACTIVE 3D TIMELINE (EDUCATION & WORK EXPERIENCE)
 * 1. Mengisi progress rail dan menyalakan node 3D saat di-scroll per timeline
 * 2. Menyelaraskan tinggi gradasi track (--track-height) dengan tinggi fisik track
 * 3. Expand/collapse detail saat kartu diklik atau via keyboard
 */
const timelines3D = document.querySelectorAll("[data-3d-timeline]");

const updateAll3DTimelines = () => {
    const triggerPoint = window.innerHeight * 0.65;

    timelines3D.forEach((timeline) => {
        const trackEl = timeline.querySelector(".edu-timeline-track");
        const progressEl = timeline.querySelector("[data-timeline-progress]");
        const rows = timeline.querySelectorAll(".edu-timeline-row");
        if (!progressEl) return;

        if (trackEl) {
            progressEl.style.setProperty("--track-height", `${trackEl.offsetHeight}px`);
        }

        const rect = timeline.getBoundingClientRect();
        const scrolledDistance = triggerPoint - rect.top;
        const progressPercent = Math.min(100, Math.max(0, (scrolledDistance / rect.height) * 100));
        progressEl.style.height = `${progressPercent}%`;

        rows.forEach((row) => {
            const rowRect = row.getBoundingClientRect();
            if (rowRect.top <= triggerPoint) {
                row.classList.add("is-active");
            } else {
                row.classList.remove("is-active");
            }
        });
    });
};

document.querySelectorAll("[data-timeline-card]").forEach((card) => {
    const toggleCard = () => {
        const isExpanded = card.classList.toggle("is-expanded");
        card.setAttribute("aria-expanded", String(isExpanded));

        const parentRow = card.closest(".edu-timeline-row");
        if (parentRow && isExpanded) {
            parentRow.classList.add("is-active");
        }

        setTimeout(updateAll3DTimelines, 420);
    };

    card.addEventListener("click", () => {
        if (window.getSelection().toString().length > 0) return;
        toggleCard();
    });

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCard();
        }
    });
});

window.addEventListener("scroll", updateAll3DTimelines, { passive: true });
window.addEventListener("resize", updateAll3DTimelines);
updateAll3DTimelines();

/**
 * 3D PERSPECTIVE TILT CARDS (TECHNICAL SKILLS)
 * Mengikuti arah kursor pada perangkat pointer halus dan mereset mulus saat keluar
 */
const tiltCards = document.querySelectorAll("[data-3d-tilt]");

tiltCards.forEach((card) => {
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
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateX = (-relY * 12).toFixed(2);
            const rotateY = (relX * 12).toFixed(2);

            card.style.setProperty("--tilt-x", `${rotateX}deg`);
            card.style.setProperty("--tilt-y", `${rotateY}deg`);
        });
    });

    card.addEventListener("pointerleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
    });
});

/**
 * 3D INTERACTIVE FLIP CARDS (SOFT SKILLS)
 * Mendukung tap pada mobile/tablet dan keyboard Enter/Space
 */
const flipCards = document.querySelectorAll("[data-flip-card]");

flipCards.forEach((card) => {
    const toggleFlip = () => {
        card.classList.toggle("is-flipped");
    };

    card.addEventListener("click", toggleFlip);

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleFlip();
        }
    });
});

/**
 * UNDER CONSTRUCTION TOAST NOTIFICATION
 */
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.under-construction');

    if (btn) {
        e.preventDefault();

        const toastNotification = document.getElementById('toast-notification');

        if (toastNotification) {
            toastNotification.classList.add('show');

            if (window.toastTimer) clearTimeout(window.toastTimer);

            window.toastTimer = setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 5000);
        }
    }
});

/**
 * SMOOTH SCROLL, SCROLL-SPY ACTIVE LINK & AUTO-CLOSE MOBILE MENU
 */
const navbarLinks = document.querySelectorAll(".navbar-link");
const sections = document.querySelectorAll("section[id]");

const updateActiveNavLink = () => {
    const scrollPos = window.scrollY + (header ? header.offsetHeight : 0) + 120;
    let currentId = "";

    sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
            currentId = section.getAttribute("id");
        }
    });

    navbarLinks.forEach((link) => {
        const href = link.getAttribute("href");
        link.classList.remove("active");

        if (!currentId && href === "#") {
            link.classList.add("active");
        } else if (href === `#${currentId}`) {
            link.classList.add("active");
        }
    });
};

window.addEventListener("scroll", updateActiveNavLink, { passive: true });
updateActiveNavLink();

navbarLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");

        if (targetId && targetId.startsWith("#")) {
            e.preventDefault();

            if (navbar.classList.contains("active")) {
                navbar.classList.remove("active");
                overlay.classList.remove("active");
                document.body.classList.remove("nav-active");
            }

            if (targetId === "#") {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    });
});