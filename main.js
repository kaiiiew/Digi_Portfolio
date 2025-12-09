// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
// TODO: Replace these with your actual keys from Supabase Dashboard > Settings > API
const supabaseUrl = 'https://rvquihhxbazfwfhlgmny.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2cXVpaGh4YmF6ZndmaGxnbW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAzMTYsImV4cCI6MjA4MDgzNjMxNn0.KtnjjfXbqrx35MrDB62dApBcOhQEdKhAPNxMG-QTv1g';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. UTILITIES & THEME
// ==========================================
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

// Theme Toggle
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

// Year & Stats
if ($('#year')) $('#year').textContent = new Date().getFullYear();
const START_YEAR = 2020;
if ($('#yearsExp')) $('#yearsExp').textContent = (new Date().getFullYear() - START_YEAR) + '+';


// ==========================================
// 3. FETCH & RENDER PROJECTS
// ==========================================
let ALL_PROJECTS = []; // Stores fetched data
const grid = $('#projectGrid');

async function loadProjects() {
  if(!grid) return;
  grid.innerHTML = '<p class="tiny">Loading projects...</p>';

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading projects:', error);
    grid.innerHTML = '<p>Failed to load projects.</p>';
    return;
  }

  // Map DB columns to your JS object structure
  ALL_PROJECTS = data.map(p => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    kind: p.category, // DB uses 'category', JS uses 'kind'
    tags: p.tags || [],
    images: p.image_urls || [],
    thumb: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : null,
    video: p.video_url,
    live: p.live_url,
    code: p.code_url
  }));

  renderProjects(ALL_PROJECTS);
}

function renderProjects(list) {
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.innerHTML = `
      <div class="thumb" aria-hidden="true">
        ${p.thumb 
          ? `<img src="${p.thumb}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
          : `<div style="background:#333;height:100%;border-radius:12px;"></div>`
        }
      </div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="tags">${p.tags.map(t => `<span class='chip'>${t}</span>`).join('')}</div>
      <div class="tiny" style="margin-top:8px">${p.kind}</div>
    `;
    
    // Interactions
    const open = () => openProject(p);
    card.addEventListener('click', open);
    card.addEventListener('keypress', (e) => { if (e.key === 'Enter') open(); });
    grid.appendChild(card);
  });
}

// Search & Filter Logic
const searchInput = $('#searchInput');
const filterChips = $$('.filters .chip');
let activeFilter = 'all';

function applyFilters() {
  const q = searchInput && searchInput.value ? searchInput.value.toLowerCase().trim() : '';
  const filtered = ALL_PROJECTS.filter(p => {
    const kind = (p.kind || '').toLowerCase();
    const matchesFilter = activeFilter === 'all' || kind === activeFilter;
    // Search in title, desc, and tags
    const matchesText = !q || [p.title, p.desc, ...p.tags].join(' ').toLowerCase().includes(q);
    return matchesFilter && matchesText;
  });
  renderProjects(filtered);
}

if (searchInput) searchInput.addEventListener('input', applyFilters);

filterChips.forEach(chip => chip.addEventListener('click', () => {
  filterChips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  activeFilter = chip.dataset.filter;
  applyFilters();
}));


// ==========================================
// 4. PROJECT MODAL
// ==========================================
const modal = $('#projectModal');
const modalTitle = $('#modalTitle');
const modalDesc = $('#modalDesc');
const modalTags = $('#modalTags');
const modalLive = $('#modalLive');
const modalCode = $('#modalCode');
const modalVideo = $('#modalVideo');
const modalMainImg = $('#modalMainImg');
const modalThumbs = $('#modalThumbs');

function openProject(p) {
  if (!modal) return;
  
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalTags.innerHTML = (p.tags || []).map(t => `<span class='chip active'>${t}</span>`).join('');
  
  // Links
  modalLive.href = p.live || '#';
  modalLive.style.display = p.live ? 'inline-block' : 'none';
  modalCode.href = p.code || '#';
  modalCode.style.display = p.code ? 'inline-block' : 'none';

  // Video
  if (modalVideo) {
    modalVideo.innerHTML = p.video ? `<video src="${p.video}" controls style="width:100%; border-radius:8px;"></video>` : '';
  }

  // Gallery
  if (modalMainImg && modalThumbs) {
    modalMainImg.innerHTML = '';
    modalThumbs.innerHTML = '';

    if (p.images && p.images.length > 0) {
      // Function to switch main image
      const showImg = (idx) => {
        modalMainImg.innerHTML = `<img src="${p.images[idx]}" alt="Screenshot" style="width:100%;border-radius:8px;">`;
        // Update active class on thumbs
        $$('.thumbs-row img', modalThumbs).forEach((img, i) => img.classList.toggle('active', i === idx));
      };

      // Create thumbnails
      modalThumbs.innerHTML = p.images.map((src, i) => 
        `<img src="${src}" class="thumb-img" style="cursor:pointer; width:60px; height:40px; object-fit:cover; border-radius:4px; margin-right:5px; opacity:0.6;">`
      ).join('');
      
      // Add click events to thumbs
      $$('.thumb-img', modalThumbs).forEach((img, i) => {
        img.onclick = () => showImg(i);
      });

      // Show first image initially
      showImg(0);
    }
  }

  modal.showModal();
}


// ==========================================
// 5. FETCH SKILLS
// ==========================================
async function loadSkills() {
  const skillsList = $('#skills');
  if (!skillsList) return;

  const { data: skills, error } = await supabase
    .from('skills')
    .select('*')
    .order('level', { ascending: false });

  if(error) {
    console.error(error);
    return;
  }

  skills.forEach(s => {
    const el = document.createElement('div');
    el.className = 'skill';
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between">
        <strong>${s.name}</strong>
        <span class="tiny">${s.level}%</span>
      </div>
      <div class='bar'><i style='width:0%' data-width="${s.level}"></i></div>
    `;
    skillsList.appendChild(el);
  });

  // Animation Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.bar > i', entry.target).forEach(i => {
          i.style.width = i.getAttribute('data-width') + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });

  observer.observe($('#about'));
}


