import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { analyzeJob } from '../services/api';
import { JobAnalysis } from '../types';

interface JobDescriptionInputProps {
  onJobAnalyzed: (analysis: JobAnalysis) => void;
  onBack: () => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ 
  onJobAnalyzed, 
  onBack 
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    
    setLoading(true);
    try {
      const response = await analyzeJob({ text: jobDescription });
      onJobAnalyzed(response.data);
    } catch (error) {
      console.error('Error analyzing job description:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Paste Job Description
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={12}
          variant="outlined"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Job'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default JobDescriptionInput;