import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Typography,
  Box,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import { Transaction, TransactionTableProps, SortState } from '../../types/transaction';
import TransactionPagination from './TransactionPagination';

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  loading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  sort,
  onSortChange,
}) => {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (description: string) => {
    return description
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSort = (field: keyof Transaction) => {
    onSortChange(field);
  };

  const getSortDirection = (field: keyof Transaction): 'asc' | 'desc' | false => {
    if (sort.field === field) {
      return sort.direction;
    }
    return false;
  };

  const columns = [
    { id: 'description' as keyof Transaction, label: 'Description', sortable: true, minWidth: 200 },
    { id: 'amount' as keyof Transaction, label: 'Amount', sortable: true, minWidth: 120, align: 'right' as const },
    { id: 'type' as keyof Transaction, label: 'Type', sortable: true, minWidth: 100 },
    { id: 'category' as keyof Transaction, label: 'Category', sortable: true, minWidth: 120 },
    { id: 'date' as keyof Transaction, label: 'Date', sortable: true, minWidth: 120 },
    { id: 'actions', label: 'Actions', sortable: false, minWidth: 120, align: 'center' as const },
  ];

  const LoadingSkeleton = () => (
    <>
      {[...Array(pagination.pageSize)].map((_, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={column.id}>
              <Skeleton variant="text" height={40} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  return (
    <Paper
      sx={{
        background: theme.card.background,
        border: `1px solid ${theme.card.border}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: theme.background.secondary,
                    borderBottom: `1px solid ${theme.border.primary}`,
                    fontWeight: 600,
                    color: theme.text.primary,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sort.field === column.id}
                      direction={getSortDirection(column.id)}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        color: theme.text.primary,
                        '&:hover': {
                          color: theme.text.primary,
                        },
                        '&.Mui-active': {
                          color: '#C8EE44',
                          '& .MuiTableSortLabel-icon': {
                            color: '#C8EE44',
                          },
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: theme.text.secondary,
                  }}
                >
                  <Typography variant="body1">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.background.secondary,
                    },
                    borderBottom: `1px solid ${theme.border.primary}`,
                  }}
                >
                  {/* Description */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: transaction.type === 'income' ? '#4CAF50' : '#E53935',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(transaction.description)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.text.primary,
                            fontWeight: 600,
                          }}
                        >
                          {transaction.description}
                        </Typography>
                        {transaction.tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {transaction.tags.slice(0, 2).map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  backgroundColor: theme.background.secondary,
                                  color: theme.text.secondary,
                                }}
                              />
                            ))}
                            {transaction.tags.length > 2 && (
                              <Chip
                                label={`+${transaction.tags.length - 2}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  backgroundColor: theme.background.secondary,
                                  color: theme.text.secondary,
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Amount */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {transaction.type === 'income' ? (
                        <ArrowUpward sx={{ color: '#4CAF50', fontSize: 16 }} />
                      ) : (
                        <ArrowDownward sx={{ color: '#E53935', fontSize: 16 }} />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          color: transaction.type === 'income' ? '#4CAF50' : '#E53935',
                          fontWeight: 600,
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    <Chip
                      label={transaction.type === 'income' ? 'Income' : 'Expense'}
                      size="small"
                      sx={{
                        backgroundColor: transaction.type === 'income' ? '#E8F5E8' : '#FFEBEE',
                        color: transaction.type === 'income' ? '#2E7D32' : '#C62828',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.text.primary,
                      }}
                    >
                      {transaction.category}
                    </Typography>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.text.secondary,
                      }}
                    >
                      {formatDate(transaction.date)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="Edit transaction">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(transaction)}
                          sx={{
                            color: theme.text.secondary,
                            '&:hover': {
                              backgroundColor: theme.background.secondary,
                              color: '#C8EE44',
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete transaction">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(transaction)}
                          sx={{
                            color: theme.text.secondary,
                            '&:hover': {
                              backgroundColor: '#FFEBEE',
                              color: '#E53935',
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TransactionPagination
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Paper>
  );
};

export default TransactionTable;
