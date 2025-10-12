import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  EmojiEvents,
  CalendarMonth,
  Payment,
  School,
} from '@mui/icons-material';
import { BeltDisplay } from '@gym-management/ui-components';
import { BeltColor, BeltDegree } from '@gym-management/common';

/**
 * Student Dashboard Page
 * Shows student's current belt, upcoming classes, payments, etc.
 */
export const DashboardPage: React.FC = () => {
  // TODO: Fetch from API
  const student = {
    fullName: 'Maria Silva',
    currentBelt: BeltColor.BLUE,
    currentDegree: BeltDegree.DEGREE_2,
    enrollmentDate: '2024-01-15',
    nextClass: 'Monday, 18:00 - Advanced Class',
    upcomingPayment: 'R$ 150,00 - Due Dec 10',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Student Info */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              bgcolor: 'white',
              color: '#667eea',
            }}
          >
            MS
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700}>
              Welcome back, {student.fullName}!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Member since {new Date(student.enrollmentDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip
            label="Active"
            color="success"
            sx={{ bgcolor: '#10b981', fontWeight: 600 }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Current Belt Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EmojiEvents sx={{ color: '#f59e0b' }} />
                <Typography variant="h6" fontWeight={600}>
                  Current Graduation
                </Typography>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={3}
              >
                <BeltDisplay
                  beltColor={student.currentBelt}
                  beltDegree={student.currentDegree}
                  size="large"
                  showLabel={true}
                />

                <Box mt={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Next promotion
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    Blue Belt - 3rd Degree
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Estimated: 6 months
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#dbeafe',
                        display: 'flex',
                      }}
                    >
                      <CalendarMonth sx={{ color: '#1976d2' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Next Class
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {student.nextClass}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#fef3c7',
                        display: 'flex',
                      }}
                    >
                      <Payment sx={{ color: '#f59e0b' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Upcoming Payment
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {student.upcomingPayment}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: '#dcfce7',
                        display: 'flex',
                      }}
                    >
                      <School sx={{ color: '#16a34a' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Classes This Month
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        18 / 20
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Graduation History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Graduation History
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap">
                <Box textAlign="center">
                  <BeltDisplay
                    beltColor={BeltColor.WHITE}
                    beltDegree={BeltDegree.NONE}
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Jan 2024
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <BeltDisplay
                    beltColor={BeltColor.BLUE}
                    beltDegree={BeltDegree.NONE}
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Jul 2024
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <BeltDisplay
                    beltColor={BeltColor.BLUE}
                    beltDegree={BeltDegree.DEGREE_1}
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Sep 2024
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <BeltDisplay
                    beltColor={BeltColor.BLUE}
                    beltDegree={BeltDegree.DEGREE_2}
                    size="small"
                  />
                  <Typography variant="caption" display="block" mt={1}>
                    Oct 2024
                  </Typography>
                  <Chip label="Current" size="small" color="primary" sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

