import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import PricingPlans from './components/PricingPlans';
import Phase10LiveTimelineWithAlerts from './components/Phase10LiveTimelineWithAlerts';
import Testimonials from './components/Testimonials';

export default function App() {
  return (
    <>
      <Header />
      <HeroSection />
      <Features />
      <PricingPlans />
      <Phase10LiveTimelineWithAlerts />
      <Testimonials />
    </>
  );
}
