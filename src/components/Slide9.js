// src/MainComponent.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import debounce from "lodash.debounce";
import PropTypes from "prop-types";

// Import components
import BackgroundImage from "./components/BackgroundImage";
import BackgroundVideo from "./components/BackgroundVideo";
import Subtitle from "./components/Subtitle";
import SliderComponent from "./components/SliderComponent";
import ModalComponent from "./components/ModalComponent";
import WordCountDisplay from "./components/WordCountDisplay";
import AudioRecorder from "./components/AudioRecorder";
import Foreground from "./components/Foreground";
import AdditionalForeground from "./components/AdditionalForeground";
import VideoPlayer from "./components/VideoPlayer"; // Import the VideoPlayer component

// Import the option images and videos
import optionImage1 from "./image/options/0.webp";
import optionImage2 from "./image/options/0j.webp";
import optionImage3 from "./image/options/video-option.jpg";
import optionVideo4 from "./video/0.mp4";

// Import slides data
import slidesData from "./components/slidesData";

// Styled components for positioning
const ContentWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 20px;
  z-index: 1;
`;

const RecorderContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 3;
`;

// Define constants
const SMALL_SCREEN_WIDTH = 768;

// Animation variants for background transitions
const backgroundVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Translation object
const translations = {
  english: {
    errorLoadingMedia: "Failed to load media.",
    retry: "Retry",
    foreground: "Foreground",
    additionalForeground: "Additional Foreground",
    selectOption: "Select an Option",
    option4Label: "Option 4",
  },
  hindi: {
    errorLoadingMedia: "मीडिया लोड करने में विफल रहा।",
    retry: "पुनः प्रयास करें",
    foreground: "पूर्वभूमि",
    additionalForeground: "अतिरिक्त पूर्वभूमि",
    selectOption: "एक विकल्प चुनें",
    option4Label: "विकल्प 4",
  },
  // Add more languages as needed
};

