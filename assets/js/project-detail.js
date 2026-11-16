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
 * STICKY HEADER SAAT SCROLL
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
 * 3D PERSPECTIVE TILT CARDS (META BENTO, BREAKDOWN & TOOLS)
 */
const tiltCards = document.querySelectorAll("[data-3d-tilt]");

tiltCards.forEach((card) => {
    let rafId = null;
    const isLargeCard = card.classList.contains("breakdown-item");
    const maxTilt = parseFloat(card.dataset.tiltMax) || (isLargeCard ? 3.5 : 6.5);

    card.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        card.classList.add("is-tilting");
    });

    card.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            if (e.target.closest(".read-more-btn, a, button")) {
                return;
            }

            const rect = card.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;

            const rotateX = (-relY * maxTilt).toFixed(2);
            const rotateY = (relX * maxTilt).toFixed(2);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
    });

    card.addEventListener("pointerleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.classList.remove("is-tilting");
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
});