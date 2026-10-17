import Image from 'next/image';

import { logo } from '@/content/media';
import styles from './brand-logo.module.css';

type Props = { className?: string; priority?: boolean; sizes?: string };

/** The official logo in its on-dark variant, directly on the page. */
export function BrandLogo({
  className,
  priority = false,
  sizes = '180px',
}: Props) {
  return (
    <span className={[styles.logo, className].filter(Boolean).join(' ')}>
      <Image
        src={logo.image}
        alt={logo.alt}
        sizes={sizes}
        priority={priority}
      />
    </span>
  );
}
