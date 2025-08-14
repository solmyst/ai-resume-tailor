import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { uploadResume } from '../services/api';
import { ParsedResume } from '../types';

interface ResumeUploadProps {
  onResumeUploaded: (resume: ParsedResume) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUploaded }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const response = await uploadResume(file);
        onResumeUploaded(response.data);
      } catch (error) {
        console.error('Error uploading resume:', error);
      }
    }
  }, [onResumeUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Upload Your Resume
      </Typography>
      
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        
        {isDragActive ? (
          <Typography variant="h6">Drop your resume here...</Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Drag & drop your resume here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to select a file
            </Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>
              Choose File
            </Button>
          </>
        )}
        
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Supported formats: PDF, DOCX, TXT
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResumeUpload;