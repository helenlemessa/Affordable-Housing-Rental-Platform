import React from 'react';
import Hero from './Hero';
import { Disc } from 'lucide-react';
 import Discover from './Discover';
import ContactSection from './ContactSection';
import TestimonialsSection from './TestimonialsSection';  
const Home = () => {
  return (
   <div  className="mt-66" >
    
      <Hero />
      <Discover />
      <ContactSection />
      <TestimonialsSection />
      </div>
  );
};

export default Home;