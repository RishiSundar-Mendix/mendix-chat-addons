# Voice input for the Mendix Conversational UI chat

A microphone button for the chat message box. The user speaks, the words appear in the box, and the user reads them and presses Send. It never sends by itself, so a misheard word cannot trigger an action.

It uses the browser's built-in speech recognition (the Web Speech API), so there is no extra service, key or cost.

## What you get
- A round microphone button next to Send, the same height as Send.
- A hint line in the box: "Click the microphone to speak", "Listening... click to stop", "Check the text, then press Send".
- A red border and a pulsing microphone while listening.
- If the browser has no speech recognition, or the page is not on https or localhost, the microphone is not shown and the hint says so.

## Works with
- Mendix 11 with the Conversational UI module (the message box is `.chat-input-wrapper`).
- Chrome and Edge. Firefox has no speech recognition.
- Tested on desktop only.

## Install (5 minutes)
1. Open `theme/web/index.html` in your app. Before the closing `</body>`, add a script tag and paste the contents of `voice-input.js` inside it:
   ```html
   <script>
     /* paste voice-input.js here */
   </script>
   ```
2. Append the contents of `voice-input.scss` to `theme/web/main.scss` (or to a styles file your theme imports).
3. Run the app and hard-refresh the browser. Open a chat that uses the Conversational UI message box.

## Settings
- Language: set `window.AI_VOICE_LANG = "nl-NL";` before the script to force a language. By default it uses the browser language.
- Texts: the hint texts are constants at the top of the script (`HINT_READY`, `HINT_LISTEN`, `HINT_REVIEW`).

## How it works
- A timer looks for `.chat-input-wrapper` and adds a hint line and the microphone button once per box.
- The microphone is placed beside the Send button by measuring the widest button in the box, so it adapts to your button width.
- Recognition results are written into the textarea with the native value setter and `input` and `change` events, so Mendix sees the change.

## Limits
- Recognition quality depends on the browser and the language. Codes and IDs such as "E-17" can be misheard, which is why the user always reviews the text.
- It reads the browser's own recognition service. Check your organisation's rules on voice data before use.
- The class names come from the Conversational UI module. If a new module version renames them, update the selectors in the script and the styles.

## License
MIT. See the LICENSE file in the repository root.
