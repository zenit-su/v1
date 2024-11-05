// src/components/VideoPlayer.jsx

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const VideoWrapper = styled.div`
  position: fixed; /* Use fixed to cover the entire viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 1000; /* Ensure it appears above other elements */
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoPlayer = ({ videoSrc, onEnded, onError }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // Ensure the video is muted to comply with autoplay policies
      videoElement.muted = true;

      // Play the video and handle autoplay policies
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing video:", error);
          if (onError) onError(error);
        });
      }
    }

    return () => {
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    };
  }, [videoSrc, onError]);

  return (
    <VideoWrapper>
      <StyledVideo
        ref={videoRef}
        src={videoSrc}
        onEnded={onEnded}
        onError={(e) => {
          console.error("Video playback error:", e);
          if (onError) onError(e);
        }}
        playsInline
        muted
        autoPlay
        controls={false}
        aria-label="Associated Video"
      />
    </VideoWrapper>
  );
};

VideoPlayer.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  onEnded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default VideoPlayer;
