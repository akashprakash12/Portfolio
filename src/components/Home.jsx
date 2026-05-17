import React, { useState, useEffect, useRef, useMemo } from "react";
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

  // Contact form state (name, email, message)
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const containerRef = useRef(null);
  const sectionsRef = useRef([]);

  const roles = [
    "Full-Stack Developer",
    "React & React Native Dev",
    "3D Web Developer",
    "Mobile App Developer",
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
      e.preventDefault();
      if (isScrolling) return;

      setIsScrolling(true);
      if (e.deltaY > 0) {
        scrollToSection(activeSection + 1);
      } else {
        scrollToSection(activeSection - 1);
      }

      setTimeout(() => setIsScrolling(false), 800);
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

    const wheelOpts = { passive: false };
    container.addEventListener("wheel", handleWheel, wheelOpts);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel, wheelOpts);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, isScrolling]);

  const scrollToSection = (index) => {
    if (index < 0 || index >= sectionsRef.current.length) return;

    setActiveSection(index);

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
      tech: ["React", "React Native", "React Three Fiber", "JavaScript", "Expo"],
      level: 90,
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: FiServer,
      name: "Backend",
      tech: ["Node.js", "Django", "Flask", "Python", "REST APIs"],
      level: 80,
      color: "from-green-500/20 to-green-500/5",
    },
    {
      icon: FiDatabase,
      name: "Database",
      tech: ["MongoDB", "MySQL"],
      level: 78,
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: FiFigma,
      name: "Tools",
      tech: ["Git", "Postman", "VS Code", "Figma", "Three.js"],
      level: 85,
      color: "from-pink-500/20 to-pink-500/5",
    },
  ];

  const projects = [
    {
      title: "Swaram – Multimodal Communication App",
      description:
        "React Native app enabling communication through lip reading, sign recognition, and speech synthesis using CNN–LSTM and NLP fusion for people with speech/hearing disabilities.",
      tags: ["React Native", "Expo", "TensorFlow", "Flask", "Python", "MongoDB"],
      type: "ai",
      status: "In Development",
      liveLink: "#",
      githubLink: "https://github.com/akashprakash12/swaramweb",
    },
    {
      title: "IVJourney – IV Management App",
      description:
        "Mobile app for managing college industrial visits — handles scheduling, student registrations, faculty approvals, and visit tracking in one place.",
      tags: ["React Native", "MongoDB", "Expo", "Node.js"],
      type: "mobile",
      status: "Live",
      liveLink: "#",
      githubLink: "https://github.com/akashprakash12/IVJourney",
    },
    {
      title: "Grievance Management System",
      description:
        "Web application for registering, tracking, and resolving public complaints with an admin dashboard for authorities to manage and respond to grievances. Internship project developed for the Idukki Collectorate under the guidance of District Collector V. Vigneshwari, IAS.",
      tags: ["Django", "MySQL", "Python", "HTML/CSS"],
      type: "web",
      status: "Live",
      liveLink: "#",
      githubLink: "https://github.com/akashprakash12/Grivevance_MA",
    },
  ];

  const sceneConfig = useMemo(() => {
    switch (activeSection) {
      case 0:
        return {
          primaryColor: "#f59e0b",
          secondaryColor: "#d97706",
          showGrid: true,
          sceneType: "hero",
        };
      case 1:
        return {
          primaryColor: "#3b82f6",
          secondaryColor: "#1d4ed8",
          showGrid: false,
          sceneType: "about",
        };
      case 2:
        return {
          primaryColor: "#8b5cf6",
          secondaryColor: "#7c3aed",
          showGrid: true,
          sceneType: "skills",
        };
      case 3:
        return {
          primaryColor: "#10b981",
          secondaryColor: "#059669",
          showGrid: false,
          sceneType: "projects",
        };
      case 4:
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
  }, [activeSection]);

  const getSceneConfig = () => sceneConfig;

  // Contact form submit handler — POSTs to backend and falls back to mailto
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: contactName,
      email: contactEmail,
      message: contactMessage,
    };

    const makeMailto = (to, subjectText, bodyText) => {
      const subject = encodeURIComponent(subjectText);
      const body = encodeURIComponent(bodyText);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    };

    try {
      // try relative endpoint first (same origin / proxy), then localhost fallback
      let res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        res = await fetch("http://localhost:4000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.sent) {
          setContactSubmitted(true);
          setContactName("");
          setContactEmail("");
          setContactMessage("");
        } else if (data.subject && data.text) {
          // backend returned prepared mail content (no SMTP configured)
          makeMailto(data.to || "akashprakash7032@gmail.com", data.subject, data.text);
          setContactSubmitted(true);
        } else {
          // unexpected response — fallback to mailto
          const subjectText = `${contactName || "Anonymous"} — Contact Request`;
          const bodyText = `Contact request from ${contactName} <${contactEmail}>.\n\n${contactMessage || ""}`;
          makeMailto("akashprakash7032@gmail.com", subjectText, bodyText);
          setContactSubmitted(true);
        }
      } else {
        // network failure — fallback to mailto
        const subjectText = `${contactName || "Anonymous"} — ${contactProjectType || "Project Inquiry"}`;
        const bodyText = `${contactMessage}\n\n---\nFrom: ${contactName} <${contactEmail}>\nProject type: ${contactProjectType}`;
        makeMailto("akashprakash7032@gmail.com", subjectText, bodyText);
        setContactSubmitted(true);
      }
    } catch (err) {
      // error — fallback to mailto
      const subjectText = `${contactName || "Anonymous"} — Contact Request`;
      const bodyText = `Contact request from ${contactName} <${contactEmail}>.\n\n${contactMessage || ""}`;
      makeMailto("akashprakash7032@gmail.com", subjectText, bodyText);
      setContactSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style>{`.ui-wrapper{pointer-events:none} .ui-wrapper button, .ui-wrapper a, .ui-wrapper input, .ui-wrapper textarea, .ui-wrapper select, .ui-wrapper [role="button"]{pointer-events:auto}`}</style>

      {/* FULL SCREEN BACKGROUND SCENE */}
      <div className="canvas-container fixed inset-0 z-0">
        <Scene {...getSceneConfig()} activeSection={activeSection} />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-black/25 pointer-events-none" />

      {/* Dark overlay for better text visibility */}
      <div className="fixed inset-0 z-10 bg-black/20 pointer-events-none"></div>

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
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/50 shadow-lg">
                <img src="/akash.png" alt="Akash" className="w-full h-full object-cover object-top" />
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
      <div style={{ mixBlendMode: "normal" }} className="ui-wrapper relative z-20">
        <div
          ref={containerRef}
          className="flex overflow-x-auto snap-x snap-mandatory h-screen scrollbar-hide relative z-10 pointer-events-none"
          style={{ scrollBehavior: "smooth" }}
        >

          {/* ───────────────────────────────────────────
              Section 1: Hero
          ─────────────────────────────────────────── */}
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
                  className="space-y-4 relative z-40"
                >
                  {/* Profile Picture — 50×50 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative">
                      {/* Spinning amber ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-[2px] rounded-full"
                        style={{
                          background: "conic-gradient(from 0deg, #f59e0b, #d97706, transparent, #f59e0b)",
                          borderRadius: "9999px",
                        }}
                      />
                      {/* Glow */}
                      <div className="absolute -inset-2 rounded-full bg-amber-500/15 blur-md" />
                      {/* Image — exactly 50×50 */}
                      <div className="relative w-52 h-52 rounded-full overflow-hidden border-2 border-amber-500/60 shadow-lg shadow-amber-500/20">
                        <img
                          src="/akash.png"
                          alt="Akash"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      {/* Online dot */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-black animate-pulse" />
                    </div>
                    {/* Available badge */}
                
                  </motion.div>

                

                  {/* Main Greeting */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-shadow-xl"
                  >
                    Hello, I'm <br />
                    <span className="text-amber-400 font-bold">AKASH</span>
                  </motion.h1>

                  {/* Animated Typing Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="h-10"
                  >
                    <div className="text-base md:text-lg font-semibold text-shadow">
                      <span className="text-gray-200">I'm a </span>
                      <span className="text-amber-400 font-bold">{text}</span>
                      <span className="inline-block w-[3px] h-5 bg-amber-500 ml-1 animate-blink"></span>
                    </div>
                  </motion.div>

                  {/* Short Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm md:text-base text-gray-300 max-w-sm leading-relaxed text-shadow"
                  >
                    I craft immersive digital experiences by blending cutting-edge
                    technology with elegant design. Passionate about solving
                    complex problems and building scalable solutions.
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    <button
                      onClick={() => scrollToSection(4)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 flex items-center text-sm shadow-lg shadow-amber-500/25"
                    >
                      <FiMail className="mr-2" size={16} />
                      Start a Conversation
                    </button>
                    <a
                      href="/AkashPrakash_CV.pdf"
                      download="AkashPrakash_CV.pdf"
                      className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:border-amber-500 hover:text-amber-400 transition-all duration-300 transform hover:scale-105 flex items-center text-sm"
                    >
                      <FiDownload className="mr-2" size={16} />
                      Download Resume
                    </a>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="flex space-x-3 pt-2"
                  >
                    <a
                      href="https://github.com/akashprakash12"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
                      aria-label="GitHub"
                    >
                      <FiGithub size={18} className="group-hover:text-amber-400" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/akash-prakash-/?skipRedirect=true"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:rotate-12 group"
                      aria-label="LinkedIn"
                    >
                      <FiLinkedin size={18} className="group-hover:text-amber-400" />
                    </a>
                  </motion.div>
                </motion.div>

                {/* Right side — empty for layout balance */}
                <div className="hidden lg:block"></div>
              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────
              Section 2: About  ← content now on RIGHT
          ─────────────────────────────────────────── */}
          <section
            ref={(el) => (sectionsRef.current[1] = el)}
            className="min-w-full h-screen flex items-center justify-center px-6 md:px-8 snap-center relative z-20"
          >
            <div className="container mx-auto max-w-7xl relative z-30">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* Left side — empty so mushroom (in background left) has space */}
                <div className="hidden lg:block"></div>

                {/* Right Content ✅ */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
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
                    I'm a passionate Computer Science student and full-stack developer
                    specialising in React, React Native, and 3D web experiences with
                    Three.js. I love building immersive, scalable applications that
                    solve real problems — from AI-powered communication tools to
                    mobile-first platforms.
                  </p>

                  <div className="space-y-6 pt-4">
                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-blue-500/50 transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                        <FiMapPin className="text-blue-400" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 text-white">Based in</h4>
                        <p className="text-gray-300">Idukki, Kerala, India</p>
                        <p className="text-sm text-gray-400 mt-1">Open to remote opportunities</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-green-500/50 transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="text-green-400" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 text-white">Education</h4>
                        <p className="text-gray-300">B.Tech Computer Science – APJ Abdul Kalam TU</p>
                        <p className="text-sm text-gray-400 mt-1">2023–2026 · CGPA: 6.4 / 10</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-amber-500/50 transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent flex items-center justify-center flex-shrink-0">
                        <FiAward className="text-amber-400" size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 text-white">Specialisation</h4>
                        <p className="text-gray-300">React · React Native · Three.js · Full-Stack</p>
                        <p className="text-sm text-gray-400 mt-1">MERN Stack · 3D Web · Mobile Dev</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* ───────────────────────────────────────────
              Section 3: Skills
          ─────────────────────────────────────────── */}
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

          {/* ───────────────────────────────────────────
              Section 4: Projects
          ─────────────────────────────────────────── */}
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

          {/* ───────────────────────────────────────────
              Section 5: Contact
          ─────────────────────────────────────────── */}
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
                        <p className="text-gray-300">akashprakash7032@gmail.com</p>
                        <p className="text-sm text-gray-400 mt-1">Typically replies within 24 hours</p>
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
                        <p className="text-gray-300">github.com/akashprakash12</p>
                        <p className="text-sm text-gray-400 mt-1">Check out my open-source work</p>
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
                        <p className="text-gray-300">https://www.linkedin.com/in/akash-prakash-/?skipRedirect=true</p>
                        <p className="text-sm text-gray-400 mt-1">Let's connect professionally</p>
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
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
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
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 placeholder-gray-500 text-gray-200"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Message
                      </label>
                      <textarea
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-pink-500 focus:bg-white/20 focus:outline-none transition-all duration-300 resize-none placeholder-gray-500 text-gray-200"
                        placeholder="Write a quick message or details..."
                      />
                    </div>
                    {/* Simplified form: only name and email required. Message and project type removed. */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-black font-bold rounded-xl hover:from-pink-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-pink-500/25"
                    >
                      <FiMail className="inline mr-2" />
                      Send Message
                    </motion.button>
                    {contactSubmitted && (
                      <p className="text-center text-sm text-green-400 pt-4">
                        Thanks — I'll get back to you within 24 hours.
                      </p>
                    )}
                    <p className="text-center text-sm text-gray-400 pt-4">
                      I'll get back to you within 24 hours
                    </p>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;