import type { Term } from './term';
import { loadOptions, saveOptions, type Options } from './options';
import { copyToClipboard, copyShortcut } from './clipboard';

declare global {
  interface Window {
    wetty_save_config?: (config: Options) => void;
    loadOptions: (config: Options) => void;
  }
}

export function configureTerm(term: Term): void {
  applyOptions(term);
  setupClipboard(term);
  setupSettingsModal(term);
}

function applyOptions(term: Term): void {
  try {
    term.options = loadOptions().xterm;
  } catch {
    /* ignore invalid stored options */
  }
}

function setupClipboard(term: Term): void {
  term.attachCustomKeyEventHandler(copyShortcut);
  document.addEventListener('mouseup', () => {
    if (term.hasSelection()) copyToClipboard(term.getSelection());
  });
}

function setupSettingsModal(term: Term): void {
  const modal = document.getElementById('settings-modal');
  const editor = modal?.querySelector(
    'iframe.editor',
  ) as HTMLIFrameElement | null;
  if (!modal || !editor) return;

  const open = (): void => {
    editor.contentWindow?.loadOptions(loadOptions());
    modal.classList.add('open');
  };
  const close = (): void => {
    modal.classList.remove('open');
    term.focus();
  };

  function initEditor(): void {
    const win = editor!.contentWindow;
    if (!win) return;
    win.loadOptions(loadOptions());
    win.wetty_save_config = (updated: Options) => {
      try {
        const prev = JSON.stringify(loadOptions());
        const next = JSON.stringify(updated);
        if (prev === next) return;
        term.options = updated.xterm;
        if (
          !updated.wettyFitTerminal &&
          updated.xterm.cols != null &&
          updated.xterm.rows != null
        ) {
          term.resize(updated.xterm.cols, updated.xterm.rows);
        }
        term.resizeTerm();
        saveOptions(updated);
      } catch (e) {
        console.error('Configuration error', e);
      }
    };
  }

  const doc = editor.contentDocument ?? editor.contentWindow?.document;
  if (doc?.readyState === 'complete') initEditor();
  editor.addEventListener('load', initEditor);

  for (const el of document.querySelectorAll<HTMLElement>(
    '[data-action="toggle-settings"]',
  )) {
    el.addEventListener('click', () => open());
  }
  for (const el of document.querySelectorAll<HTMLElement>(
    '[data-action="close-settings"]',
  )) {
    el.addEventListener('click', () => close());
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      e.preventDefault();
      close();
    }
  });
}
