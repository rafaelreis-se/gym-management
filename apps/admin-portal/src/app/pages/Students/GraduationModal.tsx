import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { EmojiEvents, Close } from '@mui/icons-material';
import { BeltColor, BeltDegree, Modality } from '@gym-management/types';
import { BeltDisplay } from '@gym-management/ui-components';
import { graduationsService } from '../../services';

interface GraduationModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  onSuccess?: () => void;
}

export const GraduationModal: React.FC<GraduationModalProps> = ({
  open,
  onClose,
  studentId,
  studentName,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    modality: Modality.JIU_JITSU,
    beltColor: BeltColor.WHITE,
    beltDegree: BeltDegree.DEGREE_1,
    graduationDate: new Date().toISOString().split('T')[0],
    grantedBy: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        studentId,
        modality: formData.modality,
        beltColor: formData.beltColor,
        beltDegree: formData.beltDegree,
        graduationDate: new Date(formData.graduationDate),
        grantedBy: formData.grantedBy || undefined,
        notes: formData.notes || undefined,
      };

      await graduationsService.create(requestData);

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFormData({
          modality: Modality.JIU_JITSU,
          beltColor: BeltColor.WHITE,
          beltDegree: BeltDegree.DEGREE_1,
          graduationDate: new Date().toISOString().split('T')[0],
          grantedBy: '',
          notes: '',
        });
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving graduation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EmojiEvents color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Register Graduation
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {studentName}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Graduation registered successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Belt Preview */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                  Preview
                </Typography>
                <BeltDisplay
                  beltColor={formData.beltColor}
                  beltDegree={formData.beltDegree}
                  size="large"
                  showLabel={true}
                />
              </Box>
            </Grid>

            {/* Modality */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Modality</InputLabel>
                <Select
                  value={formData.modality}
                  onChange={handleChange('modality')}
                  label="Modality"
                >
                  <MenuItem value={Modality.JIU_JITSU}>Jiu-Jitsu</MenuItem>
                  <MenuItem value={Modality.MMA}>MMA</MenuItem>
                  <MenuItem value={Modality.MUAY_THAI}>Muay Thai</MenuItem>
                  <MenuItem value={Modality.BOXING}>Boxing</MenuItem>
                  <MenuItem value={Modality.WRESTLING}>Wrestling</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Graduation Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Graduation Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.graduationDate}
                onChange={handleChange('graduationDate')}
              />
            </Grid>

            {/* Belt Color */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Belt Color</InputLabel>
                <Select
                  value={formData.beltColor}
                  onChange={handleChange('beltColor')}
                  label="Belt Color"
                >
                  <optgroup label="Adult Belts">
                    <MenuItem value={BeltColor.WHITE}>White Belt</MenuItem>
                    <MenuItem value={BeltColor.BLUE}>Blue Belt</MenuItem>
                    <MenuItem value={BeltColor.PURPLE}>Purple Belt</MenuItem>
                    <MenuItem value={BeltColor.BROWN}>Brown Belt</MenuItem>
                    <MenuItem value={BeltColor.BLACK}>Black Belt</MenuItem>
                    <MenuItem value={BeltColor.RED_BLACK}>Coral Belt (Red/Black)</MenuItem>
                    <MenuItem value={BeltColor.RED_WHITE}>Red/White Belt</MenuItem>
                    <MenuItem value={BeltColor.RED}>Red Belt</MenuItem>
                  </optgroup>
                  <optgroup label="Children Belts">
                    <MenuItem value={BeltColor.GRAY_WHITE}>Gray/White Belt</MenuItem>
                    <MenuItem value={BeltColor.GRAY}>Gray Belt</MenuItem>
                    <MenuItem value={BeltColor.GRAY_BLACK}>Gray/Black Belt</MenuItem>
                    <MenuItem value={BeltColor.YELLOW_WHITE}>Yellow/White Belt</MenuItem>
                    <MenuItem value={BeltColor.YELLOW}>Yellow Belt</MenuItem>
                    <MenuItem value={BeltColor.YELLOW_BLACK}>Yellow/Black Belt</MenuItem>
                    <MenuItem value={BeltColor.ORANGE_WHITE}>Orange/White Belt</MenuItem>
                    <MenuItem value={BeltColor.ORANGE}>Orange Belt</MenuItem>
                    <MenuItem value={BeltColor.ORANGE_BLACK}>Orange/Black Belt</MenuItem>
                    <MenuItem value={BeltColor.GREEN_WHITE}>Green/White Belt</MenuItem>
                    <MenuItem value={BeltColor.GREEN}>Green Belt</MenuItem>
                    <MenuItem value={BeltColor.GREEN_BLACK}>Green/Black Belt</MenuItem>
                  </optgroup>
                </Select>
              </FormControl>
            </Grid>

            {/* Belt Degree */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Belt Degree (Stripes)</InputLabel>
                <Select
                  value={formData.beltDegree}
                  onChange={handleChange('beltDegree')}
                  label="Belt Degree (Stripes)"
                >
                  <MenuItem value={BeltDegree.NONE}>No Stripe</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_1}>1 Stripe</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_2}>2 Stripes</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_3}>3 Stripes</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_4}>4 Stripes</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_5}>5 Stripes</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_6}>6 Stripes</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_7}>7 Degrees (Black Belt)</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_8}>8 Degrees (Black Belt)</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_9}>9 Degrees (Black Belt)</MenuItem>
                  <MenuItem value={BeltDegree.DEGREE_10}>10 Degrees (Black Belt)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Granted By */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Granted By (Professor/Instructor)"
                placeholder="e.g., Professor João Silva"
                value={formData.grantedBy}
                onChange={handleChange('grantedBy')}
                helperText="Optional: Name of the instructor who granted the graduation"
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                placeholder="Additional observations about the graduation..."
                value={formData.notes}
                onChange={handleChange('notes')}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            startIcon={<Close />}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <EmojiEvents />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Register Graduation'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

