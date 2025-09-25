const cardsList = document.getElementById('cards-list');
const searchInput = document.getElementById('search');
const statsDiv = document.getElementById('stats');
const emptyState = document.getElementById('empty-state');

let allCards = [];
let filteredCards = [];

async function loadCards() {
  const { cards = [] } = await chrome.storage.local.get(['cards']);
  allCards = cards.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  filterCards();
}

function filterCards() {
  const searchTerm = (searchInput.value || "").toLowerCase();
  filteredCards = allCards.filter(card =>
    card.claim.toLowerCase().includes(searchTerm) ||
    card.mla.toLowerCase().includes(searchTerm) ||
    (card.source?.title || "").toLowerCase().includes(searchTerm) ||
    (card.source?.author || "").toLowerCase().includes(searchTerm)
  );
  renderCards();
  updateStats();
}

function updateStats() {
  const totalCards = allCards.length;
  const visibleCards = filteredCards.length;
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm) {
    statsDiv.innerHTML = `Showing ${visibleCards} of ${totalCards} cards matching "${searchTerm}"`;
  } else {
    statsDiv.innerHTML = `Total cards: ${totalCards}`;
  }
}

function renderCards() {
  if (filteredCards.length === 0) {
    cardsList.innerHTML = '';
    emptyState.style.display = allCards.length === 0 ? 'block' : 'none';
    return;
  }
  
  emptyState.style.display = 'none';
  
  cardsList.innerHTML = filteredCards.map(card => {
    const createdDate = new Date(card.createdAt).toLocaleDateString();
    const sourceTitle = card.source?.title || 'Unknown Source';
    const sourceAuthor = card.source?.author || '';
    
    return `
      <div class="card" data-card-id="${card.id}">
        <div class="card-header">
          <h3 class="card-claim">${escapeHtml(card.claim)}</h3>
          <span class="card-date">${createdDate}</span>
        </div>
        <div class="card-source">
          <strong>${escapeHtml(sourceTitle)}</strong>
          ${sourceAuthor ? ` by ${escapeHtml(sourceAuthor)}` : ''}
        </div>
        <div class="card-mla">${escapeHtml(card.mla)}</div>
        <div class="card-actions">
          <button class="btn-primary" onclick="copyCard('${card.id}', 'markdown')">Copy MD</button>
          <button class="btn-primary" onclick="copyCard('${card.id}', 'html')">Copy HTML</button>
          <button class="btn-secondary" onclick="editCard('${card.id}')">Edit</button>
          <button class="btn-danger" onclick="deleteCard('${card.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function copyCard(cardId, format) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) return;
  
  const sents = card.evidence.fullText.match(/[^.!?]+[.!?]+(\s|$)/g) || [card.evidence.fullText];
  const highlights = card.evidence.highlights || [];
  
  let content;
  if (format === 'markdown') {
    const ev = sents.map((s, i) => 
      highlights.includes(i) ? `**__${s.trim()}__**` : s.trim()
    ).join(" ");
    
    content = `CLAIM — ${card.claim}

${card.authorLine}

${card.mla}

${ev}

IMPACT — ${card.impact}`;
  } else {
    const ev = sents.map((s, i) => 
      highlights.includes(i)
        ? `<b><u>${s.trim()}</u></b>`
        : `<span style="font-size:8pt">${s.trim()}</span>`
    ).join(" ");
    
    content = `<p><b>CLAIM —</b> ${card.claim}</p>
<p>${card.authorLine}</p>
<p>${card.mla}</p>
<p>${ev}</p>
<p><b>IMPACT —</b> ${card.impact}</p>`;
  }
  
  try {
    await navigator.clipboard.writeText(content);
    showNotification(`Copied ${format.toUpperCase()} to clipboard!`);
  } catch (err) {
    console.error('Failed to copy:', err);
    showNotification('Failed to copy to clipboard', 'error');
  }
}

async function deleteCard(cardId) {
  if (!confirm('Are you sure you want to delete this card?')) return;
  
  allCards = allCards.filter(c => c.id !== cardId);
  await chrome.storage.local.set({ cards: allCards });
  filterCards();
  showNotification('Card deleted');
}

function editCard(cardId) {
  // For now, just copy the card data to session storage and open popup
  const card = allCards.find(c => c.id === cardId);
  if (card) {
    chrome.storage.session.set({ 
      draftCardPayload: {
        text: card.evidence.fullText,
        meta: card.source
      },
      editCard: card
    });
    chrome.action.openPopup();
  }
}

async function exportAllCards(format) {
  if (allCards.length === 0) {
    showNotification('No cards to export', 'error');
    return;
  }
  
  const cardsContent = allCards.map(card => {
    const sents = card.evidence.fullText.match(/[^.!?]+[.!?]+(\s|$)/g) || [card.evidence.fullText];
    const highlights = card.evidence.highlights || [];
    
    if (format === 'markdown') {
      const ev = sents.map((s, i) => 
        highlights.includes(i) ? `**__${s.trim()}__**` : s.trim()
      ).join(" ");
      
      return `CLAIM — ${card.claim}

${card.authorLine}

${card.mla}

${ev}

IMPACT — ${card.impact}

---`;
    } else {
      const ev = sents.map((s, i) => 
        highlights.includes(i)
          ? `<b><u>${s.trim()}</u></b>`
          : `<span style="font-size:8pt">${s.trim()}</span>`
      ).join(" ");
      
      return `<div class="card">
<p><b>CLAIM —</b> ${card.claim}</p>
<p>${card.authorLine}</p>
<p>${card.mla}</p>
<p>${ev}</p>
<p><b>IMPACT —</b> ${card.impact}</p>
</div>`;
    }
  }).join('\n\n');
  
  const fullContent = format === 'markdown' 
    ? `# Card Library Export\n\n${cardsContent}`
    : `<html><head><title>Card Library Export</title></head><body>${cardsContent}</body></html>`;
  
  try {
    await navigator.clipboard.writeText(fullContent);
    showNotification(`Exported ${allCards.length} cards as ${format.toUpperCase()}!`);
  } catch (err) {
    console.error('Failed to export:', err);
    showNotification('Failed to export cards', 'error');
  }
}

async function clearAllCards() {
  if (!confirm('Are you sure you want to delete ALL cards? This cannot be undone.')) return;
  
  await chrome.storage.local.set({ cards: [] });
  allCards = [];
  filterCards();
  showNotification('All cards deleted');
}

function showNotification(message, type = 'success') {
  // Simple notification - could be enhanced with a proper toast
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : '#28a745'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 1000;
    font-weight: 500;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Event listeners
searchInput.addEventListener('input', filterCards);

document.getElementById('exportMD').addEventListener('click', () => exportAllCards('markdown'));
document.getElementById('exportHTML').addEventListener('click', () => exportAllCards('html'));
document.getElementById('clearAll').addEventListener('click', clearAllCards);

// Load cards on page load
loadCards();
