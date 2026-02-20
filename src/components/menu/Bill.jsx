import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import { addOrder, updateTable } from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { useNavigate } from "react-router-dom";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const Bill = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 5.25;
  const tax = (total * taxRate) / 100;
  const totalPriceWithTax = total + tax;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentOptions = [
    { id: "Cash", name: "Cash", icon: <FaMoneyBillWave />, color: "bg-green-600" },
    { id: "Card", name: "Card", icon: <FaCreditCard />, color: "bg-blue-600" },
  ];

  const validateOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", { variant: "warning" });
      return false;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Your cart is empty!", { variant: "warning" });
      return false;
    }
    if (!customerData.table?.tableId) {
      enqueueSnackbar("Please select a table first!", { variant: "warning" });
      navigate("/tables");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateOrder()) return;
    setIsProcessing(true);

    const orderData = {
      customerDetails: {
        name: customerData.customerName || `Guest ${Math.floor(Math.random() * 1000)}`,
        phone: customerData.customerPhone || "",
        guests: customerData.guests || 1,
      },
      orderStatus: "In Progress",
      bills: { 
        total: Number(total.toFixed(2)), 
        tax: Number(tax.toFixed(2)), 
        totalWithTax: Number(totalPriceWithTax.toFixed(2)) 
      },
      items: cartData.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.pricePerQuantity || item.price / item.quantity,
      })),
      table: customerData.table.tableId,
      paymentMethod: paymentMethod,
    };
    
    orderMutation.mutate(orderData);
  };

  const orderMutation = useMutation({
    mutationFn: addOrder,
    onSuccess: (resData) => {
      const orderData = resData.data.data;
      setOrderInfo(orderData);
      
      // Update table status
      tableUpdateMutation.mutate({
        tableId: customerData.table.tableId,
        status: "Booked",
        orderId: orderData._id,
      });
      
      setShowInvoice(true);
      setIsProcessing(false);
      
      enqueueSnackbar("Order placed successfully!", { variant: "success" });
    },
    onError: (error) => {
      console.error("Order error:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to place order!", {
        variant: "error",
      });
      setIsProcessing(false);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => {
      // Clear cart and customer data after successful table update
      dispatch(removeAllItems());
      dispatch(removeCustomer());
    },
    onError: (error) => {
      console.error("Table update error:", error);
    },
  });

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    navigate("/");
  };

  // If cart is empty, show empty state
  if (cartData.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">Your cart is empty</p>
        <p className="text-xs text-gray-500 mt-1">Add items from the menu</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Bill Summary */}
        <div className="space-y-2">
          <h4 className="text-white text-sm font-semibold">Bill Summary</h4>
          
          {/* Items list - limited height with scroll if needed */}
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
            {cartData.map((item, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-400 truncate max-w-[100px]">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-white">₹{item.price}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#333] pt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Tax (5.25%)</span>
              <span className="text-white">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#333]">
              <span className="text-gray-300">Total</span>
              <span className="text-[#f6b100]">₹{totalPriceWithTax.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                  paymentMethod === option.id
                    ? `${option.color} text-white`
                    : "bg-[#262626] text-gray-400 hover:bg-[#333]"
                }`}
              >
                {option.icon} {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Info */}
        {customerData.table && (
          <div className="bg-[#262626] rounded-lg p-2">
            <p className="text-xs text-gray-400">
              Table: <span className="text-white font-medium">{customerData.table.tableNo}</span>
              {customerData.customerName && (
                <span className="ml-2 text-gray-400">
                  | Guest: <span className="text-white">{customerData.customerName}</span>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !paymentMethod}
          className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${
            isProcessing || !paymentMethod
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f6b100] text-black hover:bg-yellow-500"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </span>
          ) : (
            `Place Order • ₹${totalPriceWithTax.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <Invoice orderInfo={orderInfo} setShowInvoice={handleCloseInvoice} />
        </div>
      )}
    </>
  );
};

export default Bill;
