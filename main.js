// ENVELOPE INTRO
const envOverlay = document.getElementById('envelope-overlay');
const envOpenBtn = document.getElementById('env-open-btn');
const envelope   = document.querySelector('.envelope');

document.body.style.overflow = 'hidden';

envOpenBtn.addEventListener('click', function() {
  envOpenBtn.style.opacity = '0';
  envOpenBtn.style.pointerEvents = 'none';
  envelope.classList.add('opening');
  setTimeout(function() {
    envOverlay.classList.add('hide');
    document.body.style.overflow = '';
  }, 1800);
});

// 3D TILT ON TIMELINE CARDS
document.querySelectorAll('.timeline-card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r = card.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width  - 0.5;
    var y = (e.clientY - r.top)  / r.height - 0.5;
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

// MUSIC PLAYER
var audio     = document.getElementById('audio-player');
var musicBtn  = document.getElementById('music-btn');
var iconPlay  = document.getElementById('icon-play');
var iconPause = document.getElementById('icon-pause');

musicBtn.addEventListener('click', function() {
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

// HAMBURGER NAV
var hamburger = document.getElementById('nav-hamburger');
var navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', function() {
  var isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// SCROLL REVEAL
var revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(function(el) { observer.observe(el); });

// NAV SCROLL CLASS
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// COUNTDOWN
var weddingDate = new Date('2026-08-08T00:00:00');

function updateCountdown() {
  var diff = weddingDate - new Date();
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p style="font-family:Cormorant Garamond,serif;font-style:italic;font-size:1.4rem;color:#d4af8a;letter-spacing:.1em;">Today is the day!</p>';
    return;
  }
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);

  function set(id, val) {
    var el  = document.getElementById(id);
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

// SUPABASE CONFIG v2
var SUPABASE_URL = 'https://tfgakletdbgzoaothego.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' + '.' + 'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ2FrbGV0ZGJnem9hb3RoZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2ODc3NjQsImV4cCI6MjA5NTI2Mzc2NH0' + '.' + 'z2nXxusC4LQGZhfWNdD1rvUnI4gUGNWKx2WkClUV3Ms';

// RSVP FORM -> SUPABASE
document.getElementById('rsvp-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  var status = document.getElementById('form-status');
  var btn    = this.querySelector('button span');
  btn.textContent    = 'Sending...';
  status.textContent = '';

  var data = new FormData(this);
  var payload = {
    name:        data.get('name'),
    party_names: data.get('party_names'),
    attendance:  data.get('attendance'),
    address:     data.get('address'),
    phone:       data.get('phone'),
    children:    data.get('children')
  };

  try {
    var check = await fetch(SUPABASE_URL + '/rest/v1/rsvps?or=(phone.eq.' + encodeURIComponent(payload.phone) + ',name.ilike.' + encodeURIComponent(payload.name) + ')&select=id', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    var existing = await check.json();
    if (existing.length > 0) {
      status.textContent = 'An RSVP has already been submitted with this name or phone number.';
      status.style.color = '#c0392b';
      btn.textContent = 'Send RSVP';
      return;
    }

    var res = await fetch(SUPABASE_URL + '/rest/v1/rsvps', {
      method:  'POST',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
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

// ADD TO CALENDAR
function addToCalendar() {
  var title       = "Jason & Hozi's Wedding";
  var location    = 'St. Andrews Scotts Kirk, Galle Road, Colombo 03';
  var description = "We can't wait to celebrate with you!";
  var start       = '20260808T000000';
  var end         = '20260808T235900';
  var startUTC    = '20260808T000000Z';
  var endUTC      = '20260808T235900Z';

  var ua        = navigator.userAgent || '';
  var isAndroid = /android/i.test(ua);
  var isIOS     = /iphone|ipad|ipod/i.test(ua);

  if (isAndroid) {
    var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(title) +
      '&dates=' + startUTC + '/' + endUTC +
      '&details=' + encodeURIComponent(description) +
      '&location=' + encodeURIComponent(location);
    window.open(url, '_blank');
  } else if (isIOS) {
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Jason & Hozi Wedding//EN',
      'BEGIN:VEVENT',
      'DTSTART:' + start, 'DTEND:' + end,
      'SUMMARY:' + title, 'DESCRIPTION:' + description, 'LOCATION:' + location,
      'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url2 = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url2; a.download = 'jason-hozi-wedding.ics';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url2);
  }
}
