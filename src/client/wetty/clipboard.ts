export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

export function copyShortcut(e: KeyboardEvent): boolean {
  if (e.ctrlKey && e.shiftKey && e.key === "C") {
    e.preventDefault();
    const selection = window.getSelection()?.toString();
    if (selection) copyToClipboard(selection);
    return false;
  }
  return true;
}
