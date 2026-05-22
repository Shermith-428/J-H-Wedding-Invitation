// ── MUSIC PLAYER ──
const audio = new Audio();
audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // placeholder
audio.loop = true;
audio.volume = 0.5;

// Use YouTube as actual source via a hidden iframe trick
const ytFrame = document.getElementById('yt-player');
ytFrame.src = 'https://www.youtube.com/embed/sWp1RKMpKMA?autoplay=0&loop=1&playlist=sWp1RKMpKMA&controls=1&rel=0';

let isPlaying = false;

document.getElementById('music-btn').addEventListener('click', () => {
  const iconPlay  = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const container = document.getElementById('yt-container');

  if (!isPlaying) {
    // Show the iframe visibly so user can interact (browser requires it)
    container.style.cssText = 'position:fixed;bottom:80px;right:28px;width:280px;height:160px;z-index:199;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);';
    ytFrame.src = 'https://www.youtube.com/embed/sWp1RKMpKMA?autoplay=1&loop=1&playlist=sWp1RKMpKMA&controls=1&rel=0&modestbranding=1';
    iconPlay.style.display  = 'none';
    iconPause.style.display = 'block';
    isPlaying = true;
  } else {
    container.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;bottom:0;right:0;';
    ytFrame.src = 'about:blank';
    iconPlay.style.display  = 'block';
    iconPause.style.display = 'none';
    isPlaying = false;
  }
});

// ── COUNTDOWN ──
const weddingDate = new Date('2026-08-08T00:00:00');

function updateCountdown() {
  const now  = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p style="letter-spacing:.2em;font-size:.9rem;">Today is the day! 🎉</p>';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent    = String(days).padStart(2, '0');
  document.getElementById('hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── NAV SHRINK ON SCROLL ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.style.padding = window.scrollY > 50 ? '10px 0' : '18px 0';
});

// ── RSVP FORM → GOOGLE SHEETS ──
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

document.getElementById('rsvp-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('form-status');
  const btn    = this.querySelector('button');

  btn.textContent = 'Sending...';
  btn.disabled    = true;
  status.textContent = '';

  const data = new FormData(this);
  const payload = {
    name:       data.get('name'),
    email:      data.get('email'),
    phone:      data.get('phone'),
    attendance: data.get('attendance'),
    guests:     data.get('guests'),
    meal:       data.get('meal'),
    message:    data.get('message'),
    timestamp:  new Date().toLocaleString()
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode:   'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    status.textContent = '✦ Thank you! We look forward to celebrating with you.';
    status.style.color = '#6b1a2a';
    this.reset();
  } catch {
    status.textContent = 'Something went wrong. Please try again.';
    status.style.color = '#c0392b';
  } finally {
    btn.textContent = 'Send RSVP';
    btn.disabled    = false;
  }
});
