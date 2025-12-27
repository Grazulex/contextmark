import { colors, icons } from './colors';

export const logger = {
  info: (msg: string) => console.log(colors.info(icons.info), msg),
  success: (msg: string) => console.log(colors.success(icons.success), msg),
  warning: (msg: string) => console.log(colors.warning(icons.warning), msg),
  error: (msg: string) => console.log(colors.error(icons.error), msg),
  debug: (msg: string) => {
    if (process.env.DEBUG) {
      console.log(colors.muted('[DEBUG]'), msg);
    }
  },
  dim: (msg: string) => console.log(colors.dim(msg)),
  log: (msg: string) => console.log(msg),
  blank: () => console.log(),
};

export default logger;
