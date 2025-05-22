import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Chip 
} from '@mui/material';
import SimpleButtonLink from '@/components/ui/SimpleButtonLink';

interface PlaceholderChallengeCardProps {
  index: number;
}

const PlaceholderChallengeCard: React.FC<PlaceholderChallengeCardProps> = ({ index }) => {
  // Predefined placeholder content based on index
  const getTitle = () => {
    switch (index) {
      case 0:
        return "AI Customer Service Assistant";
      case 1:
        return "Smart Document Processing";
      case 2:
        return "Conversational Shopping Bot";
      default:
        return "AI Challenge";
    }
  };

  const getDescription = () => {
    switch (index) {
      case 0:
        return "Build an AI assistant that can handle customer service inquiries across multiple channels with natural language understanding...";
      case 1:
        return "Create a system that can automatically extract and process information from various document types, including invoices, receipts...";
      case 2:
        return "Develop a conversational AI that can help customers find products, compare options, and complete purchases...";
      default:
        return "Join this exciting AI challenge to showcase your skills and creativity...";
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {index === 0 && (
          <Chip 
            label="Sponsored" 
            size="small" 
            color="secondary" 
            sx={{ mb: 2 }} 
          />
        )}
        <Typography variant="h6" component="h3" gutterBottom>
          {getTitle()}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {getDescription()}
        </Typography>
      </CardContent>
      <CardActions>
        <SimpleButtonLink 
          size="small" 
          color="primary"
          to="/challenges"
        >
          Browse Challenges
        </SimpleButtonLink>
      </CardActions>
    </Card>
  );
};

export default PlaceholderChallengeCard;