function MainComponent() {
  // State variables
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(-1);
  const [isHoveringLastWord, setIsHoveringLastWord] = useState(false);
  const [totalWordsRead, setTotalWordsRead] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < SMALL_SCREEN_WIDTH
      : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("preferredLanguage") || "english"
  );
  const [selectedOption, setSelectedOption] = useState(null);
  const [slides, setSlides] = useState([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaSrc, setMediaSrc] = useState("");
  const [mediaType, setMediaType] = useState("none");
  const [isSwitching, setIsSwitching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);

  // New State Variables to Control Video Playback
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const [shouldPlayForegroundVideo, setShouldPlayForegroundVideo] =
    useState(false);
  const [shouldPlayAssociatedVideo, setShouldPlayAssociatedVideo] =
    useState(false); // New state variable

  // Reference for audio elements
  const audioRef = useRef(null);
  const wordAudioRefs = useRef([]);

  // Memoize words and audio files
  const words = useMemo(
    () => slides[currentIndex]?.subtitle?.split(" ") || [],
    [slides, currentIndex]
  );
  const audioFiles = useMemo(
    () => slides[currentIndex]?.audioFiles || [],
    [slides, currentIndex]
  );

  // Determine current translation based on selectedLanguage
  const currentTranslation =
    translations[selectedLanguage] || translations.english;

  // Preload media when mediaSrc or mediaType changes
  useEffect(() => {
    setError(null); // Reset error state on media change

    let isMounted = true; // To prevent state updates on unmounted components

    if (mediaType === "image") {
      const img = new Image();
      img.src = mediaSrc;
      img.onload = () => {
        if (isMounted) {
          setMediaLoaded(true);
          setIsTransitioning(false); // Reset isTransitioning after image loads
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${mediaSrc}`);
        if (isMounted) {
          setMediaLoaded(false);
          setError(currentTranslation.errorLoadingMedia);
          setIsTransitioning(false); // Reset isTransitioning on error
        }
      };
    } else if (mediaType === "video") {
      setMediaLoaded(false);
      // Do not reset isTransitioning here; it will be reset when the video loads
    } else {
      setMediaLoaded(false);
      setIsTransitioning(false); // Reset isTransitioning if there's no media
    }

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [mediaSrc, mediaType, currentTranslation.errorLoadingMedia]);

  // Handle window resize to adjust media source for small screens
  useEffect(() => {
    const handleResize = debounce(() => {
      const smallScreen = window.innerWidth < SMALL_SCREEN_WIDTH;
      if (smallScreen !== isSmallScreen) {
        setIsSmallScreen(smallScreen);
        const currentSlide = slides[currentIndex];
        let newMediaSrc = "";
        let newMediaType = "none";

        if (currentSlide.video) {
          newMediaSrc = currentSlide.video;
          newMediaType = "video";
        } else if (currentSlide.image || currentSlide.imageSmall) {
          newMediaSrc = smallScreen
            ? currentSlide.imageSmall
            : currentSlide.image;
          newMediaType = "image";
        }

        setMediaSrc(newMediaSrc);
        setMediaType(newMediaType);

        // Preload the new media
        if (newMediaType === "image") {
          const img = new Image();
          img.src = newMediaSrc;
          img.onload = () => {
            setMediaLoaded(true);
            setIsTransitioning(false); // Reset isTransitioning after image loads
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${newMediaSrc}`);
            setMediaLoaded(false);
            setError(currentTranslation.errorLoadingMedia);
            setIsTransitioning(false); // Reset isTransitioning on error
          };
        } else if (newMediaType === "video") {
          setMediaLoaded(false);
          // Do not reset isTransitioning here; it will be reset when the video loads
        }
      }
    }, 300); // Debounce delay of 300ms

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [
    isSmallScreen,
    slides,
    currentIndex,
    currentTranslation.errorLoadingMedia,
  ]);

  // New useEffect for Random Slide Selection on Mount
  useEffect(() => {
    if (slides.length === 0 && selectedLanguage) {
      const availableOptions = Object.keys(slidesData[selectedLanguage]).filter(
        (key) => key.startsWith("option")
      );
      if (availableOptions.length > 0) {
        const randomOptionKey =
          availableOptions[Math.floor(Math.random() * availableOptions.length)];
        const optionNumber = parseInt(
          randomOptionKey.replace("option", ""),
          10
        );
        handleOptionClick(optionNumber);
      } else {
        console.warn(
          `No available options found for language: ${selectedLanguage}`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, slides.length]); // Run only when selectedLanguage or slides.length changes

  // Preload word audio files when slide changes
  useEffect(() => {
    wordAudioRefs.current = audioFiles.map((src) => {
      const audio = new Audio(src);
      return audio;
    });
  }, [audioFiles]);

  // Function to handle moving to the next slide
  const handleNextSlide = useCallback(() => {
    if (isSwitching || isTransitioning) return;

    setIsSwitching(true);
    setIsTransitioning(true);
    const nextIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0;

    // Reset slider and media load status
    setSliderValue(-1);
    setMediaLoaded(false);
    setError(null);

    // Reset playback states
    setShouldPlayVideo(false);
    setShouldPlayForegroundVideo(false);
    setShouldPlayAssociatedVideo(false); // Reset associated video state

    // Get the next slide and determine media type and source
    const nextSlide = slides[nextIndex];
    let nextMediaSrc = "";
    let nextMediaType = "none";

    if (nextSlide.video) {
      nextMediaSrc = nextSlide.video;
      nextMediaType = "video";
    } else if (nextSlide.image || nextSlide.imageSmall) {
      nextMediaSrc = isSmallScreen ? nextSlide.imageSmall : nextSlide.image;
      nextMediaType = "image";
    }

    setMediaSrc(nextMediaSrc);
    setMediaType(nextMediaType);

    // Preload the next media
    if (nextMediaType === "image") {
      const img = new Image();
      img.src = nextMediaSrc;
      img.onload = () => {
        setMediaLoaded(true);
        setIsTransitioning(false); // Reset isTransitioning after image loads
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${nextMediaSrc}`);
        setMediaLoaded(false);
        setError(currentTranslation.errorLoadingMedia);
        setIsTransitioning(false); // Reset isTransitioning on error
      };
    } else if (nextMediaType === "video") {
      setMediaLoaded(false);
      // Let the onLoaded callback of BackgroundVideo handle isTransitioning
    } else {
      setIsTransitioning(false); // Reset isTransitioning if there's no media
    }

    // Update current index after transition
    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIsSwitching(false);
    }, 500); // Duration matches the animation transition
  }, [
    isSwitching,
    isTransitioning,
    currentIndex,
    slides,
    isSmallScreen,
    currentTranslation.errorLoadingMedia,
  ]);

  // Adjusted handleSliderChange function
  const handleSliderChange = useCallback(
    (newValue) => {
      if (isSwitching || isTransitioning) return;

      const wordCount = words.length;
      if (newValue > sliderValue && newValue <= wordCount) {
        // Update the slider value
        setSliderValue(newValue);

        // Play word audio if available
        if (newValue < wordCount) {
          setTotalWordsRead((prev) => prev + 1);
          const audio = wordAudioRefs.current[newValue];
          if (audio) {
            audio.play().catch((error) => {
              console.error("Error playing word audio:", error);
            });
          }
        }

        // When the slider reaches the second last word
        if (newValue === wordCount - 1) {
          const currentSlide = slides[currentIndex];

          if (
            currentSlide?.foreground?.type === "video" &&
            !shouldPlayForegroundVideo
          ) {
            // Start playing the foreground video
            setShouldPlayForegroundVideo(true);
          }
        }

        // When the slider reaches the last word
        if (newValue === wordCount) {
          const currentSlide = slides[currentIndex];

          if (currentSlide?.associatedVideo) {
            if (!shouldPlayAssociatedVideo) {
              console.log("Setting shouldPlayAssociatedVideo to true");
              setShouldPlayAssociatedVideo(true);
            }
          } else {
            handleNextSlide();
          }
        }
      }
    },
    [
      isSwitching,
      isTransitioning,
      sliderValue,
      words.length,
      handleNextSlide,
      currentIndex,
      slides,
      shouldPlayAssociatedVideo,
      shouldPlayForegroundVideo, // Ensure this is included
    ]
  );

  // Handle word clicks to reveal the next word
  const handleWordClick = useCallback(
    (index) => {
      if (index === sliderValue + 1 && !isSwitching && !isTransitioning) {
        handleSliderChange(index);
      }
    },
    [sliderValue, isSwitching, isTransitioning, handleSliderChange]
  );

  // Handle special action (e.g., clicking on the last word)
  const handleSpecialAction = useCallback(() => {
    handleNextSlide();
  }, [handleNextSlide]);

  // Handle modal option selection
  const handleOptionClick = useCallback(
    (option) => {
      setIsModalOpen(false);
      let selectedSlides;
      if (selectedLanguage && slidesData[selectedLanguage]) {
        selectedSlides = slidesData[selectedLanguage][`option${option}`];
      }

      // Fallback to English Option 1 if slides are not found
      if (!selectedSlides) {
        selectedSlides = slidesData["english"]["option1"];
      }

      setSlides([...selectedSlides]);
      setCurrentIndex(0);
      setTotalWordsRead(0);
      setSliderValue(-1);
      setError(null);

      // Determine media type and source for the first slide
      const firstSlide = selectedSlides[0];
      let initialMediaSrc = "";
      let initialMediaType = "none";

      if (firstSlide.video) {
        initialMediaSrc = firstSlide.video;
        initialMediaType = "video";
      } else if (firstSlide.image || firstSlide.imageSmall) {
        initialMediaSrc = isSmallScreen
          ? firstSlide.imageSmall
          : firstSlide.image;
        initialMediaType = "image";
      }

      setMediaSrc(initialMediaSrc);
      setMediaType(initialMediaType);

      // Preload the initial media
      if (initialMediaType === "image") {
        const img = new Image();
        img.src = initialMediaSrc;
        img.onload = () => {
          setMediaLoaded(true);
          setIsTransitioning(false); // Reset isTransitioning after image loads
        };
        img.onerror = () => {
          console.error(`Failed to load image: ${initialMediaSrc}`);
          setMediaLoaded(false);
          setError(currentTranslation.errorLoadingMedia);
          setIsTransitioning(false); // Reset isTransitioning on error
        };
      } else if (initialMediaType === "video") {
        setMediaLoaded(false);
        // Let the onLoaded callback of BackgroundVideo handle isTransitioning
      } else {
        setIsTransitioning(false); // Reset isTransitioning if there's no media
      }

      // Reset playback states
      setShouldPlayVideo(false);
      setShouldPlayForegroundVideo(false);
      setShouldPlayAssociatedVideo(false);
    },
    [selectedLanguage, isSmallScreen, currentTranslation.errorLoadingMedia]
  );

  // Handle language change from ModalComponent
  const handleLanguageChange = useCallback((language) => {
    setSelectedLanguage(language);
    localStorage.setItem("preferredLanguage", language); // Persist Language Preference
    setSelectedOption(null);
    setIsModalOpen(true); // Reopen modal to select option in the new language
    setSlides([]); // Clear slides until an option is selected
    setCurrentIndex(0);
    setTotalWordsRead(0);
    setSliderValue(-1);
    setError(null);
    setMediaSrc("");
    setMediaType("none");
    setMediaLoaded(false);
    setIsTransitioning(false); // Reset isTransitioning

    // Reset playback states
    setShouldPlayVideo(false);
    setShouldPlayForegroundVideo(false);
    setShouldPlayAssociatedVideo(false);
  }, []);

  // Open modal on first slide
  const handleModalOpen = useCallback(() => {
    if (currentIndex === 0) {
      setIsModalOpen(true);
    }
  }, [currentIndex]);

  // Handle audio playback for the first slide
  useEffect(() => {
    if (currentIndex === 0 && slides[0]?.audio) {
      if (sliderValue >= 0) {
        // Play the audio when the first word is revealed
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
      } else {
        // Pause and reset the audio if the first word is not yet revealed
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    } else {
      // Pause and reset the audio if not on the first slide
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [currentIndex, sliderValue, slides]);

  // Debugging: Log the value of shouldPlayAssociatedVideo
  useEffect(() => {
    console.log("shouldPlayAssociatedVideo:", shouldPlayAssociatedVideo);
  }, [shouldPlayAssociatedVideo]);

  return (
    <>
      {/* AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        {mediaSrc && (
          <motion.div
            key={mediaSrc}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={backgroundVariants}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
            }}
          >
            {/* Background Image */}
            {mediaType === "image" &&
              (currentIndex === 0 ? (
                <button
                  onClick={handleModalOpen}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                  }}
                  aria-label={
                    selectedLanguage === "hindi"
                      ? "पृष्ठभूमि छवि"
                      : "Background Image"
                  }
                >
                  <BackgroundImage backgroundImage={mediaSrc} />
                </button>
              ) : (
                <BackgroundImage backgroundImage={mediaSrc} />
              ))}

            {/* Background Video */}
            {mediaType === "video" &&
              (currentIndex === 0 ? (
                <button
                  onClick={handleModalOpen}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                  }}
                  aria-label={
                    selectedLanguage === "hindi"
                      ? "पृष्ठभूमि वीडियो"
                      : "Background Video"
                  }
                >
                  <BackgroundVideo
                    videoSrc={mediaSrc}
                    shouldPlay={shouldPlayVideo}
                    onLoaded={() => {
                      setMediaLoaded(true);
                      setIsTransitioning(false); // Reset isTransitioning when video loads
                    }}
                    onError={() => {
                      console.error(`Failed to load video: ${mediaSrc}`);
                      setMediaLoaded(false);
                      setError(currentTranslation.errorLoadingMedia);
                      setIsTransitioning(false); // Reset isTransitioning on error
                    }}
                  />
                </button>
              ) : (
                <BackgroundVideo
                  videoSrc={mediaSrc}
                  shouldPlay={shouldPlayVideo}
                  onLoaded={() => {
                    setMediaLoaded(true);
                    setIsTransitioning(false); // Reset isTransitioning when video loads
                  }}
                  onError={() => {
                    console.error(`Failed to load video: ${mediaSrc}`);
                    setMediaLoaded(false);
                    setError(currentTranslation.errorLoadingMedia);
                    setIsTransitioning(false); // Reset isTransitioning on error
                  }}
                />
              ))}

            {/* Render Foreground if present */}
            {slides[currentIndex]?.foreground &&
              (currentIndex === 0 ? (
                <button
                  onClick={handleModalOpen}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 2,
                  }}
                  aria-label={
                    selectedLanguage === "hindi" ? "पूर्वभूमि" : "Foreground"
                  }
                >
                  <Foreground
                    foreground={slides[currentIndex].foreground}
                    shouldPlay={shouldPlayForegroundVideo}
                  />
                </button>
              ) : (
                <Foreground
                  foreground={slides[currentIndex].foreground}
                  shouldPlay={shouldPlayForegroundVideo}
                />
              ))}

            {/* Render Additional Foreground if present */}
            {slides[currentIndex]?.additionalForeground &&
              (currentIndex === 0 ? (
                <button
                  onClick={handleModalOpen}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 3,
                  }}
                  aria-label={
                    selectedLanguage === "hindi"
                      ? "अतिरिक्त पूर्वभूमि"
                      : "Additional Foreground"
                  }
                >
                  <AdditionalForeground
                    additionalForeground={
                      slides[currentIndex].additionalForeground
                    }
                  />
                </button>
              ) : (
                <AdditionalForeground
                  additionalForeground={
                    slides[currentIndex].additionalForeground
                  }
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the Audio Element Conditionally */}
      {slides[currentIndex]?.audio && (
        <audio
          ref={audioRef}
          src={slides[currentIndex].audio.src}
          type={slides[currentIndex].audio.type}
          style={slides[currentIndex].audio.style}
          controls={false}
        />
      )}

      {/* Render the Associated Video when shouldPlayAssociatedVideo is true */}
      {shouldPlayAssociatedVideo && slides[currentIndex]?.associatedVideo && (
        <>
          {console.log(
            "Rendering VideoPlayer with videoSrc:",
            slides[currentIndex].associatedVideo
          )}
          <VideoPlayer
            videoSrc={slides[currentIndex].associatedVideo}
            onEnded={() => {
              // When the video ends, reset shouldPlayAssociatedVideo and move to next slide
              setShouldPlayAssociatedVideo(false);
              handleNextSlide();
            }}
            onError={(error) => {
              console.error(
                `Failed to load associated video: ${slides[currentIndex]?.associatedVideo}`,
                error
              );
              setShouldPlayAssociatedVideo(false);
              handleNextSlide();
            }}
          />
        </>
      )}

      {/* Display total words revealed */}
      <WordCountDisplay totalWordsRead={totalWordsRead} />

      {/* Audio Recorder Component */}
      <RecorderContainer>
        <AudioRecorder />
      </RecorderContainer>

      {/* Wrapper for Subtitle and Slider */}
      <ContentWrapper>
        {/* Subtitle Component */}
        <Subtitle
          words={words}
          sliderValue={sliderValue}
          handleWordClick={handleWordClick}
          handleWordHover={(index) =>
            setIsHoveringLastWord(index === words.length - 1)
          }
          handleWordUnhover={() => setIsHoveringLastWord(false)}
          isHoveringLastWord={isHoveringLastWord}
          handleSpecialAction={handleSpecialAction}
        />

        {/* Slider Component */}
        <SliderComponent
          value={sliderValue}
          max={words.length}
          onChange={handleSliderChange}
          disabled={isSwitching || isTransitioning}
          style={{ transition: "all 0.5s ease-in-out" }}
        />
      </ContentWrapper>

      {/* Modal Component with options and language selection */}
      <ModalComponent
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        optionImage1={optionImage1}
        optionImage2={optionImage2}
        optionImage3={optionImage3}
        optionVideo4={optionVideo4}
        handleOptionClick={handleOptionClick}
        selectedLanguage={selectedLanguage}
        handleLanguageChange={handleLanguageChange}
      />

      {/* Error Message Display */}
      {error && (
        <ErrorMessage>
          <p>{error}</p>
          <button
            onClick={() => {
              // Retry logic based on media type
              if (mediaType === "image") {
                const img = new Image();
                img.src = mediaSrc;
                img.onload = () => {
                  setMediaLoaded(true);
                  setError(null);
                  setIsTransitioning(false); // Reset isTransitioning after retry
                };
                img.onerror = () => {
                  console.error(`Retry failed to load image: ${mediaSrc}`);
                  setError(currentTranslation.errorLoadingMedia);
                  setIsTransitioning(false); // Reset isTransitioning on error
                };
              } else if (mediaType === "video") {
                setMediaLoaded(false);
                setError(null);
                setIsTransitioning(false); // Reset isTransitioning for video retry
              }
            }}
            aria-label={
              selectedLanguage === "hindi"
                ? "मीडिया लोड करने का पुनः प्रयास करें"
                : "Retry loading media"
            }
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {currentTranslation.retry}
          </button>
        </ErrorMessage>
      )}
    </>
  );
}

// Define PropTypes (Optional)
MainComponent.propTypes = {
  // Define any props if MainComponent receives them
};

export default MainComponent;
