import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { People, AttachMoney, TrendingUp, Warning } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: any) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: `${color}.100`,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

import { useTranslation } from 'react-i18next';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('dashboard')}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value="0"
            icon={<People />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue This Month"
            value="R$ 0"
            icon={<AttachMoney />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Enrollments"
            value="0"
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Payments"
            value="0"
            icon={<Warning />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('welcome.admin')}
          </Typography>
          <Typography color="text.secondary">
            {t('welcome.instruction')}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};
