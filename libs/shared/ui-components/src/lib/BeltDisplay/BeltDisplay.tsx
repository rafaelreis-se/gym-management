import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { BeltColor, BeltDegree } from '@gym-management/types';
import './BeltDisplay.css';

interface BeltDisplayProps {
  beltColor: BeltColor;
  beltDegree: BeltDegree;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Belt Display Component
 * Displays a Jiu Jitsu belt with correct colors and degrees (stripes)
 * Features black tip characteristic of Jiu Jitsu belts
 */
export const BeltDisplay: React.FC<BeltDisplayProps> = ({
  beltColor,
  beltDegree,
  size = 'medium',
  showLabel = true,
}) => {
  const beltColors = getBeltColorHex(beltColor);
  const degreeCount = getDegreeCount(beltDegree);

  const dimensions = {
    small: { width: 120, height: 30, tipWidth: 15 },
    medium: { width: 200, height: 50, tipWidth: 25 },
    large: { width: 300, height: 70, tipWidth: 35 },
  };

  const { width, height, tipWidth } = dimensions[size];

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
      {showLabel && (
        <Typography variant="caption" color="text.secondary">
          {getBeltLabel(beltColor)}
          {degreeCount > 0 && ` - ${degreeCount} ${degreeCount === 1 ? 'Degree' : 'Degrees'}`}
        </Typography>
      )}
      
      <Box
        sx={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          boxShadow: 2,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        {/* Black tip (right side) */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            width: `${tipWidth}px`,
            height: '100%',
            background: '#000',
            zIndex: 1,
          }}
        />

        {/* Main belt color */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: beltColors.primary,
            ...(beltColors.secondary && {
              background: `linear-gradient(to right, ${beltColors.primary} 50%, ${beltColors.secondary} 50%)`,
            }),
          }}
        />

        {/* Degrees (white stripes) */}
        {degreeCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: `${tipWidth}px`,
              display: 'flex',
              gap: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px',
              padding: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px',
              zIndex: 2,
            }}
          >
            {Array.from({ length: degreeCount }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: size === 'small' ? '2px' : size === 'medium' ? '3px' : '4px',
                  height: size === 'small' ? '50%' : '60%',
                  background: '#fff',
                  borderRadius: '1px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/**
 * Get hex color codes for belt
 */
function getBeltColorHex(color: BeltColor): { primary: string; secondary?: string } {
  const colorMap: Record<BeltColor, { primary: string; secondary?: string }> = {
    // Adult belts
    [BeltColor.WHITE]: { primary: '#FFFFFF' },
    [BeltColor.BLUE]: { primary: '#1E3A8A' },
    [BeltColor.PURPLE]: { primary: '#7C3AED' },
    [BeltColor.BROWN]: { primary: '#78350F' },
    [BeltColor.BLACK]: { primary: '#000000' },
    [BeltColor.RED_BLACK]: { primary: '#DC2626', secondary: '#000000' }, // Coral
    [BeltColor.RED_WHITE]: { primary: '#DC2626', secondary: '#FFFFFF' },
    [BeltColor.RED]: { primary: '#DC2626' },

    // Children belts
    [BeltColor.GRAY_WHITE]: { primary: '#6B7280', secondary: '#FFFFFF' },
    [BeltColor.GRAY]: { primary: '#6B7280' },
    [BeltColor.GRAY_BLACK]: { primary: '#6B7280', secondary: '#000000' },
    [BeltColor.YELLOW_WHITE]: { primary: '#EAB308', secondary: '#FFFFFF' },
    [BeltColor.YELLOW]: { primary: '#EAB308' },
    [BeltColor.YELLOW_BLACK]: { primary: '#EAB308', secondary: '#000000' },
    [BeltColor.ORANGE_WHITE]: { primary: '#F97316', secondary: '#FFFFFF' },
    [BeltColor.ORANGE]: { primary: '#F97316' },
    [BeltColor.ORANGE_BLACK]: { primary: '#F97316', secondary: '#000000' },
    [BeltColor.GREEN_WHITE]: { primary: '#16A34A', secondary: '#FFFFFF' },
    [BeltColor.GREEN]: { primary: '#16A34A' },
    [BeltColor.GREEN_BLACK]: { primary: '#16A34A', secondary: '#000000' },
  };

  return colorMap[color] || { primary: '#CCCCCC' };
}

/**
 * Get human-readable belt label
 */
function getBeltLabel(color: BeltColor): string {
  const labels: Record<BeltColor, string> = {
    [BeltColor.WHITE]: 'White Belt',
    [BeltColor.BLUE]: 'Blue Belt',
    [BeltColor.PURPLE]: 'Purple Belt',
    [BeltColor.BROWN]: 'Brown Belt',
    [BeltColor.BLACK]: 'Black Belt',
    [BeltColor.RED_BLACK]: 'Coral Belt',
    [BeltColor.RED_WHITE]: 'Red/White Belt',
    [BeltColor.RED]: 'Red Belt',
    [BeltColor.GRAY_WHITE]: 'Gray/White Belt',
    [BeltColor.GRAY]: 'Gray Belt',
    [BeltColor.GRAY_BLACK]: 'Gray/Black Belt',
    [BeltColor.YELLOW_WHITE]: 'Yellow/White Belt',
    [BeltColor.YELLOW]: 'Yellow Belt',
    [BeltColor.YELLOW_BLACK]: 'Yellow/Black Belt',
    [BeltColor.ORANGE_WHITE]: 'Orange/White Belt',
    [BeltColor.ORANGE]: 'Orange Belt',
    [BeltColor.ORANGE_BLACK]: 'Orange/Black Belt',
    [BeltColor.GREEN_WHITE]: 'Green/White Belt',
    [BeltColor.GREEN]: 'Green Belt',
    [BeltColor.GREEN_BLACK]: 'Green/Black Belt',
  };

  return labels[color] || 'Unknown Belt';
}

/**
 * Convert BeltDegree enum to number
 */
function getDegreeCount(degree: BeltDegree): number {
  const degreeMap: Record<BeltDegree, number> = {
    [BeltDegree.NONE]: 0,
    [BeltDegree.DEGREE_1]: 1,
    [BeltDegree.DEGREE_2]: 2,
    [BeltDegree.DEGREE_3]: 3,
    [BeltDegree.DEGREE_4]: 4,
    [BeltDegree.DEGREE_5]: 5,
    [BeltDegree.DEGREE_6]: 6,
    [BeltDegree.DEGREE_7]: 7,
    [BeltDegree.DEGREE_8]: 8,
    [BeltDegree.DEGREE_9]: 9,
    [BeltDegree.DEGREE_10]: 10,
  };

  return degreeMap[degree] || 0;
}

