import React from "react";
import Scene from "./Scene";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#3b3a3e] text-white flex justify-center items-center px-8 relative">
      {/* Navigation */}
      <nav className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-10 text-sm font-mono">
        <a
          href="#"
          className="relative after:absolute after:-bottom-1 after:left-0 after:w-10 after:border-b after:border-white after:border-opacity-70"
        >
          Home
        </a>
        <a href="#" className="opacity-70 hover:opacity-100">
          About
        </a>
        <a href="#" className="opacity-70 hover:opacity-100">
          Contact
        </a>
      </nav>

      <div className="max-w-6xl w-full flex justify-between items-center">
        {/* Left Text Content */}
        <div className="flex flex-col justify-center space-y-4">
          <div className="border-l border-[#a78320] border-opacity-75 pl-4">
            <h1 className="text-3xl font-semibold font-sans">Akash Prakash</h1>
            <p className="text-gray-400 text-lg font-sans">Web Developer</p>
          </div>
          <button className="w-max px-5 py-1 rounded-full border border-[#a78320] text-[#a78320] font-semibold text-sm hover:bg-[#a78320] hover:text-black transition">
            Contact
          </button>
        </div>

        {/* Right image */}
        <div className="relative w-[800px] h-[800px]">
     <Scene></Scene>
        </div>
      </div>

      {/* Right Pagination Dots */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
        <span className="w-1 h-6 rounded-full bg-[#a78320]"></span>
        <span className="w-1 h-6 rounded-full border border-white border-opacity-50"></span>
        <span className="w-1 h-6 rounded-full border border-white border-opacity-50"></span>
      </div>

      {/* Bottom View Projects */}
      <div className="absolute bottom-10 left-8 flex items-center space-x-4 font-mono text-sm opacity-90">
        <div className="w-10 border-b border-white border-opacity-70"></div>
        <span>View projects</span>
        <span className="border border-white rounded-full w-7 h-7 flex justify-center items-center text-xs font-semibold">
          1
        </span>
      </div>
    </div>
  );
};

export default Home;