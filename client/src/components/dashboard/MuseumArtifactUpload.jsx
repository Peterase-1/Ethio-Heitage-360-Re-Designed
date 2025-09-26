

import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField, Typography,
  Stepper, Step, StepLabel, StepContent, Paper, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, FormControlLabel, Switch, Chip, IconButton, Tooltip,
  Snackbar, Alert, LinearProgress, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon, Description as DescriptionIcon, Category as CategoryIcon,
  PhotoCamera as PhotoCameraIcon, ThreeDRotation as ThreeDRotationIcon, CheckCircle as CheckCircleIcon,
  Error as ErrorIcon, Info as InfoIcon, Delete as DeleteIcon, Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/api.js';

const MuseumArtifactUpload = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    period: '',
    material: '',
    origin: '',
    condition: 'good',
    isFragile: false,
    isOnDisplay: true,
    acquisitionMethod: 'donation',
    acquisitionDate: '',
    donor: '',
    value: '',
    insuranceInfo: '',
    notes: ''
  });

  // File upload state
  const [files, setFiles] = useState({
    model: null,
    images: [],
    documents: []
  });

  // UI state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file uploads with react-dropzone
  const onDrop = (acceptedFiles, type) => {
    if (type === 'model') {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validTypes = ['.glb', '.gltf', '.obj'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(`.${fileExt}`)) {
          showSnackbar('Invalid file type. Please upload a .glb, .gltf, or .obj file.', 'error');
          return;
        }

        setFiles(prev => ({ ...prev, model: file }));
      }
    } else if (type === 'images') {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validFiles = acceptedFiles.filter(file => validImageTypes.includes(file.type));
      setFiles(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }
  };

  // Configure dropzone
  const { getRootProps: getModelRootProps, getInputProps: getModelInputProps } = useDropzone({
    accept: { 'model/gltf-binary': ['.glb'], 'model/gltf+json': ['.gltf'], 'model/obj': ['.obj'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, 'model')
  });

  const { getRootProps: getImagesRootProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true,
    onDrop: (acceptedFiles) => onDrop(acceptedFiles, 'images')
  });

  // Remove file from state
  const removeFile = (type, index) => {
    if (type === 'model') {
      setFiles(prev => ({ ...prev, model: null }));
    } else if (type === 'images') {
      const newImages = [...files.images];
      newImages.splice(index, 1);
      setFiles(prev => ({ ...prev, images: newImages }));
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ['title', 'category', 'period', 'material', 'origin'];
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field]) newErrors[field] = 'This field is required';
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showSnackbar('Please fill in all required fields', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Map UI fields to backend artifact schema
      const payload = {
        name: formData.title,
        description: formData.description,
        category: formData.category,
        period: formData.period,
        material: formData.material,
        origin: formData.origin,
        condition: formData.condition,
        isFragile: !!formData.isFragile,
        isOnDisplay: !!formData.isOnDisplay,
        acquisitionMethod: formData.acquisitionMethod,
        acquisitionDate: formData.acquisitionDate || undefined,
        donor: formData.donor,
        value: formData.value ? Number(formData.value) : undefined,
        insuranceInfo: formData.insuranceInfo,
        notes: formData.notes,
      };

      // Create artifact (metadata)
      const created = await api.createArtifact(payload);
      const artifactId = created?.artifact?._id || created?._id || created?.id;

      if (!artifactId) {
        throw new Error('Artifact created but no ID returned');
      }

      // Upload images if any
      if (files.images && files.images.length > 0) {
        await api.uploadArtifactImages(artifactId, files.images);
      }

      // Upload 3D model if present
      if (files.model) {
        await api.uploadArtifactModel(artifactId, files.model);
      }

      showSnackbar('Artifact uploaded successfully!', 'success');

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        period: '',
        material: '',
        origin: '',
        condition: 'good',
        isFragile: false,
        isOnDisplay: true,
        acquisitionMethod: 'donation',
        acquisitionDate: '',
        donor: '',
        value: '',
        insuranceInfo: '',
        notes: ''
      });
      setFiles({ model: null, images: [], documents: [] });

    } catch (err) {
      console.error('Artifact upload failed:', err);
      showSnackbar(err.message || 'Artifact upload failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper steps
  const steps = [
    {
      label: 'Basic Information', fields: [
        { name: 'title', label: 'Artifact Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        {
          name: 'category', label: 'Category', type: 'select',
          options: ['Sculpture', 'Pottery', 'Jewelry', 'Tool', 'Weapon', 'Textile', 'Other'],
          required: true
        },
        { name: 'period', label: 'Historical Period', type: 'text', required: true },
        { name: 'material', label: 'Material', type: 'text', required: true },
      ]
    },
    {
      label: 'Media & Files', fields: [
        { name: '3dModel', label: '3D Model', type: 'file', accept: '.glb,.gltf,.obj' },
        { name: 'images', label: 'Images', type: 'image', multiple: true },
      ]
    }
  ];

  return (
    <Card>
      <CardHeader title="Upload New Artifact" />
      <CardContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {step.fields.map((field) => (
                      <Grid item xs={12} key={field.name}>
                        {field.type === 'select' ? (
                          <FormControl fullWidth margin="normal" required={field.required}>
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              name={field.name}
                              value={formData[field.name] || ''}
                              onChange={handleChange}
                              label={field.label}
                            >
                              {field.options.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : field.type === 'textarea' ? (
                          <TextField
                            fullWidth
                            name={field.name}
                            label={field.label}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                            required={field.required}
                          />
                        ) : field.type === 'file' || field.type === 'image' ? (
                          <div {...(field.name === '3dModel' ? getModelRootProps() : getImagesRootProps())}>
                            <input {...(field.name === '3dModel' ? getModelInputProps() : {})} />
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'action.hover' }
                              }}
                            >
                              {field.name === '3dModel' ? (
                                <>
                                  <ThreeDRotationIcon fontSize="large" color="action" />
                                  <Typography>
                                    {files.model ? files.model.name : 'Drag & drop 3D model or click to select'}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <PhotoCameraIcon fontSize="large" color="action" />
                                  <Typography>
                                    {files.images.length > 0
                                      ? `Selected ${files.images.length} image(s)`
                                      : 'Drag & drop images or click to select'}
                                  </Typography>
                                </>
                              )}
                            </Paper>

                            {(field.name === '3dModel' && files.model) && (
                              <List>
                                <ListItem
                                  secondaryAction={
                                    <IconButton edge="end" onClick={() => removeFile('model')}>
                                      <DeleteIcon />
                                    </IconButton>
                                  }
                                >
                                  <ListItemIcon>
                                    <ThreeDRotationIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={files.model.name}
                                    secondary={`${(files.model.size / 1024 / 1024).toFixed(2)} MB`}
                                  />
                                </ListItem>
                              </List>
                            )}

                            {field.name === 'images' && files.images.length > 0 && (
                              <List>
                                {files.images.map((file, index) => (
                                  <ListItem
                                    key={index}
                                    secondaryAction={
                                      <IconButton edge="end" onClick={() => removeFile('images', index)}>
                                        <DeleteIcon />
                                      </IconButton>
                                    }
                                  >
                                    <ListItemIcon>
                                      <PhotoCameraIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={file.name}
                                      secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            )}
                          </div>
                        ) : (
                          <TextField
                            fullWidth
                            name={field.name}
                            label={field.label}
                            type={field.type || 'text'}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            margin="normal"
                            required={field.required}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type={index === steps.length - 1 ? 'submit' : 'button'}
                      disabled={isSubmitting}
                      onClick={() => index < steps.length - 1 && setActiveStep(activeStep + 1)}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                      {isSubmitting ? 'Submitting...' : index === steps.length - 1 ? 'Submit Artifact' : 'Continue'}
                    </Button>
                    {index > 0 && (
                      <Button
                        onClick={() => setActiveStep(activeStep - 1)}
                        sx={{ ml: 1 }}
                      >
                        Back
                      </Button>
                    )}
                  </Box>
                </form>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {isSubmitting && <LinearProgress sx={{ mt: 2 }} />}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default MuseumArtifactUpload;
