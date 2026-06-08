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

// ── FIREBASE CONFIG ──
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyAdcmp4ETuFCSEQppAVYqMC0U_ujQE7Q44',
  authDomain:        'wedding-2468a.firebaseapp.com',
  projectId:         'wedding-2468a',
  storageBucket:     'wedding-2468a.firebasestorage.app',
  messagingSenderId: '681917384185',
  appId:             '1:681917384185:web:132f16900b831d197de928'
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── RSVP FORM → FIRESTORE ──
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
    submitted_at: new Date().toISOString()
  };

  try {
    const rsvpsRef = collection(db, 'rsvps');

    // Check duplicate phone
    const phoneQ = query(rsvpsRef, where('phone', '==', payload.phone.trim()));
    const phoneSnap = await getDocs(phoneQ);
    if (!phoneSnap.empty) {
      status.textContent = 'This phone number has already submitted an RSVP.';
      status.style.color = '#c0392b';
      btn.textContent = 'Send RSVP 🪷';
      return;
    }

    // Check duplicate name
    const nameQ = query(rsvpsRef, where('name', '==', payload.name.trim()));
    const nameSnap = await getDocs(nameQ);
    if (!nameSnap.empty) {
      status.textContent = 'This name has already submitted an RSVP.';
      status.style.color = '#c0392b';
      btn.textContent = 'Send RSVP 🪷';
      return;
    }

    await addDoc(rsvpsRef, payload);

    status.textContent = '❖ Thank you — we look forward to celebrating with you.';
    status.style.color = '#6b1a2a';
    this.reset();

    if (payload.attendance === "Yes, I'll be there") {
      setTimeout(() => addToCalendar(), 800);
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Something went wrong. Please try again.';
    status.style.color = '#c0392b';
  } finally {
    btn.textContent = 'Send RSVP 🪷';
  }
});

// ── ADD TO CALENDAR ──
function addToCalendar() {
  const title       = "Jason & Hozi's Wedding";
  const location    = 'Villa by the Edge Glasshouse, Wattala';
  const description = "We can't wait to celebrate with you!";
  const start       = '20260808T000000';
  const end         = '20260808T235900';
  const startUTC    = '20260808T000000Z';
  const endUTC      = '20260808T235900Z';

  const ua = navigator.userAgent || '';
  const isAndroid = /android/i.test(ua);
  const isIOS     = /iphone|ipad|ipod/i.test(ua);

  if (isAndroid) {
    // Google Calendar
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${startUTC}/${endUTC}` +
      `&details=${encodeURIComponent(description)}` +
      `&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  } else if (isIOS) {
    // iOS → .ics download (opens Apple Calendar)
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jason & Hozi Wedding//EN',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'jason-hozi-wedding.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
