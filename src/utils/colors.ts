import chalk from 'chalk';

// Brand color: Violet for ContextMark
export const brand = chalk.hex('#8B5CF6');

export const colors = {
  brand,
  primary: brand,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.cyan,
  muted: chalk.gray,
  dim: chalk.dim,
  bold: chalk.bold,
  white: chalk.white,
};

export const icons = {
  success: '✔',
  error: '✖',
  warning: '⚠',
  info: 'ℹ',
  arrow: '→',
  arrowRight: '▶',
  bullet: '•',
  check: '✓',
  cross: '✗',
  star: '★',
  block: '█',
  folder: '📁',
  file: '📄',
  package: '📦',
  gear: '⚙',
  sync: '⟳',
  plus: '+',
  minus: '-',
};

export function header(text: string): void {
  console.log(colors.brand.bold(text));
}

export function success(message: string): void {
  console.log(`${colors.success(icons.success)} ${message}`);
}

export function error(message: string): void {
  console.log(`${colors.error(icons.error)} ${message}`);
}

export function warning(message: string): void {
  console.log(`${colors.warning(icons.warning)} ${message}`);
}

export function info(message: string): void {
  console.log(`${colors.info(icons.info)} ${message}`);
}

export function dim(message: string): void {
  console.log(colors.dim(message));
}

export function log(message: string): void {
  console.log(message);
}
