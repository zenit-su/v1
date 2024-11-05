// src/components/WordCountDisplay.jsx

import React, { memo, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";

/**
 * WordCountDisplay Component
 *
 * Displays the total number of words revealed in the application.
 *
 * Props:
 * - totalWordsRead (number): The cumulative number of words revealed.
 * - label (string): Custom label for the word count display.
 * - isVisible (bool): Controls the visibility of the word count display.
 */

const WordCountWrapper = styled(motion.div)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ theme }) =>
    theme.colors.wordCountBg || "rgba(0, 0, 0, 0.6)"};
  padding: 10px 20px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.wordCountText || "#fff"};
  font-size: 1.5rem;
  font-weight: bold;
  z-index: 3;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 8px 16px;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 6px 12px;
  }
`;

// Define animation variants
const wordCountVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0, scale: 1 },
  update: { scale: 1.2 },
};

/**
 * WordCountDisplay Component
 *
 * @param {number} totalWordsRead - The cumulative number of words revealed.
 * @param {string} [label="Total Words Revealed"] - Custom label for the display.
 * @param {boolean} [isVisible=true] - Controls the visibility of the component.
 */
const WordCountDisplay = ({
  totalWordsRead,
  label = "Total Words Revealed",
  isVisible = true,
}) => {
  // Hooks must be called unconditionally
  // Ensure the word count is a non-negative integer
  const safeTotalWords = Math.max(0, Math.floor(totalWordsRead));

  // Animation controls from framer-motion
  const controls = useAnimation();

  // Trigger the 'update' animation whenever totalWordsRead changes
  useEffect(() => {
    controls
      .start("update")
      .then(() => controls.start("animate"))
      .catch((error) => console.error("Animation error:", error));
  }, [totalWordsRead, controls]);

  // Early return after hooks
  if (!isVisible) return null;

  return (
    <WordCountWrapper
      variants={wordCountVariants}
      initial="initial"
      animate={controls}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
      aria-live="polite"
      aria-atomic="true"
    >
      {label}: {safeTotalWords}
    </WordCountWrapper>
  );
};

WordCountDisplay.propTypes = {
  totalWordsRead: PropTypes.number.isRequired,
  label: PropTypes.string,
  isVisible: PropTypes.bool,
};

export default memo(WordCountDisplay);
