/**
 * Runs inline in <head> before first paint.
 * - swaps `no-js` for `js` so CSS can stage entrance states only when JS runs;
 * - decides whether the first-visit curtain shows (desktop only, never with
 *   reduced motion);
 * - adds `reveal-failsafe` if the motion layer has not started after 4s, so
 *   staged content can never stay hidden.
 */
export const bootScript = `(function(){var d=document.documentElement;d.classList.remove('no-js');d.classList.add('js');try{var m=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!m&&!sessionStorage.getItem('naplin-curtain')&&location.pathname==='/'&&window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches){d.setAttribute('data-curtain','on')}}catch(e){}setTimeout(function(){if(!d.classList.contains('motion-ready')){d.classList.add('reveal-failsafe');d.removeAttribute('data-curtain')}},4000)})();`;
