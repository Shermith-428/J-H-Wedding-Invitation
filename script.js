// ── TWEMOJI ──
twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });

// ── MUSIC PLAYER ──
const audio     = document.getElementById('audio-player');
const musicBtn  = document.getElementById('music-btn');
const iconPlay  = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');

musicBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    iconPlay.style.display  = 'none';
    iconPause.style.display = 'inline';
    musicBtn.classList.add('playing');
  } else {
    audio.pause();
    iconPlay.style.display  = 'inline';
    iconPause.style.display = 'none';
    musicBtn.classList.remove('playing');
  }
});

// ── HAMBURGER NAV ──
const hamburger = document.getElementById('nav-hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => observer.observe(el));

// ── NAV SCROLL CLASS ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ── COUNTDOWN ──
const weddingDate = new Date('2026-08-08T00:00:00');

function updateCountdown() {
  const diff = weddingDate - new Date();

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p style="font-family:Cormorant Garamond,serif;font-style:italic;font-size:1.4rem;color:#d4af8a;letter-spacing:.1em;">Today is the day! 🎉</p>';
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const set = (id, val) => {
    const el = document.getElementById(id);
    const str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 200);
    }
  };

  set('days', d);
  set('hours', h);
  set('minutes', m);
  set('seconds', s);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── RSVP FORM → GOOGLE SHEETS ──
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

document.getElementById('rsvp-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('form-status');
  const btn    = this.querySelector('button span');

  btn.textContent    = 'Sending...';
  status.textContent = '';

  const data = new FormData(this);
  const payload = {
    name:        data.get('name'),
    party_names: data.get('party_names'),
    attendance:  data.get('attendance'),
    address:     data.get('address'),
    phone:       data.get('phone'),
    children:    data.get('children'),
    timestamp:   new Date().toLocaleString()
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    status.textContent = '✦ Thank you — we look forward to celebrating with you.';
    status.style.color = '#6b1a2a';
    this.reset();
  } catch {
    status.textContent = 'Something went wrong. Please try again.';
    status.style.color = '#c0392b';
  } finally {
    btn.textContent = 'Send RSVP';
  }
});
