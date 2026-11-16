'use strict';

const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(eventType, callback);
    }
};

// Navbar functionality
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

// Header scroll effect
const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }
});

// Reveal animations
const revealElements = document.querySelectorAll("[data-reveal]");
const revealDelayElements = document.querySelectorAll("[data-reveal-delay]");

const reveal = function () {
    for (let i = 0, len = revealElements.length; i < len; i++) {
        if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15) {
            revealElements[i].classList.add("revealed");
        }
    }
};

for (let i = 0, len = revealDelayElements.length; i < len; i++) {
    revealDelayElements[i].style.transitionDelay = revealDelayElements[i].dataset.revealDelay;
    revealDelayElements[i].style.animationDelay = revealDelayElements[i].dataset.revealDelay;
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

// ==========================================
// 3D INTERACTIVE TILT & GLARE ENGINE (ANTI-JITTER)
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const projectCards = document.querySelectorAll('.project-card');

    if (!isTouchDevice) {
        projectCards.forEach(card => {
            const maxTilt = 5.5;
            let rafId = null;

            card.addEventListener('mouseenter', () => {
                card.classList.add('is-tilting');
            });

            card.addEventListener('mousemove', (e) => {
                if (rafId) cancelAnimationFrame(rafId);

                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // Update cahaya glare tetap halus mengikuti kursor
                    card.style.setProperty('--glare-x', `${((x / rect.width) * 100).toFixed(1)}%`);
                    card.style.setProperty('--glare-y', `${((y / rect.height) * 100).toFixed(1)}%`);

                    // Kunci sudut tilt saat kursor berada di atas tombol agar klik & hover 100% stabil
                    if (e.target.closest('.btn-text, .status-badge')) {
                        return;
                    }

                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    const rotateX = ((y - centerY) / centerY) * -maxTilt;
                    const rotateY = ((x - centerX) / centerX) * maxTilt;

                    card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.classList.remove('is-tilting');
                card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
            });
        });
    }

    // ==========================================
    // PROJECT FILTER FUNCTIONALITY WITH URL UPDATE
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectListItems = document.querySelectorAll('.projects-grid li');

    function updateFilter(filterValue) {
        if (filterValue === 'all') {
            if (window.location.hash) {
                window.history.pushState(null, null, window.location.pathname);
            }
        } else {
            window.history.pushState(null, null, `#${filterValue}`);
        }

        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filterValue) {
                btn.classList.add('active');
            }
        });

        filterProjects(filterValue);
        setTimeout(updateProjectCounter, 250);
    }

    function initializeFilterFromURL() {
        const hash = window.location.hash.substring(1);
        const filterValue = hash || 'all';
        const validFilters = Array.from(filterButtons).map(btn => btn.getAttribute('data-filter'));
        const finalFilterValue = validFilters.includes(filterValue) ? filterValue : 'all';

        updateFilter(finalFilterValue);
    }

    initializeFilterFromURL();

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const filterValue = button.getAttribute('data-filter');
            updateFilter(filterValue);
        });
    });

    window.addEventListener('popstate', initializeFilterFromURL);

    function filterProjects(filterValue) {
        projectListItems.forEach((listItem) => {
            const card = listItem.querySelector('.project-card');
            if (!card) return;

            listItem.style.opacity = '0';
            listItem.style.transform = 'translateY(20px)';

            setTimeout(() => {
                const cardCategories = card.getAttribute('data-category') || '';
                const shouldShow = filterValue === 'all' || cardCategories.includes(filterValue);

                if (shouldShow) {
                    listItem.style.display = 'block';
                    setTimeout(() => {
                        listItem.style.opacity = '1';
                        listItem.style.transform = 'translateY(0)';
                    }, 40);
                } else {
                    listItem.style.display = 'none';
                }
            }, 200);
        });
    }

    function updateProjectCounter() {
        const visibleProjects = document.querySelectorAll('.projects-grid li:not([style*="display: none"])');
        const counter = document.querySelector('.project-counter');

        if (counter) {
            counter.textContent = `${visibleProjects.length} Project${visibleProjects.length !== 1 ? 's' : ''}`;
        }
    }

    const filterContainer = document.querySelector('.filter-buttons');
    if (filterContainer) {
        const counterElement = document.createElement('div');
        counterElement.className = 'project-counter';
        counterElement.style.cssText = `
            text-align: center;
            margin-top: 20px;
            font-size: 1.4rem;
            color: hsla(220, 12%, 43%, 0.8);
            font-weight: 600;
        `;
        filterContainer.parentNode.insertBefore(counterElement, filterContainer.nextSibling);
        updateProjectCounter();
    }
});

// ==========================================
// UNDER CONSTRUCTION POPUP LOGIC
// ==========================================
const underConstructionLinks = document.querySelectorAll('.under-construction');
const toastNotification = document.getElementById('toast-notification');
let toastTimeout;

if (toastNotification) {
    underConstructionLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            toastNotification.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 5000);
        });
    });
}