import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Footer from './components/Footer';

function Portfolio() {
    return (
        <div className="portfolio container-fluid min-vh-100 p-0">
            <Navbar />
            <Hero />
            <AboutMe />
            <Skills />
            <Projects />
            <Footer />
        </div>
    );
}

export default Portfolio;
