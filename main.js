// ===== UTILITIES =====
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

// ===== THEME TOGGLE =====
const themeToggle = $('#themeToggle');
if (themeToggle) {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'light') document.documentElement.classList.add('light');
  themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌞' : '🌙';
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    themeToggle.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ===== YEAR & COUNTERS =====
if ($('#year')) {
  $('#year').textContent = new Date().getFullYear();
}
const START_YEAR = 2020; // ← change this
if ($('#yearsExp')) {
  $('#yearsExp').textContent = (new Date().getFullYear() - START_YEAR) + '+';
}

// ===== PROJECT DATA =====
const PROJECTS = [
  {
    id: 1,
    title: 'Sige Talong - MiniGame',
    kind: 'Design',
    tags: ['Gogot', 'Design System', 'MiniGame'],
    desc: 'A lightweight Godot minigame with replayability and accessibility built in',
    live: '#',
    code: '#',
    // <-- Independent thumbnail image
    images: [
      'image/Ui.jpg',
      'image/1.jpg',
      'image/2.jpg',
      'image/3.jpg'
    ],
    video: 'video/game.mp4'
  }
  , {
    id: 2,
    title: 'Events LCUP Website',
    kind: 'Web', // <-- matches 'design' chip
    tags: ['Wordpress', 'Web', 'Hostinger'],
    desc: 'EventsLCUP is the official hub for all events happening at La Consolacion University Philippines.',
    live: '#',
    code: '#',
    thumb: 'image/E1.jpg', // <-- Independent thumbnail image
    images: [
      'image/E1.jpg',
      'image/E2.jpg',
      'image/E3.jpg'
    ],
    // Make modal/project display bigger by adding a new property
    displaySize: 'large' // You can use this in your modal CSS/JS to set a larger size
  }
  // Add more projects here if needed
];

