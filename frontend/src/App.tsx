import React, { useState } from 'react';
import { Container, Typography, Stepper, Step, StepLabel, Box } from '@mui/material';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import ResultsDisplay from './components/ResultsDisplay';
import { ParsedResume, JobAnalysis, TailoredResume } from './types';

const steps = ['Upload Resume', 'Job Description', 'Tailored Results'];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null);
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ResumeUpload
            onResumeUploaded={(data) => {
              setResumeData(data);
              handleNext();
            }}
          />
        );
      case 1:
        return (
          <JobDescriptionInput
            onJobAnalyzed={(analysis) => {
              setJobAnalysis(analysis);
              handleNext();
            }}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ResultsDisplay
            resumeData={resumeData}
            jobAnalysis={jobAnalysis}
            tailoredResume={tailoredResume}
            onTailoredResumeGenerated={setTailoredResume}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        AI Resume & Portfolio Tailor
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Automatically customize your resume for any job description using AI
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ mt: 4 }}>
        {renderStepContent(activeStep)}
      </Box>
    </Container>
  );
}

export default App;