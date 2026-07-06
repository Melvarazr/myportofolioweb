'use strict'

const addEventOnElements = function (elements, eventType, callback) {
    for (let i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener(eventType, callback);
    }
}

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNavbar);

const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
    if (window.scrollY > 100) {
        header.classList.add("active");
    } else {
        header.classList.remove("active");
    }
});

// ==========================================
// REVEAL ANIMATION PADA SAAT SCROLL
// ==========================================
const revealElements = document.querySelectorAll("[data-reveal]");
const revealDelayElements = document.querySelectorAll("[data-reveal-delay]");

const reveal = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    // Mengecek apakah elemen sudah masuk ke dalam jangkauan layar
    if (revealElements[i].getBoundingClientRect().top < window.innerHeight / 1.15) {
      revealElements[i].classList.add("revealed");
    }
  }
}

for (let i = 0, len = revealDelayElements.length; i < len; i++) {
  revealDelayElements[i].style.transitionDelay = revealDelayElements[i].dataset.revealDelay;
  revealDelayElements[i].style.animationDelay = revealDelayElements[i].dataset.revealDelay;
}

// Hanya memicu animasi saat layar di-scroll atau baru pertama diload
window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);


// ==========================================
// EFEK HOVER KARTU EXPERIENCE
// ==========================================
document.querySelectorAll('.experience-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateY(-8px) translateX(5px) scale(1.02)';
  });
  
  item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateY(0) translateX(0) scale(1)';
  });
});

// ==========================================
// Contact Form AJAX Submission (Web3Forms)
// ==========================================
const form = document.getElementById('contactForm');
const statusMessage = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        btnText.innerHTML = "Sending...";
        submitBtn.style.opacity = "0.7";
        submitBtn.style.cursor = "not-allowed";
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                statusMessage.innerHTML = "Thanks! Your message has been sent.";
                statusMessage.style.color = "#4caf50"; 
                statusMessage.style.display = "block";
                form.reset(); 
            } else {
                console.log(response);
                statusMessage.innerHTML = json.message;
                statusMessage.style.color = "#f44336"; 
                statusMessage.style.display = "block";
            }
        })
        .catch(error => {
            console.log(error);
            statusMessage.innerHTML = "Something went wrong. Please try again later.";
            statusMessage.style.color = "#f44336";
            statusMessage.style.display = "block";
        })
        .finally(() => {
            btnText.innerHTML = "Send Message";
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
            submitBtn.disabled = false;
            
            setTimeout(() => {
                statusMessage.style.display = "none";
            }, 5000);
        });
    });
}

// ==========================================
// UNDER CONSTRUCTION POPUP LOGIC
// ==========================================
document.addEventListener('click', function(e) {
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

// ==========================================
// SMOOTH SCROLL & AUTO-CLOSE MOBILE MENU
// ==========================================
const navbarLinks = document.querySelectorAll(".navbar-link");

navbarLinks.forEach(link => {
    link.addEventListener("click", function(e) {
        // Ambil id target dari atribut href (contoh: "#education")
        const targetId = this.getAttribute("href");
        
        // Pastikan link mengarah ke id bagian di halaman ini
        if (targetId && targetId.startsWith("#") && targetId.length > 1) {
            e.preventDefault(); // Mencegah lompatan kasar bawaan browser
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 1. Tutup menu mobile secara otomatis saat link diklik
                if (navbar.classList.contains("active")) {
                    navbar.classList.remove("active");
                    overlay.classList.remove("active");
                    document.body.classList.remove("nav-active");
                }

                // 2. Animasi Smooth Scroll dengan memperhitungkan tinggi Header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                
                // Menghitung posisi pas agar judul tidak tertutup header (+ jarak nafas 20px)
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; 
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    });
});