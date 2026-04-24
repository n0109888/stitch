(function () {
    'use strict';

    var KEY = 'auth';
    var PW_HASH = 'f95e792cc5747f04adf5d0165dcf0428b4d220ad6fc0e5fd164562f502f68e0f';

    function isAuthed() {
        try { return sessionStorage.getItem(KEY) === 'ok'; } catch (e) { return false; }
    }
    if (isAuthed()) return;

    var hideStyle = document.createElement('style');
    hideStyle.id = 'auth-gate-hide';
    hideStyle.textContent = 'body > *:not(#auth-gate) { visibility: hidden !important; }';
    (document.head || document.documentElement).appendChild(hideStyle);

    async function sha256(str) {
        var enc = new TextEncoder().encode(str);
        var buf = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(buf)).map(function (b) {
            return b.toString(16).padStart(2, '0');
        }).join('');
    }

    var CSS = [
        '.auth-gate {',
        '  position: fixed; inset: 0; z-index: 9999;',
        '  background: #fbf9f9;',
        '  display: flex; align-items: center; justify-content: center;',
        '  padding: 2rem; opacity: 1;',
        '  transition: opacity 0.5s ease, background-color 0.5s ease;',
        '  font-family: "Inter", system-ui, sans-serif;',
        '}',
        '.auth-gate.leaving { opacity: 0; pointer-events: none; }',
        '.auth-gate-card {',
        '  width: 100%; max-width: 380px;',
        '  animation: gate-rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;',
        '}',
        '@keyframes gate-rise {',
        '  from { opacity: 0; transform: translateY(18px); }',
        '  to   { opacity: 1; transform: translateY(0); }',
        '}',
        '.auth-gate-brand {',
        '  font-size: 1.5rem; font-weight: 700; letter-spacing: -0.04em;',
        '  color: #000000; margin-bottom: 3rem;',
        '  transition: color 0.4s ease;',
        '}',
        '.auth-gate-eyebrow {',
        '  font-size: 0.62rem; font-weight: 600; text-transform: uppercase;',
        '  letter-spacing: 0.22em; color: #7e7576;',
        '  margin-bottom: 1.2rem; display: inline-flex; align-items: center; gap: 0.6rem;',
        '}',
        '.auth-gate-eyebrow::before {',
        '  content: ""; width: 1.25rem; height: 1px; background: #1b1c1c;',
        '  transition: background-color 0.4s ease;',
        '}',
        '.auth-gate-form {',
        '  display: flex; align-items: center; gap: 0.75rem;',
        '  border-bottom: 1px solid rgba(27, 28, 28, 0.3);',
        '  padding-bottom: 0.5rem; transition: border-color 0.35s ease;',
        '}',
        '.auth-gate-form:focus-within { border-color: #000000; }',
        '.auth-gate-input {',
        '  flex: 1; background: transparent; border: none; outline: none;',
        '  font-family: inherit; font-size: 1.1rem; color: #1b1c1c;',
        '  padding: 0.5rem 0; letter-spacing: 0.02em;',
        '  transition: color 0.4s ease;',
        '}',
        '.auth-gate-input::placeholder { color: #a8a5a0; font-weight: 300; }',
        '.auth-gate-submit {',
        '  width: 36px; height: 36px; border-radius: 9999px;',
        '  border: 1px solid rgba(27, 28, 28, 0.3); background: transparent;',
        '  color: #1b1c1c; cursor: pointer;',
        '  display: inline-flex; align-items: center; justify-content: center;',
        '  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.15s ease;',
        '}',
        '.auth-gate-submit:hover { background: #000000; color: #ffffff; border-color: #000000; }',
        '.auth-gate-submit:active { transform: scale(0.94); }',
        '.auth-gate-submit svg { transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1); }',
        '.auth-gate-submit:hover svg { transform: translateX(3px); }',
        '.auth-gate-error {',
        '  font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;',
        '  font-weight: 600; color: #ba1a1a;',
        '  margin-top: 1rem; min-height: 1rem;',
        '  opacity: 0; transition: opacity 0.25s ease;',
        '}',
        '.auth-gate-error:not(:empty) { opacity: 1; }',
        '@keyframes gate-shake {',
        '  0%, 100% { transform: translateX(0); }',
        '  20%, 60% { transform: translateX(-7px); }',
        '  40%, 80% { transform: translateX(7px); }',
        '}',
        '.auth-gate.shake .auth-gate-card { animation: gate-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97); }',
        'html.dark .auth-gate { background: #0e0f12; }',
        'html.dark .auth-gate-brand { color: #ffffff; }',
        'html.dark .auth-gate-eyebrow { color: #6f6d69; }',
        'html.dark .auth-gate-eyebrow::before { background: #eaeaea; }',
        'html.dark .auth-gate-form { border-bottom-color: rgba(234, 234, 234, 0.3); }',
        'html.dark .auth-gate-form:focus-within { border-color: #ffffff; }',
        'html.dark .auth-gate-input { color: #eaeaea; }',
        'html.dark .auth-gate-input::placeholder { color: #6f6d69; }',
        'html.dark .auth-gate-submit { border-color: rgba(234, 234, 234, 0.3); color: #eaeaea; }',
        'html.dark .auth-gate-submit:hover { background: #ffffff; color: #0e0f12; border-color: #ffffff; }',
        'html.dark .auth-gate-error { color: #ff8a84; }'
    ].join('\n');

    var HTML = [
        '<div id="auth-gate" class="auth-gate" role="dialog" aria-modal="true" aria-label="Password required">',
        '  <div class="auth-gate-card">',
        '    <div class="auth-gate-brand">nealCS</div>',
        '    <div class="auth-gate-eyebrow">Private preview</div>',
        '    <form id="auth-gate-form" class="auth-gate-form" autocomplete="off" novalidate>',
        '      <input id="auth-gate-input" class="auth-gate-input" type="password" placeholder="password" required autocomplete="off" spellcheck="false" aria-label="Password"/>',
        '      <button type="submit" class="auth-gate-submit" aria-label="Unlock">',
        '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M14 6l6 6-6 6"/></svg>',
        '      </button>',
        '    </form>',
        '    <div id="auth-gate-error" class="auth-gate-error" aria-live="polite"></div>',
        '  </div>',
        '</div>'
    ].join('\n');

    function inject() {
        var style = document.createElement('style');
        style.id = 'auth-gate-style';
        style.textContent = CSS;
        document.head.appendChild(style);

        var wrap = document.createElement('div');
        wrap.innerHTML = HTML.trim();
        var gate = wrap.firstElementChild;
        document.body.appendChild(gate);

        var form = gate.querySelector('#auth-gate-form');
        var input = gate.querySelector('#auth-gate-input');
        var err = gate.querySelector('#auth-gate-error');

        setTimeout(function () { input.focus(); }, 120);

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            err.textContent = '';
            var hash = null;
            try { hash = await sha256(input.value); } catch (ex) {}
            if (hash === PW_HASH) {
                try { sessionStorage.setItem(KEY, 'ok'); } catch (ex) {}
                gate.classList.add('leaving');
                setTimeout(function () {
                    gate.remove();
                    hideStyle.remove();
                }, 550);
            } else {
                gate.classList.add('shake');
                err.textContent = 'Wrong password';
                setTimeout(function () { gate.classList.remove('shake'); }, 500);
                input.select();
            }
        });
    }

    if (document.readyState === 'loading' || !document.body) {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
