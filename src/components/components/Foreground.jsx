// src/components/Foreground.jsx

import React, { useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import "./Foreground.css"; // Import the corresponding CSS file

/**
 * Foreground Component
 * Renders a foreground element (image, video, or custom component) with animations.
 *
 * Props:
 * - foreground: Object containing type, sources, src, alt, style, component, and props.
 * - shouldPlay: Boolean indicating whether videos should play.
 * - onEnded: Function to call when the video ends.
 */
const Foreground = ({ foreground, shouldPlay, onEnded }) => {
  // Always call hooks at the top
  const videoRef = useRef(null);

  // Destructure foreground properties
  const {
    type,
    sources, // Array of video sources
    src, // Single image or fallback video source
    alt,
    style,
    component: ForegroundComponent, // Custom React component
    props: componentProps, // Props for the custom component
    loop = true, // Default loop to true unless specified
  } = foreground || {}; // Provide a default empty object to prevent destructuring errors

  // Use useEffect to control video playback
  useEffect(() => {
    if (type === "video" && videoRef.current) {
      const videoElement = videoRef.current;

      if (shouldPlay) {
        // Attempt to play the video
        const playPromise = videoElement.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing foreground video:", error);
          });
        }
      } else {
        // Pause the video
        videoElement.pause();
      }
    }
  }, [shouldPlay, type]);

  // Early return after hooks
  if (!foreground) return null;

  // Define animation variants for Framer Motion
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Render based on the type of foreground
  switch (type) {
    case "image":
      if (!src) {
        console.warn("Foreground type 'image' requires a 'src' prop.");
        return null;
      }
      return (
        <motion.img
          src={src}
          alt={alt || "Foreground Image"}
          className="foreground-image"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
          loading="lazy" // Enables lazy loading for performance
          style={style} // Apply any additional styles
        />
      );

    case "video":
      return (
        <motion.video
          ref={videoRef}
          className="foreground-video"
          loop={loop}
          muted={true} // Set muted to true for autoplay compliance
          playsInline // Allows videos to play inline on mobile devices
          onEnded={onEnded}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
          style={style} // Apply any additional styles
        >
          {sources && sources.length > 0 ? (
            sources.map((source, index) => (
              <source key={index} src={source.src} type={source.type} />
            ))
          ) : src ? (
            <source src={src} type="video/webm" />
          ) : null}
          Your browser does not support the video tag.
        </motion.video>
      );

    case "component":
      if (!ForegroundComponent) {
        console.warn(
          "Foreground type 'component' requires a 'component' prop."
        );
        return null;
      }
      return (
        <motion.div
          className="foreground-component"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
          style={style} // Apply any additional styles
        >
          <ForegroundComponent {...componentProps} />
        </motion.div>
      );

    default:
      console.warn(`Unsupported foreground type: ${type}`);
      return null;
  }
};

// Define PropTypes for type checking and documentation
Foreground.propTypes = {
  foreground: PropTypes.shape({
    type: PropTypes.oneOf(["image", "video", "component"]).isRequired,
    sources: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
      })
    ),
    src: PropTypes.string, // For images or fallback video
    alt: PropTypes.string, // Descriptive alt text for images
    style: PropTypes.object, // Inline styles (optional)
    component: PropTypes.elementType, // Custom React component
    props: PropTypes.object, // Props for the custom component
    loop: PropTypes.bool, // Indicates if the video should loop
  }).isRequired,
  shouldPlay: PropTypes.bool, // Controls video playback
  onEnded: PropTypes.func, // Callback when video ends
};

// Define default props for optional properties
Foreground.defaultProps = {
  shouldPlay: false,
  onEnded: () => {}, // No-op function if not provided
};

export default memo(Foreground); // Use React.memo for performance optimization
