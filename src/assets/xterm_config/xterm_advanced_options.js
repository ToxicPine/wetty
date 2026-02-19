window.inflateOptions([
  {
    type: 'boolean',
    name: 'Allow Proposed XTerm APIs',
    description:
      'When set to false, any experimental or proposed APIs will throw errors.',
    path: ['xterm', 'allowProposedApi'],
  },
  {
    type: 'boolean',
    name: 'Allow Transparent Background',
    description: 'Whether the background is allowed to be a non-opaque color.',
    path: ['xterm', 'allowTransparency'],
  },
  {
    type: 'text',
    name: 'Bell Sound URI',
    description: 'URI for a custom bell character sound.',
    path: ['xterm', 'bellSound'],
    nullable: true,
  },
  {
    type: 'enum',
    name: 'Bell Style',
    description: 'How the terminal will react to the bell character.',
    path: ['xterm', 'bellStyle'],
    enum: ['none', 'sound'],
  },
  {
    type: 'boolean',
    name: 'Force End-Of-Line',
    description:
      'When enabled, new-line characters (\\n) will be interpreted as carriage-return new-line (\\r\\n).',
    path: ['xterm', 'convertEol'],
  },
  {
    type: 'boolean',
    name: 'Disable Stdin',
    description: 'Whether input should be disabled.',
    path: ['xterm', 'disableStdin'],
  },
  {
    type: 'number',
    name: 'Letter Spacing',
    description: 'The spacing in whole pixels between characters.',
    path: ['xterm', 'letterSpacing'],
  },
  {
    type: 'number',
    name: 'Line Height',
    description:
      'Line height, multiplied by the font size to get the height of terminal rows.',
    path: ['xterm', 'lineHeight'],
    float: true,
  },
  {
    type: 'enum',
    name: 'Log Level',
    description: 'Log level for the xterm library.',
    path: ['xterm', 'logLevel'],
    enum: ['trace', 'debug', 'info', 'warn', 'error', 'off'],
  },
  {
    type: 'boolean',
    name: 'Mac Option Key As Meta',
    description:
      'When enabled, the Option key on Macs will be interpreted as the Meta key.',
    path: ['xterm', 'macOptionIsMeta'],
  },
  {
    type: 'boolean',
    name: 'Mac Option Click Forces Selection',
    description:
      'Whether holding a modifier key will force normal selection behavior, regardless of whether the terminal is in mouse events mode.',
    path: ['xterm', 'macOptionClickForcesSelection'],
  },
  {
    type: 'number',
    name: 'Forced Contrast Ratio',
    description:
      'Minimum contrast ratio for terminal text. Goes from 1 (do nothing) to 21 (strict black and white).',
    path: ['xterm', 'minimumContrastRatio'],
    float: true,
  },
  {
    type: 'boolean',
    name: 'Right Click Selects Words',
    description: 'Whether to select the word under the cursor on right click.',
    path: ['xterm', 'rightClickSelectsWord'],
  },
  {
    type: 'boolean',
    name: 'Screen Reader Support',
    description:
      'Whether screen reader support is enabled. Exposes supporting elements in the DOM for NVDA and VoiceOver.',
    path: ['xterm', 'screenReaderMode'],
  },
  {
    type: 'text',
    name: 'Word Separator',
    description:
      'All characters considered word separators for double-click selection. Encoded as JSON.',
    path: ['xterm', 'wordSeparator'],
    json: true,
  },
]);
