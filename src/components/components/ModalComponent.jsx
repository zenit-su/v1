// src/components/ModalComponent.jsx

import React from "react";
import Modal from "react-modal";
import styled from "styled-components";
import PropTypes from "prop-types";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalHeader = styled.h2`
  margin-bottom: 20px;
`;

const LanguageSelector = styled.select`
  margin-bottom: 20px;
  padding: 8px;
  font-size: 16px;
`;

const OptionImagesContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap; /* Allows images and video to wrap on smaller screens */
  gap: 20px; /* Adds spacing between elements */
`;

const OptionImage = styled.img`
  width: 100%;
  max-width: 200px;
  margin: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;

  &:hover {
    border-color: #4caf50;
  }
`;

const OptionVideo = styled.video`
  width: 100%;
  max-width: 200px;
  margin: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;

  &:hover {
    border-color: #4caf50;
  }
`;

const translations = {
  english: {
    header: "Select an Option",
    selectLanguage: "Select Language:",
    languages: {
      english: "English",
      hindi: "Hindi",
    },
    options: {
      option1: "Option 1",
      option2: "Option 2",
      option3: "Option 3",
      option4: "Option 4", // New option
    },
  },
  hindi: {
    header: "एक विकल्प चुनें",
    selectLanguage: "भाषा चुनें:",
    languages: {
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
    },
    options: {
      option1: "विकल्प 1",
      option2: "विकल्प 2",
      option3: "विकल्प 3",
      option4: "विकल्प 4", // New option
    },
  },
  // Add more languages as needed
};

const ModalComponent = ({
  isModalOpen,
  setIsModalOpen,
  optionImage1,
  optionImage2,
  optionImage3, // Existing third option image
  optionVideo4, // New fourth option video
  handleOptionClick,
  selectedLanguage,
  handleLanguageChange,
}) => {
  // Determine the current language's translations
  const currentTranslations =
    translations[selectedLanguage] || translations.english;

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={() => setIsModalOpen(false)}
      contentLabel={currentTranslations.header}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: "700px", // Increased maxWidth to accommodate more options
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000, // Ensure the modal overlays other elements
        },
      }}
      ariaHideApp={false}
    >
      <ModalContent>
        {/* Language Selection Dropdown */}
        <LanguageSelector
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          aria-label={currentTranslations.selectLanguage}
        >
          <option value="english">
            {currentTranslations.languages.english}
          </option>
          <option value="hindi">{currentTranslations.languages.hindi}</option>
          {/* Add more languages as needed */}
        </LanguageSelector>

        {/* Modal Header */}
        <ModalHeader>{currentTranslations.header}</ModalHeader>

        {/* Option Images and Video */}
        <OptionImagesContainer>
          <OptionImage
            src={optionImage1}
            alt={currentTranslations.options.option1}
            onClick={() => handleOptionClick(1)}
          />
          <OptionImage
            src={optionImage2}
            alt={currentTranslations.options.option2}
            onClick={() => handleOptionClick(2)}
          />
          <OptionImage
            src={optionImage3} // Existing third option image
            alt={currentTranslations.options.option3}
            onClick={() => handleOptionClick(3)}
          />
          <OptionVideo
            src={optionVideo4} // New fourth option video
            alt={currentTranslations.options.option4}
            onClick={() => handleOptionClick(4)}
            controls={false} // Hide controls if you want to manage playback programmatically
            loop
            muted
          />
        </OptionImagesContainer>
      </ModalContent>
    </Modal>
  );
};

ModalComponent.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  optionImage1: PropTypes.string.isRequired,
  optionImage2: PropTypes.string.isRequired,
  optionImage3: PropTypes.string.isRequired,
  optionVideo4: PropTypes.string.isRequired, // New prop
  handleOptionClick: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  handleLanguageChange: PropTypes.func.isRequired,
};

export default ModalComponent;
