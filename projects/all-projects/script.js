'use strict'

const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(eventType, callback);
    }
}

// Navbar functionality
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
}

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
        if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.2) {
            revealElements[i].classList.add("revealed");
        }
    }
}

// Set reveal delays
for (let i = 0, len = revealDelayElements.length; i < len; i++) {
    revealDelayElements[i].style.transitionDelay = revealDelayElements[i].dataset.revealDelay;
    revealDelayElements[i].style.animationDelay = revealDelayElements[i].dataset.revealDelay;
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

// Parallax effect for experience items
const handleParallax = function() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.experience-item');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
}

// Smooth scroll reveal function
const revealElementOnScroll = function() {
    reveal();
}

// Scroll event listeners
window.addEventListener('scroll', () => {
    revealElementOnScroll();
    requestAnimationFrame(handleParallax);
});

window.addEventListener('load', revealElementOnScroll);

// Initial reveal timeout
setTimeout(() => {
    revealElements.forEach(el => el.classList.add('revealed'));
}, 500);

// Experience item hover effects
document.querySelectorAll('.experience-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-8px) translateX(5px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) translateX(0) scale(1)';
    });
});

// PROJECT FILTER FUNCTIONALITY
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectListItems = document.querySelectorAll('.projects-grid li');

    // Initialize: Show all projects by default
    showAllProjects();

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            filterProjects(filterValue);
        });
    });

    function filterProjects(filterValue) {
        projectListItems.forEach((listItem, index) => {
            const card = listItem.querySelector('.project-card');
            if (!card) return;

            // Add fade out effect
            listItem.style.opacity = '0';
            listItem.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                if (filterValue === 'all') {
                    listItem.style.display = 'block';
                    // Animate in
                    setTimeout(() => {
                        listItem.style.opacity = '1';
                        listItem.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    const cardCategories = card.getAttribute('data-category');
                    if (cardCategories && cardCategories.includes(filterValue)) {
                        listItem.style.display = 'block';
                        // Animate in
                        setTimeout(() => {
                            listItem.style.opacity = '1';
                            listItem.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        listItem.style.display = 'none';
                    }
                }
            }, 200);
        });
    }

    function showAllProjects() {
        projectListItems.forEach(listItem => {
            listItem.style.display = 'block';
            listItem.style.opacity = '1';
            listItem.style.transform = 'translateY(0)';
        });
    }

    // Enhanced hover effects for project cards
    projectCards.forEach(card => {
        const listItem = card.closest('li');
        
        card.addEventListener('mouseenter', () => {
            if (listItem && listItem.style.display !== 'none') {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (listItem && listItem.style.display !== 'none') {
                card.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Add smooth scrolling to project section when filter is clicked
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectsGrid = document.querySelector('.projects-grid');
            if (projectsGrid) {
                projectsGrid.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    });

    // Counter animation for visible projects
    function updateProjectCounter() {
        const visibleProjects = document.querySelectorAll('.projects-grid li:not([style*="display: none"])');
        const counter = document.querySelector('.project-counter');
        
        if (counter) {
            counter.textContent = `${visibleProjects.length} Project${visibleProjects.length !== 1 ? 's' : ''}`;
        }
    }

    // Optional: Add project counter (you can add this element to your HTML)
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
        
        // Update counter when filter changes
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                setTimeout(updateProjectCounter, 250);
            });
        });
    }
});