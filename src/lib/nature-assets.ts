import heroMobile from '../assets/nature-stories/hero-mobile.png';
import heroDesktop from '../assets/nature-stories/hero-desktop.png';
import journeyMobile from '../assets/nature-stories/journey-mobile.png';
import journeyDesktop from '../assets/nature-stories/journey-desktop.png';
import letterMobile from '../assets/nature-stories/letter-mobile.png';
import letterDesktop from '../assets/nature-stories/letter-desktop.png';
import venueMobile from '../assets/nature-stories/venue-mobile.png';
import venueDesktop from '../assets/nature-stories/venue-desktop.png';
import closingMobile from '../assets/nature-stories/closing-mobile.png';
import closingDesktop from '../assets/nature-stories/closing-desktop.png';
import wishesMobile from '../assets/nature-stories/wishes-mobile-v1.png';
import wishesDesktop from '../assets/nature-stories/wishes-desktop-v1.png';
import haldi from '../assets/nature-stories/event-haldi.png';
import evening from '../assets/nature-stories/event-evening.png';
import wedding from '../assets/nature-stories/event-wedding.png';
export const landscapes = {
  hero: { mobile: heroMobile, desktop: heroDesktop },
  journey: { mobile: journeyMobile, desktop: journeyDesktop },
  letter: { mobile: letterMobile, desktop: letterDesktop },
  venue: { mobile: venueMobile, desktop: venueDesktop },
  closing: { mobile: closingMobile, desktop: closingDesktop },
  wishes: { mobile: wishesMobile, desktop: wishesDesktop },
};
export const natureEvents: Record<string, typeof haldi> = {
  'floral-courtyard': haldi, haldi, 'lantern-garden': evening, mehndi: evening,
  sangeet: evening, 'mandap-courtyard': wedding, varmala: wedding,
};
export const eventFallback = wedding;
