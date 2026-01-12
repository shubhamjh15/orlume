"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

// Register GSAP TextPlugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin);
}

const timelineSteps = [
  { text: "Spinning up the project", duration: 8 },
  { text: "Installing dependencies", duration: 9 },
  { text: "Agents started working", duration: 8 },
  { text: "Understanding the context", duration: 7 },
  { text: "Designing the layout", duration: 8 },
  { text: "Generating the page structure", duration: 8 },
  { text: "Optimizing responsiveness", duration: 8 },
  { text: "Refining UI decisions", duration: 7 },
  { text: "Creating components", duration: 0 }, // Final State
];

export default function Loader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hourglassRef = useRef<HTMLDivElement>(null);
  const butterflyRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- 1. Icon Animations ---
      
      // Hourglass
      gsap.to(hourglassRef.current, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: "elastic.inOut(1, 0.75)",
        transformOrigin: "center center",
      });

      // Butterfly
      gsap.to(butterflyRef.current, {
        rotationY: 360,
        duration: 2.5,
        repeat: -1,
        ease: "slow(0.7, 0.7, false)",
        transformOrigin: "center center",
      });

      // Star
      const starTl = gsap.timeline({ repeat: -1 });
      gsap.to(starRef.current, {
        rotation: -360,
        duration: 6,
        repeat: -1,
        ease: "linear",
        transformOrigin: "center center",
      });
      gsap.to(starRef.current, {
        scale: 0.7,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // --- 2. Cursor Blink ---
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // --- 3. Typewriter Logic ---
      let currentIndex = 0;

      const playStep = () => {
        if (!textRef.current) return;

        const step = timelineSteps[currentIndex];
        const isLastStep = currentIndex === timelineSteps.length - 1;

        const tl = gsap.timeline();
        const typeSpeed = step.text.length * 0.05;

        // Type In
        tl.to(textRef.current, {
          text: { value: step.text, delimiter: "" },
          duration: typeSpeed,
          ease: "none",
        });

        if (!isLastStep) {
          // Wait
          tl.to({}, { duration: step.duration });

          // Delete
          tl.to(textRef.current, {
            text: { value: "" },
            duration: 0.5,
            ease: "none",
            onComplete: () => {
              currentIndex++;
              playStep();
            },
          });
        } else {
          console.log("Sequence complete.");
        }
      };

      // Start the sequence
      playStep();

    }, containerRef); // Scope GSAP to this component

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full bg-[#0b0b0b] overflow-hidden font-sans text-white m-0"
    >
      {/* SVG Gradient Definition (Hidden) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9a9e" stopOpacity="1" />
            <stop offset="50%" stopColor="#fecfef" stopOpacity="1" />
            <stop offset="100%" stopColor="#4facfe" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Icons Container */}
      {/* Gap is 80px, Bottom Margin is 35px */}
      <div className="flex gap-[80px] mb-[35px] scale-75 md:scale-100 transition-transform">
        
        {/* 1. Hourglass */}
        <div
          ref={hourglassRef}
          className="w-[60px] h-[60px] drop-shadow-[0_0_10px_rgba(130,233,255,0.3)]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path fill="url(#mainGradient)" d="M20,20 L80,20 L50,50 Z" />
            <path fill="url(#mainGradient)" d="M20,80 L80,80 L50,50 Z" />
          </svg>
        </div>

        {/* 2. Butterfly */}
        <div
          ref={butterflyRef}
          className="w-[60px] h-[60px] drop-shadow-[0_0_10px_rgba(130,233,255,0.3)]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path
              fill="url(#mainGradient)"
              d="M50,50 C20,20 0,20 0,50 C0,80 20,80 50,50 Z"
            />
            <path
              fill="url(#mainGradient)"
              d="M50,50 C80,20 100,20 100,50 C100,80 80,80 50,50 Z"
            />
          </svg>
        </div>

        {/* 3. Star */}
        <div
          ref={starRef}
          className="w-[60px] h-[60px] drop-shadow-[0_0_10px_rgba(130,233,255,0.3)]"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <path
              fill="url(#mainGradient)"
              d="M50,0 C60,40 60,40 100,50 C60,60 60,60 50,100 C40,60 40,60 0,50 C40,40 40,40 50,0 Z"
            />
          </svg>
        </div>
      </div>

      {/* Text Container */}
      <div className="flex justify-center items-center h-[20px] min-w-[300px]">
        <span
          ref={textRef}
          className="text-[14px] text-[#888888] tracking-[0.5px] font-normal whitespace-nowrap"
        ></span>
        <span
          ref={cursorRef}
          className="inline-block w-[2px] h-[16px] bg-[#888888] ml-[2px] align-middle opacity-100"
        ></span>
      </div>
    </div>
  );
}
