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
 * REVERSIBLE SNAPPY SCROLL REVEAL (INTERSECTION OBSERVER)
 * Mengecualikan elemen di dalam .hero karena sudah ditangani animasi CSS heroEntrance
 */
const revealElements = Array.from(document.querySelectorAll("[data-reveal]"))
    .filter((el) => !el.closest(".hero"));

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
 * CACHE METRIK SECTION & TRACK TIMELINE (ANTI LAYOUT THRASHING)
 */
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");
const navbarLinks = document.querySelectorAll(".navbar-link");
const sections = document.querySelectorAll("section[id]");
const timelines3D = Array.from(document.querySelectorAll("[data-3d-timeline]")).map((timeline) => ({
    el: timeline,
    trackEl: timeline.querySelector(".edu-timeline-track"),
    progressEl: timeline.querySelector("[data-timeline-progress]"),
    rows: Array.from(timeline.querySelectorAll(".edu-timeline-row"))
}));

let cachedHeaderHeight = header ? header.offsetHeight : 0;
let cachedSections = [];

const measureLayoutMetrics = () => {
    cachedHeaderHeight = header ? header.offsetHeight : 0;

    cachedSections = Array.from(sections).map((section) => ({
        id: section.getAttribute("id"),
        top: section.offsetTop,
        bottom: section.offsetTop + section.offsetHeight
    }));

    const trackHeights = timelines3D.map((item) =>
        item.trackEl ? item.trackEl.offsetHeight : 0
    );

    timelines3D.forEach((item, idx) => {
        if (item.progressEl && trackHeights[idx] > 0) {
            item.progressEl.style.setProperty("--track-height", `${trackHeights[idx]}px`);
        }
    });
};

/**
 * BATCHED UPDATE UNTUK ACTIVE HEADER, BACK-TO-TOP, 3D TIMELINE & SCROLL-SPY NAVBAR
 */
const updateOnScroll = () => {
    const scrollY = window.scrollY;
    const triggerPoint = window.innerHeight * 0.65;

    // 1. Sticky Header
    if (header) {
        header.classList.toggle("active", scrollY > 100);
    }

    // 2. Back to Top Button
    if (backTopBtn) {
        backTopBtn.classList.toggle("is-visible", scrollY > 450);
    }

    // 3. Batch Read seluruh posisi timeline sebelum melakukan DOM Write
    const timelineMeasurements = timelines3D.map((item) => {
        if (!item.progressEl) return null;
        const rect = item.el.getBoundingClientRect();
        const rowTops = item.rows.map((row) => row.getBoundingClientRect().top);
        return { item, rect, rowTops };
    });

    // Batch Write untuk progress rail & active node
    timelineMeasurements.forEach((data) => {
        if (!data) return;
        const { item, rect, rowTops } = data;
        const scrolledDistance = triggerPoint - rect.top;
        const progressPercent = rect.height > 0
            ? Math.min(100, Math.max(0, (scrolledDistance / rect.height) * 100))
            : 0;

        item.progressEl.style.height = `${progressPercent}%`;

        item.rows.forEach((row, idx) => {
            row.classList.toggle("is-active", rowTops[idx] <= triggerPoint);
        });
    });

    // 4. Scroll-Spy Active Link menggunakan nilai ter-cache (zero DOM read)
    const scrollPos = scrollY + cachedHeaderHeight + 120;
    let currentId = "";

    for (let i = 0; i < cachedSections.length; i++) {
        const sec = cachedSections[i];
        if (scrollPos >= sec.top && scrollPos < sec.bottom) {
            currentId = sec.id;
            break;
        }
    }

    navbarLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isMatch = (!currentId && href === "#") || href === `#${currentId}`;
        link.classList.toggle("active", isMatch);
    });
};

let scrollTicking = false;
const scheduleScrollUpdate = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        updateOnScroll();
        scrollTicking = false;
    });
};

/**
 * INTERACTIVE 3D TIMELINE ACCORDION (EDUCATION & WORK EXPERIENCE)
 * Tidak melakukan kalkulasi ukuran di dalam event click agar transisi 60 FPS
 */