// ==========================================
// 6. FETCH EXPERIENCE
// ==========================================
async function loadExperience() {
  const timeline = $('#timeline');
  if(!timeline) return;

  const { data: experiences, error } = await supabase
    .from('experience')
    .select('*')
    .order('created_at', { ascending: true }); // Or order by year if you change SQL to int

  if(error) {
    console.error(error);
    return;
  }

  experiences.forEach(r => {
    const item = document.createElement('div');
    item.className = 'titem';
    
    // Create bullet list HTML
    const bulletsHtml = (r.bullets || []).map(b => `<li>${b}</li>`).join('');

    item.innerHTML = `
      <div class='tiny' style='color:var(--muted)'>${r.year_range}</div>
      <h3 style='margin:.2rem 0'>${r.role} · ${r.organization}</h3>
      <ul>${bulletsHtml}</ul>
    `;
    timeline.appendChild(item);
  });
}


// ==========================================
// 7. CONTACT FORM (SUPABASE + EMAILJS)
// ==========================================
const contactForm = $('#contactForm');
const statusEl = $('#formStatus');

if (contactForm && statusEl) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Sending...';

    const formData = {
      name: $('#name').value,
      email: $('#email').value,
      subject: $('#subject').value,
      message: $('#message').value
    };

    // 1. Save to Database (Supabase)
    const { error: dbError } = await supabase
      .from('messages')
      .insert([formData]);

    if (dbError) {
      console.error('Database Error:', dbError);
      statusEl.textContent = '❌ Error saving message.';
      return;
    }

    // 2. Send Email (EmailJS) - OPTIONAL
    // If you want to keep receiving emails, keep this part.
    if (window.emailjs) {
        emailjs.init('VVix4UStPXwpsOada'); // Your Public Key
        emailjs.send('service_wh3tkc4', 'template_rzrxqcf', formData)
          .then(() => {
             console.log('Email sent');
          })
          .catch((err) => console.error('EmailJS failed', err));
    }

    statusEl.textContent = '✅ Message sent & saved!';
    contactForm.reset();
  });
}


// ==========================================
// 8. IMAGE MODAL & NAV LOGIC
// ==========================================
// Cert Images
const certImgs = $$('.cert-view-img');
const certImgModal = $('#certImgModal');
const certImgModalImg = $('#certImgModalImg');
const certImgModalClose = $('.img-modal-close');

certImgs.forEach(img => {
  const open = () => {
    certImgModalImg.src = img.src;
    certImgModal.style.display = 'flex';
    certImgModal.focus();
  };
  img.addEventListener('click', open);
  img.addEventListener('keypress', (e) => { if(e.key === 'Enter') open(); });
});

if(certImgModalClose) {
    certImgModalClose.addEventListener('click', () => certImgModal.style.display = 'none');
}
if(certImgModal) {
    certImgModal.addEventListener('click', (e) => {
        if(e.target === certImgModal) certImgModal.style.display = 'none';
    });
}

// Nav Toggle
const navToggle = $('#navToggle');
const primaryNav = $('#primaryNav');

if (navToggle && primaryNav) {
  const setNav = (open) => {
    navToggle.classList.toggle('open', open);
    primaryNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  };
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setNav(!primaryNav.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if(!primaryNav.classList.contains('open')) return;
    if(!primaryNav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
  });
}

