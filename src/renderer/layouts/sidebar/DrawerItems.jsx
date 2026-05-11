import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import ListItem from './list-items/ListItem';
import CollapseListItem from './list-items/CollapseListItem';
import IconifyIcon from '../../components/base/IconifyIcon';
import LogoImg from '../../../assets/logos/logo.jpg';
import { sitemap } from '../../routes/sitemap';
import Image from '../../components/base/Image';
import { useLocation } from 'react-router-dom';
import paths from '../../routes/paths';
import React from 'react';

const DrawerItems = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      <Stack
        pt={2}
        pb={1.5}
        px={2.5}
        position="sticky"
        top={0}
        bgcolor="info.light"
        alignItems="center"
        justifyContent="flex-start"
        borderBottom={1}
        borderColor="info.main"
        zIndex={1000}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <ButtonBase component={Link} href={paths.home} disableRipple>
            <Image
              src={LogoImg}
              alt="logo"
              width={140}
              sx={{
                height: 'auto',
              }}
            />
          </ButtonBase>
        </Box>
      </Stack>

      <List component="nav" sx={{ mt: 1, mb: 5, px: 1 }}>
        {sitemap.map((route) =>
          route.items ? (
            <CollapseListItem
              key={route.id}
              active={currentPath === route.path}
              {...route}
            />
          ) : (
            <ListItem
              key={route.id}
              active={currentPath === route.path}
              {...route}
            />
          ),
        )}
      </List>
    </>
  );
};

export default DrawerItems;
