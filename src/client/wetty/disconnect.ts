export function confirmUnload(e: BeforeUnloadEvent): string {
  e.returnValue = 'Are you sure?';
  return e.returnValue;
}

export function disconnect(reason: string): void {
  const overlay = document.getElementById('overlay');
  if (overlay === null) return;
  overlay.style.display = 'block';
  const msg = document.getElementById('msg');
  if (reason !== undefined && msg !== null) msg.textContent = reason;
  window.removeEventListener('beforeunload', confirmUnload);
}
