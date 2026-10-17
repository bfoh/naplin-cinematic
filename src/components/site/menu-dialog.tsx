'use client';

import Link from 'next/link';
import { useEffect, useRef, type CSSProperties } from 'react';

import { useMotion } from '@/components/motion/motion-provider';
import { BrandLogo } from '@/components/ui/brand-logo';
import { business, navigation } from '@/content/site';
import styles from './menu-dialog.module.css';

const items = [
  { label: 'Home', href: '/' },
  ...navigation,
  { label: 'Book an appointment', href: '/book' },
];

type Props = { open: boolean; pathname: string; onClose: () => void };

/**
 * Full-screen navigation. A native modal <dialog> supplies focus containment,
 * Escape handling and an inert page behind it.
 */
export function MenuDialog({ open, pathname, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { lenis } = useMotion();
  const lastPath = useRef(pathname);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('menu-open');
      lenis?.stop();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, lenis]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.classList.remove('menu-open');
      lenis?.start();
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [lenis, onClose]);

  // Close after a route change triggered from inside the menu.
  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
      if (ref.current?.open) ref.current.close();
    }
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      id="site-menu"
      className={styles.dialog}
      aria-label="Site menu"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const focusable = [
          ...(ref.current?.querySelectorAll<HTMLElement>('a[href], button') ??
            []),
        ];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        // Same-page links do not change the route; close explicitly.
        if ((event.target as HTMLElement).closest('a')) ref.current?.close();
      }}
    >
      <div className={styles.inner}>
        <div className={styles.top}>
          <BrandLogo className={styles.label} sizes="96px" />
          <button
            type="button"
            className={styles.close}
            onClick={() => ref.current?.close()}
            autoFocus
          >
            Close
            <span className={styles.closeIcon} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Menu links" className={styles.nav}>
          <ul>
            {items.map((item, index) => (
              <li key={item.href} style={{ '--i': index } as CSSProperties}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.meta}>
          <div>
            <p className="eyebrow">Visit</p>
            <p>
              {business.city}, {business.country}
              <br />
              {business.hours.days}
              <br />
              {business.hours.time}
            </p>
          </div>
          <div>
            <p className="eyebrow">Call</p>
            <ul>
              {business.phones.map((phone) => (
                <li key={phone.tel}>
                  <a href={`tel:${phone.tel}`} className={styles.tel}>
                    {phone.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </dialog>
  );
}