const grid = $('#projectGrid');
function renderProjects(list) {
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open details for ${p.title}`);
    card.innerHTML = `
      <div class="thumb" aria-hidden="true">
        ${p.thumb ? `<img src="${p.thumb}" alt="${p.title} thumbnail" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
        : (p.images && p.images.length ? `<img src="${p.images[0]}" alt="${p.title} thumbnail" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">` : p.title[0])}
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="tags">${p.tags.map(t => `<span class='chip'>${t}</span>`).join('')}</div>
      <div class="tiny" style="margin-top:8px">${p.kind}</div>
    `;
    card.addEventListener('click', () => openProject(p));
    card.addEventListener('keypress', (e) => { if (e.key === 'Enter') openProject(p); });
    grid.appendChild(card);
  });
}
renderProjects(PROJECTS);

// Search & Filter
const searchInput = $('#searchInput');
const filterChips = $$('.filters .chip');
let activeFilter = 'all';

function applyFilters() {
  const q = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '';
  const filtered = PROJECTS.filter(p => {
    const kind = (p.kind || '').toLowerCase();
    const matchesFilter = activeFilter === 'all' || kind === activeFilter;
    const matchesText = !q || [p.title, p.desc, ...(p.tags || [])].join(' ').toLowerCase().includes(q);
    return matchesFilter && matchesText;
  });
  renderProjects(filtered);
}

if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}
filterChips.forEach(chip => chip.addEventListener('click', () => {
  filterChips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeFilter = chip.dataset.filter;
  applyFilters();
}));

// Modal
const modal = $('#projectModal');
const modalTitle = $('#modalTitle');
const modalThumb = $('#modalThumb');
const modalDesc = $('#modalDesc');
const modalTags = $('#modalTags');
const modalLive = $('#modalLive');
const modalCode = $('#modalCode');

function openProject(p) {
  if (!modal || !modalTitle || !modalDesc || !modalTags || !modalLive || !modalCode) return;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalTags.innerHTML = (p.tags || []).map(t => `<span class='chip active'>${t}</span>`).join('');
  modalLive.href = p.live || '#';
  modalCode.href = p.code || '#';

  // Video
  const modalVideo = $('#modalVideo');
  if (modalVideo) {
    modalVideo.innerHTML = p.video ? `<video src="${p.video}" controls></video>` : '';
  }

  // Images
  const modalMainImg = $('#modalMainImg');
  const modalThumbs = $('#modalThumbs');
  let currentImg = 0;

  function showImg(idx) {
    currentImg = idx;
    if (modalMainImg) {
      modalMainImg.innerHTML = `<img src="${p.images[idx]}" alt="${p.title} screenshot">`;
    }
    // Highlight active thumb
    if (modalThumbs) {
      $$('.thumbs-row img').forEach((img, i) => {
        img.classList.toggle('active', i === idx);
      });
    }
  }

  if (modalThumbs && p.images && p.images.length) {
    modalThumbs.innerHTML = p.images.map((src, i) =>
      `<img src="${src}" alt="Screenshot ${i + 1}" ${i === 0 ? 'class="active"' : ''} />`
    ).join('');
    showImg(0);
    // Add click event to thumbs
    $$('.thumbs-row img').forEach((img, i) => {
      img.onclick = () => showImg(i);
    });
  } else if (modalMainImg && modalThumbs) {
    modalMainImg.innerHTML = '';
    modalThumbs.innerHTML = '';
  }

  modal.showModal();
}

// ===== SKILLS BARS =====
const SKILLS = [
  { name: 'HTML', level: 85 },
  { name: 'CSS', level: 82 },
  { name: 'JavaScript', level: 80 },
  { name: 'Flutter', level: 85 },
  { name: 'Accessibility', level: 88 },
  { name: 'Performance', level: 86 }
];

const skillsList = $('#skills');
if (skillsList) {
  SKILLS.forEach(s => {
    const el = document.createElement('div');
    el.className = 'skill';
    el.innerHTML = `<div style="display:flex; justify-content:space-between"><strong>${s.name}</strong><span class="tiny">${s.level}%</span></div><div class='bar'><i style='width:0%'></i></div>`;
    skillsList.appendChild(el);
  });
  // animate on intersection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.bar > i', entry.target).forEach((i, idx) => {
          i.style.width = SKILLS[idx].level + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  const aboutSection = $('#about');
  if (aboutSection) observer.observe(aboutSection);
}

// ===== EXPERIENCE TIMELINE =====
const ROLES = [
  { when: '2023', title: 'Secretary', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['From Pixels to Perfection: Unleashing Creativity in Game Development and Graphic Designing.'] },
  { when: '2023', title: 'Secretary', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['IT Trends Navigating the Ever - Changing Digital Landscape.'] },
  { when: '2023', title: 'Support Committee', org: 'Philippine Society of Information Technology Educators - PSITE', bullets: ['Regional Assembly on Information Technology Education 2023 - RAITE 2023.'] },
  { when: '2023 - 2024', title: 'Secretary', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Former Organizational - Secretary'] },
  { when: '2024', title: 'Technical Writing Participant', org: 'Philippine Society of Information Technology Educators - PSITE', bullets: ['International Research Conference on Information Technology Education - IRCITE 2024.'] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['St. Elined Foundation Inc. Outreach Program.'] },
  { when: '2024', title: 'Shirt Layout Participant', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Organizationl T - Shirt Layout Competition.'] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Coding for Impact: Leveraging Technology to Solve Real-World Challenges.'] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Ethical Hacking: Juggling Technology and Morality.'] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Stream your Ideas: A new era of content creation with OBS Studio. '] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Smart Solutions: AI Tools for Business, Education, and Innovation.'] },
  { when: '2024', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Click, Code, Secure, Discover: A Hands-On Tech Adventure.'] },
  { when: '2025', title: 'Committee', org: 'Junior Philippine Student Society for Information Technology Education LCUP - JPSSITE', bullets: ['Pushing Tech Limits.'] }
];

const timeline = $('#timeline');
if (timeline) {
  ROLES.forEach(r => {
    const item = document.createElement('div');
    item.className = 'titem';
    item.innerHTML = `<div class='tiny' style='color:var(--muted)'>${r.when}</div><h3 style='margin:.2rem 0'>${r.title} · ${r.org}</h3><ul>${r.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
    timeline.appendChild(item);
  });
}
console.log("EmailJS loaded?", typeof emailjs !== "undefined");

// Ensure EmailJS is initialized
if (window.emailjs && typeof emailjs.init === 'function') {
  try {
    // init again is safe; replace only if needed
    emailjs.init('VVix4UStPXwpsOada');
  } catch (e) {
    console.warn('EmailJS init failed (likely already initialized)', e);
  }
} else {
  console.warn('EmailJS SDK not found. Ensure the SDK <script> is included in index.html before main.js');
}
console.log('EmailJS ready?', typeof emailjs !== 'undefined', emailjs && emailjs._userID);

