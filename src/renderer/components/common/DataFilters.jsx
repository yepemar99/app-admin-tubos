import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Typography,
  Menu,
} from '@mui/material';
import { flexEnd, flexSpaceBetween } from '../../utils/styles';
import SearchTextfield from './SearchTextfied';
import React, { useState } from 'react';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const DataFilters = ({
  sx = {},
  searchTerm = '',
  hiddenSearch = false,
  filters = [],
  loading = false,
  handleFilterChange = () => {},
  handleCleanFilters = () => {},
}) => {
  const [dateRangeAnchorEl, setDateRangeAnchorEl] = useState({});

  const handleDateRangeOpen = (filterName, event) => {
    setDateRangeAnchorEl((prev) => ({
      ...prev,
      [filterName]: event.currentTarget,
    }));
  };

  const handleDateRangeClose = (filterName) => {
    setDateRangeAnchorEl((prev) => ({
      ...prev,
      [filterName]: null,
    }));
  };

  const getDateRangeLabel = (filter) => {
    const hasStart = filter?.valueStart;
    const hasEnd = filter?.valueEnd;

    if (hasStart || hasEnd) {
      return `${hasStart ? filter.valueStart : 'Inicio'} - ${hasEnd ? filter.valueEnd : 'Actualidad'}`;
    }
    return 'Seleccione un rango de fechas';
  };

  return (
    <Card sx={{ py: 1.5, px: 1, ...flexSpaceBetween, ...sx }}>
      <Box>
        {!hiddenSearch && (
          <SearchTextfield
            placeholder="Buscar..."
            loading={loading}
            searchTerm={searchTerm}
            handleChange={(value) => {
              handleFilterChange('search', value);
            }}
          />
        )}
      </Box>
      <Box sx={flexEnd}>
        {filters.map(
          (filter, index) =>
            filter.type !== 'search' && (
              <Box key={filter.name + index}>
                {filter.type === 'select' && (
                  <FormControl
                    sx={{ minWidth: filter?.minWidth ? filter?.minWidth : 120 }}
                    disabled={loading}
                  >
                    <InputLabel size="small" id={`${filter.name}-label`}>
                      {filter.label}
                    </InputLabel>
                    <Select
                      labelId={`${filter.name}-label`}
                      id={`${filter.name}-select`}
                      name={filter?.name || ''}
                      value={filter?.value || ''}
                      label={filter?.label || ''}
                      onChange={(e) => {
                        handleFilterChange(filter.name, e.target.value);
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">
                        <em>Ninguno</em>
                      </MenuItem>
                      {(filter?.options || []).map((option, index) => (
                        <MenuItem
                          value={option.value}
                          key={option.value + option.label + index}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {filter.type === 'daterange' && (
                  <Box>
                    <Button
                      id={`date-range-button-${filter.name}`}
                      size="small"
                      endIcon={<ArrowDropDownIcon />}
                      onClick={(e) => {
                        handleDateRangeOpen(filter.name, e);
                      }}
                      disabled={loading}
                      aria-controls={
                        dateRangeAnchorEl[filter.name]
                          ? `date-range-menu-${filter.name}`
                          : undefined
                      }
                      aria-haspopup="true"
                      aria-expanded={
                        dateRangeAnchorEl[filter.name] ? 'true' : 'false'
                      }
                      sx={{
                        textTransform: 'none',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '5px',
                        color: 'black',
                        fontSize: '1rem',
                        fontWeight: '400',
                        lineHeight: '1.4375em',
                        fontFamily: 'DM Sans,sans-serif',
                      }}
                    >
                      {getDateRangeLabel(filter)}
                    </Button>
                    <Menu
                      id={`date-range-menu-${filter.name}`}
                      anchorEl={dateRangeAnchorEl[filter.name]}
                      open={Boolean(dateRangeAnchorEl[filter.name])}
                      onClose={() => {
                        handleDateRangeClose(filter.name);
                      }}
                      slotProps={{
                        list: {
                          'aria-labelledby': `date-range-button-${filter.name}`,
                        },
                      }}
                      sx={{
                        '& .MuiPaper-root': {
                          minWidth: 320,
                        },
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {filter.label}
                        </Typography>
                        <Stack sx={{ my: 2 }} spacing={1.5}>
                          <TextField
                            size="small"
                            type="date"
                            label="Desde"
                            variant="outlined"
                            value={filter?.valueStart || ''}
                            onChange={(e) => {
                              handleFilterChange(
                                `${filter.name}`,
                                {
                                  start: e.target.value,
                                  end: filter?.valueEnd || '',
                                },
                                'daterange',
                              );
                            }}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                          <TextField
                            size="small"
                            type="date"
                            label="Hasta"
                            variant="outlined"
                            value={filter?.valueEnd || ''}
                            onChange={(e) => {
                              handleFilterChange(
                                `${filter.name}`,
                                {
                                  start: filter?.valueStart || '',
                                  end: e.target.value,
                                },
                                'daterange',
                              );
                            }}
                            disabled={loading}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </Stack>
                      </Box>
                    </Menu>
                  </Box>
                )}
              </Box>
            ),
        )}
        {filters.length > 0 && (
          <Button
            variant="contained"
            size="small"
            color={'primary'}
            startIcon={<FilterAltOffIcon />}
            onClick={handleCleanFilters}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default DataFilters;
