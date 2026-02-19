export function mobileKeyboard(): void {
  const screen = document.querySelector('.xterm-screen');
  if (screen === null) return;
  screen.setAttribute('contenteditable', 'true');
  screen.setAttribute('spellcheck', 'false');
  screen.setAttribute('autocorrect', 'false');
  screen.setAttribute('autocomplete', 'false');
  screen.setAttribute('autocapitalize', 'false');
}

export function setupMobileViewport(onResize: () => void): void {
  const vv = window.visualViewport;
  if (!vv) return;

  let timer: ReturnType<typeof setTimeout>;

  const update = (): void => {
    document.documentElement.style.setProperty('--vh', `${vv.height}px`);
    clearTimeout(timer);
    timer = setTimeout(onResize, 100);
  };

  vv.addEventListener('resize', update);
  update();
}
