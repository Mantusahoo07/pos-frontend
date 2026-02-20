import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '../services/orderService';
import { enqueueSnackbar } from 'notistack';

export const useOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => orderService.getOrders(page, limit),
    select: (data) => data.data,
    keepPreviousData: true,
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      enqueueSnackbar('Order created successfully!', { variant: 'success' });
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['tables']);
      return data;
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to create order', { variant: 'error' });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: (data) => {
      enqueueSnackbar('Order status updated!', { variant: 'success' });
      queryClient.invalidateQueries(['orders']);
      return data;
    },
    onError: (error) => {
      enqueueSnackbar(error.message || 'Failed to update status', { variant: 'error' });
    },
  });
};
