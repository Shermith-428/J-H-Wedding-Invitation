// ── TWEMOJI ──
twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });

// ── MUSIC PLAYER (YouTube IFrame API) ──
const YOUTUBE_VIDEO_ID = 'h7lMNnMBMEo';

const musicBtn  = document.getElementById('music-btn');
const iconPlay  = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');

let ytPlayer  = null;
let isPlaying = false;
let apiReady  = false;

// Load YouTube IFrame API script
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

// Called automatically by YouTube API when ready
window.onYouTubeIframeAPIReady = function () {
  apiReady = true;
  ytPlayer = new YT.Player('yt-player', {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: { autoplay: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID, controls: 0, rel: 0 },
    events: {
      onReady: () => {},
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) ytPlayer.playVideo();
      }
    }
  });
};

musicBtn.addEventListener('click', () => {
  if (!apiReady || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
  isPlaying = !isPlaying;
  iconPlay.style.display  = isPlaying ? 'none'   : 'inline';
  iconPause.style.display = isPlaying ? 'inline' : 'none';
  musicBtn.classList.toggle('playing', isPlaying);
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
