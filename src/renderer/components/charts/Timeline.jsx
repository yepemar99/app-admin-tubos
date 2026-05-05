import React from 'react';
import { Box, Card, Stack, Typography, Avatar, Link } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import InventoryIcon from '@mui/icons-material/Inventory';

const Timeline = ({
  items = [
    {
      id: 1,
      title: 'Have 5 pending order.',
      subtitle: 'Delivered',
      date: 'Nov 02',
      timeAgo: '6 hour ago',
    },
    {
      id: 2,
      title: 'New Order Received',
      subtitle: 'Pick Up',
      date: 'Nov 03',
      timeAgo: '1 day ago',
    },
    {
      id: 3,
      title: 'Manager Posted',
      subtitle: 'In Transit',
      date: 'Nov 03',
      timeAgo: 'Yesterday',
    },
    {
      id: 4,
      title: 'Have 1 pending order.',
      subtitle: '2 hour ago',
      date: 'Nov 04',
      timeAgo: '6 hour ago',
    },
  ],
}) => {
  return (
    <Stack flexDirection={'column'} spacing={0} sx={{ position: 'relative' }}>
      {items.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            gap: 2,
            pb: index < items.length - 1 ? 3 : 0,
            position: 'relative',
            '&:not(:last-child)::after': {
              content: '""',
              position: 'absolute',
              left: 20,
              top: 50,
              bottom: -24,
              width: 2,
              backgroundColor: '#E5DFFF',
            },
          }}
        >
          {/* Avatar with Icon */}
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: 'primary.main',
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <LocalShippingIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Avatar>

          {/* Content */}
          <Box sx={{ flex: 1, pt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: '#1F2937',
              }}
            >
              {item.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.813rem',
                color: '#9CA3AF',
                mt: 0.25,
              }}
            >
              {item.subtitle}
            </Typography>
          </Box>

          {/* Date Info */}
          <Box sx={{ textAlign: 'right', pt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1F2937',
              }}
            >
              {item.date}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#9CA3AF',
                mt: 0.25,
              }}
            >
              {item.timeAgo}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export default Timeline;
