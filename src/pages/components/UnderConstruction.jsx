import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, LinearProgress, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Canvas } from '@react-three/fiber';
import TicTacToe3D from './TicTacToe3D';
import { Html } from '@react-three/drei';
import zIndex from '@mui/material/styles/zIndex';

const StyledBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(4),
}));

const GlowingPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '15px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.6)',
  },
}));

const UnderConstruction = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isIdle, setIsIdle] = useState(true);
  const [isDimmed, setIsDimmed] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [idleTimer, setIdleTimer] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [progress]);

  const handleUserActivity = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      setIsDimmed(false);
      setIsBlurred(false);
      setIsIdle(false);
    }
    // This code sets up a series of timers to create a staged idle effect:
    // 1. After 10 seconds of inactivity, it sets isIdle to true
    // 2. 10 seconds after that, it sets isBlurred to true
    // 3. 10 seconds after blurring, it sets isDimmed to true
    const newTimer = setTimeout(() => {
      setIsIdle(true);
      setTimeout(() => {
        setIsBlurred(true);
        setTimeout(() => {
          setIsDimmed(true);
        }, 100000);
      }, 10000);
    }, 10000);
    
    // Store the outermost timer ID so it can be cleared if user activity occurs
    setIdleTimer(newTimer);
  };
/*
  useEffect(() => {
    if (!isLoading) {
      handleUserActivity();
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
      return () => {
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keydown', handleUserActivity);
        if (idleTimer) {
          clearTimeout(idleTimer);
        }
      };
    }
  }, [isLoading]);*/

  return (
    <StyledBox>
      {isLoading ? (
        <GlowingPaper sx={{ backdropFilter: 'blur(10px)', position: 'absolute', zIndex: 2, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <Typography variant="h4" gutterBottom>
            Loading...
          </Typography>
          <LinearProgress variant="determinate" value={progress} sx={{ width: '80%', maxWidth: 400 }} />
        </GlowingPaper>
      ) : (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30px',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#000',
            color: '#FFD700',
            whiteSpace: 'nowrap',
            animation: 'moveText 20s linear infinite',
            '@keyframes moveText': {
              '0%': { transform: 'translateX(100%)' },
              '100%': { transform: 'translateX(-100%)' },
            },
          }}>
            <Typography variant="body1" sx={{ padding: '0 20px' }}>
              ⚠️ UNDER CONSTRUCTION ⚠️ UNDER CONSTRUCTION ⚠️ UNDER CONSTRUCTION ⚠️
            </Typography>
          </Box>
          
        </Box>
      )}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        filter: isLoading || isBlurred ? 'blur(10px)' : 'none',
        transition: 'filter 0.5s ease-in-out, opacity 0.5s ease-in-out',
        opacity: isDimmed ? 0.5 : 1,
      }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }} shadows>
          <fog attach="fog" args={['#e6f2ff', 5, 30]} />
          <TicTacToe3D isIdle={isIdle}/>
        </Canvas>
      </Box>      
    </StyledBox>
  );
};

export default UnderConstruction;