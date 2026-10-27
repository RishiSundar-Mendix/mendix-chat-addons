# Mendix chat add-ons

Two small, independent add-ons for Mendix apps that use the Agents Kit (Agent Commons, Conversational UI, GenAI Commons). Take one or both.

| Add-on | What it does |
|---|---|
| [voice-input](voice-input) | A microphone button for the chat message box. Speech fills the text box; the user reviews it and presses Send. |
| [report-export](report-export) | Lets the agent create a downloadable Excel, Word or PDF file from data it has already read with its tools. |

## Requirements
- Mendix 11 (built and tried on 11.12.6).
- Conversational UI for the chat window. The agent needs Agent Commons and an AI connector.
- Voice input: Chrome or Edge, on https or localhost.
- Report export: Apache POI, OpenPDF and Jackson libraries in `userlib`.

## Status
- Voice input: tried on desktop, in Chrome.
- Report export: Excel and PDF tested end to end through an agent chat. Word is built but less tested. Test all three in your own app before relying on them.
- Neither add-on is a Marketplace module. Copy the files and follow each README.

## Notes
- Both add-ons depend on class names and screens from Conversational UI. A new module version may need small updates.
- The report export file contains only what the model sends, so keep the prompt rule "copy values exactly from tool results, never invent".
- Voice input uses the browser's own speech recognition. Check your organisation's rules on voice data.

## Contributing
Issues and pull requests are welcome. Please describe your Mendix and module versions.

## License
MIT. See [LICENSE](LICENSE).
