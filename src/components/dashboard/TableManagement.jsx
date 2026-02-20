import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, addTable, updateTable, deleteTable } from "../../https";
import { enqueueSnackbar } from "notistack";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Modal from "../shared/Modal";

const TableManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNo: "",
    seats: "",
  });

  // Fetch tables
  const { data: tablesData, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await getTables();
      return response.data.data;
    },
  });

  // Add table mutation
  const addMutation = useMutation({
    mutationFn: (data) => addTable(data),
    onSuccess: () => {
      enqueueSnackbar("Table added successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to add table", {
        variant: "error",
      });
    },
  });

  // Update table mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTable(id, data),
    onSuccess: () => {
      enqueueSnackbar("Table updated successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to update table", {
        variant: "error",
      });
    },
  });

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: () => {
      enqueueSnackbar("Table deleted successfully!", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message || "Failed to delete table", {
        variant: "error",
      });
    },
  });

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNo: table.tableNo,
        seats: table.seats,
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNo: "",
        seats: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ tableNo: "", seats: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTable) {
      updateMutation.mutate({
        id: editingTable._id,
        data: formData,
      });
    } else {
      addMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <h2 className="text-2xl font-semibold text-[#f5f5f5]">Table Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#f6b100] text-[#1f1f1f] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-500 transition-colors"
        >
          <MdAdd size={20} /> Add New Table
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#333] text-[#ababab]">
            <tr>
              <th className="p-4">Table No.</th>
              <th className="p-4">Seats</th>
              <th className="p-4">Status</th>
              <th className="p-4">Current Order</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tablesData?.map((table) => (
              <tr key={table._id} className="border-b border-gray-700 hover:bg-[#333]">
                <td className="p-4 font-semibold">Table {table.tableNo}</td>
                <td className="p-4">{table.seats} Seats</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      table.status === "Available"
                        ? "bg-green-500 bg-opacity-20 text-green-500"
                        : "bg-yellow-500 bg-opacity-20 text-yellow-500"
                    }`}
                  >
                    {table.status}
                  </span>
                </td>
                <td className="p-4">
                  {table.currentOrder ? (
                    <span className="text-sm">
                      Order #{table.currentOrder.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-gray-500">No active order</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenModal(table)}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(table._id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTable ? "Edit Table" : "Add New Table"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Table Number
            </label>
            <input
              type="number"
              name="tableNo"
              value={formData.tableNo}
              onChange={handleInputChange}
              className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Number of Seats
            </label>
            <input
              type="number"
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              className="w-full bg-[#1f1f1f] text-[#f5f5f5] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              min="1"
              max="12"
            />
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
                : editingTable
                ? "Update Table"
                : "Add Table"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TableManagement;
