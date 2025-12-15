import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { formatUnit } from '@/utils/formatters';
import type { AverageData } from '@/types';

interface AverageParameterCardsProps {
  equipmentId: number;
  parameterId: number;
  parameterName?: string;
}

const AverageParameterCards: React.FC<AverageParameterCardsProps> = ({
  equipmentId,
  parameterId,
  parameterName = 'Temperature',
}) => {
  const [averages, setAverages] = useState<AverageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAverages();
  }, [equipmentId, parameterId]);

  const loadAverages = async () => {
    try {
      setLoading(true);
      const { getMockAverages } = await import('@/utils/mockData');
      const mockData = getMockAverages(parameterName);
      setAverages(mockData);
    } catch (error) {
      console.error('Error loading averages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
        Average Humidity {parameterName}
      </Typography>
      <Grid container spacing={2}>
        {averages.map((avg) => (
          <Grid item xs={6} key={avg.equipment_id}>
            <Card
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1.5, fontSize: '0.8125rem' }}>
                  {avg.equipment_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                    {formatUnit(avg.average_value, avg.unit)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: avg.trend === 'up' ? '#10b981' : '#ef4444',
                    }}
                  >
                    {avg.trend === 'up' ? (
                      <TrendingUp fontSize="small" />
                    ) : (
                      <TrendingDown fontSize="small" />
                    )}
                    <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                      {avg.change_percentage}% vs last week
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AverageParameterCards;
