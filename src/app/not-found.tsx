import { PageHero } from '@/components/pages/page-hero';
import { Cta } from '@/components/ui/cta';

export default function NotFound() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Page not found"
        title={
          <>
            Lost the <em>thread.</em>
          </>
        }
        lead="This page doesn’t exist. Let’s get you back to the hair."
      >
        <Cta href="/">Back to home</Cta>
        <Cta href="/shop" variant="line">
          Explore the hair
        </Cta>
      </PageHero>
    </main>
  );
}
