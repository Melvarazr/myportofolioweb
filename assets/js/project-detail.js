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
    if (!navbar || !overlay) return;
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

/**
 * ACTIVE HEADER SAAT SCROLL (THROTTLED VIA RAF)
 */
const header = document.querySelector("[data-header]");
if (header) {
    let scrollTicking = false;

    window.addEventListener("scroll", () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            header.classList.toggle("active", window.scrollY > 100);
            scrollTicking = false;
        });
    }, { passive: true });
}

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
 * 3D INTERACTIVE TILT ENGINE UNTUK BENTO & CONTENT CARDS (DESKTOP POINTER ONLY)
 */
const supportsFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (supportsFinePointer) {
    const tiltCards = document.querySelectorAll(
        "[data-3d-tilt], .meta-bento-card, .breakdown-item, .feature-item, .improvement-item, .process-item, .tool-item"
    );

    tiltCards.forEach((card) => {
        const maxTilt = 4.5;
        let rafId = null;

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
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -maxTilt;
                const rotateY = ((x - centerX) / centerX) * maxTilt;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
            });
        });

        card.addEventListener("pointerleave", () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.classList.remove("is-tilting");
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
        });
    });
}

/**
 * INTERACTIVE UI LIGHTBOX PREVIEW (ZOOM, PAN & GALLERY NAVIGATION)
 */
