import { useEffect } from 'react';
import { BookingProvider } from './BookingContext';
import BookCall from './components/BookCall';
import ClientMarquee from './components/ClientMarquee';
import Craft from './components/Craft';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Process from './components/Process';
import Stories from './components/Stories';
import Studio from './components/Studio';
import Work from './components/Work';
import { getMotion, siteConfig } from './siteConfig';

export default function App() {
  // Push the chosen motion preset into CSS so the reveal transitions match.
  useEffect(() => {
    const { distance, duration } = getMotion();
    const root = document.documentElement;
    root.style.setProperty('--mm-reveal-distance', `${distance}px`);
    root.style.setProperty('--mm-reveal-duration', `${duration}s`);
  }, []);

  return (
    <BookingProvider>
      {siteConfig.showIntro ? <Intro /> : null}
      <Nav />
      <main>
        <Hero />
        <ClientMarquee />
        <Craft />
        <Work />
        <Process />
        <Studio />
        <Stories />
        <BookCall />
      </main>
      <Footer />
    </BookingProvider>
  );
}
