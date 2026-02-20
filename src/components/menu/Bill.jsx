import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";
import {
  addOrder,
  createOrderRazorpay,
  updateTable,
  verifyPaymentRazorpay,
} from "../../https/index";
import { enqueueSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { removeAllItems } from "../../redux/slices/cartSlice";
import { removeCustomer } from "../../redux/slices/customerSlice";
import Invoice from "../invoice/Invoice";
import { useNavigate } from "react-router-dom";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

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

  // Validate before placing order
  const validateOrder = () => {
    if (!paymentMethod) {
      enqueueSnackbar("Please select a payment method!", {
        variant: "warning",
      });
      return false;
    }

    if (cartData.length === 0) {
      enqueueSnackbar("Your cart is empty! Please add items.", {
        variant: "warning",
      });
      return false;
    }

    if (!customerData.table?.tableId) {
      enqueueSnackbar("Please select a table first!", {
        variant: "warning",
      });
      navigate("/tables");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    setIsProcessing(true);

    if (paymentMethod === "Online") {
      await handleOnlinePayment();
    } else {
      // Cash payment - direct order
      const orderData = {
        customerDetails: {
          name: customerData.customerName,
          phone: customerData.customerPhone,
          guests: customerData.guests,
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
        description: "Payment for your order",
        order_id: data.order.id,
        handler: async function (response) {
          // Verify payment
          const verification = await verifyPaymentRazorpay(response);
          
          if (verification.data.success) {
            enqueueSnackbar("Payment successful!", { variant: "success" });
            
            // Place the order after successful payment
            const orderData = {
              customerDetails: {
                name: customerData.customerName,
                phone: customerData.customerPhone,
                guests: customerData.guests,
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
          name: customerData.customerName,
          contact: customerData.customerPhone,
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
      // Clear cart and customer data after successful order
      dispatch(removeAllItems());
      dispatch(removeCustomer());
    },
    onError: (error) => {
      console.error("Table update error:", error);
    },
  });

  const handlePrintAndClose = () => {
    setShowInvoice(false);
    navigate("/"); // Go back to home after order completion
  };

  if (cartData.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-[#ababab]">Your cart is empty</p>
        <p className="text-xs text-[#ababab] mt-2">Add items from the menu to place an order</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-4">
        {/* Bill Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">
              Subtotal ({cartData.length} items)
            </p>
            <h1 className="text-[#f5f5f5] text-md font-bold">
              ₹{total.toFixed(2)}
            </h1>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#ababab] font-medium">Tax (5.25%)</p>
            <h1 className="text-[#f5f5f5] text-md font-bold">
              ₹{tax.toFixed(2)}
            </h1>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
            <p className="text-sm text-[#f5f5f5] font-semibold">Total</p>
            <h1 className="text-[#f6b100] text-xl font-bold">
              ₹{totalPriceWithTax.toFixed(2)}
            </h1>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mt-6">
          <p className="text-sm text-[#ababab] font-medium mb-3">Payment Method</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaymentMethod("Cash")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                paymentMethod === "Cash" 
                  ? "bg-[#f6b100] text-[#1f1f1f]" 
                  : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
              }`}
            >
              💵 Cash
            </button>
            <button
              onClick={() => setPaymentMethod("Online")}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
                paymentMethod === "Online" 
                  ? "bg-[#f6b100] text-[#1f1f1f]" 
                  : "bg-[#1f1f1f] text-[#ababab] hover:bg-[#2a2a2a]"
              }`}
            >
              📱 Online
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !paymentMethod || cartData.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
              isProcessing || !paymentMethod || cartData.length === 0
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#f6b100] text-[#1f1f1f] hover:bg-yellow-500"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#1f1f1f] border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              "Place Order"
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-3 rounded-lg bg-[#1f1f1f] text-[#ababab] font-semibold hover:bg-[#2a2a2a] transition-colors"
          >
            🖨️ Print Bill
          </button>
        </div>

        {/* Table Info */}
        {customerData.table && (
          <div className="mt-4 p-3 bg-[#1f1f1f] rounded-lg">
            <p className="text-xs text-[#ababab]">
              Table: <span className="text-[#f5f5f5] font-semibold">{customerData.table.tableNo}</span>
            </p>
            {customerData.customerName && (
              <p className="text-xs text-[#ababab] mt-1">
                Customer: <span className="text-[#f5f5f5]">{customerData.customerName}</span>
              </p>
            )}
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