// Active Nav on Scroll
const sections = ['home','projects','about','education','experience','contact'].map(id => document.getElementById(id));
const links = $$('header nav a');
document.addEventListener('scroll', () => {
    const y = window.scrollY + 120;
    let current = sections[0].id;
    sections.forEach(sec => { if(sec && sec.offsetTop <= y) current = sec.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, {passive: true});

// ==========================================
// NEW: FETCH CERTIFICATIONS
// ==========================================
async function loadCertifications() {
  const certContainer = document.querySelector('.cert-list');
  if (!certContainer) return;

  // 1. Fetch from Supabase
  const { data: certs, error } = await supabase
    .from('certifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading certifications:', error);
    certContainer.innerHTML = '<p>Error loading certifications.</p>';
    return;
  }

  // 2. Render HTML
  certContainer.innerHTML = ''; // Clear existing static content
  
  certs.forEach(cert => {
    const html = `
      <article class="panel cert-card">
          <div class="cert-grid">
              <div class="cert-img">
                  <!-- Added tabindex and class for the modal logic -->
                  <img src="${cert.image_url}" 
                       alt="${cert.title}" 
                       class="cert-view-img" 
                       tabindex="0" 
                       style="cursor: pointer;">
              </div>
              <div class="cert-info">
                  <h3>${cert.title}</h3>
                  <p class="tiny">${cert.subtitle || ''}</p>
                  <p>${cert.description || ''}</p>
              </div>
          </div>
      </article>
    `;
    certContainer.innerHTML += html;
  });

  // 3. RE-ATTACH MODAL EVENT LISTENERS
  // We must do this here because the images didn't exist when the page first loaded
  const newCertImgs = document.querySelectorAll('.cert-view-img');
  const certImgModal = document.querySelector('#certImgModal');
  const certImgModalImg = document.querySelector('#certImgModalImg');

  if (certImgModal && certImgModalImg) {
    newCertImgs.forEach(img => {
      const open = () => {
        certImgModalImg.src = img.src;
        certImgModal.style.display = 'flex';
        certImgModal.focus();
      };
      // Remove old listeners to be safe (optional) and add new ones
      img.addEventListener('click', open);
      img.addEventListener('keypress', (e) => { 
        if(e.key === 'Enter') open(); 
      });
    });
  }
}
// ==========================================
// NEW: FETCH CV & PROFILE
// ==========================================
async function loadProfile() {
  // 1. Fetch the profile row (we take the first one found)
  const { data, error } = await supabase
    .from('profile')
    .select('cv_url, resume_url, full_name') // include resume_url
    .limit(1)
    .single();

  if (error) {
    console.error('Error loading profile:', error);
    return;
  }

  // 2. Update the "Download" UI
  const cvBtnLink = document.getElementById('downloadCV');
  const resumeBtnLink = document.getElementById('downloadResume');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadMenu = document.getElementById('downloadMenu');

  const cvUrl = data?.cv_url || null;
  const resumeUrl = data?.resume_url || null;

  // Set links (if elements exist)
  if (cvBtnLink) {
    if (cvUrl) {
      cvBtnLink.href = cvUrl;
      cvBtnLink.style.display = '';
      cvBtnLink.setAttribute('download', '');
    } else {
      cvBtnLink.style.display = 'none';
    }
  }

  if (resumeBtnLink) {
    if (resumeUrl) {
      resumeBtnLink.href = resumeUrl;
      resumeBtnLink.style.display = '';
      resumeBtnLink.setAttribute('download', '');
    } else {
      resumeBtnLink.style.display = 'none';
    }
  }

  // If both present -> show dropdown and keep toggle behavior
  if (downloadBtn && downloadMenu) {
    const both = !!cvUrl && !!resumeUrl;
    const onlyCv = !!cvUrl && !resumeUrl;
    const onlyResume = !!resumeUrl && !cvUrl;

    // Reset state
    downloadMenu.hidden = true;
    downloadBtn.setAttribute('aria-expanded', 'false');
    downloadBtn.onclick = null;

    if (both) {
      // keep dropdown behavior
      downloadBtn.textContent = 'Download ▾';
      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = downloadMenu.hidden;
        downloadMenu.hidden = !open;
        downloadBtn.setAttribute('aria-expanded', String(open));
      });

      // close when clicking outside
      document.addEventListener('click', (e) => {
        if (!downloadMenu.hidden && !downloadMenu.contains(e.target) && e.target !== downloadBtn) {
          downloadMenu.hidden = true;
          downloadBtn.setAttribute('aria-expanded', 'false');
        }
      });
    } else if (onlyCv) {
      // single CV -> make main button download CV immediately
      downloadBtn.textContent = 'Download CV';
      downloadBtn.addEventListener('click', () => {
        if (cvBtnLink && cvBtnLink.href) window.location.href = cvBtnLink.href;
      });
    } else if (onlyResume) {
      downloadBtn.textContent = 'Download Resume';
      downloadBtn.addEventListener('click', () => {
        if (resumeBtnLink && resumeBtnLink.href) window.location.href = resumeBtnLink.href;
      });
    } else {
      // nothing available -> hide dropdown
      downloadBtn.style.display = 'none';
    }
  }

  // Optional: update full name if provided
  if (data?.full_name) {
    const brandText = document.querySelector('.brand-text');
    if (brandText) brandText.textContent = data.full_name;
  }
}
// ==========================================
// 8a. WEATHER WIDGET (Current + Forecast)
// ==========================================
async function loadWeather() {
    const container = document.getElementById('weather-container');
    if (!container) return;

    // Default: Manila
    let lat = 14.5995;
    let lon = 120.9842;
    let locationName = "Manila, PH";

    // Weather Codes Helper
    const getWeatherIcon = (code) => {
        const codes = {
            0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️",
            45: "🌫", 48: "🌫",
            51: "🌦", 53: "🌧", 55: "🌧",
            61: "☂️", 63: "☂️", 65: "☔",
            80: "🌦", 81: "🌦", 82: "⛈",
            95: "⚡", 96: "⚡❄️"
        };
        return codes[code] || "❓";
    };

    const getWeatherText = (code) => {
        const codes = {
            0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
            45: "Fog", 51: "Drizzle", 53: "Moderate Rain", 61: "Slight Rain",
            63: "Rain", 80: "Showers", 95: "Thunderstorm"
        };
        return codes[code] || "Variable";
    };

    try {
        // 1. Get Location
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                lat = position.coords.latitude;
                lon = position.coords.longitude;
                locationName = "Local Weather";
            } catch (e) { console.warn("Using default location."); }
        }

        // 2. Fetch Data (Current + 7 Day Forecast)
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.current_weather) throw new Error("No weather data");

        // 3. Render Current Weather
        const { temperature, weathercode, windspeed } = data.current_weather;
        
        // 4. Render Forecast (Next 5 Days)
        let forecastHTML = '<div class="forecast-list">';
        const daily = data.daily;
        
        // Loop through 5 days (start at 1 to skip "today" if you prefer, or 0 for today)
        for(let i = 0; i < 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
            const max = Math.round(daily.temperature_2m_max[i]);
            const min = Math.round(daily.temperature_2m_min[i]);
            const icon = getWeatherIcon(daily.weathercode[i]);

            forecastHTML += `
                <div class="forecast-item">
                    <div class="forecast-day">${dayName}</div>
                    <div class="forecast-icon">${icon}</div>
                    <div class="forecast-temp"><span>${max}°</span> / ${min}°</div>
                </div>
            `;
        }
        forecastHTML += '</div>';

        // 5. Combine and Inject
        container.innerHTML = `
            <div class="weather-temp">${Math.round(temperature)}°C</div>
            <div class="weather-desc">${getWeatherText(weathercode)} ${getWeatherIcon(weathercode)}</div>
            <div class="weather-loc">📍 ${locationName} • 💨 ${windspeed} km/h</div>
            
            <div class="weather-divider"></div>
            
            ${forecastHTML}
        `;

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="tiny">Weather unavailable</p>';
    }
}
// ==========================================
// 8b. NEWS WIDGET (DEV.to API)
// ==========================================
async function loadNews() {
    const container = document.getElementById('news-container');
    if (!container) return;

    // We use DEV.to public API (Reliable, JSON format, No CORS issues)
    // Fetching top 4 recent 'technology' articles
    const API_URL = 'https://dev.to/api/articles?tag=technology&per_page=4&state=rising';

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = '<p class="tiny">No news available.</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="news-item">
                <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
                <div class="news-meta">
                    <span class="news-date">${new Date(item.published_at).toLocaleDateString()}</span>
                    <span class="news-author">${item.user.name}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("News Load Error:", err);
        container.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <p class="tiny" style="color:#ff6b6b">Unable to load news.</p>
                <button class="btn ghost" onclick="loadNews()" style="font-size:0.7rem; padding:4px 8px;">Retry</button>
            </div>
        `;
    }
}

// ==========================================
// 9. INITIALIZE
// ==========================================
// Start fetching data
loadProjects();
loadSkills();
loadExperience();
loadCertifications();
loadProfile();
loadWeather(); // <--- Added
loadNews();    // <--- Added