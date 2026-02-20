import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getCategories } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Modal from "../shared/Modal";

const MenuManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    preparationTime: "15",
    isAvailable: true,
  });

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const response = await getMenuItems();
      return response.data.data;
    },
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.data;
    },
  });

  // Add menu item mutation
  const addMutation = useMutation({
    mutationFn: (data) => addMenuItem(data),
    onSuccess: () => {
      enqueueSnackbar("Menu item added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["menu-items"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to add menu item", {
        variant: "error",
      });
    },
  });

  // Update menu item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateMenuItem(id, data),
    onSuccess: () => {
      enqueueSnackbar("Menu item updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["menu-items"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to update menu item", {
        variant: "error",
      });
    },
  });

  // Delete menu item mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMenuItem(id),
    onSuccess: () => {
      enqueueSnackbar("Menu item deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["menu-items"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete menu item", {
        variant: "error",
      });
    },
  });

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        category: item.category._id,
        description: item.description || "",
        preparationTime: item.preparationTime || "15",
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        price: "",
        category: categories?.[0]?._id || "",
        description: "",
        preparationTime: "15",
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem._id,
        data: formData,
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#262626] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#f5f5f5]">Menu Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#f6b100] text-[#1f1f1f] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
        >
          <MdAdd size={20} /> Add New Item
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {menuItems?.map((item) => (
          <div
            key={item._id}
            className="bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#f5f5f5] font-semibold text-lg">{item.name}</h3>
                  {!item.isAvailable && (
                    <span className="text-xs bg-red-500 bg-opacity-20 text-red-500 px-2 py-1 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-[#ababab] text-sm mt-1">
                  Category: {item.category?.name}
                </p>
                <p className="text-[#f6b100] font-bold text-xl mt-2">₹{item.price}</p>
                {item.description && (
                  <p className="text-[#ababab] text-xs mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="text-blue-500 hover:text-blue-400 p-1"
                  title="Edit"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-500 hover:text-red-400 p-1"
                  title="Delete"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Menu Item" : "Add New Menu Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Preparation Time (mins)
              </label>
              <input
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                min="1"
              />
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Status
              </label>
              <div className="flex items-center gap-4 mt-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.isAvailable}
                    onChange={() => setFormData({ ...formData, isAvailable: true })}
                    className="text-yellow-400 focus:ring-yellow-400"
                  />
                  <span className="text-[#f5f5f5]">Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!formData.isAvailable}
                    onChange={() => setFormData({ ...formData, isAvailable: false })}
                    className="text-red-500 focus:ring-red-500"
                  />
                  <span className="text-[#f5f5f5]">Unavailable</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-[#f6b100] text-[#1f1f1f] font-semibold hover:bg-yellow-500 transition-colors"
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {addMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : editingItem
                ? "Update Item"
                : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
