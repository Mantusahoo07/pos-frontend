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
      enqueueSnackbar("Select payment method!", { variant: "warning" });
      return false;
    }
    if (cartData.length === 0) {
      enqueueSnackbar("Cart is empty!", { variant: "warning" });
      return false;
    }
    if (!customerData.table?.tableId) {
      enqueueSnackbar("Select a table first!", { variant: "warning" });
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
        name: customerData.customerName || `Guest`,
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
      setOrderInfo(resData.data.data);
      tableUpdateMutation.mutate({
        tableId: customerData.table.tableId,
        status: "Booked",
        orderId: resData.data.data._id,
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
      dispatch(removeAllItems());
      dispatch(removeCustomer());
    },
    onError: (error) => {
      console.error("Table update error:", error);
    },
  });

  if (cartData.length === 0) {
    return (
      <div className="text-center py-2">
        <p className="text-xs text-gray-500">Cart is empty</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Bill Summary */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Items ({cartData.length})</span>
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

        {/* Payment Methods */}
        <div className="grid grid-cols-2 gap-1">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setPaymentMethod(option.id)}
              className={`py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 ${
                paymentMethod === option.id
                  ? `${option.color} text-white`
                  : "bg-[#262626] text-gray-400 hover:bg-[#333]"
              }`}
            >
              {option.icon} {option.name}
            </button>
          ))}
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !paymentMethod}
          className={`w-full py-2 rounded text-sm font-bold ${
            isProcessing || !paymentMethod
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f6b100] text-black hover:bg-yellow-500"
          }`}
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <Invoice 
            orderInfo={orderInfo} 
            setShowInvoice={() => {
              setShowInvoice(false);
              navigate("/");
            }} 
          />
        </div>
      )}
    </>
  );
};

export default Bill;