// ===== CONTACT FORM (EmailJS) =====
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  // Replace these values with the exact IDs from https://dashboard.emailjs.com/admin
  const SERVICE_ID = 'service_wh3tkc4';    // confirm on dashboard
  const TEMPLATE_ID = 'template_rzrxqcf';  // confirm on dashboard

  if (!contactForm || !statusEl) return;

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    statusEl.textContent = 'Sending…';

    // Use native form validation (form no longer has novalidate)
    if (!contactForm.checkValidity()) {
      // Show browser validation UI and provide a short status message
      contactForm.reportValidity();
      statusEl.textContent = 'Please complete required fields and provide a valid email.';
      return;
    }

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const subject = document.getElementById("subject")?.value.trim();
    const message = document.getElementById("message")?.value.trim();
    const emailInput = document.getElementById("email");

    // Extra check: ensure the email field passes HTML validity
    if (!emailInput || !emailInput.checkValidity()) {
      statusEl.textContent = emailInput?.validationMessage || 'Please enter a valid email address.';
      return;
    }

    // Enforce @email.com domain (keeps your previous requirement)
    if (!/^[A-Za-z0-9._%+-]+@email\.com$/i.test(email)) {
      statusEl.textContent = 'Please use an email address that ends with "@email.com".';
      return;
    }

    if (!name || !email || !subject || !message) {
      statusEl.textContent = 'Please complete all fields.';
      return;
    }

    // Enforce @email.com domain
    if (!/^[A-Za-z0-9._%+-]+@email\.com$/i.test(email)) {
      statusEl.textContent = 'Please use an email address that ends with "@email.com".';
      return;
    }

    if (!window.emailjs || typeof emailjs.send !== 'function') {
      console.error('EmailJS SDK missing or not initialized.');
      statusEl.textContent = 'Email service unavailable.';
      return;
    }

    // Use sendForm with the form selector (3rd param must be form element or selector)
    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, '#contactForm')
      .then(() => {
        statusEl.textContent = '✅ Message sent successfully!';
        contactForm.reset();
      })
      .catch(function (error) {
        console.error('EmailJS error object:', error);
        let userMessage = '❌ Unable to send message. Check console for details.';
        if (error && error.status === 412) {
          userMessage = '❌ Email service authorization failed (Gmail scopes). Reconnect Gmail in EmailJS dashboard or use SMTP/app-password.';
        } else if (error && error.status === 400 && error.text && error.text.includes('service')) {
          userMessage = '❌ Service ID not found. Check SERVICE_ID in main.js matches EmailJS dashboard.';
        } else if (error && error.text) {
          userMessage = `❌ ${error.text}`;
        }
        statusEl.textContent = userMessage;
      });
  });
});

// ===== NAV ACTIVE STATE ON SCROLL =====
const sections = ['home', 'projects', 'about', 'education', 'experience', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const links = $$('header nav a');
const onScroll = () => {
  const y = window.scrollY + 120;
  let current = sections.length ? sections[0].id : '';
  sections.forEach(sec => { if (sec.offsetTop <= y) current = sec.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Certification image modal logic
const certImgs = $$('.cert-view-img');
const certImgModal = $('#certImgModal');
const certImgModalImg = $('#certImgModalImg');
const certImgModalClose = $('.img-modal-close');

certImgs.forEach(img => {
  img.addEventListener('click', () => {
    certImgModalImg.src = img.src;
    certImgModal.style.display = 'flex';
    certImgModal.focus();
  });
  img.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      certImgModalImg.src = img.src;
      certImgModal.style.display = 'flex';
      certImgModal.focus();
    }
  });
});

if (certImgModalClose) {
  certImgModalClose.addEventListener('click', () => {
    certImgModal.style.display = 'none';
    certImgModalImg.src = '';
  });
  certImgModalClose.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      certImgModal.style.display = 'none';
      certImgModalImg.src = '';
    }
  });
}

// Close modal when clicking outside image
if (certImgModal) {
  certImgModal.addEventListener('click', (e) => {
    if (e.target === certImgModal) {
      certImgModal.style.display = 'none';
      certImgModalImg.src = '';
    }
  });
}

// ===== NAV TOGGLE (responsive dropdown) =====
const navToggle = $('#navToggle');
const primaryNav = $('#primaryNav');

if (navToggle && primaryNav) {
  function setNavOpen(open) {
    navToggle.classList.toggle('open', open);
    primaryNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setNavOpen(!primaryNav.classList.contains('open'));
  });

  // Close when clicking a link
  $$('#primaryNav a').forEach(a => a.addEventListener('click', () => setNavOpen(false)));

  // Close when clicking outside the nav (on small screens)
  document.addEventListener('click', (e) => {
    if (!primaryNav.classList.contains('open')) return;
    const inside = primaryNav.contains(e.target) || navToggle.contains(e.target);
    if (!inside) setNavOpen(false);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });

  // Ensure nav closes when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setNavOpen(false);
  });
}

