import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
} from '@mui/icons-material';
import { BeltDisplay } from '@gym-management/ui-components';
import { BeltColor, BeltDegree, StudentStatus } from '@gym-management/types';

// Mock data for demonstration
const mockStudents = [
  {
    id: '1',
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    cpf: '123.456.789-01',
    phone: '(11) 99999-9999',
    status: StudentStatus.ACTIVE,
    ageCategory: 'ADULT',
    currentBelt: BeltColor.BLUE,
    currentDegree: BeltDegree.DEGREE_2,
  },
  {
    id: '2',
    fullName: 'João Santos',
    email: 'joao@example.com',
    cpf: '987.654.321-00',
    phone: '(11) 88888-8888',
    status: StudentStatus.ACTIVE,
    ageCategory: 'CHILD',
    currentBelt: BeltColor.YELLOW,
    currentDegree: BeltDegree.DEGREE_1,
  },
];

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight={600}>Name</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Contact</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Current Belt</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Status</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Category</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{student.fullName}</Typography>
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
                  <TableCell>
                    <BeltDisplay
                      beltColor={student.currentBelt}
                      beltDegree={student.currentDegree}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      color={getStatusColor(student.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={student.ageCategory} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/students/${student.id}/edit`)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {mockStudents.length === 0 && (
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

