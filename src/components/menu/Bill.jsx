   await handleOnlinePayment();
    } else {
      // Cash payment - direct order
      const orderData = {
        customerDetails: {
          name: customerData.customerName || `Guest ${Math.floor(Math.random() * 1000)}`,
          phone: customerData.customerPhone || "",
          guests: customerData.guests || 1,
        },
        orderStatus: "In Progress",
        bills: {
          total: total,
          tax: tax,
          totalWithTax: totalPriceWithTax,
        },
        items: cartData.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.pricePerQuantity || item.price / item.quantity,
          notes: item.notes || ""
        })),
        table: customerData.table.tableId,
        paymentMethod: paymentMethod,
      };
      
      orderMutation.mutate(orderData);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      // Load Razorpay script
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        enqueueSnackbar("Razorpay SDK failed to load. Are you online?", {
          variant: "warning",
        });
        setIsProcessing(false);
        return;
      }

      // Create order in backend
      const reqData = {
        amount: totalPriceWithTax,
      };

      const { data } = await createOrderRazorpay(reqData);

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Restro POS",
        description: `Payment for Table ${customerData.table?.tableNo || ""}`,
        order_id: data.order.id,
        handler: async function (response) {
          // Verify payment
          const verification = await verifyPaymentRazorpay(response);
          
          if (verification.data.success) {
            enqueueSnackbar("Payment successful!", { variant: "success" });
            
            // Place the order after successful payment
            const orderData = {
              customerDetails: {
                name: customerData.customerName || `Guest ${Math.floor(Math.random() * 1000)}`,
                phone: customerData.customerPhone || "",
                guests: customerData.guests || 1,
              },
              orderStatus: "In Progress",
              bills: {
                total: total,
                tax: tax,
                totalWithTax: totalPriceWithTax,
              },
              items: cartData.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.pricePerQuantity || item.price / item.quantity,
                notes: item.notes || ""
              })),
              table: customerData.table.tableId,
              paymentMethod: paymentMethod,
              paymentData: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
              },
            };
            
            orderMutation.mutate(orderData);
          } else {
            enqueueSnackbar("Payment verification failed!", { variant: "error" });
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerData.customerName || "Guest",
          contact: customerData.customerPhone || "",
        },
        theme: { color: "#f6b100" },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            enqueueSnackbar("Payment cancelled", { variant: "info" });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      enqueueSnackbar("Payment failed! Please try again.", {
        variant: "error",
      });
      setIsProcessing(false);
    }
  };

  const orderMutation = useMutation({
    mutationFn: (reqData) => addOrder(reqData),
    onSuccess: (resData) => {
      const { data } = resData.data;
      console.log("Order created:", data);

      setOrderInfo(data);

      // Update Table status
      const tableData = {
        status: "Booked",
        orderId: data._id,
      };

      tableUpdateMutation.mutate({
        tableId: customerData.table.tableId,
        ...tableData
      });

      enqueueSnackbar("Order placed successfully!", {
        variant: "success",
      });
      
      setShowInvoice(true);
      setIsProcessing(false);
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
    mutationFn: (reqData) => updateTable(reqData),
    onSuccess: (resData) => {
      console.log("Table updated:", resData);
    },
    onError: (error) => {
      console.error("Table update error:", error);
    },
  });

  const handlePrintAndClose = () => {
    setShowInvoice(false);
    dispatch(removeAllItems());
    dispatch(removeCustomer());
    navigate("/");
  };

  // If cart is empty, show empty state
  if (cartData.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-[#ababab] text-lg">Your cart is empty</p>
        <p className="text-xs text-[#ababab] mt-2">Add items from the menu to place an order</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-4 overflow-y-auto max-h-[calc(100vh-300px)]">
        {/* Bill Summary */}
        <div className="space-y-3">
          <h3 className="text-[#f5f5f5] font-semibold text-lg">Bill Summary</h3>
          
          <div className="space-y-2">
            {cartData.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-[#ababab]">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-[#f5f5f5]">₹{item.price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#2a2a2a] pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#ababab]">Subtotal</p>
              <p className="text-[#f5f5f5] font-semibold">₹{total.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#ababab]">Tax (5.25%)</p>
              <p className="text-[#f5f5f5] font-semibold">₹{tax.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
              <p className="text-base text-[#f5f5f5] font-bold">Total</p>
              <p className="text-xl text-[#f6b100] font-bold">₹{totalPriceWithTax.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mt-6">
          <p className="text-sm text-[#ababab] font-medium mb-3">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPaymentMethod(option.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 ${
                  paymentMethod === option.id
                    ? `${option.color} text-white scale-105 shadow-lg`
                    : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
                }`}
              >
                <div className="mb-2">{option.icon}</div>
                <span className="text-sm font-semibold">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Info */}
        {customerData.table && (
          <div className="mt-4 p-3 bg-[#1f1f1f] rounded-lg">
            <p className="text-sm text-[#ababab]">
              Table: <span className="text-[#f5f5f5] font-semibold">{customerData.table.tableNo}</span>
            </p>
            {customerData.customerName && (
              <p className="text-sm text-[#ababab] mt-1">
                Customer: <span className="text-[#f5f5f5]">{customerData.customerName}</span>
              </p>
            )}
            <p className="text-sm text-[#ababab] mt-1">
              Guests: <span className="text-[#f5f5f5]">{customerData.guests || 1}</span>
            </p>
          </div>
        )}

        {/* Place Order Button */}
        <div className="mt-6">
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !paymentMethod}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              isProcessing || !paymentMethod
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#f6b100] text-[#1f1f1f] hover:bg-yellow-500 hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#1f1f1f] border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              `Place Order • ₹${totalPriceWithTax.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Selected Payment Method Indicator */}
        {paymentMethod && (
          <div className="mt-3 text-center">
            <p className="text-xs text-[#ababab]">
              Selected: <span className="text-[#f6b100] font-semibold">{paymentMethod}</span>
            </p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderInfo && (
        <Invoice 
          orderInfo={orderInfo} 
          setShowInvoice={handlePrintAndClose} 
        />
      )}
    </>
  );
};

export default Bill;
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
      bills: { total, tax, totalWithTax: totalPriceWithTax },
      items: cartData.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.pricePerQuantity,
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
    },
    onError: () => {
      enqueueSnackbar("Failed to place order!", { variant: "error" });
      setIsProcessing(false);
    },
  });

  const tableUpdateMutation = useMutation({
    mutationFn: updateTable,
    onSuccess: () => {
      dispatch(removeAllItems());
      dispatch(removeCustomer());
    },
  });

  if (cartData.length === 0) {
    return <p className="text-xs text-gray-500 text-center py-2">Cart empty</p>;
  }

  return (
    <>
      <div className="space-y-2">
        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Total:</span>
          <span className="text-white font-bold">₹{totalPriceWithTax.toFixed(2)}</span>
        </div>

        {/* Payment Methods */}
        <div className="flex gap-1">
          {paymentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setPaymentMethod(option.id)}
              className={`flex-1 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 ${
                paymentMethod === option.id
                  ? option.color + " text-white"
                  : "bg-[#262626] text-gray-400"
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
              ? "bg-gray-600 text-gray-400"
              : "bg-[#f6b100] text-black hover:bg-yellow-500"
          }`}
        >
          {isProcessing ? "..." : "Place Order"}
        </button>
      </div>

      {showInvoice && orderInfo && (
        <Invoice orderInfo={orderInfo} setShowInvoice={() => {
          setShowInvoice(false);
          navigate("/");
        }} />
      )}
    </>
  );
};

export default Bill;
