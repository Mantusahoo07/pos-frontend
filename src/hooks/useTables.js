import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tableService from '../services/tableService';
import { enqueueSnackbar } from 'notistack';

export const useTables = () => {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => tableService.getTables(),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useAvailableTables = () => {
  return useQuery({
    queryKey: ['available-tables'],
    queryFn: () => tableService.getAvailableTables(),
    select: (data) => data.data,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });
};

export const useAddTable = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tableData) => tableService.addTable(tableData),
    onSuccess: () => {
      enqueueSnackbar('Table added successfully!', { variant: 'success' });
      queryClient.invalidateQueries(['tables']);
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to add table', { variant: 'error' });
    },
  });
};

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status, orderId }) => 
      tableService.updateTableStatus(id, status, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries(['tables']);
      queryClient.invalidateQueries(['available-tables']);
    },
  });
};
