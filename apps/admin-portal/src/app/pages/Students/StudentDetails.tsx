import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Mock data for demonstration
const mockStudent = {
  id: '1',
  fullName: 'Maria Silva',
  email: 'maria@example.com',
  cpf: '123.456.789-01',
  phone: '(11) 99999-9999',
  emergencyPhone: '(11) 88888-8888',
  address: 'Rua Teste, 123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  status: StudentStatus.ACTIVE,
  ageCategory: 'ADULT',
  medicalObservations: 'No allergies',
  currentBelt: BeltColor.BLUE,
  currentDegree: BeltDegree.DEGREE_2,
  enrollments: [
    {
      id: '1',
      modality: 'Jiu-Jitsu',
      startDate: '2023-01-15',
      isActive: true,
    },
  ],
  graduations: [
    {
      id: '1',
      beltColor: BeltColor.WHITE,
      beltDegree: BeltDegree.DEGREE_4,
      graduationDate: '2023-01-15',
      modality: 'Jiu-Jitsu',
      grantedBy: 'Professor João',
    },
    {
      id: '2',
      beltColor: BeltColor.BLUE,
      beltDegree: BeltDegree.NONE,
      graduationDate: '2024-01-15',
      modality: 'Jiu-Jitsu',
      grantedBy: 'Professor João',
    },
    {
      id: '3',
      beltColor: BeltColor.BLUE,
      beltDegree: BeltDegree.DEGREE_2,
      graduationDate: '2024-08-10',
      modality: 'Jiu-Jitsu',
      grantedBy: 'Professor João',
    },
  ],
  guardians: [
    {
      id: '1',
      fullName: 'João Silva',
      relationship: 'Father',
      phone: '(11) 97777-7777',
      isFinanciallyResponsible: true,
    },
  ],
};

export const StudentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [graduationModalOpen, setGraduationModalOpen] = useState(false);

  // TODO: Fetch student data from API
  const student = mockStudent;

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

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
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
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {student.fullName}
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
                  <Typography variant="body1">{student.emergencyPhone}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {student.address}, {student.city} - {student.state}, {student.zipCode}
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
                    <Typography variant="body1">{student.medicalObservations}</Typography>
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
              <Box display="flex" justifyContent="center">
                <BeltDisplay
                  beltColor={student.currentBelt}
                  beltDegree={student.currentDegree}
                  size="large"
                  showLabel={true}
                />
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
                      {guardian.isFinanciallyResponsible && ' • Financial Responsible'}
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
                          {new Date(graduation.graduationDate).toLocaleDateString()}
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
          // TODO: Refresh student data
          console.log('Graduation added successfully');
        }}
      />
    </>
  );
};