document.querySelectorAll("[data-timeline-card]").forEach((card) => {
    const collapseEl = card.querySelector(".edu-details-collapse");

    const toggleCard = () => {
        const isExpanded = card.classList.toggle("is-expanded");
        card.setAttribute("aria-expanded", String(isExpanded));

        const parentRow = card.closest(".edu-timeline-row");
        if (parentRow && isExpanded) {
            parentRow.classList.add("is-active");
        }
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

    if (collapseEl) {
        collapseEl.addEventListener("transitionend", (e) => {
            if (e.target === collapseEl && e.propertyName === "grid-template-rows") {
                measureLayoutMetrics();
                scheduleScrollUpdate();
            }
        });
    }
});

// Otomatis sinkronkan tinggi track & section jika ukuran container berubah
if (typeof ResizeObserver !== "undefined") {
    const layoutResizeObserver = new ResizeObserver(() => {
        measureLayoutMetrics();
        scheduleScrollUpdate();
    });

    timelines3D.forEach((item) => layoutResizeObserver.observe(item.el));
}

window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
window.addEventListener("resize", () => {
    measureLayoutMetrics();
    scheduleScrollUpdate();
}, { passive: true });

measureLayoutMetrics();
updateOnScroll();

/**
 * 3D PERSPECTIVE TILT CARDS (ABOUT BENTO STATS & TECHNICAL SKILLS)
 * Hanya dipasang pada perangkat dengan pointer halus (laptop/PC)
 */
const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (supportsFinePointer) {
    const tiltCards = document.querySelectorAll("[data-3d-tilt]");

    tiltCards.forEach((card) => {
        let rafId = null;
        const defaultMaxTilt = card.classList.contains("bento-box") ? 8 : 12;
        const maxTilt = parseFloat(card.dataset.tiltMax) || defaultMaxTilt;

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

                const rotateX = (-relY * maxTilt).toFixed(2);
                const rotateY = (relX * maxTilt).toFixed(2);

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
}

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
 * TOAST NOTIFICATION HELPER
 */
function triggerToast(message, isSuccess = false, duration = 5000) {
    const toastNotification = document.getElementById("toast-notification");
    if (!toastNotification) return;

    const icon = toastNotification.querySelector("ion-icon");
    const text = toastNotification.querySelector("p");

    toastNotification.classList.toggle("is-success", isSuccess);
    if (icon) {
        icon.setAttribute("name", isSuccess ? "checkmark-circle" : "information-circle");
    }
    if (text && message) {
        text.textContent = message;
    }

    toastNotification.classList.add("show");

    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toastNotification.classList.remove("show");
    }, duration);
}

/**
 * UNDER CONSTRUCTION TOAST NOTIFICATION
 */
document.addEventListener("click", function (e) {
    const btn = e.target.closest(".under-construction");

    if (btn) {
        e.preventDefault();
        triggerToast(
            "Case study coming soon! In the meantime, please feel free to explore my 'All Projects' page.",
            false,
            5000
        );
    }
});

/**
 * COPY EMAIL & PHONE NUMBER
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }

    return new Promise((resolve, reject) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const ok = document.execCommand("copy");
            document.body.removeChild(textarea);
            ok ? resolve() : reject();
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}

document.querySelectorAll("[data-copy-text]").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const text = btn.getAttribute("data-copy-text");
        const label = btn.getAttribute("data-copy-label") || "Contact";
        if (!text) return;

        try {
            await copyToClipboard(text);
            const actionIcon = btn.querySelector(".copy-action-icon");
            btn.classList.add("is-copied");
            if (actionIcon) actionIcon.setAttribute("name", "checkmark-outline");

            clearTimeout(btn._copyResetTimer);
            btn._copyResetTimer = setTimeout(() => {
                btn.classList.remove("is-copied");
                if (actionIcon) actionIcon.setAttribute("name", "copy-outline");
            }, 2000);

            triggerToast(`${label} copied: ${text}`, true, 3500);
        } catch (err) {
            triggerToast(`Failed to copy ${label.toLowerCase()}: ${text}`, false, 4000);
        }
    });
});

/**
 * BACK TO TOP BUTTON
 */
if (backTopBtn) {
    backTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/**
 * SMOOTH SCROLL & AUTO-CLOSE MOBILE MENU
 */
navbarLinks.forEach((link) => {
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
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - cachedHeaderHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    });
});