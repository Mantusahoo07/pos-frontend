import { useQuery } from '@tanstack/react-query';
import { getMenuItems, getCategories } from '../https';

export const useMenu = () => {
  // Fetch categories
  const { 
    data: categoriesData, 
    isLoading: categoriesLoading,
    error: categoriesError 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.data || [];
    },
  });

  // Fetch menu items
  const { 
    data: menuItemsData, 
    isLoading: menuItemsLoading,
    error: menuItemsError 
  } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const response = await getMenuItems();
      return response.data.data || [];
    },
  });

  // Group menu items by category
  const menuByCategory = menuItemsData?.reduce((acc, item) => {
    const categoryId = item.category?._id || item.category;
    const categoryName = item.category?.name || 'Uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        id: categoryId,
        name: categoryName,
        icon: item.category?.icon || '🍽️',
        bgColor: item.category?.bgColor || '#5b45b0',
        items: []
      };
    }
    acc[categoryId].items.push(item);
    return acc;
  }, {});

  const menus = Object.values(menuByCategory || {});

  return {
    menus,
    categories: categoriesData || [],
    menuItems: menuItemsData || [],
    isLoading: categoriesLoading || menuItemsLoading,
    error: categoriesError || menuItemsError
  };
};
