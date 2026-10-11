/* ==========================================================================
   Configuration
   ========================================================================== */

// Appointment requests are POSTed as JSON to this URL (e.g. a Formspree,
// Basin or custom backend endpoint). While it is empty the form runs in demo
// mode: it validates input but clearly tells visitors nothing was sent.
const BOOKING_ENDPOINT = "";

const SERVICES = {
  general: {
    title: "General Dentistry",
    intro: "Routine care is the foundation of a healthy smile. Regular visits help keep teeth and gums in good condition and make it easier to notice small changes early.",
    items: [
      ["Routine dental checkups", "An examination of your teeth, gums and mouth, with time to raise any questions or concerns."],
      ["Professional teeth cleaning", "Removal of plaque and tartar build-up from areas that are hard to reach with brushing alone."],
      ["Preventive dental care", "Practical advice on brushing, cleaning between teeth and everyday habits that support oral health."],
    ],
  },
  cosmetic: {
    title: "Cosmetic Dentistry",
    intro: "Cosmetic treatments focus on the appearance of your smile. We start with a conversation about what you'd like to change and what's realistic for your teeth.",
    items: [
      ["Professional teeth whitening", "Whitening carried out under a dentist's guidance, following a check that it's suitable for you."],
      ["Smile enhancement", "Options for improving the shape, shade or evenness of your teeth, discussed step by step."],
      ["Cosmetic dental consultations", "A no-pressure appointment to explore your goals, the options available and what each involves."],
    ],
  },
  restorative: {
    title: "Restorative Dentistry",
    intro: "Restorative care repairs teeth that are worn, decayed or damaged, with the aim of restoring comfort and everyday function.",
    items: [
      ["Dental crowns", "A custom-made cover that fits over a weakened tooth to protect it and restore its shape."],
      ["Tooth-colored fillings", "Fillings matched to the shade of your teeth, used to repair areas affected by decay."],
      ["Repair of damaged teeth", "Assessment and treatment options for chipped, cracked or broken teeth."],
    ],
  },
  orthodontics: {
    title: "Orthodontics",
    intro: "Orthodontic treatment gradually moves teeth into better alignment. The right approach depends on your teeth, your bite and your preferences.",
    items: [
      ["Traditional braces", "Fixed brackets and wires that are adjusted over time to guide teeth into position."],
      ["Clear aligners", "A series of removable, transparent trays worn over the teeth as a discreet alternative to fixed braces."],
      ["Teeth alignment consultations", "An assessment of your teeth and bite, with a clear explanation of the options open to you."],
    ],
  },
};

/* ==========================================================================
   Header & navigation
   ========================================================================== */
const header = document.querySelector(".site-header");
const nav = document.getElementById("main-nav");
const navToggle = document.querySelector(".nav-toggle");

function setNav(open) {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setNav(false); navToggle.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setNav(false);
  });
}

const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Highlight the nav link for the section currently in view
if (nav && "IntersectionObserver" in window) {
  const links = new Map();
  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    const target = document.getElementById(a.hash.slice(1));
    if (target && target !== header) links.set(target, a);
  });
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      nav.querySelectorAll(".is-current").forEach((a) => a.classList.remove("is-current"));
      links.get(entry.target).classList.add("is-current");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, section) => spy.observe(section));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ==========================================================================
   Service details dialog
   ========================================================================== */
const dialog = document.getElementById("service-dialog");
const serviceSelect = document.getElementById("f-service");

if (dialog) {
  let currentService = "";

  document.querySelectorAll("[data-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = SERVICES[btn.dataset.service];
      if (!service) return;
      currentService = btn.dataset.service;
      document.getElementById("dialog-title").textContent = service.title;
      document.getElementById("dialog-intro").textContent = service.intro;
      const list = document.getElementById("dialog-list");
      list.replaceChildren(...service.items.map(([term, detail]) => {
        const row = document.createElement("div");
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = term;
        dd.textContent = detail;
        row.append(dt, dd);
        return row;
      }));
      dialog.showModal();
    });
  });

  dialog.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", () => dialog.close()));
  // Close when the backdrop is clicked
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

  document.getElementById("dialog-book").addEventListener("click", () => {
    if (serviceSelect && currentService) serviceSelect.value = currentService;
    dialog.close();
  });
}

/* ==========================================================================
   Appointment request form
   ========================================================================== */
const form = document.getElementById("booking-form");

if (form) {
  const status = document.getElementById("form-status");
  const submitBtn = form.querySelector('[type="submit"]');
  const dateInput = form.elements.date;
  const isDemo = !BOOKING_ENDPOINT;

  document.getElementById("demo-banner").hidden = !isDemo;

  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  dateInput.min = today;

  const validators = {
    name: (v) => (v.length < 2 ? "Please enter your full name." : ""),
    phone: (v) => {
      if (!v) return "Please enter a phone number we can reach you on.";
      return /^[+()\d\s.-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a valid phone number.";
    },
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Please enter a valid email address, or leave this blank."),
    date: (v) => {
      if (!v) return "Please choose a preferred date.";
      return v < today ? "Please choose today or a future date." : "";
    },
    time: (v) => (v ? "" : "Please select a preferred time."),
    service: (v) => (v ? "" : "Please select the service you need."),
  };

  function validateField(name) {
    const field = form.elements[name];
    const message = validators[name](field.value.trim());
    document.getElementById(`e-${name}`).textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !message;
  }

  function showStatus(kind, title, body) {
    const box = document.createElement("div");
    const strong = document.createElement("strong");
    box.className = `is-${kind}`;
    strong.textContent = title;
    box.append(strong, " ", body);
    status.replaceChildren(box);
  }

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener("blur", () => { if (field.value || field.hasAttribute("aria-invalid")) validateField(name); });
    field.addEventListener("input", () => { if (field.hasAttribute("aria-invalid")) validateField(name); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.replaceChildren();

    const invalid = Object.keys(validators).filter((name) => !validateField(name));
    if (invalid.length) {
      showStatus("error", "Please check the form.", `${invalid.length} field${invalid.length > 1 ? "s need" : " needs"} your attention before you can send your request.`);
      form.elements[invalid[0]].focus();
      return;
    }

    if (isDemo) {
      showStatus("demo", "Demo only — your request was not sent.", "Your details look good, but this form isn't connected to a booking system yet, so no appointment has been requested. Please contact the clinic directly to book.");
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      form.reset();
      showStatus("success", "Thank you — your request has been received.", "This is not a confirmed appointment yet. We'll contact you to confirm a date and time.");
    } catch (err) {
      showStatus("error", "Sorry, we couldn't send your request.", "Please try again in a moment, or contact the clinic by phone.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Request an Appointment";
    }
  });
}
