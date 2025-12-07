import React, { useState, useEffect, useRef } from "react";
import Scene from "./Scene";
import {
  FiMenu,
  FiX,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiCode,
  FiServer,
  FiDatabase,
  FiExternalLink,
  FiFigma,
  FiDownload,
  FiAward,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiBriefcase,
  FiLayers,
  FiMessageSquare,
} from "react-icons/fi";
import { motion } from "framer-motion";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  const roles = [
    "Full-Stack Developer",
    "UI/UX Designer",
    "Problem Solver",
    "Tech Innovator",
  ];

  // Typing animation effect
  useEffect(() => {
    const handleType = () => {
      const currentRole = roles[loopNum % roles.length];
      const updatedText = isDeleting
        ? currentRole.substring(0, text.length - 1)
        : currentRole.substring(0, text.length + 1);

      setText(updatedText);

      if (!isDeleting && updatedText === currentRole) {
        setTimeout(() => setIsDeleting(true), 1500);
        setTypingSpeed(100);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(150);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum]);

  // Handle horizontal scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (isScrolling) return;

      setIsScrolling(true);
      if (e.deltaY > 0) {
        scrollToSection(activeSection + 1);
      } else {
        scrollToSection(activeSection - 1);
      }

      setTimeout(() => setIsScrolling(false), 1000);
    };

    const handleKeyDown = (e) => {
      if (isScrolling) return;

      if (e.key === "ArrowRight") {
        setIsScrolling(true);
        scrollToSection(activeSection + 1);
        setTimeout(() => setIsScrolling(false), 1000);
      } else if (e.key === "ArrowLeft") {
        setIsScrolling(true);
        scrollToSection(activeSection - 1);
        setTimeout(() => setIsScrolling(false), 1000);
      }
    };

    container.addEventListener("wheel", handleWheel);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, isScrolling]);

  const scrollToSection = (index) => {
    if (index < 0 || index >= sectionsRef.current.length) return;

    setActiveSection(index);
    setSceneKey(index);

    const section = sectionsRef.current[index];
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  const navItems = [
    { name: "Home", index: 0, icon: FiUser },
    { name: "About", index: 1, icon: FiBriefcase },
    { name: "Skills", index: 2, icon: FiLayers },
    { name: "Projects", index: 3, icon: FiCode },
    { name: "Contact", index: 4, icon: FiMessageSquare },
  ];

  const skills = [
    {
      icon: FiCode,
      name: "Frontend",
      tech: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
      level: 95,
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: FiServer,
      name: "Backend",
      tech: ["Node.js", "Express", "Python", "FastAPI", "REST"],
      level: 90,
      color: "from-green-500/20 to-green-500/5",
    },
    {
      icon: FiDatabase,
      name: "Database",
      tech: ["MongoDB", "PostgreSQL", "Redis", "Firebase"],
      level: 85,
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: FiFigma,
      name: "Design",
      tech: ["Figma", "Adobe XD", "UI/UX", "Prototyping"],
      level: 80,
      color: "from-pink-500/20 to-pink-500/5",
    },
  ];

  const projects = [
    {
      title: "E-Commerce Platform",
      description:
        "A modern full-stack e-commerce solution with real-time inventory, payment processing, and admin dashboard. Built with microservices architecture.",
      tags: ["React", "Node.js", "MongoDB", "Stripe", "Redis"],
      type: "web",
      status: "Live",
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "Task Management App",
      description:
        "Collaborative project management tool with real-time updates, AI task suggestions, and advanced reporting features.",
      tags: ["Next.js", "TypeScript", "Socket.io", "OpenAI", "Prisma"],
      type: "web",
      status: "In Development",
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "AI Content Generator",
      description:
        "Platform for AI-powered content creation with multiple templates, tone customization, and SEO optimization features.",
      tags: ["Python", "FastAPI", "React", "OpenAI", "PostgreSQL"],
      type: "ai",
      status: "Live",
      liveLink: "#",
      githubLink: "#",
    },
  ];

  const getSceneConfig = () => {
    switch (activeSection) {
      case 0: // Home
        return {
          primaryColor: "#f59e0b",
          secondaryColor: "#d97706",
          showGrid: true,
          sceneType: "hero",
        };
      case 1: // About
        return {
          primaryColor: "#3b82f6",
          secondaryColor: "#1d4ed8",
          showGrid: false,
          sceneType: "about",
        };
      case 2: // Skills
        return {
          primaryColor: "#8b5cf6",
          secondaryColor: "#7c3aed",
          showGrid: true,
          sceneType: "skills",
        };
      case 3: // Projects
        return {
          primaryColor: "#10b981",
          secondaryColor: "#059669",
          showGrid: false,
          sceneType: "projects",
        };
      case 4: // Contact
        return {
          primaryColor: "#ec4899",
          secondaryColor: "#db2777",
          showGrid: true,
          sceneType: "contact",
        };
      default:
        return {
          primaryColor: "#f59e0b",
          secondaryColor: "#d97706",
          showGrid: true,
          sceneType: "hero",
        };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* FULL SCREEN BACKGROUND SCENE */}
      <div className="fixed inset-0 z-0">
        <Scene key={sceneKey} {...getSceneConfig()} />
      </div>

      {/* Dark overlay for better text visibility */}
      <div className="fixed inset-0 z-1 bg-gradient-to-r from-black/80 via-black/60 to-transparent pointer-events-none"></div>

      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4">
        {navItems.map((item, index) => (
          <button
            key={item.name}
            onClick={() => scrollToSection(index)}
            className={`flex items-center justify-center rounded-full transition-all duration-300 group ${
              activeSection === index
                ? "w-12 h-12 bg-amber-500/20 border border-amber-500/50"
                : "w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20"
            }`}
            aria-label={`Go to ${item.name}`}
          >
            <item.icon
              className={
                activeSection === index
                  ? "text-amber-400"
                  : "text-white/60 group-hover:text-white"
              }
            />
          </button>
        ))}
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
                <span className="font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
                AKASH
              </span>
            </div>
            <button
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pb-4"
            >
              <div className="flex flex-col space-y-2 bg-black/90 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.index);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 rounded-lg text-left transition-all ${
                      activeSection === item.index
                        ? "bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border border-amber-500/30"
                        : "text-gray-200 hover:text-amber-400 hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="mr-3" />
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Horizontal Container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory h-screen scrollbar-hide relative z-10"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Section 1: Hero */}
        <section
          ref={(el) => (sectionsRef.current[0] = el)}
          className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
        >
          <div className="container mx-auto max-w-7xl relative z-30">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 relative z-40"
              >
                {/* Welcome Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/30 backdrop-blur-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-200">
                    Welcome to my digital space
                  </span>
                </motion.div>

                {/* Main Greeting */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-shadow-xl"
                >
                  Hello, I'm <br />
                  <span className="bg-clip-text text-amber-400 font-bold">
                    AKASH
                  </span>
                </motion.h1>

                {/* Animated Typing Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="h-20"
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-semibold text-shadow">
                    <span className="text-gray-200">I'm a </span>
                    <span className="text-amber-400 font-bold">{text}</span>
                    <span className="inline-block w-[4px] h-12 bg-amber-500 ml-1 animate-blink"></span>
                  </div>
                </motion.div>

                {/* Short Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed text-shadow"
                >
                  I craft immersive digital experiences by blending cutting-edge
                  technology with elegant design. Passionate about solving
                  complex problems and building scalable solutions that make a
                  real impact.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap gap-4 pt-6"
                >
                  <button
                    onClick={() => scrollToSection(4)}
                    className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-amber-500/25"
                  >
                    <FiMail className="mr-2" size={20} />
                    Start a Conversation
                  </button>
                  <a
                    href="#"
                    className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-amber-500 hover:text-amber-400 transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <FiDownload className="mr-2" size={20} />
                    Download Resume
                  </a>
                </motion.div>

                {/* Social Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex space-x-4 pt-8"
                >
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
                    aria-label="GitHub"
                  >
                    <FiGithub
                      size={22}
                      className="group-hover:text-amber-400"
                    />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
                    aria-label="LinkedIn"
                  >
                    <FiLinkedin
                      size={22}
                      className="group-hover:text-amber-400"
                    />
                  </a>
                </motion.div>
              </motion.div>

              {/* Right side - Empty for layout balance (Scene is in background) */}
              <div className="hidden lg:block"></div>
            </div>
          </div>
        </section>

        {/* Section 2: About */}
        <section
          ref={(el) => (sectionsRef.current[1] = el)}
          className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
        >
          <div className="container mx-auto max-w-7xl relative z-30">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8 relative z-40"
              >
                <div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/30 backdrop-blur-sm mb-6">
                    <span className="text-sm font-medium text-gray-200">
                      About Me
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-xl">
                    My <span className="text-blue-400">Journey</span>
                  </h2>
                </div>

                <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-shadow">
                  With over 3 years of experience in full-stack development,
                  I've had the privilege of working on diverse projects ranging
                  from enterprise-scale applications to innovative startup
                  products. My approach combines technical excellence with
                  user-centered design.
                </p>

                <div className="space-y-6 pt-4">
                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">
                        Based in
                      </h4>
                      <p className="text-gray-300">
                        San Francisco Bay Area, CA
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Working remotely with global teams
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-green-500/50 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">
                        Experience
                      </h4>
                      <p className="text-gray-300">
                        3+ years in web development
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        15+ successful projects delivered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-amber-500/50 transition-all duration-300">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiAward className="text-amber-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 text-white">
                        Specialization
                      </h4>
                      <p className="text-gray-300">
                        Full-Stack Development & UI/UX Design
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Focus on React ecosystem & modern design systems
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right side - Empty for layout balance */}
              <div className="hidden lg:block"></div>
            </div>
          </div>
        </section>

        {/* Section 3: Skills */}
        <section
          ref={(el) => (sectionsRef.current[2] = el)}
          className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
        >
          <div className="container mx-auto max-w-7xl relative z-30">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-transparent border border-purple-500/30 backdrop-blur-sm mb-6"
              >
                <span className="text-sm font-medium text-gray-200">
                  Technical Expertise
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-xl"
              >
                My <span className="text-purple-400">Skills</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto text-shadow"
              >
                A comprehensive toolkit for building modern, scalable, and
                performant web applications
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-40">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${skill.color} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group`}
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <skill.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-white transition-colors text-white">
                    {skill.name}
                  </h3>

                  {/* Skill Level Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Proficiency</span>
                      <span className="font-bold">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.1 + 0.3,
                          duration: 1,
                          ease: "easeOut",
                        }}
                        className="h-full bg-gradient-to-r from-white to-white/80 rounded-full"
                      ></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skill.tech.map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: techIndex * 0.05 + index * 0.1 }}
                        className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-colors cursor-default text-gray-200"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Projects */}
        <section
          ref={(el) => (sectionsRef.current[3] = el)}
          className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
        >
          <div className="container mx-auto max-w-7xl relative z-30">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30 backdrop-blur-sm mb-6"
              >
                <span className="text-sm font-medium text-gray-200">
                  Portfolio Showcase
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-xl"
              >
                Featured <span className="text-green-400">Projects</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto text-shadow"
              >
                A selection of projects that demonstrate my technical
                capabilities and creative approach
              </motion.p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 relative z-40">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, rotateY: -10 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, type: "spring" }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm border border-white/20 group-hover:border-green-500/50 transition-all duration-300 h-full">
                    {/* Project Type Badge */}
                    <div className="absolute -top-3 left-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          project.type === "ai"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {project.type === "ai" ? "AI/ML" : "Web Application"}
                      </span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            project.status === "Live"
                              ? "bg-green-500 animate-pulse"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-400">
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors text-white">
                      {project.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs hover:bg-white/20 transition-colors cursor-default text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-white/20">
                      <a
                        href={project.liveLink}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-black font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-300 text-center flex items-center justify-center"
                      >
                        <FiExternalLink className="mr-2" />
                        Live Demo
                      </a>
                      <a
                        href={project.githubLink}
                        className="flex-1 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all duration-300 text-center flex items-center justify-center text-gray-200"
                      >
                        <FiGithub className="mr-2" />
                        View Code
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Contact */}
        <section
          ref={(el) => (sectionsRef.current[4] = el)}
          className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
        >
          <div className="container mx-auto max-w-7xl relative z-30">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8 relative z-40"
              >
                <div>
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-transparent border border-pink-500/30 backdrop-blur-sm mb-6">
                    <span className="text-sm font-medium text-gray-200">
                      Let's Connect
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-shadow-xl">
                    Get In <span className="text-pink-400">Touch</span>
                  </h2>
                </div>

                <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-shadow">
                  I'm currently available for freelance work and interesting
                  opportunities. Whether you have a project in mind or just want
                  to say hello, I'd love to hear from you.
                </p>

                <div className="space-y-6 pt-4">
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-pink-500/50 transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiMail className="text-pink-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white">Email</h4>
                      <p className="text-gray-300">hello@akash.dev</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Typically replies within 24 hours
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiGithub className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white">GitHub</h4>
                      <p className="text-gray-300">github.com/akash</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Check out my open-source work
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-green-500/50 transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                      <FiLinkedin className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white">LinkedIn</h4>
                      <p className="text-gray-300">linkedin.com/in/akash</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Let's connect professionally
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/20 shadow-2xl relative z-40"
              >
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-500 text-gray-200"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-500 text-gray-200"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Type
                    </label>
                    <select className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 text-gray-200">
                      <option value="" className="bg-gray-900">
                        Select a project type
                      </option>
                      <option value="web" className="bg-gray-900">
                        Web Development
                      </option>
                      <option value="mobile" className="bg-gray-900">
                        Mobile App
                      </option>
                      <option value="design" className="bg-gray-900">
                        UI/UX Design
                      </option>
                      <option value="consulting" className="bg-gray-900">
                        Technical Consulting
                      </option>
                      <option value="other" className="bg-gray-900">
                        Other
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 resize-none placeholder-gray-500 text-gray-200"
                      placeholder="Tell me about your project, timeline, and budget..."
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-black font-bold rounded-xl hover:from-pink-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-pink-500/25"
                  >
                    <FiMail className="inline mr-2" />
                    Send Message
                  </motion.button>
                  <p className="text-center text-sm text-gray-400 pt-4">
                    I'll get back to you within 24 hours
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;