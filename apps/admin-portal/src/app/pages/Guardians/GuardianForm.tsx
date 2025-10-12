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
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, CheckCircle } from '@mui/icons-material';
import { guardiansService } from '../../services';

export const GuardianFormPage: React.FC = () => {
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
    alternativePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profession: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      };

      if (isEdit) {
        await guardiansService.update(id!, requestData);
      } else {
        await guardiansService.create(requestData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/guardians');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving guardian. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" mb={3} gap={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/guardians')}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Edit Guardian' : 'New Guardian'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          Guardian saved successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
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
                      placeholder="12345678901"
                      value={formData.cpf}
                      onChange={handleChange('cpf')}
                      inputProps={{ maxLength: 11 }}
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
                      placeholder="11999999999"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Alternative Phone"
                      placeholder="11988888888"
                      value={formData.alternativePhone}
                      onChange={handleChange('alternativePhone')}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Profession"
                      value={formData.profession}
                      onChange={handleChange('profession')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

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
                      value={formData.address}
                      onChange={handleChange('address')}
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={handleChange('city')}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
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
                      placeholder="01234567"
                      value={formData.zipCode}
                      onChange={handleChange('zipCode')}
                      inputProps={{ maxLength: 8 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange('notes')}
                      placeholder="Additional notes..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/guardians')}
                size="large"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                size="large"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Guardian' : 'Create Guardian'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

