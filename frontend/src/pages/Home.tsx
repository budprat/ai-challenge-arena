import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Paper,
  Divider,
  useTheme,
  Theme
} from '@mui/material'

import { fetchRecommendedChallenges, selectRecommendedChallenges, selectChallengeLoading } from '@/store/slices/challengeSlice'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { AppDispatch } from '@/store'
import { Challenge } from '@/types/models'
import SimpleButtonLink from '@/components/ui/SimpleButtonLink'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import PlaceholderChallengeCard from '@/components/challenges/PlaceholderChallengeCard'

const Home: React.FC = () => {
  const theme = useTheme<Theme>()
  const dispatch = useDispatch<AppDispatch>()
  
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const recommendedChallenges = useSelector(selectRecommendedChallenges)
  const loading = useSelector(selectChallengeLoading)
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchRecommendedChallenges())
    }
  }, [isAuthenticated, dispatch])
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  // Calculate time remaining until deadline
  const getTimeRemaining = (deadlineString: string): string => {
    try {
      const now = new Date()
      const deadline = new Date(deadlineString)
      const diff = deadline.getTime() - now.getTime()
      
      if (diff <= 0) {
        return 'Deadline passed'
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (days > 1) {
        return `${days} days remaining`
      } else if (days === 1) {
        return '1 day remaining'
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        return `${hours} hours remaining`
      }
    } catch (error) {
      return 'Invalid deadline'
    }
  }
  
  // Hero section with main call to action
  const renderHeroSection = () => (
    <Paper 
      elevation={0}
      sx={{ 
        bgcolor: 'background.default',
        py: 8,
        mb: 6,
        borderRadius: 2,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="md">
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2
          }}
        >
          EliteBuilders
        </Typography>
        <Typography 
          variant="h5" 
          component="h2" 
          color="textSecondary" 
          paragraph
          sx={{ mb: 4 }}
        >
          Showcase your AI building skills and land your dream job through competitive challenges
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <SimpleButtonLink 
            variant="contained" 
            color="primary" 
            size="large"
            to="/challenges"
          >
            View Challenges
          </SimpleButtonLink>
          {!isAuthenticated && (
            <SimpleButtonLink 
              variant="outlined" 
              color="primary"
              size="large"
              to="/register"
            >
              Join Now
            </SimpleButtonLink>
          )}
        </Box>
      </Container>
    </Paper>
  )
  
  // How it works section explaining the process
  const renderHowItWorksSection = () => (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ mb: 6, fontWeight: 600 }}
        >
          How It Works
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h3" gutterBottom>
                1. Choose a Challenge
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Browse through company-sponsored challenges and select the one that matches your skills and interests.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h3" gutterBottom>
                2. Build Your Solution
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Create an AI-powered solution including code, a pitch deck, and a demo video showcasing your work.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" component="h3" gutterBottom>
                3. Get Recognized
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Receive automated evaluation, earn badges, climb the leaderboard, and get noticed by hiring companies.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
  
  // Challenge cards section
  const renderChallengesSection = () => (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom
          sx={{ mb: 4, fontWeight: 600 }}
        >
          {isAuthenticated ? 'Recommended Challenges' : 'Featured Challenges'}
        </Typography>
        
        {isAuthenticated && recommendedChallenges.length === 0 && !loading && (
          <Typography variant="body1" color="textSecondary">
            No recommended challenges at the moment. Check out all available challenges.
          </Typography>
        )}
        
        <Grid container spacing={4}>
          {recommendedChallenges.length > 0 ? (
            recommendedChallenges.slice(0, 3).map((challenge: Challenge) => (
              <Grid item key={challenge.id} xs={12} md={4}>
                <ChallengeCard 
                  challenge={challenge}
                  formatDate={formatDate}
                  getTimeRemaining={getTimeRemaining}
                />
              </Grid>
            ))
          ) : (
            // Display placeholder challenges when not authenticated or no recommendations
            Array.from(new Array(3)).map((_, index) => (
              <Grid item key={index} xs={12} md={4}>
                <PlaceholderChallengeCard index={index} />
              </Grid>
            ))
          )}
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <SimpleButtonLink 
            variant="outlined" 
            color="primary"
            to="/challenges"
          >
            View All Challenges
          </SimpleButtonLink>
        </Box>
      </Container>
    </Box>
  )
  
  // Benefits section
  const renderBenefitsSection = () => (
    <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Why Join EliteBuilders?
            </Typography>
            <Typography variant="body1" paragraph>
              EliteBuilders bridges the gap between traditional coding challenges and real-world AI development, giving you the opportunity to:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Showcase your end-to-end AI development skills
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Build a portfolio of impressive AI projects
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Get noticed by top tech companies looking for AI talent
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Receive valuable AI-driven feedback on your work
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  Win prizes and recognition for your achievements
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                p: 4,
                borderRadius: 2,
                maxWidth: 400,
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom>
                Ready to Prove Your Skills?
              </Typography>
              <Typography variant="body1" paragraph>
                Join our community of AI builders and take your career to the next level.
              </Typography>
              <SimpleButtonLink
                variant="contained"
                color="secondary"
                size="large"
                to={isAuthenticated ? "/challenges" : "/register"}
                style={{ marginTop: 16 }}
              >
                {isAuthenticated ? "Start Building" : "Sign Up Now"}
              </SimpleButtonLink>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
  
  return (
    <Box>
      {renderHeroSection()}
      {renderHowItWorksSection()}
      <Divider />
      {renderChallengesSection()}
      {renderBenefitsSection()}
    </Box>
  )
}

export default Home
