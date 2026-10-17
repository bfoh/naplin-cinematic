'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { bookLink, navigation } from '@/content/site';
import { BrandLogo } from '@/components/ui/brand-logo';
import { MenuDialog } from './menu-dialog';
import styles from './header.module.css';

const isActive = (pathname: string, href: string) =>
  href === '/'
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (y < window.innerHeight * 0.85) setHidden(false);
      else if (y > lastY + 6) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const className = [
    styles.header,
    scrolled ? styles.scrolled : '',
    hidden && !menuOpen ? styles.hidden : '',
  ].join(' ');

  return (
    <header className={className}>
      <div className={styles.bar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Hair By Naplin — home"
        >
          <BrandLogo
            className={styles.label}
            eager
            sizes="(min-width: 768px) 180px, 120px"
          />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.navLink}
                  aria-current={
                    isActive(pathname, item.href) ? 'page' : undefined
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <Link
            href={bookLink.href}
            className={styles.book}
            aria-current={
              isActive(pathname, bookLink.href) ? 'page' : undefined
            }
          >
            <span className={styles.bookShort}>Book</span>
            <span className={styles.bookLong}>Book an appointment</span>
          </Link>
          <button
            ref={menuButton}
            type="button"
            className={styles.menuButton}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span className={styles.menuText}>Menu</span>
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <MenuDialog
        open={menuOpen}
        pathname={pathname}
        onClose={() => {
          setMenuOpen(false);
          menuButton.current?.focus();
        }}
      />
    </header>
  );
}
