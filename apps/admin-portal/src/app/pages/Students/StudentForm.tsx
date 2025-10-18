import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
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
  Alert,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Search, Person, Close } from '@mui/icons-material';
import {
  AgeCategory,
  StudentStatus,
  GuardianRelationship,
} from '@gym-management/types';
import { studentsService, guardiansService } from '../../services';

interface Guardian {
  id?: string;
  fullName: string;
  email: string;
  cpf: string;
  rg?: string;
  birthDate?: string;
  phone: string;
  alternativePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profession?: string;
  notes?: string;
}

function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch student data for edit mode
  const { data: studentData } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getById(id!),
    enabled: !!id,
  });

  // Form data
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

  // Guardian data
  const [guardianCpf, setGuardianCpf] = useState('');
  const [existingGuardian, setExistingGuardian] = useState<Guardian | null>(
    null
  );
  const [showGuardianForm, setShowGuardianForm] = useState(false);
  const [guardianData, setGuardianData] = useState<Guardian>({
    fullName: '',
    email: '',
    cpf: '',
    phone: '',
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
  });
  const [guardianRelationship, setGuardianRelationship] =
    useState<GuardianRelationship>(GuardianRelationship.MOTHER);

  // UI States
  const [loading, setLoading] = useState(false);
  const [searchingGuardian, setSearchingGuardian] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (studentData?.data && isEdit) {
      const student = studentData.data;
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        cpf: student.cpf || '',
        rg: student.rg || '',
        birthDate: student.birthDate
          ? new Date(student.birthDate).toISOString().split('T')[0]
          : '',
        phone: student.phone || '',
        emergencyPhone: student.emergencyPhone || '',
        address: student.address || '',
        city: student.city || '',
        state: student.state || '',
        zipCode: student.zipCode || '',
        ageCategory: student.ageCategory || AgeCategory.ADULT,
        status: student.status || StudentStatus.ACTIVE,
        medicalObservations: student.medicalObservations || '',
        notes: student.notes || '',
      });

      // If student has guardian, set it as existing guardian
      if (student.guardians && student.guardians.length > 0) {
        setExistingGuardian(student.guardians[0]);
      }
    }
  }, [studentData, isEdit]);

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });

    // Sync address with guardian if child
    if (formData.ageCategory === AgeCategory.CHILD && !existingGuardian) {
      if (['address', 'city', 'state', 'zipCode'].includes(field)) {
        setGuardianData({
          ...guardianData,
          [field]: event.target.value,
        });
      }
    }
  };

  const handleGuardianChange = (field: string) => (event: any) => {
    setGuardianData({ ...guardianData, [field]: event.target.value });
  };

  const searchGuardianByCpf = async () => {
    if (!guardianCpf || guardianCpf.length < 11) {
      const errorMessage = t('error.invalid-cpf');
      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      });

      return;
    }

    setSearchingGuardian(true);
    setError(null);

    try {
      const guardian = await guardiansService.findByCpf(guardianCpf);

      if (guardian) {
        setExistingGuardian(guardian);
        setShowGuardianForm(false);
        toast.success(t('success.guardian-found'), {
          position: 'top-right',
          autoClose: 2000,
        });
      } else {
        // Guardian not found, show form to create new
        setExistingGuardian(null);
        setShowGuardianForm(true);
        setGuardianData({
          ...guardianData,
          cpf: guardianCpf,
        });
        toast.info(t('info.guardian-not-found'), {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (err: any) {
      const errorMessage = t('error.guardian-search');
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 4000,
      });

      // Scroll to top to show the error alert as well
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSearchingGuardian(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isChild = formData.ageCategory === AgeCategory.CHILD;

      if (isChild && !existingGuardian && !showGuardianForm) {
        const errorMessage = t('error.children-require-guardian');
        setError(errorMessage);

        // Show error toast
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Scroll to top to show the error alert as well
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setLoading(false);
        return;
      }

      let requestData: any;

      if (isEdit) {
        // Update existing student
        requestData = {
          ...formData,
          birthDate: new Date(formData.birthDate),
        };

        await studentsService.update(id!, requestData);
      } else {
        // Create new student
        if (isChild && (existingGuardian || showGuardianForm)) {
          // Create student with guardian
          requestData = {
            student: {
              ...formData,
              birthDate: new Date(formData.birthDate),
            },
            guardian: existingGuardian || {
              ...guardianData,
              birthDate: guardianData.birthDate
                ? new Date(guardianData.birthDate)
                : undefined,
            },
            guardianRelationship: {
              relationship: guardianRelationship,
              isFinanciallyResponsible: true,
              isEmergencyContact: true,
              canPickUp: true,
            },
          };

          await studentsService.createWithGuardian(requestData);
        } else {
          // Create student only (adult)
          requestData = {
            ...formData,
            birthDate: new Date(formData.birthDate),
          };

          await studentsService.create(requestData);
        }
      }

      // Invalidate students cache to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['students'] });

      // Show success toast
      if (isEdit) {
        toast.success(t('students.updated-success'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success(t('students.created-success'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      setTimeout(() => {
        navigate('/students');
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || t('error.saving-student');
      setError(errorMessage);

      // Show error toast
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Scroll to top to show the error alert as well
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const isChildCategory = formData.ageCategory === AgeCategory.CHILD;

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
          {isEdit ? t('students.edit-student') : t('students.add-student')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', width: '100%', maxWidth: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Personal Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.full-name')}
                      required
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.email')}
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange('email')}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('students.form.cpf')}
                      required
                      placeholder="12345678901"
                      value={formData.cpf}
                      onChange={handleChange('cpf')}
                      inputProps={{ maxLength: 11 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('students.form.rg')}
                      value={formData.rg}
                      onChange={handleChange('rg')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.birth-date')}
                      type="date"
                      required
                      InputLabelProps={{ shrink: true }}
                      value={formData.birthDate}
                      onChange={handleChange('birthDate')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.phone')}
                      required
                      placeholder="11999999999"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.emergency-phone')}
                      placeholder="11988888888"
                      value={formData.emergencyPhone}
                      onChange={handleChange('emergencyPhone')}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Address */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', width: '100%', maxWidth: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  {t('students.form.address')}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.address')}
                      required
                      value={formData.address}
                      onChange={handleChange('address')}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('students.form.city')}
                      required
                      value={formData.city}
                      onChange={handleChange('city')}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('students.form.state')}
                      required
                      placeholder="SP"
                      value={formData.state}
                      onChange={handleChange('state')}
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('students.form.zip-code')}
                      required
                      placeholder="01234567"
                      value={formData.zipCode}
                      onChange={handleChange('zipCode')}
                      inputProps={{ maxLength: 8 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Information */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%', width: '100%', maxWidth: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  Student Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Age Category *</InputLabel>
                      <Select
                        value={formData.ageCategory}
                        onChange={handleChange('ageCategory')}
                        label="Age Category *"
                      >
                        <MenuItem value={AgeCategory.ADULT}>
                          Adult (16+)
                        </MenuItem>
                        <MenuItem value={AgeCategory.CHILD}>
                          Child (4-15)
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={handleChange('status')}
                        label="Status"
                      >
                        <MenuItem value={StudentStatus.ACTIVE}>Active</MenuItem>
                        <MenuItem value={StudentStatus.INACTIVE}>
                          Inactive
                        </MenuItem>
                        <MenuItem value={StudentStatus.SUSPENDED}>
                          Suspended
                        </MenuItem>
                        <MenuItem value={StudentStatus.CANCELLED}>
                          Cancelled
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medical Observations"
                      multiline
                      rows={4}
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

          {/* Guardian Information (only for children) */}
          <Collapse in={isChildCategory} sx={{ width: '100%' }}>
            <Grid item xs={12} sx={{ px: 3, pt: 3 }}>
              <Card sx={{ border: '2px solid', borderColor: 'primary.main' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <Person color="primary" />
                    <Typography variant="h6" fontWeight={600} color="primary">
                      Guardian Information (Required for Children)
                    </Typography>
                  </Box>

                  {/* Search Guardian by CPF */}
                  {!existingGuardian && !showGuardianForm && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 3 }}>
                        First, search if the guardian is already registered. If
                        not found, you can register a new one.
                      </Alert>

                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Guardian CPF"
                            placeholder="12345678901"
                            value={guardianCpf}
                            onChange={(e) => setGuardianCpf(e.target.value)}
                            inputProps={{ maxLength: 11 }}
                            helperText="Enter CPF to search for existing guardian"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                              searchingGuardian ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Search />
                              )
                            }
                            onClick={searchGuardianByCpf}
                            disabled={
                              searchingGuardian || guardianCpf.length < 11
                            }
                            size="large"
                          >
                            {searchingGuardian
                              ? 'Searching...'
                              : 'Search Guardian'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Existing Guardian Found */}
                  {existingGuardian && (
                    <Box>
                      <Alert
                        severity="success"
                        action={
                          <IconButton
                            size="small"
                            onClick={() => {
                              setExistingGuardian(null);
                              setGuardianCpf('');
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        }
                        sx={{ mb: 2 }}
                      >
                        Guardian found! The student will be linked to this
                        guardian.
                      </Alert>

                      <Card variant="outlined">
                        <CardContent>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="start"
                            mb={2}
                          >
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {existingGuardian.fullName}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                CPF: {existingGuardian.cpf}
                              </Typography>
                            </Box>
                            <Chip
                              label="Existing Guardian"
                              color="success"
                              size="small"
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Email
                              </Typography>
                              <Typography variant="body1">
                                {existingGuardian.email}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Phone
                              </Typography>
                              <Typography variant="body1">
                                {existingGuardian.phone}
                              </Typography>
                            </Grid>
                            {existingGuardian.address && (
                              <Grid item xs={12}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Address
                                </Typography>
                                <Typography variant="body1">
                                  {existingGuardian.address},{' '}
                                  {existingGuardian.city} -{' '}
                                  {existingGuardian.state}
                                </Typography>
                              </Grid>
                            )}
                          </Grid>

                          <Box mt={3}>
                            <FormControl fullWidth>
                              <InputLabel>Relationship *</InputLabel>
                              <Select
                                value={guardianRelationship}
                                onChange={(e) =>
                                  setGuardianRelationship(
                                    e.target.value as GuardianRelationship
                                  )
                                }
                                label="Relationship *"
                              >
                                <MenuItem value={GuardianRelationship.MOTHER}>
                                  Mother
                                </MenuItem>
                                <MenuItem value={GuardianRelationship.FATHER}>
                                  Father
                                </MenuItem>
                                <MenuItem
                                  value={GuardianRelationship.GRANDMOTHER}
                                >
                                  Grandmother
                                </MenuItem>
                                <MenuItem
                                  value={GuardianRelationship.GRANDFATHER}
                                >
                                  Grandfather
                                </MenuItem>
                                <MenuItem value={GuardianRelationship.AUNT}>
                                  Aunt
                                </MenuItem>
                                <MenuItem value={GuardianRelationship.UNCLE}>
                                  Uncle
                                </MenuItem>
                                <MenuItem
                                  value={GuardianRelationship.LEGAL_GUARDIAN}
                                >
                                  Legal Guardian
                                </MenuItem>
                                <MenuItem value={GuardianRelationship.OTHER}>
                                  Other
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {/* New Guardian Form */}
                  {showGuardianForm && (
                    <Box>
                      <Alert severity="warning" sx={{ mb: 3 }}>
                        Guardian not found. Please fill in the information below
                        to register a new guardian.
                      </Alert>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Guardian Full Name"
                            required
                            value={guardianData.fullName}
                            onChange={handleGuardianChange('fullName')}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Guardian Email"
                            type="email"
                            required
                            value={guardianData.email}
                            onChange={handleGuardianChange('email')}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Guardian CPF"
                            required
                            value={guardianData.cpf}
                            onChange={handleGuardianChange('cpf')}
                            disabled
                            inputProps={{ maxLength: 11 }}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Guardian Phone"
                            required
                            placeholder="11999999999"
                            value={guardianData.phone}
                            onChange={handleGuardianChange('phone')}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Relationship *</InputLabel>
                            <Select
                              value={guardianRelationship}
                              onChange={(e) =>
                                setGuardianRelationship(
                                  e.target.value as GuardianRelationship
                                )
                              }
                              label="Relationship *"
                            >
                              <MenuItem value={GuardianRelationship.MOTHER}>
                                Mother
                              </MenuItem>
                              <MenuItem value={GuardianRelationship.FATHER}>
                                Father
                              </MenuItem>
                              <MenuItem
                                value={GuardianRelationship.GRANDMOTHER}
                              >
                                Grandmother
                              </MenuItem>
                              <MenuItem
                                value={GuardianRelationship.GRANDFATHER}
                              >
                                Grandfather
                              </MenuItem>
                              <MenuItem value={GuardianRelationship.AUNT}>
                                Aunt
                              </MenuItem>
                              <MenuItem value={GuardianRelationship.UNCLE}>
                                Uncle
                              </MenuItem>
                              <MenuItem
                                value={GuardianRelationship.LEGAL_GUARDIAN}
                              >
                                Legal Guardian
                              </MenuItem>
                              <MenuItem value={GuardianRelationship.OTHER}>
                                Other
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Guardian Address (Optional - will use student's
                            address if not provided)
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Guardian Address"
                            value={guardianData.address}
                            onChange={handleGuardianChange('address')}
                          />
                        </Grid>

                        <Grid item xs={12} md={5}>
                          <TextField
                            fullWidth
                            label="City"
                            value={guardianData.city}
                            onChange={handleGuardianChange('city')}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="State"
                            placeholder="SP"
                            value={guardianData.state}
                            onChange={handleGuardianChange('state')}
                            inputProps={{ maxLength: 2 }}
                          />
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <TextField
                            fullWidth
                            label="ZIP Code"
                            placeholder="01234567"
                            value={guardianData.zipCode}
                            onChange={handleGuardianChange('zipCode')}
                            inputProps={{ maxLength: 8 }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            startIcon={<Close />}
                            onClick={() => {
                              setShowGuardianForm(false);
                              setGuardianCpf('');
                              setGuardianData({
                                fullName: '',
                                email: '',
                                cpf: '',
                                phone: '',
                                address: formData.address,
                                city: formData.city,
                                state: formData.state,
                                zipCode: formData.zipCode,
                              });
                            }}
                          >
                            Cancel and Search Again
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Collapse>

          {/* Actions */}
          <Grid item xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/students')}
                size="large"
                disabled={loading}
              >
                {t('students.form.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                size="large"
                disabled={
                  loading ||
                  (!isEdit &&
                    isChildCategory &&
                    !existingGuardian &&
                    !showGuardianForm)
                }
              >
                {loading
                  ? t('students.form.saving')
                  : isEdit
                  ? t('students.form.update-student')
                  : t('students.form.create-student')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default StudentForm;
export { StudentForm as StudentFormPage };
