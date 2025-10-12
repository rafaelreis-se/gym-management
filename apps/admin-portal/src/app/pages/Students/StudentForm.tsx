import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { AgeCategory, StudentStatus } from '@gym-management/types';

export const StudentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cpf: '',
    rg: '',
    birthDate: '',
    phone: '',
    emergencyPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    ageCategory: AgeCategory.ADULT,
    status: StudentStatus.ACTIVE,
    medicalObservations: '',
    notes: '',
  });

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Integrar com API
    console.log('Saving student:', formData);
    
    // Simulate API call
    alert('Student saved successfully! (Integration with API pending)');
    navigate('/students');
  };

  return (
    <>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/students')}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Edit Student' : 'New Student'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Personal Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      required
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange('email')}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="CPF"
                      required
                      placeholder="123.456.789-01"
                      value={formData.cpf}
                      onChange={handleChange('cpf')}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="RG"
                      value={formData.rg}
                      onChange={handleChange('rg')}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Birth Date"
                      type="date"
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.birthDate}
                      onChange={handleChange('birthDate')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Emergency Phone"
                      placeholder="(11) 88888-8888"
                      value={formData.emergencyPhone}
                      onChange={handleChange('emergencyPhone')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Address
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      required
                      value={formData.address}
                      onChange={handleChange('address')}
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="City"
                      required
                      value={formData.city}
                      onChange={handleChange('city')}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      required
                      placeholder="SP"
                      value={formData.state}
                      onChange={handleChange('state')}
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      required
                      placeholder="01234-567"
                      value={formData.zipCode}
                      onChange={handleChange('zipCode')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Student Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Age Category</InputLabel>
                      <Select
                        value={formData.ageCategory}
                        onChange={handleChange('ageCategory')}
                        label="Age Category"
                      >
                        <MenuItem value={AgeCategory.ADULT}>Adult (16+)</MenuItem>
                        <MenuItem value={AgeCategory.CHILD}>Child (4-15)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={handleChange('status')}
                        label="Status"
                      >
                        <MenuItem value={StudentStatus.ACTIVE}>Active</MenuItem>
                        <MenuItem value={StudentStatus.INACTIVE}>Inactive</MenuItem>
                        <MenuItem value={StudentStatus.SUSPENDED}>Suspended</MenuItem>
                        <MenuItem value={StudentStatus.CANCELLED}>Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medical Observations"
                      multiline
                      rows={3}
                      value={formData.medicalObservations}
                      onChange={handleChange('medicalObservations')}
                      placeholder="Any medical conditions, allergies, etc..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange('notes')}
                      placeholder="Additional notes..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/students')}
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                size="large"
              >
                {isEdit ? 'Update Student' : 'Create Student'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

