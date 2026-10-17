import Link from 'next/link';
import type { ComponentProps } from 'react';

import { Arrow } from './arrow';

type Variant = 'solid' | 'line' | 'ink' | 'ink-line' | 'text';

const variantClass: Record<Variant, string> = {
  solid: 'btn',
  line: 'btn btn--line',
  ink: 'btn btn--ink',
  'ink-line': 'btn btn--ink-line',
  text: 'text-link',
};

type CtaProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: Variant;
  className?: string;
  /** Gentle pointer attraction on desktop (see Cursor). */
  magnetic?: boolean;
};

/** Internal navigation call to action. */
export function Cta({
  variant = 'solid',
  className,
  magnetic,
  children,
  ...props
}: CtaProps) {
  return (
    <Link
      className={[variantClass[variant], className].filter(Boolean).join(' ')}
      data-magnetic={magnetic ? '' : undefined}
      {...props}
    >
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

type TelProps = {
  tel: string;
  display: string;
  variant?: Variant;
  className?: string;
};

/** Tap-to-call link for an owner-approved public number. */
export function TelLink({
  tel,
  display,
  variant = 'line',
  className,
}: TelProps) {
  return (
    <a
      href={`tel:${tel}`}
      className={[variantClass[variant], className].filter(Boolean).join(' ')}
    >
      <span>
        <span className="sr-only">Call </span>
        {display}
      </span>
      <Arrow />
    </a>
  );
}
