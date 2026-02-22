function renderTicker(notices) {
      const t = document.getElementById('tickerTrack');
      if (!notices.length) return;
      const items = [...notices, ...notices].map(n => `<span>${n.title}</span>`).join('');
      t.innerHTML = items;
    }

    function renderNotices(list) {
      // Hero card
      document.getElementById('heroNotices').innerHTML = list.slice(0, 5).map(n => `
    <div class="nm ${n.category || 'general'}">
      <div class="nm-cat ${n.category || 'general'}">${n.category || 'general'}</div>
      <div class="nm-title">${n.title}</div>
      <div class="nm-date">${n.date}</div>
    </div>`).join('');
      // Notice grid
      const icons = { exam: '📝', meeting: '🤝', finance: '💰', event: '🎉', general: '📌' };
      const grid = document.getElementById('noticesGrid');
      if (!list.length) { grid.innerHTML = '<div style="color:var(--gray)">No notices yet.</div>'; return; }
      grid.innerHTML = list.slice(0, 8).map(n => `
    <div class="np ${n.category || 'general'} reveal">
      <div class="np-icon ${n.category || 'general'}">${icons[n.category] || '📌'}</div>
      <div>
        <div class="np-cat ${n.category || 'general'}">${n.category || 'general'}</div>
        <div class="np-title">${n.title}</div>
        <div class="np-body">${n.body}</div>
        <div class="np-date">📅 ${n.date}</div>
      </div>
    </div>`).join('');
      observe();
    }

    function renderEvents(list) {
      const c = document.getElementById('eventsCards');
      if (!list.length) { c.innerHTML = '<div style="color:var(--gray)">No events scheduled.</div>'; return; }
      c.innerHTML = list.slice(0, 4).map(ev => {
        const d = ev.date ? new Date(ev.date + 'T00:00:00') : new Date();
        const f = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        return `<div class="ev-card reveal">
      <div class="ev-top">
        <div class="ev-date-str">${f}</div>
        <div class="ev-title">${ev.title}</div>
      </div>
      <div class="ev-body">
        <div class="ev-meta">
          ${ev.time ? `<span>🕐 ${ev.time}</span>` : ''}
          ${ev.venue ? `<span>📍 ${ev.venue}</span>` : ''}
        </div>
        ${ev.description ? `<div class="ev-desc">${ev.description}</div>` : ''}
      </div>
    </div>`;
      }).join('');
      observe();
    }

    function renderGallery(list) {
      const m = document.getElementById('galleryMasonry');
      if (!list.length) { m.innerHTML = '<div style="color:rgba(255,255,255,.4)">No photos yet.</div>'; return; }
      m.innerHTML = list.map(g => `
    <div class="gp" onclick="openLightbox('${g.url}','${g.title}')">
      <img src="${g.url}" alt="${g.title}" loading="lazy">
      <div class="gp-ov"><div class="gp-t">${g.title}</div><div class="gp-c">${g.category}</div></div>
    </div>`).join('');
    }

    function openLightbox(url, cap) {
      document.getElementById('lbImg').src = url;
      document.getElementById('lbCap').textContent = cap || '';
      document.getElementById('lightbox').classList.add('open');
    }
    function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    function observe() {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
    }
    observe();

    // Nav active state
    const sections = document.querySelectorAll('section[id],footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      let cur = '';
      sections.forEach(s => { if (window.scrollY >= s.offsetTop - 90) cur = s.id; });
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    }, { passive: true });
 