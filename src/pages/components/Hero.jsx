import React from 'react';
import { InstagramLogoIcon, GitHubLogoIcon, EnvelopeClosedIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'

const Hero = () => {
    return (
        <section className="hero" id="hero">
            <div className="hero-content">
                <div className="hero-text">
                    <h1 className="display-4 fw-bold">Mehdi Acho</h1>
                    <h2>Software Engineer</h2>
                    <p className="lead mb-4"><i className="fas fa-map-marker-alt me-2"></i>Gaborone, Botswana</p>
                    <div className="social-links">
                        <a href="https://www.linkedin.com/in/mehdi-acho" target="_blank" rel="noopener noreferrer" className="me-3">
                            <LinkedInLogoIcon width="30" height="30" color="white"/>
                        </a>
                        <a href="https://github.com/mehdiacho" target="_blank" rel="noopener noreferrer" className="me-3">
                            <GitHubLogoIcon width="30" height="30" color="white"/>
                        </a>
                        <a href="mailto:mehdiacho@gmail.com" className="me-3">
                            <EnvelopeClosedIcon width="30" height="30" color="white"/>
                        </a>
                        <a href="https://www.instagram.com/darkstarsaint/">
                            <InstagramLogoIcon width="30" height="30" color="white"/>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
