const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const navigationLinks = [...document.querySelectorAll(".site-nav a")];
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
  navigation.classList.toggle("open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
});

navigationLinks.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeMenu();
});

const sectionByNavTarget = new Map(
  navigationLinks
    .map((link) => [link.getAttribute("href"), link])
    .filter(([target]) => target?.startsWith("#"))
    .map(([target, link]) => [document.querySelector(target), link])
    .filter(([section]) => section)
);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navigationLinks.forEach((link) => link.classList.remove("active"));
    sectionByNavTarget.get(visible.target)?.classList.add("active");
  },
  { rootMargin: "-20% 0px -55%", threshold: [0, 0.1, 0.3, 0.6] },
);

sectionByNavTarget.forEach((_, section) => observer.observe(section));

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const formData = new FormData(contactForm);
  const submitButton = contactForm.querySelector(".form-submit");
  const originalButtonText = submitButton?.innerHTML;

  if (formStatus) {
    formStatus.textContent = "Sending your message...";
    formStatus.style.color = "var(--copy)";
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.style.opacity = "0.7";
  }

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      if (formStatus) {
        formStatus.textContent = "Thanks! Your message has been sent successfully.";
        formStatus.style.color = "var(--teal)";
      }
      contactForm.reset();
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    if (formStatus) {
      formStatus.textContent =
        "Sorry, something went wrong. Please email us directly at Info@devseatechnologies.com.";
      formStatus.style.color = "#e53935";
    }
    console.error("Contact form error:", error);
  } finally {
    if (submitButton && originalButtonText) {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }
  }
});
