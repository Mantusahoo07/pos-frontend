import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, addCategory, updateCategory, deleteCategory } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Modal from "../shared/Modal";

const categoryColors = [
  "#b73e3e", "#5b45b0", "#7f167f", "#735f32", 
  "#1d2569", "#285430", "#f6b100", "#025cca"
];

const categoryIcons = ["🍲", "🍛", "🍹", "🍜", "🍰", "🍕", "🍺", "🥗"];

const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🍽️",
    bgColor: "#5b45b0",
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getCategories();
      return response.data.data;
    },
  });

  // Add category mutation
  const addMutation = useMutation({
    mutationFn: (data) => addCategory(data),
    onSuccess: () => {
      enqueueSnackbar("Category added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to add category", {
        variant: "error",
      });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      enqueueSnackbar("Category updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to update category", {
        variant: "error",
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      enqueueSnackbar("Category deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete category", {
        variant: "error",
      });
    },
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "🍽️",
        bgColor: category.bgColor || "#5b45b0",
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        icon: "🍽️",
        bgColor: "#5b45b0",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "🍽️", bgColor: "#5b45b0" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory._id,
        data: formData,
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
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
        <h2 className="text-2xl font-semibold text-[#f5f5f5]">Category Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#f6b100] text-[#1f1f1f] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
        >
          <MdAdd size={20} /> Add New Category
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div
            key={category._id}
            className="bg-[#1f1f1f] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors"
            style={{ borderLeft: `4px solid ${category.bgColor}` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="text-[#f5f5f5] font-semibold text-lg">{category.name}</h3>
                  <p className="text-[#ababab] text-sm mt-1">{category.description || "No description"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(category)}
                  className="text-blue-500 hover:text-blue-400 p-1"
                  title="Edit"
                >
                  <MdEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
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
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCategory ? "Edit Category" : "Add New Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
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
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {categoryIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Color
              </label>
              <select
                value={formData.bgColor}
                onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {categoryColors.map(color => (
                  <option key={color} value={color} style={{ backgroundColor: color }}>
                    {color}
                  </option>
                ))}
              </select>
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
                : editingCategory
                ? "Update Category"
                : "Add Category"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;
