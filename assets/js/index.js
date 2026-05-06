const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const topbarClose = document.querySelector(".topbar-close");
const topbar = document.querySelector(".topbar");

if (window.AOS) {
    window.AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        anchorPlacement: "top-bottom"
    });
}

if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        mainNav.classList.toggle("show");
    });
}

if (topbarClose && topbar) {
    topbarClose.addEventListener("click", () => {
        topbar.style.display = "none";
    });
}

const statsContainer = document.querySelector("#statsContainer");
const trustedStatsContainer = document.querySelector("#trustedStatsContainer");

const statsData = [
    { label: "Active Collectors", value: 25000, prefix: "", suffix: "+", compact: true },
    { label: "Cards Sold", value: 1200000, prefix: "", suffix: "+", compact: true, decimals: 1 },
    { label: "Live Breaks", value: 850, prefix: "", suffix: "+", compact: false },
    { label: "Hits Pulled", value: 50000, prefix: "", suffix: "+", compact: true }
];

const trustedStatsData = [
    { label: "Active Collectors", value: 25000, prefix: "", suffix: "+", compact: true },
    { label: "Hits Pulled", value: 50000, prefix: "", suffix: "+", compact: true },
    { label: "Cards Sold", value: 1200000, prefix: "", suffix: "+", compact: true, decimals: 1 },
    { label: "Live Breaks Hosted", value: 850, prefix: "", suffix: "+", compact: false }
];

function formatStat(value, stat) {
    if (stat.compact) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(stat.decimals ?? 0)}M${stat.suffix}`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(stat.decimals ?? 0)}K${stat.suffix}`;
        }
    }
    return `${Math.floor(value)}${stat.suffix}`;
}

function animateCount(element, stat, duration = 1600) {
    const start = performance.now();

    function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentValue = stat.value * easedProgress;
        element.textContent = `${stat.prefix}${formatStat(currentValue, stat)}`;

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

if (statsContainer) {
    statsContainer.innerHTML = statsData
        .map(
            (stat, index) => `
            <article class="stat-card" data-aos="fade-up" data-aos-delay="${100 + (index * 70)}">
                <h3 data-stat-value="${stat.value}" data-compact="${stat.compact}" data-decimals="${stat.decimals ?? 0}">0</h3>
                <p>${stat.label}</p>
            </article>
        `
        )
        .join("");

    if (window.AOS) {
        window.AOS.refreshHard();
    }

    const statElements = statsContainer.querySelectorAll("h3");

    const statsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    statElements.forEach((el, index) => animateCount(el, statsData[index]));
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.35 }
    );

    statsObserver.observe(statsContainer);
}

if (trustedStatsContainer) {
    trustedStatsContainer.innerHTML = trustedStatsData
        .map(
            (stat, index) => `
            <article data-aos="fade-up" data-aos-delay="${100 + (index * 70)}">
                <h3>0</h3>
                <p>${stat.label}</p>
            </article>
        `
        )
        .join("");

    const trustedStatElements = trustedStatsContainer.querySelectorAll("h3");

    const trustedStatsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    trustedStatElements.forEach((el, index) => animateCount(el, trustedStatsData[index]));
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.35 }
    );

    trustedStatsObserver.observe(trustedStatsContainer);
}

const reviewSlider = document.querySelector("#reviewSlider");

if (reviewSlider) {
    const track = reviewSlider.querySelector(".review-track");
    const slides = reviewSlider.querySelectorAll(".review-card");
    const dots = reviewSlider.querySelectorAll(".review-dot");

    let currentSlide = 0;
    let sliderInterval;

    function goToSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        const targetSlide = slides[currentSlide];
        const offsetX = targetSlide ? targetSlide.offsetLeft : 0;
        track.style.transform = `translateX(-${offsetX}px)`;
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function startSlider() {
        sliderInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 3500);
    }

    function stopSlider() {
        if (sliderInterval) {
            clearInterval(sliderInterval);
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            goToSlide(index);
            stopSlider();
            startSlider();
        });
    });

    reviewSlider.addEventListener("mouseenter", stopSlider);
    reviewSlider.addEventListener("mouseleave", startSlider);

    goToSlide(0);
    startSlider();
}
