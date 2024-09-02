import React from 'react';

const AboutMe = () => {
    return (
        <section className="about-me container-fluid min-vh-100 d-flex align-items-center" id="about-me">
            <div className="">
                <h2 className="text-center mb-5">About Me</h2>
                <div className="row">
                    <div className="col-md-8 mx-auto">
                        <h3>About Me</h3>
                        <p className="lead">
                            I'm Mehdi Acho, a Software Engineer and AI enthusiast based in Gaborone, Botswana. With a strong foundation in Computer Science and Software Engineering, I'm passionate about leveraging technology to solve complex problems.
                        </p>

                        <h4>What I Do</h4>
                        <ul className="lead">
                            <li><strong>Full-Stack Development</strong>: I build robust web applications using React.js, Flask, and Express, ensuring seamless user experiences and efficient backend operations.</li>
                            <li><strong>AI Integration</strong>: I specialize in incorporating AI models into web applications, enhancing functionality and user engagement.</li>
                            <li><strong>Mobile Development</strong>: I create cross-platform mobile apps using Flutter, expanding digital reach across devices.</li>
                        </ul>

                        <h4>My Journey</h4>
                        <p className="lead">
                            Currently completing my Bachelor's degree at Botswana International University of Science and Technology, I've already gained valuable industry experience through my internship at Spectrum Analytics. There, I led AI integration projects and collaborated with cross-functional teams to deliver high-quality solutions.
                        </p>

                        <h4>What Drives Me</h4>
                        <p className="lead">
                            I'm constantly seeking to push the boundaries of what's possible with software and AI. My goal is to pursue a master's in Artificial Intelligence, deepening my expertise and contributing to cutting-edge research in the field.
                        </p>

                        <h4>Let's Connect</h4>
                        <p className="lead">
                            Whether you're interested in collaboration, have a project in mind, or just want to chat about the latest in tech, I'd love to hear from you. Check out my projects or reach out via <a href="https://linkedin.com/in/mehdi-acho/" target="_blank" rel="noopener noreferrer">LinkedIn</a> or <a href="https://github.com/mehdiacho" target="_blank" rel="noopener noreferrer">GitHub</a>.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
