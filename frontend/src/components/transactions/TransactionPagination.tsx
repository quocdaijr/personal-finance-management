import React from 'react';
import {
  Box,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import {
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { PaginationState } from '../../types/transaction';

interface TransactionPaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
}) => {
  const { theme } = useTheme();
  const { page, pageSize, total } = pagination;

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    onPageChange(newPage);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange(newPageSize);
    // Reset to first page when changing page size
    onPageChange(1);
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  if (total === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        borderTop: `1px solid ${theme.border.primary}`,
        background: theme.background.paper,
      }}
    >
      {/* Items info and page size selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.text.secondary,
            fontSize: '0.875rem',
          }}
        >
          Showing {startItem}-{endItem} of {total} transactions
        </Typography>

        {showPageSizeSelector && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: theme.text.secondary,
                fontSize: '0.875rem',
              }}
            >
              Rows per page:
            </Typography>
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                sx={{
                  minWidth: 70,
                  '& .MuiSelect-select': {
                    py: 0.5,
                    fontSize: '0.875rem',
                  },
                }}
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* First page button */}
        <IconButton
          onClick={handleFirstPage}
          disabled={page === 1}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
            '&.Mui-disabled': {
              color: theme.text.disabled,
            },
          }}
        >
          <FirstPage fontSize="small" />
        </IconButton>

        {/* Previous page button */}
        <IconButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
            '&.Mui-disabled': {
              color: theme.text.disabled,
            },
          }}
        >
          <NavigateBefore fontSize="small" />
        </IconButton>

        {/* Page numbers */}
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          size="small"
          hidePrevButton
          hideNextButton
          sx={{
            '& .MuiPaginationItem-root': {
              color: theme.text.secondary,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: theme.background.secondary,
              },
              '&.Mui-selected': {
                backgroundColor: '#C8EE44',
                color: '#1B212D',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#B8DE34',
                },
              },
            },
          }}
        />

        {/* Next page button */}
        <IconButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
            '&.Mui-disabled': {
              color: theme.text.disabled,
            },
          }}
        >
          <NavigateNext fontSize="small" />
        </IconButton>

        {/* Last page button */}
        <IconButton
          onClick={handleLastPage}
          disabled={page === totalPages}
          size="small"
          sx={{
            color: theme.text.secondary,
            '&:hover': {
              backgroundColor: theme.background.secondary,
            },
            '&.Mui-disabled': {
              color: theme.text.disabled,
            },
          }}
        >
          <LastPage fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TransactionPagination;