function initUiLightbox() {
    const targetImages = Array.from(
        document.querySelectorAll(".hero-image img, img[data-lightbox]")
    );

    if (!targetImages.length) return;

    // 1. Pasang badge petunjuk "Inspect UI" & event klik pada setiap wrapper gambar
    targetImages.forEach((img, index) => {
        const wrapper = img.closest(".hero-image") || img.parentElement;
        if (!wrapper) return;

        if (!wrapper.classList.contains("hero-image")) {
            wrapper.setAttribute("data-lightbox-wrap", "");
        }

        if (!wrapper.querySelector(".lightbox-hint-badge")) {
            const badge = document.createElement("span");
            badge.className = "lightbox-hint-badge";
            badge.innerHTML =
                '<ion-icon name="expand-outline" aria-hidden="true"></ion-icon><span>Inspect UI</span>';
            wrapper.appendChild(badge);
        }

        wrapper.addEventListener("click", (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });

    // 2. Bangun elemen modal Lightbox secara dinamis
    const lightbox = document.createElement("div");
    lightbox.className = "ui-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "UI Image Preview");
    lightbox.innerHTML = `
        <div class="ui-lightbox-topbar">
            <div class="ui-lightbox-caption">
                <span class="ui-lightbox-counter">1 / 1</span>
                <span class="ui-lightbox-title">UI Preview</span>
            </div>
            <div class="ui-lightbox-controls">
                <button type="button" class="ui-lb-btn" data-lb-zoom-out aria-label="Zoom out" title="Zoom out (-)">
                    <ion-icon name="remove-outline"></ion-icon>
                </button>
                <span class="ui-lb-zoom-level">100%</span>
                <button type="button" class="ui-lb-btn" data-lb-zoom-in aria-label="Zoom in" title="Zoom in (+)">
                    <ion-icon name="add-outline"></ion-icon>
                </button>
                <button type="button" class="ui-lb-btn" data-lb-reset aria-label="Reset zoom" title="Reset (0)">
                    <ion-icon name="refresh-outline"></ion-icon>
                </button>
                <button type="button" class="ui-lb-btn" data-lb-close aria-label="Close preview" title="Close (ESC)">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </div>
        </div>
        <div class="ui-lightbox-stage">
            <button type="button" class="ui-lb-nav prev" data-lb-prev aria-label="Previous image">
                <ion-icon name="chevron-back-outline"></ion-icon>
            </button>
            <img src="" alt="" class="ui-lightbox-img">
            <button type="button" class="ui-lb-nav next" data-lb-next aria-label="Next image">
                <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
        </div>
        <div class="ui-lightbox-footer">
            Click or scroll on image to zoom &bull; Drag to pan when zoomed &bull; Press ESC to close
        </div>
    `;
    document.body.appendChild(lightbox);

    const stage = lightbox.querySelector(".ui-lightbox-stage");
    const lbImg = lightbox.querySelector(".ui-lightbox-img");
    const lbTitle = lightbox.querySelector(".ui-lightbox-title");
    const lbCounter = lightbox.querySelector(".ui-lightbox-counter");
    const lbZoomLabel = lightbox.querySelector(".ui-lb-zoom-level");
    const prevBtn = lightbox.querySelector("[data-lb-prev]");
    const nextBtn = lightbox.querySelector("[data-lb-next]");

    let currentIndex = 0;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let startY = 0;
    let dragRafId = null;

    const updateTransform = () => {
        lbImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        lbZoomLabel.textContent = `${Math.round(scale * 100)}%`;
        lbImg.classList.toggle("is-zoomed", scale > 1);
    };

    const resetZoom = () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    };

    const setZoom = (newScale) => {
        scale = Number(Math.min(Math.max(newScale, 1), 3).toFixed(2));
        if (scale === 1) {
            translateX = 0;
            translateY = 0;
        }
        updateTransform();
    };

    const renderSlide = (index) => {
        currentIndex = (index + targetImages.length) % targetImages.length;
        const sourceImg = targetImages[currentIndex];
        lbImg.src = sourceImg.currentSrc || sourceImg.src;
        lbImg.alt = sourceImg.alt || "UI Preview";
        lbTitle.textContent = sourceImg.alt || "UI Preview";
        lbCounter.textContent = `${currentIndex + 1} / ${targetImages.length}`;

        const singleImage = targetImages.length <= 1;
        prevBtn.classList.toggle("is-hidden", singleImage);
        nextBtn.classList.toggle("is-hidden", singleImage);

        resetZoom();
    };

    const openLightbox = (index) => {
        renderSlide(index);
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
        lightbox.classList.remove("is-open");
        document.body.style.overflow = "";
        resetZoom();
    };

    // Kontrol tombol toolbar & navigasi
    lightbox.querySelector("[data-lb-close]").addEventListener("click", closeLightbox);
    lightbox.querySelector("[data-lb-zoom-in]").addEventListener("click", () => setZoom(scale + 0.5));
    lightbox.querySelector("[data-lb-zoom-out]").addEventListener("click", () => setZoom(scale - 0.5));
    lightbox.querySelector("[data-lb-reset]").addEventListener("click", resetZoom);
    prevBtn.addEventListener("click", () => renderSlide(currentIndex - 1));
    nextBtn.addEventListener("click", () => renderSlide(currentIndex + 1));

    // Klik area kosong di sekitar gambar untuk menutup modal
    stage.addEventListener("click", (e) => {
        if (e.target === stage) closeLightbox();
    });

    // Klik gambar untuk toggle zoom 100% <-> 200%
    lbImg.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hasDragged) {
            hasDragged = false;
            return;
        }
        setZoom(scale > 1 ? 1 : 2);
    });

    // Scroll roda mouse untuk zoom halus
    stage.addEventListener(
        "wheel",
        (e) => {
            if (!lightbox.classList.contains("is-open")) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            setZoom(scale + delta);
        },
        { passive: false }
    );

    // Drag / Pan saat gambar sedang di-zoom (di-batch per frame)
    lbImg.addEventListener("pointerdown", (e) => {
        if (scale <= 1) return;
        e.preventDefault();
        isDragging = true;
        hasDragged = false;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lbImg.classList.add("is-dragging");
        lbImg.setPointerCapture(e.pointerId);
    });

    lbImg.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        hasDragged = true;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;

        if (dragRafId) return;
        dragRafId = requestAnimationFrame(() => {
            updateTransform();
            dragRafId = null;
        });
    });

    const stopDrag = () => {
        isDragging = false;
        if (dragRafId) {
            cancelAnimationFrame(dragRafId);
            dragRafId = null;
        }
        lbImg.classList.remove("is-dragging");
    };

    lbImg.addEventListener("pointerup", stopDrag);
    lbImg.addEventListener("pointercancel", stopDrag);

    // Navigasi Keyboard
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("is-open")) return;

        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight" && targetImages.length > 1) renderSlide(currentIndex + 1);
        if (e.key === "ArrowLeft" && targetImages.length > 1) renderSlide(currentIndex - 1);
        if (e.key === "+" || e.key === "=") setZoom(scale + 0.5);
        if (e.key === "-") setZoom(scale - 0.5);
        if (e.key === "0") resetZoom();
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUiLightbox);
} else {
    initUiLightbox();
}