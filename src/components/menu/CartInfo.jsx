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
    <div className="h-full flex flex-col">
      <h1 className="text-white text-sm font-semibold px-2 py-2 sticky top-0 bg-[#1a1a1a] z-10">
        Order Details ({cartData.length})
      </h1>
      
      <div 
        className="flex-1 overflow-y-auto px-2 scrollbar-hide" 
        ref={scrollRef}
      >
        {cartData.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">
            Your cart is empty
          </p>
        ) : (
          <div className="space-y-2 pb-2">
            {cartData.map((item) => (
              <div key={item.id} className="bg-[#262626] rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <h1 className="text-white text-xs font-medium truncate max-w-[100px]">
                    {item.name}
                  </h1>
                  <p className="text-[#f6b100] text-xs font-semibold">
                    x{item.quantity}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <RiDeleteBin2Fill
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 cursor-pointer hover:text-red-400"
                      size={14}
                    />
                    <FaNotesMedical
                      className="text-blue-500 cursor-pointer hover:text-blue-400"
                      size={14}
                    />
                  </div>
                  <p className="text-white text-xs font-bold">
                    ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartInfo;
