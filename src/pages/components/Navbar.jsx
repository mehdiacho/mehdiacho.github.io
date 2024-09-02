import React from 'react';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-sm sticky-top" id="navbar">
            <div className="container-fluid">
                <div className="navbar-header">
                    <a className="navbar-brand active" id="name-title" href="#hero">Mehdi Acho</a>
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarBtns">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarBtns">
                    <ul className="nav navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link active" href="#about-me">About Me</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#skills">Skills</a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#projects" role="button" data-bs-toggle="dropdown">Projects</a>
                            <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#nightly">Nightly</a></li>
                                <li><a className="dropdown-item" href="#farmer-reg">Farmer Registration System</a></li>
                                <li><a className="dropdown-item" href="#hackfest">Biust Hackfest 2022</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
