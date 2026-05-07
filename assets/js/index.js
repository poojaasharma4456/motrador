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

const categoryFilters = document.querySelector(".category-filters");
const breaksGrid = document.querySelector(".breaks-grid");

if (categoryFilters && breaksGrid) {
    const pills = categoryFilters.querySelectorAll(".filter-pill");
    const categoryOrder = Array.from(pills)
        .map((pill) => pill.dataset.filter)
        .filter(Boolean);

    function ensureThreeCardsPerCategory() {
        const cardsByCategory = new Map();
        categoryOrder.forEach((category) => cardsByCategory.set(category, []));

        breaksGrid.querySelectorAll(".break-card").forEach((card) => {
            const category = card.dataset.category;
            if (cardsByCategory.has(category)) {
                cardsByCategory.get(category).push(card);
            }
        });

        categoryOrder.forEach((category) => {
            const existingCards = cardsByCategory.get(category);
            const templateCard = existingCards[0];

            if (!templateCard) {
                return;
            }

            for (let i = existingCards.length; i < 3; i += 1) {
                const clone = templateCard.cloneNode(true);
                const title = clone.querySelector("h3");
                const spots = clone.querySelector(".meta-item .meta-text strong");
                const startsAt = clone.querySelectorAll(".meta-item .meta-text strong")[1];
                const price = clone.querySelectorAll(".meta-item .meta-text strong")[2];

                if (title) {
                    title.textContent = `${title.textContent} #${i + 1}`;
                }
                if (spots) {
                    spots.textContent = String(Math.max(2, Number(spots.textContent) - i * 2 || (12 - i * 2)));
                }
                if (startsAt) {
                    startsAt.textContent = i === 1 ? "01:10:00" : "03:25:00";
                }
                if (price) {
                    const numericPrice = Number(price.textContent.replace(/[^0-9]/g, "")) || 39;
                    price.textContent = `$${numericPrice + (i * 5)}`;
                }

                clone.setAttribute("data-aos-delay", String(220 + (i * 40)));
                breaksGrid.appendChild(clone);
            }
        });
    }

    ensureThreeCardsPerCategory();

    function applyBreakFilter(category) {
        const cards = breaksGrid.querySelectorAll(".break-card");
        cards.forEach((card) => {
            const isMatch = card.dataset.category === category;
            card.classList.toggle("is-hidden", !isMatch);
            card.setAttribute("aria-hidden", String(!isMatch));
        });
        pills.forEach((pill) => {
            const active = pill.dataset.filter === category;
            pill.classList.toggle("active", active);
            pill.setAttribute("aria-pressed", String(active));
        });
    }

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const category = pill.dataset.filter;
            if (category) {
                applyBreakFilter(category);
            }
        });
    });

    const initial = categoryFilters.querySelector(".filter-pill.active")?.dataset.filter;
    if (initial) {
        applyBreakFilter(initial);
    }
}
