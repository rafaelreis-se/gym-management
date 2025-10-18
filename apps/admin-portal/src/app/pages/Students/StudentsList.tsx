import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  TableSortLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const { t } = useTranslation();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'ageCategory' | 'graduation'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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
  const getCurrentGraduation = useCallback((student: any) => {
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
  }, []);

  // Filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const digitsOnly = term.replace(/\D/g, ''); // Extract only digits from search

      filtered = students.filter((student) => {
        const nameMatch = student.fullName?.toLowerCase().includes(term);
        const emailMatch = student.email?.toLowerCase().includes(term);

        // Only search CPF if the search term has digits
        let cpfMatch = false;
        if (digitsOnly.length > 0) {
          const studentCpf = student.cpf?.replace(/\D/g, '') || '';
          cpfMatch = studentCpf.includes(digitsOnly);
        }

        return nameMatch || emailMatch || cpfMatch;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortBy) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'ageCategory':
          aValue = a.ageCategory;
          bValue = b.ageCategory;
          break;
        case 'graduation': {
          const aGrad = getCurrentGraduation(a);
          const bGrad = getCurrentGraduation(b);
          aValue = aGrad?.belt?.name || '';
          bValue = bGrad?.belt?.name || '';
          break;
        }
        default:
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return sorted;
  }, [students, searchTerm, sortBy, sortOrder, getCurrentGraduation]);

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

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return t('status.active');
      case 'INACTIVE':
        return t('status.inactive');
      case 'SUSPENDED':
        return t('status.suspended');
      case 'CANCELLED':
        return t('status.cancelled');
      default:
        return t('status.active');
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
          }}
        >
          {t('students.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/students/new')}
          size="large"
          sx={{
            alignSelf: { xs: 'stretch', sm: 'auto' },
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            padding: { xs: '8px 16px', sm: '10px 24px' },
          }}
        >
          {t('students.new')}
        </Button>
      </Box>

      <Card>
        <Box p={2} borderBottom="1px solid #e5e7eb">
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <Box flex={1} minWidth="300px">
              <TextField
                fullWidth
                placeholder={t('students.search-placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>{t('students.sort-by')}</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'name' | 'ageCategory' | 'graduation'
                  )
                }
                label={t('students.sort-by')}
              >
                <MenuItem value="name">{t('students.sort-name')}</MenuItem>
                <MenuItem value="ageCategory">
                  {t('students.sort-category')}
                </MenuItem>
                <MenuItem value="graduation">
                  {t('students.sort-belt')}
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{ minWidth: 100 }}
            >
              {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </Button>
          </Box>
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
                      <Typography fontWeight={600}>
                        {t('students.name')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {t('students.contact')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {t('students.category')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {t('students.current-belt')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {t('students.status')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>
                        {t('students.actions')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAndSortedStudents.map((student: Student) => (
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
                          label={student.ageCategory || t('students.not-set')}
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
                              {t('students.no-belt')}
                            </Typography>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(student.status || 'ACTIVE')}
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
              {filteredAndSortedStudents.map((student: Student) => {
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
                          label={getStatusLabel(student.status || 'ACTIVE')}
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
                          label={student.ageCategory || t('students.not-set')}
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
                            {t('students.current-belt')}:
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
                              {t('students.no-belt')}
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

        {!isLoading &&
          filteredAndSortedStudents.length === 0 &&
          students.length > 0 && (
            <Box p={4} textAlign="center">
              <Typography variant="h6" color="text.secondary">
                {t('students.no-students-found')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('students.adjust-search-terms')}
              </Typography>
            </Box>
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
