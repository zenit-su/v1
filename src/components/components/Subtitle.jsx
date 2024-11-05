// src/components/Subtitle.jsx

import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

// Styled components
const SubtitleContainer = styled.div`
  max-width: 80%;
  font-size: clamp(1.2rem, 2.5vw, 2.5rem);
  color: #fff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
  line-height: 1.5;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    max-width: 90%;
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    max-width: 95%;
    font-size: 1.2rem;
  }
`;

const Word = styled.span`
  margin: 0 8px;
  cursor: pointer;
  display: inline-block;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const SpecialButton = styled(motion.button)`
  padding: 10px 20px;
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.3s;
  margin-top: 20px;

  &:hover {
    background-color: #43a047;
    transform: scale(1.05);
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 8px 16px;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
`;

const Subtitle = ({
  words,
  sliderValue,
  handleWordClick,
  handleWordHover,
  handleWordUnhover,
  isHoveringLastWord,
  handleSpecialAction,
}) => {
  return (
    <SubtitleContainer>
      {/* Map over each word and control its visibility based on sliderValue */}
      {words.map((word, index) => (
        <Word
          key={index}
          onClick={() => handleWordClick(index)}
          onMouseEnter={() => handleWordHover(index)}
          onMouseLeave={() => handleWordUnhover(index)}
          visible={sliderValue >= index}
          style={{
            pointerEvents: index === sliderValue + 1 ? "auto" : "none",
          }}
        >
          {word}
        </Word>
      ))}

      {/* AnimatePresence for the SpecialButton */}
      <AnimatePresence>
        {isHoveringLastWord && (
          <SpecialButton
            key="next-button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onClick={handleSpecialAction}
          >
            Next Slide
          </SpecialButton>
        )}
      </AnimatePresence>
    </SubtitleContainer>
  );
};

Subtitle.propTypes = {
  words: PropTypes.arrayOf(PropTypes.string).isRequired,
  sliderValue: PropTypes.number.isRequired,
  handleWordClick: PropTypes.func.isRequired,
  handleWordHover: PropTypes.func.isRequired,
  handleWordUnhover: PropTypes.func.isRequired,
  isHoveringLastWord: PropTypes.bool.isRequired,
  handleSpecialAction: PropTypes.func.isRequired,
};

export default Subtitle;
