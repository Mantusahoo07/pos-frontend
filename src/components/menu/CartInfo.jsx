import React, { useEffect, useRef } from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FaNotesMedical } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "../../redux/slices/cartSlice";

const CartInfo = () => {
  const cartData = useSelector((state) => state.cart);
  const scrollRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [cartData]);

  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId));
  };

  return (
    <div className="px-4 py-3">
      <h1 className="text-lg text-[#e4e4e4] font-semibold tracking-wide mb-3">
        Order Details ({cartData.length} items)
      </h1>
      <div 
        className="overflow-y-auto scrollbar-hide" 
        ref={scrollRef}
        style={{ maxHeight: "300px" }}
      >
        {cartData.length === 0 ? (
          <p className="text-[#ababab] text-sm text-center py-10">
            Your cart is empty. Start adding items!
          </p>
        ) : (
          cartData.map((item) => (
            <div key={item.id} className="bg-[#1f1f1f] rounded-lg px-4 py-3 mb-2">
              <div className="flex items-center justify-between">
                <h1 className="text-[#ababab] font-semibold text-base">
                  {item.name}
                </h1>
                <p className="text-[#f6b100] font-semibold">
                  x{item.quantity}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <RiDeleteBin2Fill
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 cursor-pointer hover:text-red-400"
                    size={18}
                  />
                  <FaNotesMedical
                    className="text-blue-500 cursor-pointer hover:text-blue-400"
                    size={18}
                  />
                </div>
                <p className="text-[#f5f5f5] font-bold">
                  ₹{item.price}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CartInfo;
