import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { BeltDisplay } from '@gym-management/ui-components';
import { BeltColor, BeltDegree } from '@gym-management/types';

// Mock data for demonstration
const mockGraduations = [
  {
    id: '1',
    studentName: 'Maria Silva',
    studentId: '1',
    modality: 'Jiu-Jitsu',
    beltColor: BeltColor.BLUE,
    beltDegree: BeltDegree.DEGREE_2,
    graduationDate: '2024-08-10',
    grantedBy: 'Professor João',
  },
  {
    id: '2',
    studentName: 'Pedro Santos',
    studentId: '2',
    modality: 'Jiu-Jitsu',
    beltColor: BeltColor.YELLOW,
    beltDegree: BeltDegree.DEGREE_1,
    graduationDate: '2024-09-15',
    grantedBy: 'Professor Marcos',
  },
];

export const GraduationsListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Graduations Management
        </Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography fontWeight={600}>Student</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Belt</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Modality</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Graduation Date</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight={600}>Granted By</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockGraduations.map((graduation) => (
                <TableRow key={graduation.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{graduation.studentName}</Typography>
                  </TableCell>
                  <TableCell>
                    <BeltDisplay
                      beltColor={graduation.beltColor}
                      beltDegree={graduation.beltDegree}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={graduation.modality} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {new Date(graduation.graduationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{graduation.grantedBy || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/students/${graduation.studentId}`)}
                      title="View Student"
                    >
                      <Visibility fontSize="small" />
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

        {mockGraduations.length === 0 && (
          <Box p={8} textAlign="center">
            <Typography variant="h6" color="text.secondary">
              No graduations registered yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Graduations are registered from the student's detail page
            </Typography>
          </Box>
        )}
      </Card>
    </>
  );
};

