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
  IconButton,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Search, Person } from '@mui/icons-material';

// Mock data for demonstration
const mockGuardians = [
  {
    id: '1',
    fullName: 'Maria Silva',
    email: 'maria@example.com',
    cpf: '123.456.789-01',
    phone: '(11) 99999-9999',
    studentsCount: 2,
    students: ['Pedro Silva', 'Ana Silva'],
  },
  {
    id: '2',
    fullName: 'João Santos',
    email: 'joao@example.com',
    cpf: '987.654.321-00',
    phone: '(11) 88888-8888',
    studentsCount: 1,
    students: ['Lucas Santos'],
  },
];

export const GuardiansListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Guardians Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/guardians/new')}
          size="large"
        >
          New Guardian
        </Button>
      </Box>

      <Card>
        <Box p={2} borderBottom="1px solid #e5e7eb">
          <TextField
            fullWidth
            placeholder="Search guardians..."
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
                  <Typography fontWeight={600}>Students</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockGuardians.map((guardian) => (
                <TableRow key={guardian.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{guardian.fullName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      CPF: {guardian.cpf}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{guardian.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {guardian.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={<Person />}
                        label={`${guardian.studentsCount} student${guardian.studentsCount > 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {guardian.students.join(', ')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/guardians/${guardian.id}/edit`)}
                      title="Edit"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" title="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {mockGuardians.length === 0 && (
          <Box p={8} textAlign="center">
            <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No guardians yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Guardians are automatically created when registering children students
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/guardians/new')}
            >
              Add Guardian
            </Button>
          </Box>
        )}
      </Card>
    </>
  );
};

