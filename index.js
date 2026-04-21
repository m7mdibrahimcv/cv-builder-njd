const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/api/healthz', (req, res) => res.json({ ok: true }));

app.post('/api/cv-builder/create', (req, res) => {
  try {
    const { name, email, phone, title, summary, skills, experience, education, template } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const colors = {
      onyx:{primary:'#1a1a1a',accent:'#555',bg:'#f8f8f8'},
      picard:{primary:'#1e3a5f',accent:'#2d6eaa',bg:'#eef3fa'},
      kakuna:{primary:'#2c2c2c',accent:'#888',bg:'#ffffff'},
      nosepass:{primary:'#c0392b',accent:'#e74c3c',bg:'#fdf2f2'},
      glalie:{primary:'#6c3483',accent:'#9b59b6',bg:'#f5eef8'},
      bronzor:{primary:'#784212',accent:'#a04000',bg:'#fdf5e6'},
      chikorita:{primary:'#1e8449',accent:'#27ae60',bg:'#eafaf1'},
      ditto:{primary:'#2e4057',accent:'#048a81',bg:'#f0f4f8'},
      gengar:{primary:'#1a1a2e',accent:'#0f3460',bg:'#e8e8f0'},
      leafish:{primary:'#2d6a4f',accent:'#40916c',bg:'#f0faf4'},
      celebi:{primary:'#0077b6',accent:'#00b4d8',bg:'#e8f4fd'},
    };
    const c = colors[template] || colors.onyx;

    const expHtml = (experience||[]).map(e=>e.position||e.company?`<div class="section-item"><div class="item-header"><span class="item-title">${e.position||''}</span><span class="item-date">${e.startDate||''} ${e.endDate?'— '+e.endDate:''}</span></div><div class="item-sub">${e.company||''}</div>${e.description?'<div class="item-desc">'+e.description.replace(/\n/g,'<br>')+'</div>':''}</div>`:'').join('');
    const eduHtml = (education||[]).map(e=>e.degree||e.institution?`<div class="section-item"><div class="item-header"><span class="item-title">${e.degree||''}</span><span class="item-date">${e.startDate||''} ${e.endDate?'— '+e.endDate:''}</span></div><div class="item-sub">${e.institution||''}</div></div>`:'').join('');
    const skillsHtml = (skills||[]).map(s=>`<span class="skill-tag">${s}</span>`).join('');

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${name} — CV</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:${c.bg};color:#222}.page{max-width:800px;margin:0 auto;background:#fff;padding:48px 56px;min-height:100vh}.header{border-bottom:3px solid ${c.primary};padding-bottom:20px;margin-bottom:28px}.header h1{font-size:2rem;font-weight:900;color:${c.primary};margin-bottom:4px}.headline{font-size:1.1rem;color:${c.accent};font-weight:600;margin-bottom:12px}.contact-row{display:flex;flex-wrap:wrap;gap:16px;font-size:13px;color:#555}.section{margin-bottom:28px}.section-title{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${c.primary};border-bottom:2px solid ${c.primary};padding-bottom:4px;margin-bottom:14px}.summary-text{font-size:14px;line-height:1.7;color:#444}.section-item{margin-bottom:16px}.item-header{display:flex;justify-content:space-between}.item-title{font-weight:800;font-size:15px;color:${c.primary}}.item-date{font-size:12px;color:#888}.item-sub{font-size:13px;color:${c.accent};font-weight:600;margin:2px 0 6px}.item-desc{font-size:13px;color:#555;line-height:1.6}.skills-wrap{display:flex;flex-wrap:wrap;gap:8px}.skill-tag{background:${c.bg};border:1.5px solid ${c.accent};color:${c.primary};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}.print-btn{position:fixed;top:20px;right:20px;background:${c.primary};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer}@media print{.print-btn{display:none}}</style></head><body><button class="print-btn" onclick="window.print()">⬇ Download PDF</button><div class="page"><div class="header"><h1>${name}</h1>${title?`<div class="headline">${title}</div>`:''}<div class="contact-row">${email?`<span>✉ ${email}</span>`:''} ${phone?`<span>📱 ${phone}</span>`:''}<span>📍 Dubai, UAE</span></div></div>${summary?`<div class="section"><div class="section-title">Professional Summary</div><div class="summary-text">${summary}</div></div>`:''} ${expHtml?`<div class="section"><div class="section-title">Work Experience</div>${expHtml}</div>`:''} ${eduHtml?`<div class="section"><div class="section-title">Education</div>${eduHtml}</div>`:''} ${skillsHtml?`<div class="section"><div class="section-title">Skills</div><div class="skills-wrap">${skillsHtml}</div></div>`:''}</div></body></html>`;

    res.json({ success:true, html });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error:'Internal server error' });
  }
});

module.exports = app;
