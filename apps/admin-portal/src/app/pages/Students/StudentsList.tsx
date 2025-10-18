import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  People,
} from '@mui/icons-material';
import { BeltDisplay } from '@gym-management/ui-components';
import { studentsService } from '../../services/students.service';

interface Student {
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  status: string;
  ageCategory?: string;
}

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch students data from API
  const {
    data: studentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentsService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const students = studentsResponse?.data || [];

  // Get current graduation (latest graduation) for a student
  const getCurrentGraduation = (student: any) => {
    if (!student.graduations || student.graduations.length === 0) {
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'SUSPENDED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Students Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/students/new')}
          size="large"
        >
          New Student
        </Button>
      </Box>

      <Card>
        <Box p={2} borderBottom="1px solid #e5e7eb">
          <TextField
            fullWidth
            placeholder="Search by name, email, or CPF..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isLoading && (
          <Box p={4} textAlign="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading students...
            </Typography>
          </Box>
        )}

        {error && (
          <Box p={2}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            >
              Error loading students. Please try again.
            </Alert>
          </Box>
        )}

        {!isLoading && !error && (
          <>
            {/* Desktop Table */}
            <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight={600}>Student</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>Contact</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>Category</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>Current Belt</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>Status</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>Actions</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student: Student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Typography
                          fontWeight={600}
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {student.fullName?.toLowerCase()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.cpf}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{student.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.phone}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.ageCategory || 'Not Set'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {(() => {
                          const currentGraduation =
                            getCurrentGraduation(student);
                          return currentGraduation ? (
                            <BeltDisplay
                              beltColor={currentGraduation.beltColor}
                              beltDegree={currentGraduation.beltDegree}
                              size="small"
                              showLabel={false}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              No belt
                            </Typography>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.status || 'Active'}
                          color={getStatusColor(student.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/students/${student.id}/edit`)
                          }
                        >
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Cards */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {students.map((student: Student) => {
                const currentGraduation = getCurrentGraduation(student);
                return (
                  <Card
                    key={student.id}
                    sx={{
                      mb: 2,
                      mx: 2,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={2}
                      >
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ textTransform: 'capitalize' }}
                          >
                            {student.fullName?.toLowerCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.cpf}
                          </Typography>
                        </Box>
                        <Chip
                          label={student.status || 'Active'}
                          color={getStatusColor(student.status)}
                          size="small"
                        />
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Box>
                          <Typography variant="body2">
                            {student.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.phone}
                          </Typography>
                        </Box>
                        <Chip
                          label={student.ageCategory || 'Not Set'}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            Current Belt:
                          </Typography>
                          {currentGraduation ? (
                            <BeltDisplay
                              beltColor={currentGraduation.beltColor}
                              beltDegree={currentGraduation.beltDegree}
                              size="small"
                              showLabel={false}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              No belt
                            </Typography>
                          )}
                        </Box>

                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/students/${student.id}/edit`)
                            }
                          >
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </>
        )}

        {!isLoading && students.length === 0 && (
          <Box p={8} textAlign="center">
            <People sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No students yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first student to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/students/new')}
            >
              Add Student
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
};
