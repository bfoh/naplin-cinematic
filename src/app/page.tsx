import { Hero } from '@/components/hero/hero';
import { AcademyFeature } from '@/components/home/academy-feature';
import { Chapters } from '@/components/home/chapters';
import { Closing } from '@/components/home/closing';
import { Confidence } from '@/components/home/confidence';
import { Flow } from '@/components/home/flow';
import { HairEdit } from '@/components/home/hair-edit';
import { Marquee } from '@/components/home/marquee';
import { Pillars } from '@/components/home/pillars';
import { Salon } from '@/components/home/salon';
import { Story } from '@/components/home/story';
import { marquee } from '@/content/site';

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Marquee items={marquee} />
      <Chapters />
      <Flow />
      <HairEdit />
      <Confidence />
      <Salon />
      <AcademyFeature />
      <Story />
      <Pillars />
      <Closing />
    </main>
  );
}
