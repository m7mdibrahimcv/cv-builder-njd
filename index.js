const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const RXRESUME_BASE = 'https://rxresu.me/api';
const API_KEY = process.env.RXRESUME_API_KEY || '';
const rxHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` });

app.get('/api/healthz', (req, res) => res.json({ ok: true }));

app.post('/api/cv-builder/create', async (req, res) => {
  try {
    const { name, email, phone, title, summary, skills, experience, education, template } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const slug = `njd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const createRes = await fetch(`${RXRESUME_BASE}/resume`, {
      method: 'POST', headers: rxHeaders(),
      body: JSON.stringify({ title: `${name} - Resume`, slug }),
    });
    if (!createRes.ok) return res.status(500).json({ error: 'Failed to create resume', details: await createRes.text() });

    const resume = await createRes.json();
    const resumeId = resume.id;
    const validTemplates = ['onyx','picard','kakuna','nosepass','glalie','bronzor','chikorita','ditto','gengar','leafish','celebi'];
    const selectedTemplate = validTemplates.includes(template) ? template : 'onyx';

    const resumeData = {
      basics: { name: name||'', headline: title||'', email: email||'', phone: phone||'', location: 'Dubai, UAE', url:{label:'',href:''}, customFields:[], picture:{url:'',size:64,aspectRatio:1,borderRadius:0,effects:{hidden:false,border:false,grayscale:false}} },
      sections: {
        summary: { name:'Summary', columns:1, separateLinks:true, visible:true, id:'summary', content:summary||'' },
        experience: { name:'Experience', columns:1, separateLinks:true, visible:true, id:'experience',
          items:(experience||[]).map((exp,i) => ({ id:`exp-${i}`, visible:true, company:exp.company||'', position:exp.position||'', startDate:exp.startDate||'', endDate:exp.endDate||'', summary:exp.description||'', location:'Dubai, UAE', url:{label:'',href:''} })) },
        education: { name:'Education', columns:1, separateLinks:true, visible:true, id:'education',
          items:(education||[]).map((edu,i) => ({ id:`edu-${i}`, visible:true, institution:edu.institution||'', studyType:edu.degree||'', area:'', startDate:edu.startDate||'', endDate:edu.endDate||'', summary:'', url:{label:'',href:''}, score:'' })) },
        skills: { name:'Skills', columns:1, separateLinks:true, visible:true, id:'skills',
          items:(skills||[]).map((skill,i) => ({ id:`skill-${i}`, visible:true, name:skill, description:'', level:3, keywords:[] })) },
      },
    };

    const patchRes = await fetch(`${RXRESUME_BASE}/resume/${resumeId}`, {
      method: 'PATCH', headers: rxHeaders(),
      body: JSON.stringify({
        metadata: { template:selectedTemplate, typography:{font:{family:'Inter',subset:'latin',variants:['regular','600'],size:14},lineHeight:1.5,hideIcons:false,underlineLinks:true}, page:{margin:18,format:'a4',options:{breakLine:true,pageNumbers:true}}, theme:{background:'#ffffff',text:'#000000',primary:'#1a3c2e'}, locale:'en', date:{format:'MMMM yyyy'}, notes:'' },
        data: resumeData,
      }),
    });
    if (!patchRes.ok) return res.status(500).json({ error: 'Failed to update resume', details: await patchRes.text() });

    res.json({ resumeId, slug:resume.slug, viewUrl:`https://rxresu.me/resume/${resume.slug}`, printUrl:`https://rxresu.me/api/resume/${resumeId}/print` });
  } catch (err) {
    console.error('CV Builder error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
