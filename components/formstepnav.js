'use client';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

const FormStepNavigator = ({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onBack, 
  isLoading = false,
  nextLabel = 'Next'
}) => {
  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <div className="d-flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: currentStep === index + 1 ? '#2D31A6' : '#ddd',
            }}
          />
        ))}
      </div>
      <div className="d-flex gap-2">
        {currentStep > 1 && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onBack}
          >
            Back
          </button>
        )}
        <button 
          type="button" 
          className="btn btn-primary btn-lg"
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};

export default FormStepNavigator;