
'use client';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

const FormStepNavigator = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLoading, 
  nextLabel = "Next",
  isDisabled = false
}) => {
  const getButtonClass = () => {
    if (isDisabled) {
      return "btn btn-warning"; // Yellow color when disabled
    }
    return "btn btn-primary"; // Default blue color
  };

  const getButtonText = () => {
    if (isLoading) {
      return "Processing...";
    }
    if (isDisabled && currentStep === 2) {
      return "Meeting Created";
    }
    return nextLabel;
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div className="d-flex align-items-center gap-2">
        {/* Step indicators */}
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`rounded-circle d-flex align-items-center justify-content-center ${
              index + 1 === currentStep
                ? 'bg-primary text-white'
                : index + 1 < currentStep
                ? 'bg-warning text-white'
                : 'bg-light text-muted'
            }`}
            style={{ width: '32px', height: '32px', fontSize: '14px' }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        {/* Back button */}
        {currentStep > 1 && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onBack}
            disabled={isLoading || isDisabled}
          >
            Back
          </button>
        )}

        {/* Next/Submit button */}
        <button
          type="button"
          className={getButtonClass()}
          onClick={onNext}
          disabled={isLoading || isDisabled}
          style={isDisabled ? { cursor: 'not-allowed' } : {}}
        >
          {isLoading && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          )}
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default FormStepNavigator;