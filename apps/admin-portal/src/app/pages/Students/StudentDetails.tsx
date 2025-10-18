import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  EmojiEvents,
  Person,
  Phone,
  Email,
  Home,
  MedicalServices,
} from '@mui/icons-material';
import { BeltDisplay } from '@gym-management/ui-components';
import { BeltColor, BeltDegree, StudentStatus } from '@gym-management/types';
import { GraduationModal } from './GraduationModal';
import { studentsService } from '../../services/students.service';
import { CircularProgress, Alert } from '@mui/material';

export const StudentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [graduationModalOpen, setGraduationModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch student data from API
  const {
    data: studentResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getById(id as string),
    enabled: !!id,
  });

  const student = studentResponse?.data;

  // Get current graduation (latest graduation)
  const getCurrentGraduation = () => {
    if (!student?.graduations || student.graduations.length === 0) {
      return null;
    }

    // Sort graduations by date and get the most recent one
    const sortedGraduations = [...student.graduations].sort(
      (a, b) =>
        new Date(b.graduationDate).getTime() -
        new Date(a.graduationDate).getTime()
    );

    return sortedGraduations[0];
  };

  const currentGraduation = getCurrentGraduation();

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ACTIVE:
        return 'success';
      case StudentStatus.INACTIVE:
        return 'default';
      case StudentStatus.SUSPENDED:
        return 'warning';
      case StudentStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error loading student details. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box p={3}>
        <Alert severity="warning">Student not found.</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/students')}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={700}>
            Student Details
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmojiEvents />}
            onClick={() => setGraduationModalOpen(true)}
          >
            Add Graduation
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/students/edit/${id}`)}
          >
            Edit Student
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                mb={3}
              >
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    gutterBottom
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {student.fullName?.toLowerCase()}
                  </Typography>
                  <Chip
                    label={student.status}
                    color={getStatusColor(student.status)}
                    size="small"
                  />
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1">{student.email}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      CPF
                    </Typography>
                  </Box>
                  <Typography variant="body1">{student.cpf}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1">{student.phone}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Emergency Phone
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.emergencyPhone}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.address}, {student.city} - {student.state},{' '}
                    {student.zipCode}
                  </Typography>
                </Grid>

                {student.medicalObservations && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <MedicalServices fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Medical Observations
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {student.medicalObservations}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Belt */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Current Belt
              </Typography>
              <Box
                display="flex"
                justifyContent="center"
                flexDirection="column"
                alignItems="center"
              >
                {currentGraduation ? (
                  <BeltDisplay
                    beltColor={currentGraduation.beltColor}
                    beltDegree={currentGraduation.beltDegree}
                    size="large"
                    showLabel={true}
                  />
                ) : (
                  <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      No graduations yet
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EmojiEvents />}
                      onClick={() => setGraduationModalOpen(true)}
                    >
                      Add First Graduation
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {student.guardians && student.guardians.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Guardians
                </Typography>
                {student.guardians.map((guardian) => (
                  <Box key={guardian.id} mb={2}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {guardian.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {guardian.relationship}
                      {guardian.isFinanciallyResponsible &&
                        ' • Financial Responsible'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {guardian.phone}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Graduation History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Graduation History
              </Typography>

              {student.graduations && student.graduations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Belt</TableCell>
                        <TableCell>Modality</TableCell>
                        <TableCell>Granted By</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {student.graduations.map((graduation) => (
                        <TableRow key={graduation.id}>
                          <TableCell>
                            {new Date(
                              graduation.graduationDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <BeltDisplay
                              beltColor={graduation.beltColor}
                              beltDegree={graduation.beltDegree}
                              size="small"
                              showLabel={false}
                            />
                          </TableCell>
                          <TableCell>{graduation.modality}</TableCell>
                          <TableCell>{graduation.grantedBy || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    No graduations recorded yet
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<EmojiEvents />}
                    onClick={() => setGraduationModalOpen(true)}
                  >
                    Add First Graduation
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <GraduationModal
        open={graduationModalOpen}
        onClose={() => setGraduationModalOpen(false)}
        studentId={student.id}
        studentName={student.fullName}
        onSuccess={() => {
          // Refresh student data after adding graduation
          queryClient.invalidateQueries({ queryKey: ['student', id] });
          setGraduationModalOpen(false);
        }}
      />
    </>
  );
};
