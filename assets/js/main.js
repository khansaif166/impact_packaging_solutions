(function () {
  const header =
    document.querySelector("[data-site-header]") ||
    document.querySelector(".site-header") ||
    document.querySelector("header");
  const navToggle =
    document.querySelector("[data-nav-toggle]") || document.querySelector(".nav-toggle");
  const mobileMenu =
    document.querySelector("[data-mobile-menu]") || document.querySelector(".mobile-menu");
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll("a[href]") : [];
  const scrolledClassTarget = header || document.body;
  const navLogoImage = document.querySelector(".nav-logo__image");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateNavLogo() {
    if (!navLogoImage) {
      return;
    }

    const defaultLogo = navLogoImage.dataset.logoDefault || "assets/images/logo.png";
    const inverseLogo = navLogoImage.dataset.logoInverse || "assets/images/logo-white.png";
    const shouldUseInverse =
      document.body.classList.contains("inner-page") &&
      header &&
      !header.classList.contains("scrolled");
    const nextLogo = shouldUseInverse ? inverseLogo : defaultLogo;

    if (navLogoImage.getAttribute("src") !== nextLogo) {
      navLogoImage.setAttribute("src", nextLogo);
    }
  }

  function updateScrolledState() {
    if (!scrolledClassTarget) {
      return;
    }

    if (window.scrollY > 80) {
      scrolledClassTarget.classList.add("scrolled");
    } else {
      scrolledClassTarget.classList.remove("scrolled");
    }

    updateNavLogo();
  }

  function setMenuState(isOpen) {
    if (!navToggle || !mobileMenu) {
      return;
    }

    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    navToggle.classList.toggle("is-open", isOpen);
    mobileMenu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  }

  function closeMenu() {
    setMenuState(false);
  }

  function openMenu() {
    setMenuState(true);
  }

  function handleToggleClick() {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function setupNavToggle() {
    if (!navToggle || !mobileMenu) {
      return;
    }

    mobileMenu.setAttribute("aria-hidden", "true");
    navToggle.addEventListener("click", handleToggleClick);

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  function setupScrollObserver() {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    if (!animatedElements.length) {
      return;
    }

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      animatedElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    animatedElements.forEach((element) => observer.observe(element));
  }

  function setupSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");
        const targetElement = targetId ? document.querySelector(targetId) : null;

        if (!targetElement) {
          return;
        }

        event.preventDefault();
        targetElement.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  }

  function normalizePath(path) {
    if (!path || path === "/") {
      return "/index.html";
    }

    if (path.endsWith("/")) {
      return path + "index.html";
    }

    return path;
  }

  function setupActiveNavLink() {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll("[data-nav-link], nav a[href], .mobile-menu a[href]");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) {
        return;
      }

      const normalizedHref = normalizePath(new URL(href, window.location.origin).pathname);
      const isActive = normalizedHref === currentPath;

      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setupProductFilters() {
    const filterButtons = document.querySelectorAll("[data-filter]");
    const productCards = document.querySelectorAll("[data-category]");

    if (!filterButtons.length || !productCards.length) {
      return;
    }

    function applyFilter(filterValue) {
      filterButtons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.filter === filterValue);
        button.setAttribute("aria-pressed", String(button.dataset.filter === filterValue));
      });

      productCards.forEach((card) => {
        const matches = filterValue === "all" || card.dataset.category === filterValue;
        card.classList.toggle("is-hidden", !matches);
      });
    }

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
      button.addEventListener("click", () => {
        applyFilter(button.dataset.filter || "all");
      });
    });
  }

  function setupContactForm() {
    const contactForm = document.querySelector("[data-contact-form]");

    if (!contactForm) {
      return;
    }

    const successMessage = document.querySelector("[data-form-success]");
    const errorMessage = document.querySelector("[data-form-error]");
    const submitButton = contactForm.querySelector("[data-submit-button]");
    const submitLabel = contactForm.querySelector("[data-submit-label]");
    const productInterestField = contactForm.querySelector("[data-product-interest]");
    const messageField = contactForm.querySelector("[data-message-field]");
    const contextField = contactForm.querySelector("[data-contact-context]");
    const searchParams = new URLSearchParams(window.location.search);
    const contextEntries = [];

    function hideMessages() {
      if (successMessage) {
        successMessage.classList.remove("is-visible");
      }

      if (errorMessage) {
        errorMessage.classList.remove("is-visible");
        errorMessage.textContent = "";
      }
    }

    function appendMessageContext(label, value) {
      if (!messageField || !value) {
        return;
      }

      const nextLine = label + ": " + value;
      if (messageField.value.includes(nextLine)) {
        return;
      }

      const prefix = messageField.value.trim() ? "\n\n" : "";
      messageField.value = messageField.value + prefix + nextLine;
    }

    const productParam = searchParams.get("product");
    if (productParam) {
      contextEntries.push("Product: " + productParam);

      if (productInterestField) {
        const normalizedProduct = productParam.toLowerCase();
        let mappedValue = "Other";

        if (normalizedProduct.includes("laminate")) {
          mappedValue = "Laminate Films";
        } else if (normalizedProduct.includes("stand-up")) {
          mappedValue = "Stand-Up Pouches";
        } else if (normalizedProduct.includes("zipper")) {
          mappedValue = "Zipper Pouches";
        } else if (normalizedProduct.includes("roll")) {
          mappedValue = "Roll Stock";
        }

        productInterestField.value = mappedValue;
      }

      appendMessageContext("Product interest from page", productParam);
    }

    const industryParam = searchParams.get("industry");
    if (industryParam) {
      contextEntries.push("Industry: " + industryParam);
      appendMessageContext("Industry requirement", industryParam);
    }

    if (contextField) {
      contextField.value = contextEntries.join(" | ");
    }

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideMessages();

      const formAction =
        contactForm.dataset.formEndpoint || contactForm.getAttribute("action") || "";
      const isPlaceholderEndpoint =
        !formAction ||
        formAction.includes("[FORMSPREE_ID]") ||
        formAction.includes("[FORMSPREE_ENDPOINT]");
      const accessKeyField = contactForm.querySelector('input[name="access_key"]');
      const accessKey = accessKeyField ? accessKeyField.value.trim() : "";
      const isPlaceholderAccessKey = !accessKey || accessKey === "YOUR_ACCESS_KEY_HERE";

      if (isPlaceholderEndpoint || isPlaceholderAccessKey) {
        if (errorMessage) {
          errorMessage.textContent =
            "Add your real Web3Forms access key in contact.html to start receiving quote requests.";
          errorMessage.classList.add("is-visible");
        }
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
      }

      if (submitLabel) {
        submitLabel.textContent = "Submitting...";
      }

      try {
        const response = await fetch(formAction, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: new FormData(contactForm),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Request failed");
        }

        contactForm.hidden = true;
        if (successMessage) {
          successMessage.classList.add("is-visible");
        }
      } catch (error) {
        if (errorMessage) {
          errorMessage.textContent =
            "Something went wrong while sending your request. Please try again or contact us by phone or email.";
          errorMessage.classList.add("is-visible");
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
        }

        if (submitLabel) {
          submitLabel.textContent = "Submit Request";
        }
      }
    });
  }

  function initHeroCarousel() {
    const carousel = document.querySelector(".hero-carousel");
    const slides = carousel ? carousel.querySelectorAll(".hero-slide") : [];
    const dots = carousel ? carousel.querySelectorAll(".carousel-dot") : [];

    if (!carousel || !slides.length || prefersReducedMotion) {
      return;
    }

    let current = 0;
    let timer;

    function setActive(index) {
      slides[current].classList.remove("active");
      if (dots[current]) {
        dots[current].classList.remove("active");
      }

      current = index;
      slides[current].classList.add("active");
      if (dots[current]) {
        dots[current].classList.add("active");
      }
    }

    function nextSlide() {
      setActive((current + 1) % slides.length);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(nextSlide, 4000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        stopTimer();
        setActive(index);
        startTimer();
      });
    });

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  updateScrolledState();
  window.addEventListener("scroll", updateScrolledState, { passive: true });

  setupNavToggle();
  setupScrollObserver();
  setupSmoothScroll();
  setupActiveNavLink();
  setupProductFilters();
  setupContactForm();
  initHeroCarousel();
})();
