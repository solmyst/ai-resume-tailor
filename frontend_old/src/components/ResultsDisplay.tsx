import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Chip, 
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { tailorResume, generatePDF } from '../services/api';
import { ParsedResume, JobAnalysis, TailoredResume } from '../types';

interface ResultsDisplayProps {
  resumeData: ParsedResume | null;
  jobAnalysis: JobAnalysis | null;
  tailoredResume: TailoredResume | null;
  onTailoredResumeGenerated: (tailored: TailoredResume) => void;
  onBack: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  resumeData,
  jobAnalysis,
  tailoredResume,
  onTailoredResumeGenerated,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    if (resumeData && jobAnalysis && !tailoredResume) {
      generateTailoredResume();
    }
  }, [resumeData, jobAnalysis]);

  const generateTailoredResume = async () => {
    if (!resumeData || !jobAnalysis) return;
    
    setLoading(true);
    try {
      const response = await tailorResume(resumeData, jobAnalysis);
      onTailoredResumeGenerated(response.data);
    } catch (error) {
      console.error('Error tailoring resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tailoredResume) return;
    
    setPdfGenerating(true);
    try {
      const response = await generatePDF(tailoredResume);
      if (response.data.download_url) {
        // Extract filename from download URL
        const filename = response.data.download_url.split('/').pop();
        if (filename) {
          // Import downloadPDF function
          const { downloadPDF } = await import('../services/api');
          await downloadPDF(filename);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tailoring your resume...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!tailoredResume) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">
          Unable to generate tailored resume
        </Typography>
        <Button variant="outlined" onClick={onBack} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const matchPercentage = Math.round(tailoredResume.match_score * 100);

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Your Tailored Resume
      </Typography>

      {/* Match Score */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Job Match Score
          </Typography>
          <Typography variant="h3" color="primary" gutterBottom>
            {matchPercentage}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={matchPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Tailored Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tailored Professional Summary
            </Typography>
            <Typography variant="body1">
              {tailoredResume.tailored_summary}
            </Typography>
          </Paper>
        </Grid>

        {/* Recommended Skills */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Skills to Highlight
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tailoredResume.recommended_skills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Job Requirements */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Job Requirements
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {jobAnalysis?.required_skills.slice(0, 8).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  color="secondary" 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Experience */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tailored Experience
            </Typography>
            {tailoredResume.tailored_experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {exp.title} | {exp.company} | {exp.duration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.description}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={generateTailoredResume}
            disabled={loading}
          >
            Regenerate
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
          >
            {pdfGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResultsDisplay;