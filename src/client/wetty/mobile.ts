export function mobileKeyboard(): void {
  const screen = document.querySelector('.xterm-screen');
  if (screen === null) return;
  screen.setAttribute('contenteditable', 'true');
  screen.setAttribute('spellcheck', 'false');
  screen.setAttribute('autocorrect', 'false');
  screen.setAttribute('autocomplete', 'false');
  screen.setAttribute('autocapitalize', 'false');
}

function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

export function setupMobileViewport(onResize: () => void): void {
  if (!window.visualViewport) return;

  const debouncedResize = debounce(onResize, 100);

  const update = () => {
    const vv = window.visualViewport!;
    document.body.style.height = `${vv.height}px`;
    debouncedResize();
  };

  window.visualViewport.addEventListener('resize', update);
  update();
}
