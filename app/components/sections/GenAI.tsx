"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { splitCmsTextToParagraphs } from "@/app/lib/split-cms-text-to-paragraphs";
import { SECTION_HEADING_CENTER_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function splitGenAiHeading(value: string): string[] {
  const explicitLines = value
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (explicitLines.length > 1) return explicitLines;

  const words = value.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length < 3) return explicitLines;

  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

interface GenAIProps {
  heading?: string;
  paragraph?: string;
  videoSrc?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function GenAI({ heading, paragraph, videoSrc, ctaText, ctaLink }: GenAIProps = {}) {
  const router = useRouter();
  const src = videoSrc?.trim() || "";
  const headingText = heading?.trim() || "";
  const paragraphText = paragraph?.trim() || "";

  if (!src && !headingText && !paragraphText) return null;
  const headingLines = splitGenAiHeading(headingText);
  const paragraphBlocks = splitCmsTextToParagraphs(paragraphText);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCtaClick = () => {
    const link = ctaLink?.trim();
    if (!link) return;
    if (/^https?:\/\//i.test(link)) {
      window.location.assign(link);
      return;
    }
    router.push(link);
  };

  // Video playback synced with scroll progress
  useEffect(() => {
    if (!src) return;

    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video) return;

    // iOS-specific setup
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('playsinline', 'true');
    
    // Ensure video is visible on iOS
    video.style.display = 'block';
    video.style.visibility = 'visible';
    video.style.opacity = '1';

    // Pause video initially - we'll control it with scroll
    video.pause();
    video.currentTime = 0;

    let trigger: ScrollTrigger | undefined;
    let isSetup = false;

    // Track when video reaches end during forward play
    let hasPlayedForward = false; // Track if video has played forward once
    const handleTimeUpdate = () => {
      if (!hasPlayedForward && video.currentTime >= video.duration - 0.1) {
        video.pause();
        video.currentTime = video.duration;
        hasPlayedForward = true;
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Wait for video to be fully ready before setting up ScrollTrigger
    const setupScrollSync = () => {
      // Prevent multiple setups
      if (isSetup) return;
      
      const videoDuration = video.duration;
      if (!videoDuration || isNaN(videoDuration) || videoDuration === 0) {
        // If duration not ready, try again after a short delay
        setTimeout(setupScrollSync, 100);
        return;
      }

      // Ensure video is at start
      video.currentTime = 0;
      video.pause();
      hasPlayedForward = false; // Reset flag

      // Create ScrollTrigger - forward plays once, reverse scrubs
      let lastProgress = 0;
      
      trigger = ScrollTrigger.create({
        trigger: section,
        start: "center center", // Start when section center is at viewport center
        end: "bottom top", // End when section bottom reaches viewport top
        onUpdate: (self) => {
          const currentProgress = self.progress;
          const videoDuration = video.duration;
          
          // Detect scroll direction
          if (currentProgress > lastProgress) {
            // Forward scroll - play video only once
            if (!hasPlayedForward) {
              // Start playing from beginning if not started
              if (video.currentTime === 0 && video.paused) {
                video.play().catch((err) => {
                  console.log("Video play error:", err);
                });
              }
              // Let video play naturally - don't scrub
            } else {
              // Already played once, keep at end
              if (video.currentTime < videoDuration - 0.1) {
                video.pause();
                video.currentTime = videoDuration;
              }
            }
          } else if (currentProgress < lastProgress) {
            // Reverse scroll - scrub video based on progress (only if forward has played)
            if (hasPlayedForward) {
              const targetTime = currentProgress * videoDuration;
              
              // Sync video time with scroll progress (reverse scrubbing)
              if (Math.abs(video.currentTime - targetTime) > 0.05) {
                video.currentTime = targetTime;
              }
              
              // Keep video paused during reverse scrub
              if (!video.paused) {
                video.pause();
              }
            }
          }
          
          lastProgress = currentProgress;
        },
        onEnter: () => {
          // Forward scroll - reset and start playing
          if (!hasPlayedForward) {
            video.playbackRate = 1;
            video.currentTime = 0;
            video.play().catch((err) => {
              console.log("Video play error:", err);
            });
          }
        },
        onEnterBack: () => {
          // Reverse scroll - start scrubbing from end (only if forward has played)
          if (hasPlayedForward) {
            video.currentTime = video.duration;
            video.pause();
          }
        },
        onLeave: () => {
          // When leaving section (scrolling forward past end)
          video.pause();
          video.currentTime = video.duration;
          hasPlayedForward = true; // Mark as played
        },
        onLeaveBack: () => {
          // When scrolling back past start, reset to allow forward play again
          video.currentTime = 0;
          video.pause();
          video.playbackRate = 1;
          hasPlayedForward = false; // Reset flag to allow forward play again
        },
      });

      // Refresh ScrollTrigger to ensure it's properly initialized
      ScrollTrigger.refresh();
      isSetup = true;
    };

    // Wait for video to be fully ready (canplaythrough is better than loadedmetadata)
    const handleCanPlay = () => {
      setupScrollSync();
    };

    // If video is already ready
    if (video.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
      setupScrollSync();
    } else {
      // Wait for video to be ready to play
      video.addEventListener('canplaythrough', handleCanPlay, { once: true });
      // Also listen for loadedmetadata as fallback
      video.addEventListener('loadedmetadata', () => {
        // Double check duration is available
        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
          setupScrollSync();
        }
      }, { once: true });
    }

    return () => {
      if (trigger) trigger.kill();
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [src]);

  // iOS video loading fix
  useEffect(() => {
    if (!src) return;
    const video = videoRef.current;
    if (!video) return;

    // Force video to load on iOS
    const loadVideo = () => {
      video.load();
      // Ensure video is visible
      video.style.display = 'block';
      video.style.visibility = 'visible';
    };

    // Try to load immediately
    loadVideo();

    // Also try after a short delay for iOS
    const timeout = setTimeout(loadVideo, 100);

    return () => clearTimeout(timeout);
  }, [src]);

  // GSAP scroll animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate video
      if (videoRef.current) {
        gsap.set(videoRef.current, { opacity: 0, scale: 0.9 });
        tl.to(videoRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      // Animate heading
      if (headingRef.current) {
        gsap.set(headingRef.current, { opacity: 0, y: 50 });
        tl.to(headingRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
        }, "<0.3");
      }

      // Animate button
      if (buttonRef.current) {
        gsap.set(buttonRef.current, { opacity: 0, y: 30 });
        tl.to(buttonRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }, "<0.2");
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [src, ctaText]);

  return (
    <section ref={sectionRef} className="relative bg-black pt-0 pb-12 md:pb-24 overflow-hidden gen-ai-section w-full">
      <div className="relative z-10 container-fluid mx-auto gen-ai-inner w-full max-w-full">
        <div className="space-y-0 h-full w-full">
          {/* Main Content Div */}
          <div className="relative flex flex-col items-center h-full min-h-[100vh] min-h-[100dvh] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px] justify-center overflow-hidden gen-ai-container w-full">
            {/* Background Video — only when CMS provides a URL */}
            {src ? (
              <video
                key={src}
                ref={videoRef}
                src={src}
                muted
                playsInline
                loop={false}
                preload="auto"
                className="absolute inset-0 z-0 video-responsive-gen-ai"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (video) {
                    video.setAttribute('webkit-playsinline', 'true');
                    video.pause();
                    video.currentTime = 0;
                  }
                }}
              />
            ) : null}

            {/* Content */}
            {/* Below `sm` the offset is handled in globals.css so it scales with the
                phone's height instead of a fixed 560px. */}
            <div className="relative z-20 w-full flex flex-col items-center text-center gap-4 sm:gap-4 md:gap-4 lg:gap-6 xl:gap-8 sm:pt-170 md:pt-170 lg:pt-170 xl:pt-170 2xl:pt-200 gen-ai-content">
              <h2
                ref={headingRef}
                className={`${SECTION_HEADING_CENTER_CLASS} max-w-4xl text-white`}
              >
                {headingLines.map((line, i) => (
                  <span key={i}>{line}{i < headingLines.length - 1 && <br />}</span>
                ))}
              </h2>
              {paragraphBlocks.length > 0 ? (
                <div className="flex flex-col gap-4 max-w-3xl md:px-0 px-12 w-full items-center gen-ai-paragraphs">
                  {paragraphBlocks.map((para, i) => (
                    <p
                      key={i}
                      className="text-[14px] md:text-[20px] text-white leading-relaxed text-center"
                      dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(para) }}
                    />
                  ))}
                </div>
              ) : null}
              {ctaText?.trim() ? (
                <div ref={buttonRef}>
                  <CallToActionButton
                    variant="shiny"
                    onClick={ctaLink?.trim() ? handleCtaClick : undefined}
                  >
                    {ctaText.trim()}
                  </CallToActionButton>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

