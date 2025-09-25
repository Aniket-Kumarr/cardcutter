# Card Cutter – NSDA

A that turns any article selection into a judge-ready NSDA debate card with proper formatting, citations, and evidence highlighting.

## Features

- **One-click card creation**: Select text → right-click → "Cut card"
- **Auto-generated citations**: Heuristic MLA web citation with editable fields
- **Evidence highlighting**: Click sentences to bold/underline key evidence
- **NSDA-compliant format**: CLAIM → "Author in Year writes," → MLA → Evidence → IMPACT
- **Card library**: Save, search, and manage all your cards
- **Multiple export formats**: Markdown, HTML (perfect for Google Docs)
- **Smart metadata detection**: Auto-detects author, title, date from web pages

## Installation

1. **Download the extension files** to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the folder containing the extension files
5. **Pin the extension** to your toolbar for easy access

## How to Use

### Creating a Card

1. **Select text** on any webpage (1-2 paragraphs work best)
2. **Right-click** and choose "Cut card" from the context menu
3. **Edit the form** that opens:
   - **Claim**: Your argument in your own words
   - **Author in Year**: Auto-generated, but editable
   - **MLA Citation**: Auto-generated, but editable
   - **Evidence**: Click sentences to highlight key evidence
   - **Impact**: Why this matters in the round
4. **Save** or **export** your card

### Managing Cards

1. **Click the extension icon** to open the card library
2. **Search** through your saved cards
3. **Export** individual cards or all cards at once
4. **Edit** or **delete** cards as needed

### Export Formats

- **Markdown**: Perfect for most debate platforms
- **HTML**: Copy-paste directly into Google Docs with formatting preserved

## Card Format

Each card follows the NSDA structure:

```
CLAIM — Your argument here

Author in Year writes,

Lastname, Firstname. "Article Title." Site Name, Day Mon. Year, URL. Accessed Day Mon. Year.

**__Key evidence sentence that you highlighted.__** Regular context text that provides background.

IMPACT — Why this matters in the round.
```

## Technical Details

- **Manifest V3** compatible
- **Local storage** - all cards saved locally in Chrome
- **No external dependencies** - pure JavaScript
- **Works on all websites** - uses content scripts for universal compatibility

## Data Storage

Cards are stored locally in Chrome's storage with this structure:

```json
{
  "id": "unique-id",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "claim": "Your claim",
  "authorLine": "Author in Year writes,",
  "mla": "Full MLA citation",
  "source": {
    "title": "Page Title",
    "author": "Author Name",
    "site": "Site Name",
    "datePublished": "2024-01-01",
    "url": "https://example.com"
  },
  "evidence": {
    "fullText": "Full selected text",
    "highlights": [0, 2, 4]
  },
  "impact": "Why this matters",
  "topicTags": []
}
```

## Privacy

- **No data collection**: All cards stored locally on your device
- **No external servers**: Everything runs in your browser
- **No tracking**: No analytics or user tracking

## Troubleshooting

**Extension not working?**
- Make sure you're on a webpage (not chrome:// pages)
- Try refreshing the page and selecting text again
- Check that the extension is enabled in chrome://extensions/

**Cards not saving?**
- Check Chrome storage permissions
- Try clearing browser data and reinstalling

**Export not working?**
- Make sure you have clipboard permissions
- Try copying manually if clipboard API fails

## Roadmap

- [ ] .docx export support
- [ ] Team sync via Google Drive
- [ ] Auto-tagging by topic
- [ ] Duplicate detection
- [ ] Citation style options (APA, Chicago)
- [ ] Coach review mode

## Contributing

This is an open-source project! Feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed for your debate team.
