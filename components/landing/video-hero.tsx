"use client";

import React, { useState, useRef, useEffect } from 'react';

export function VideoHero() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const videoRefs = [
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null),
    useRef<HTMLVideoElement>(null)
  ];

  const videos = [
    "/videos/scene-1.mp4",
    "/videos/scene-2.mp4",
    "/videos/scene-3.mp4"
  ];

  useEffect(() => {
    // Attempt to play the current video whenever the index changes
    const currentVideo = videoRefs[currentVideoIndex].current;
    if (currentVideo) {
      currentVideo.currentTime = 0;
      currentVideo.play().catch(e => console.log("Autoplay blocked:", e));
    }

    // Pause others to save resources
    videoRefs.forEach((ref, index) => {
      if (index !== currentVideoIndex && ref.current) {
        ref.current.pause();
      }
    });
  }, [currentVideoIndex]);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className="relative w-full aspect-video bg-[#18181B]">
      {videos.map((src, index) => (
        <video
          key={src}
          ref={videoRefs[index]}
          src={src}
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            currentVideoIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      
      {/* Subtle overlay for better blending with the dark theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent pointer-events-none opacity-60"></div>
    </div>
  );
}
