import 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- augmenting needs an interface
  interface CSSProperties {
    [key: `--${string}`]: number | string | undefined;
  }
}
