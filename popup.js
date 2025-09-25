const app = document.getElementById('app');

const state = {
  claim: "",
  authorLine: "",
  mla: "",
  evidenceFull: "",
  highlights: [],
  impact: "",
  tags: [],
  source: {}
};

const sentenceSplit = (txt) =>
  txt.match(/[^.!?]+[.!?]+(\s|$)/g) || [txt];

const toAuthorLine = (author, date) => {
  const year = (date || "").slice(0,4) || new Date().getFullYear();
  const last = author?.split(' ').slice(-1)[0] || "Author";
  return `${last} in ${year} writes,`;
};

const toMLAWeb = ({author, title, site, url, datePublished}) => {
  const formatDate = (d) => {
    try {
      const dt = new Date(d || Date.now());
      return dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ""; }
  };
  let nameFmt = author ? author : "N.p.";
  let dateFmt = datePublished ? formatDate(datePublished) : "n.d.";
  return `${nameFmt}. "${title}." ${site}, ${dateFmt}, ${url}. Accessed ${formatDate(new Date())}.`;
};

function render() {
  const sents = sentenceSplit(state.evidenceFull).map((s,i)=>({s,i}));
  
  // Update evidence sentences
  const evidenceContainer = document.getElementById('evidence-sentences');
  evidenceContainer.innerHTML = sents.map(({s,i})=>`
    <label class="sentence-item">
      <input type="checkbox" data-i="${i}" ${state.highlights.includes(i)?"checked":""}>
      <span class="sentence-text">${s.trim()}</span>
    </label>
  `).join("");

  // Update preview
  updatePreview();

  // Add event listeners
  document.getElementById('claim').value = state.claim;
  document.getElementById('authorLine').value = state.authorLine;
  document.getElementById('mla').value = state.mla;
  document.getElementById('impact').value = state.impact;

  document.getElementById('claim').oninput = e => {
    state.claim = e.target.value;
    updatePreview();
  };
  
  document.getElementById('authorLine').oninput = e => {
    state.authorLine = e.target.value;
    updatePreview();
  };
  
  document.getElementById('mla').oninput = e => {
    state.mla = e.target.value;
    updatePreview();
  };
  
  document.getElementById('impact').oninput = e => {
    state.impact = e.target.value;
    updatePreview();
  };

  document.querySelectorAll('input[type=checkbox]').forEach(cb=>{
    cb.onchange = () => {
      const i = Number(cb.dataset.i);
      if (cb.checked) state.highlights = Array.from(new Set([...state.highlights, i]));
      else state.highlights = state.highlights.filter(x=>x!==i);
      updatePreview();
    };
  });

  document.getElementById('save').onclick = async () => {
    const id = crypto.randomUUID();
    const card = {
      id, 
      createdAt: new Date().toISOString(),
      claim: state.claim,
      authorLine: state.authorLine,
      mla: state.mla,
      source: state.source,
      evidence: {
        fullText: state.evidenceFull,
        highlights: state.highlights
      },
      impact: state.impact,
      topicTags: []
    };
    const { cards = [] } = await chrome.storage.local.get(['cards']);
    cards.push(card);
    await chrome.storage.local.set({ cards });
    
    // Show success message
    const saveBtn = document.getElementById('save');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.style.backgroundColor = '#28a745';
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.backgroundColor = '#007bff';
    }, 1500);
  };

  document.getElementById('copyMD').onclick = () => {
    navigator.clipboard.writeText(generateMarkdown());
    showCopyFeedback('copyMD', 'Copied MD!');
  };
  
  document.getElementById('copyHTML').onclick = () => {
    navigator.clipboard.writeText(generateHTML());
    showCopyFeedback('copyHTML', 'Copied HTML!');
  };
}

function updatePreview() {
  const previewContent = document.getElementById('preview-content');
  previewContent.textContent = generateMarkdown();
}

function generateMarkdown() {
  const sents = sentenceSplit(state.evidenceFull);
  const ev = sents.map((s,i)=> state.highlights.includes(i) ? `**__${s.trim()}__**` : s.trim()).join(" ");
  return `CLAIM — ${state.claim}

${state.authorLine}

${state.mla}

${ev}

IMPACT — ${state.impact}`;
}

function generateHTML() {
  const sents = sentenceSplit(state.evidenceFull);
  const ev = sents.map((s,i)=> state.highlights.includes(i)
    ? `<b><u>${s.trim()}</u></b>`
    : `<span style="font-size:8pt">${s.trim()}</span>`).join(" ");
  return `<p><b>CLAIM —</b> ${state.claim}</p>
<p>${state.authorLine}</p>
<p>${state.mla}</p>
<p>${ev}</p>
<p><b>IMPACT —</b> ${state.impact}</p>`;
}

function showCopyFeedback(buttonId, message) {
  const btn = document.getElementById(buttonId);
  const originalText = btn.textContent;
  btn.textContent = message;
  btn.style.backgroundColor = '#28a745';
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.backgroundColor = '#007bff';
  }, 1500);
}

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const tabId = tab.dataset.tab;
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

(async function init(){
  const { draftCardPayload } = await chrome.storage.session.get(['draftCardPayload']);
  const { text, meta } = draftCardPayload || { text: "", meta: {} };
  
  state.evidenceFull = text || "";
  state.source = meta || {};
  state.authorLine = toAuthorLine(meta?.author, meta?.datePublished);
  state.mla = toMLAWeb(meta || {});
  
  render();
})();
