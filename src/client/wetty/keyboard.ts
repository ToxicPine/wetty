import type { Term } from './term';

type Action =
  | 'toggle-keyboard'
  | 'toggle-ctrl'
  | 'esc'
  | 'up'
  | 'down'
  | 'tab'
  | 'left'
  | 'right'
  | 'paste';

const KEY_SEQUENCES: Record<string, string> = {
  esc: '\x1B',
  up: '\x1B[A',
  down: '\x1B[B',
  left: '\x1B[D',
  right: '\x1B[C',
  tab: '\x09',
};

export function setupKeyboard(term: Term): void {
  let ctrlActive = false;
  const ctrlButton = document.getElementById('onscreen-ctrl');
  const panel = document.getElementById('keyboard-panel');

  function toggleCtrl(): void {
    ctrlActive = !ctrlActive;
    ctrlButton?.classList.toggle('active', ctrlActive);
    term.focus();
  }

  function sendKey(seq: string): void {
    if (ctrlActive) toggleCtrl();
    term.input(seq, false);
    term.focus();
  }

  function toggleKeyboard(): void {
    panel?.classList.toggle('active');
  }

  async function paste(): Promise<void> {
    if (ctrlActive) toggleCtrl();

    if (navigator.clipboard?.readText) {
      try {
        const text = await navigator.clipboard.readText();
        if (text) term.paste(text);
        term.focus();
        return;
      } catch {
        /* fall through to manual paste */
      }
    }

    const bar = document.createElement('input');
    bar.type = 'text';
    bar.placeholder = 'Paste Here, Then Press Enter';
    bar.style.cssText =
      'position:fixed;bottom:0;left:0;width:100%;height:48px;z-index:9999;' +
      'font-size:16px;padding:0 16px;background:#111;color:#fff;border:none;' +
      'border-top:1px solid #333;outline:none;box-sizing:border-box;';
    document.body.appendChild(bar);
    bar.focus();

    const done = (): void => {
      if (!bar.parentNode) return;
      const text = bar.value;
      bar.remove();
      if (text) term.paste(text);
      term.focus();
    };

    bar.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        done();
      }
      if (e.key === 'Escape') {
        bar.value = '';
        done();
      }
    });
    bar.addEventListener('blur', () => setTimeout(done, 200));
  }

  const handlers: Record<Action, () => void> = {
    'toggle-keyboard': toggleKeyboard,
    'toggle-ctrl': toggleCtrl,
    esc: () => sendKey(KEY_SEQUENCES.esc),
    up: () => sendKey(KEY_SEQUENCES.up),
    down: () => sendKey(KEY_SEQUENCES.down),
    tab: () => sendKey(KEY_SEQUENCES.tab),
    left: () => sendKey(KEY_SEQUENCES.left),
    right: () => sendKey(KEY_SEQUENCES.right),
    paste,
  };

  for (const el of document.querySelectorAll<HTMLElement>('[data-action]')) {
    const action = el.dataset.action as Action;
    const handler = handlers[action];
    if (handler) {
      el.addEventListener('click', (ev: Event) => {
        ev.preventDefault();
        handler();
      });
    }
  }

  document.addEventListener('keyup', (e) => {
    if (!ctrlActive) return;
    if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
      const code = e.key.toUpperCase().charCodeAt(0) - 64;
      term.input(String.fromCharCode(code), false);
      setTimeout(() => term.input('\x7F', true), 100);
    }
    toggleCtrl();
  });
}
