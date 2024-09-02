import React, { useState } from 'react';

function Skills() {
    const [showMore, setShowMore] = useState(false);

    const skillCategories = [
        {
            category: "Programming Languages",
            skills: [
                { name: "Python", level: "Intermediate" },
                { name: "JavaScript", level: "Intermediate" },
                { name: "Java", level: "Intermediate" },
                { name: "C++", level: "Prior experience" },
                { name: "C", level: "Prior experience" },
                { name: "C#", level: "Prior experience" }
            ]
        },
        {
            category: "Web Development",
            skills: ["React.js", "Flutter", "Flask", "Fastify", "Express", "Full-stack development", "Backend development"]
        },
        {
            category: "AI/ML",
            skills: ["AI model integration", "GPT-3.5 Turbo", "Natural Language Processing"]
        },
        {
            category: "Databases & Cloud",
            skills: ["Firebase", "Pinecone"]
        },
        {
            category: "Development Tools",
            skills: ["Git", "Version Control"]
        },
        {
            category: "Other Skills",
            skills: ["Data Structures & Algorithms", "Software Engineering principles", "Project Management"]
        }
    ];

    const initialSkillsToShow = 4;

    return (
        <section className="skills" id="skills">
            <div className="container">
                <h2 className="text-center mb-5">Skills</h2>
                <div className="row">
                    {skillCategories.slice(0, showMore ? skillCategories.length : initialSkillsToShow).map((category, index) => (
                        <div key={index} className="col-md-6 mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h3 className="card-title">{category.category}</h3>
                                    <ul className="list-unstyled">
                                        {category.skills.map((skill, skillIndex) => (
                                            <li key={skillIndex} className="mb-2">
                                                {typeof skill === 'string' ? (
                                                    <span className="badge bg-primary me-2">{skill}</span>
                                                ) : (
                                                    <span>
                                                        <span className="badge bg-primary me-2">{skill.name}</span>
                                                        <small className="text-muted">({skill.level})</small>
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {skillCategories.length > initialSkillsToShow && (
                    <div className="text-center mt-4">
                        <button className="btn btn-primary" onClick={() => setShowMore(!showMore)}>
                            {showMore ? 'Show Less' : 'Show More'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Skills;