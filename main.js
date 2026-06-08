// ENVELOPE
var eOv = document.getElementById('envelope-overlay');
var eBtn = document.getElementById('env-open-btn');
var eEl = document.querySelector('.envelope');
document.body.style.overflow = 'hidden';
eBtn.addEventListener('click', function() {
  eBtn.style.opacity = '0';
  eBtn.style.pointerEvents = 'none';
  eEl.classList.add('opening');
  setTimeout(function() {
    eOv.classList.add('hide');
    document.body.style.overflow = '';
  }, 1800);
});

// 3D TILT
document.querySelectorAll('.timeline-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;
    var y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = 'perspective(600px) rotateY(' + (x*10) + 'deg) rotateX(' + (-y*10) + 'deg) translateY(-4px)';
    card.style.boxShadow = (-x*12) + 'px ' + (y*12) + 'px 32px rgba(149,5,41,0.12)';
  });
  card.addEventListener('mouseleave', function() {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// TWEMOJI
twemoji.parse(document.body, { folder: 'svg', ext: '.svg' });

// MUSIC
var aud = document.getElementById('audio-player');
var mBtn = document.getElementById('music-btn');
var iPly = document.getElementById('icon-play');
var iPas = document.getElementById('icon-pause');
mBtn.addEventListener('click', function() {
  if (aud.paused) {
    aud.play();
    iPly.style.display = 'none';
    iPas.style.display = 'inline';
    mBtn.classList.add('playing');
  } else {
    aud.pause();
    iPly.style.display = 'inline';
    iPas.style.display = 'none';
    mBtn.classList.remove('playing');
  }
});

// NAV HAMBURGER
var hbg = document.getElementById('nav-hamburger');
var nMn = document.getElementById('nav-menu');
hbg.addEventListener('click', function() {
  var open = nMn.classList.toggle('open');
  hbg.classList.toggle('open', open);
  hbg.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
nMn.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    nMn.classList.remove('open');
    hbg.classList.remove('open');
    hbg.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// SCROLL REVEAL
var rEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
var rObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      rObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
rEls.forEach(function(el) { rObs.observe(el); });

// NAV SCROLL
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// COUNTDOWN
var wDate = new Date('2026-08-08T00:00:00');
function updateCountdown() {
  var diff = wDate - new Date();
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p style="font-family:Cormorant Garamond,serif;font-style:italic;font-size:1.4rem;color:#d4af8a;">Today is the day!</p>';
    return;
  }
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);
  function set(id, val) {
    var el = document.getElementById(id);
    var str = String(val).padStart(2, '0');
    if (el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
      setTimeout(function() { el.classList.remove('tick'); }, 200);
    }
  }
  set('days', d); set('hours', h); set('minutes', m); set('seconds', s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// SUPABASE
var SB_URL = 'https://tfgakletdbgzoaothego.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' + '.' + 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2FrbGV0ZGJnem9hb3RoZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODc3NjQsImV4cCI6MjA5NTI2Mzc2NH0' + '.' + 'z2nXxusC4LQGZhfWNdD1rvUnI4gUGNWKx2WkClUV3Ms';

// RSVP
document.getElementById('rsvp-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var status = document.getElementById('form-status');
  var btn = this.querySelector('button span');
  btn.textContent = 'Sending...';
  status.textContent = '';
  var data = new FormData(this);
  var payload = {
    name: data.get('name'),
    party_names: data.get('party_names'),
    attendance: data.get('attendance'),
    address: data.get('address'),
    phone: data.get('phone'),
    children: data.get('children')
  };
  try {
    var chk = await fetch(SB_URL + '/rest/v1/rsvps?or=(phone.eq.' + encodeURIComponent(payload.phone) + ',name.ilike.' + encodeURIComponent(payload.name) + ')&select=id', {
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY }
    });
    var ex = await chk.json();
    if (ex.length > 0) {
      status.textContent = 'An RSVP has already been submitted with this name or phone number.';
      status.style.color = '#c0392b';
      btn.textContent = 'Send RSVP';
      return;
    }
    var res = await fetch(SB_URL + '/rest/v1/rsvps', {
      method: 'POST',
      headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    status.textContent = 'Thank you - we look forward to celebrating with you.';
    status.style.color = '#6b1a2a';
    this.reset();
    if (payload.attendance === "Yes, I'll be there") {
      setTimeout(function() { addToCalendar(); }, 800);
    }
  } catch(err) {
    status.textContent = 'Something went wrong. Please try again.';
    status.style.color = '#c0392b';
  } finally {
    btn.textContent = 'Send RSVP';
  }
});

// CALENDAR
function addToCalendar() {
  var title = "Jason & Hozi's Wedding";
  var loc = 'St. Andrews Scotts Kirk, Galle Road, Colombo 03';
  var desc = "We can't wait to celebrate with you!";
  var ua = navigator.userAgent || '';
  if (/android/i.test(ua)) {
    window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=20260808T000000Z/20260808T235900Z&details=' + encodeURIComponent(desc) + '&location=' + encodeURIComponent(loc), '_blank');
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    var ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:20260808T000000\r\nDTEND:20260808T235900\r\nSUMMARY:' + title + '\r\nLOCATION:' + loc + '\r\nEND:VEVENT\r\nEND:VCALENDAR';
    var blob = new Blob([ics], { type: 'text/calendar' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'wedding.ics';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }
}
