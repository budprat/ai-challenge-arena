import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Chip 
} from '@mui/material';
import { Challenge } from '@/types/models';
import SimpleButtonLink from '@/components/ui/SimpleButtonLink';

interface ChallengeCardProps {
  challenge: Challenge;
  formatDate: (date: string) => string;
  getTimeRemaining: (deadline: string) => string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ 
  challenge, 
  formatDate, 
  getTimeRemaining 
}) => {
  const timeRemaining = getTimeRemaining(challenge.submission_deadline);
  const isTimeWarning = !timeRemaining.includes('days');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {challenge.is_sponsored && (
          <Chip 
            label="Sponsored" 
            size="small" 
            color="secondary" 
            sx={{ mb: 2 }} 
          />
        )}
        <Typography variant="h6" component="h3" gutterBottom>
          {challenge.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {challenge.description.length > 120 
            ? `${challenge.description.substring(0, 120)}...` 
            : challenge.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="textSecondary">
            Deadline: {formatDate(challenge.submission_deadline)}
          </Typography>
          <Typography 
            variant="caption" 
            color={isTimeWarning ? 'warning.main' : 'success.main'}
          >
            {timeRemaining}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <SimpleButtonLink 
          size="small" 
          color="primary"
          to={`/challenges/${challenge.id}`}
        >
          View Details
        </SimpleButtonLink>
      </CardActions>
    </Card>
  );
};

export default ChallengeCard;
