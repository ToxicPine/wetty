export type XTermOptions = {
  fontSize?: number;
  cols?: number;
  rows?: number;
} & Record<string, unknown>;

export interface Options {
  readonly xterm: XTermOptions;
  readonly wettyFitTerminal: boolean;
  readonly wettyVoid: number;
}

const STORAGE_KEY = 'options';

const defaults: Options = {
  xterm: { fontSize: 14 },
  wettyVoid: 0,
  wettyFitTerminal: true,
};

export function loadOptions(): Options {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return defaults;
    const parsed = JSON.parse(raw);
    if (!('xterm' in parsed)) return { ...defaults, xterm: parsed };
    return parsed;
  } catch {
    return defaults;
  }
}

export function saveOptions(options: Options): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options, null, 2));
}
