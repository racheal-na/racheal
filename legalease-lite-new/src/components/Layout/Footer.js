import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Legal Ease Lite. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Addis Ababa, Ethiopia
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;