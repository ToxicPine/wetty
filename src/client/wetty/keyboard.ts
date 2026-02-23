import { animateMini as animate } from 'motion';
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
  const wrapper = document.getElementById('controls-wrapper');
  const pasteBar = document.getElementById('paste-bar');
  const pasteInput = pasteBar?.querySelector('input') as HTMLInputElement | null;

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
    const isOpening = !wrapper?.classList.contains('active');
    if (!wrapper) return;

    if (isOpening) {
      wrapper.classList.add('active');
      animate(
        wrapper,
        { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] },
        { duration: 0.2, ease: 'easeOut' },
      );
    } else {
      animate(
        wrapper,
        { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-8px)'] },
        { duration: 0.15, ease: 'easeIn' },
      ).then(() => {
        wrapper.classList.remove('active');
        hidePasteBar();
      });
    }
  }

  function showPasteBar(): void {
    if (!pasteBar || !pasteInput) return;
    pasteInput.value = '';
    pasteBar.classList.add('active');
    animate(
      pasteBar,
      { opacity: [0, 1], transform: ['translateY(-4px)', 'translateY(0)'] },
      { duration: 0.2, ease: 'easeOut' },
    );
    pasteInput.focus();
  }

  function hidePasteBar(): void {
    if (!pasteBar || !pasteBar.classList.contains('active')) return;
    animate(
      pasteBar,
      { opacity: [1, 0], transform: ['translateY(0)', 'translateY(-4px)'] },
      { duration: 0.15, ease: 'easeIn' },
    ).then(() => {
      pasteBar.classList.remove('active');
    });
  }

  function commitPaste(): void {
    if (!pasteInput) return;
    const text = pasteInput.value;
    pasteInput.value = '';
    hidePasteBar();
    if (text) term.paste(text);
    term.focus();
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

    showPasteBar();
  }

  // Paste bar input event listeners
  pasteInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitPaste();
    }
    if (e.key === 'Escape') {
      pasteInput.value = '';
      hidePasteBar();
      term.focus();
    }
  });

  pasteInput?.addEventListener('blur', () => {
    setTimeout(() => {
      if (pasteBar?.classList.contains('active')) {
        commitPaste();
      }
    }, 200);
  });

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
