import React from 'react'
import clsx from 'clsx'

export interface Step {
  number: number
  title: string
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepNumber: number) => void
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className='stepper-nav d-flex flex-row justify-content-between mb-10'>
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={clsx(
            'stepper-item d-flex align-items-center flex-grow-1',
            { 'current': currentStep === step.number },
            { 'completed': currentStep > step.number }
          )}
          onClick={() => onStepClick && onStepClick(step.number)}
          style={{ cursor: onStepClick ? 'pointer' : 'default' }}
        >
          <div className='stepper-wrapper d-flex align-items-center'>
            <div
              className={clsx(
                'stepper-icon w-40px h-40px rounded-circle d-flex align-items-center justify-content-center',
                {
                  'bg-primary text-white': currentStep === step.number,
                  'bg-success text-white': currentStep > step.number,
                  'bg-light-primary text-primary': currentStep < step.number,
                }
              )}
            >
              {currentStep > step.number ? (
                <i className='fas fa-check fs-4'></i>
              ) : (
                <span className='stepper-number fw-bold'>{step.number}</span>
              )}
            </div>

            <div className='stepper-label ms-3'>
              <h3
                className={clsx('stepper-title fs-6 fw-bold mb-0', {
                  'text-primary': currentStep === step.number,
                  'text-success': currentStep > step.number,
                  'text-gray-600': currentStep < step.number,
                })}
              >
                {step.title}
              </h3>
              <div className='stepper-desc text-gray-500 fs-7'>{step.description}</div>
            </div>
          </div>

          {/* Linha de conexão entre steps */}
          {index < steps.length - 1 && (
            <div
              className={clsx('stepper-line flex-grow-1 mx-4', {
                'bg-success': currentStep > step.number,
                'bg-light-primary': currentStep <= step.number,
              })}
              style={{ height: '2px' }}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}

export { StepIndicator }
