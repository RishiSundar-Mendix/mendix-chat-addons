// Voice input for the Mendix Conversational UI chat message box.
// Paste inside a <script> tag in theme/web/index.html (see README).
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var supported = !!SR && window.isSecureContext;
  var LANG = window.AI_VOICE_LANG || navigator.language || "en-US";
  var HINT_READY = "Click the microphone to speak";
  var HINT_LISTEN = "Listening... click to stop";
  var HINT_REVIEW = "Check the text, then press Send";
  var HINT_BLOCKED = "Microphone is blocked. Allow it in the browser address bar.";
  var HINT_NONE = "Voice is not available in this browser";
  var recog = null;
  var listening = false;
  var stopRequested = false;

  var MIC =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11h-2z"/></svg>';

  function setText(box, text) {
    var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    setter.call(box, text);
    box.dispatchEvent(new Event("input", { bubbles: true }));
    box.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setHint(wrap, text, rec) {
    var h = wrap.querySelector(".ai-voice-hint");
    if (!h) return;
    h.innerHTML = rec ? '<span class="ai-voice-dot" aria-hidden="true"></span>' : "";
    h.appendChild(document.createTextNode(text));
    h.classList.toggle("is-rec", !!rec);
  }

  function startListening(wrap) {
    var box = wrap.querySelector("textarea");
    var mic = wrap.querySelector(".ai-voice-mic");
    if (!box || !mic) return;
    var heard = false;
    var blocked = false;
    var quick = 0;
    stopRequested = false;

    function finish() {
      listening = false;
      mic.classList.remove("is-listening");
      mic.setAttribute("aria-label", "Speak your question");
      mic.title = "Speak your question";
      wrap.classList.remove("ai-voice-rec");
      setHint(wrap, blocked ? HINT_BLOCKED : heard && box.value.trim() ? HINT_REVIEW : HINT_READY, false);
    }

    // The browser ends a session after a pause or a time limit, so each session is a fresh
    // recognizer; the next one starts after a short delay and carries on from the text box.
    function begin() {
      var r = new SR();
      recog = r;
      r.lang = LANG;
      r.interimResults = true;
      r.continuous = true;
      r.maxAlternatives = 1;
      var base = box.value ? box.value.replace(/s+$/, "") + " " : "";
      var startedAt = Date.now();
      r.onstart = function () {
        listening = true;
        mic.classList.add("is-listening");
        mic.setAttribute("aria-label", "Stop listening");
        mic.title = "Stop listening";
        wrap.classList.add("ai-voice-rec");
        setHint(wrap, HINT_LISTEN, true);
      };
      r.onresult = function (ev) {
        if (stopRequested) return;
        var t = "";
        for (var i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
        heard = true;
        quick = 0;
        setText(box, base + t);
      };
      r.onerror = function (ev) {
        if (ev.error === "not-allowed" || ev.error === "service-not-allowed") blocked = true;
      };
      r.onend = function () {
        if (Date.now() - startedAt < 1500) quick++;
        if (stopRequested || blocked || quick >= 3 || !document.body.contains(box)) { finish(); return; }
        setTimeout(function () {
          if (stopRequested || !document.body.contains(box)) { finish(); return; }
          try { begin(); } catch (e) { finish(); }
        }, 300);
      };
      r.start();
    }

    try { begin(); } catch (e) { finish(); }
  }

  // stops listening at once (mic clicked again, message sent, chat closed)
  function stopListening() {
    stopRequested = true;
    if (recog) { try { recog.abort(); } catch (e) {} }
  }

  function addVoice(wrap) {
    if (wrap.classList.contains("ai-voice-ready")) return;
    var hint = document.createElement("div");
    hint.className = "ai-voice-hint";
    wrap.appendChild(hint);
    if (!supported) {
      hint.textContent = HINT_NONE;
      wrap.classList.add("ai-voice-ready");
      return;
    }
    var mic = document.createElement("button");
    mic.type = "button";
    mic.className = "ai-voice-mic";
    mic.title = "Speak your question";
    mic.setAttribute("aria-label", "Speak your question");
    mic.innerHTML = MIC;
    mic.addEventListener("click", function (e) {
      e.preventDefault();
      if (listening) stopListening();
      else startListening(wrap);
    });
    wrap.appendChild(mic);
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button");
      if (btn && btn !== mic && listening) stopListening();
    }, true);
    wrap.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey && listening) stopListening();
    }, true);
    hint.textContent = HINT_READY;
    // the hint goes back to its start text once the box is empty again (message sent)
    var box = wrap.querySelector("textarea");
    if (box) {
      box.addEventListener("input", function () {
        if (!listening && !box.value.trim()) setHint(wrap, HINT_READY, false);
      });
    }
    wrap.classList.add("ai-voice-ready");
  }

  function placeMic(wrap) {
    var mic = wrap.querySelector(".ai-voice-mic");
    if (!mic) return;
    // the Send button is the widest visible button in the box (not the microphone)
    var send = null;
    var best = 0;
    var cands = wrap.querySelectorAll("button, a.btn, .btn");
    for (var k = 0; k < cands.length; k++) {
      if (cands[k] === mic || mic.contains(cands[k])) continue;
      var cr = cands[k].getBoundingClientRect();
      if (cr.width >= 40 && cr.height >= 20 && cr.height <= 60 && cr.width > best) {
        best = cr.width;
        send = cands[k];
      }
    }
    if (!send) return;
    var wr = wrap.getBoundingClientRect();
    var sr = send.getBoundingClientRect();
    if (!sr.width || !sr.height) return;
    var size = Math.round(sr.height);
    mic.style.width = size + "px";
    mic.style.height = size + "px";
    mic.style.right = Math.round(wr.right - sr.left + 8) + "px";
    mic.style.bottom = Math.round(wr.bottom - sr.bottom) + "px";
  }

  setInterval(function () {
    var wraps = document.querySelectorAll(".chat-input-wrapper");
    for (var i = 0; i < wraps.length; i++) {
      addVoice(wraps[i]);
      placeMic(wraps[i]);
      var bx = wraps[i].querySelector("textarea");
      var hn = wraps[i].querySelector(".ai-voice-hint");
      if (!listening && bx && hn && wraps[i].querySelector(".ai-voice-mic") && !bx.value.trim() && hn.textContent === HINT_REVIEW) setHint(wraps[i], HINT_READY, false);
    }
    if (!wraps.length && listening) stopListening();
  }, 500);
})();
    