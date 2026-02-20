import React, { useState, useEffect } from "react";
import { useMenu } from "../../hooks/useMenu";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addItems } from "../../redux/slices/cartSlice";
import FullScreenLoader from "../shared/FullScreenLoader";
import { enqueueSnackbar } from "notistack";

const MenuContainer = () => {
  const { menus, isLoading, error } = useMenu();
  const [selected, setSelected] = useState(null);
  const [itemCounts, setItemCounts] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (menus.length > 0 && !selected) {
      setSelected(menus[0]);
    }
  }, [menus, selected]);

  const increment = (itemId, e) => {
    e.stopPropagation();
    setItemCounts(prev => ({
      ...prev,
      [itemId]: Math.min((prev[itemId] || 0) + 1, 10)
    }));
  };

  const decrement = (itemId, e) => {
    e.stopPropagation();
    setItemCounts(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const handleAddToCart = (item, e) => {
    e.stopPropagation();
    const count = itemCounts[item._id] || 0;
    if (count === 0) {
      enqueueSnackbar("Please select quantity first!", { variant: "warning" });
      return;
    }

    const newObj = { 
      id: Date.now() + item._id,
      _id: item._id,
      name: item.name, 
      pricePerQuantity: item.price, 
      quantity: count, 
      price: item.price * count,
      notes: ""
    };

    dispatch(addItems(newObj));
    enqueueSnackbar(`${item.name} added!`, { variant: "success" });
    setItemCounts(prev => ({ ...prev, [item._id]: 0 }));
  };

  if (isLoading) return <FullScreenLoader />;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (menus.length === 0) return <div className="p-4 text-gray-500">No menu items</div>;

  return (
    <div className="h-full">
      {/* Categories - Horizontal Scroll on Mobile */}
      <div className="flex overflow-x-auto gap-2 p-3 scrollbar-hide">
        {menus.map((menu) => {
          const isSelected = selected?._id === menu._id;
          return (
            <button
              key={menu._id}
              onClick={() => {
                setSelected(menu);
                setItemCounts({});
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isSelected
                  ? "bg-[#f6b100] text-black"
                  : "bg-[#262626] text-gray-400 hover:bg-[#333]"
              }`}
              style={!isSelected ? { backgroundColor: menu.bgColor + '40' } : {}}
            >
              {menu.icon} {menu.name} ({menu.items.length})
            </button>
          );
        })}
      </div>

      {/* Menu Items Grid */}
      {selected && (
        <div className="grid grid-cols-2 gap-2 p-3 overflow-y-auto">
          {selected.items.map((item) => {
            const count = itemCounts[item._id] || 0;
            return (
              <div
                key={item._id}
                className="bg-[#262626] rounded-lg p-3 hover:bg-[#333] transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium text-sm truncate">
                    {item.name}
                  </h3>
                  {!item.isAvailable && (
                    <span className="text-[10px] bg-red-500 bg-opacity-20 text-red-500 px-1.5 py-0.5 rounded">
                      Unavail
                    </span>
                  )}
                </div>

                <p className="text-[#f6b100] font-bold text-base mb-2">
                  ₹{item.price}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => decrement(item._id, e)}
                      className="w-6 h-6 rounded-full bg-[#333] text-white flex items-center justify-center text-sm"
                      disabled={!item.isAvailable}
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-4 text-center">
                      {count}
                    </span>
                    <button
                      onClick={(e) => increment(item._id, e)}
                      className="w-6 h-6 rounded-full bg-[#f6b100] text-black flex items-center justify-center text-sm"
                      disabled={!item.isAvailable || count >= 10}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(item, e)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      count > 0
                        ? "bg-[#2e4a40] text-green-500"
                        : "bg-[#333] text-gray-500"
                    }`}
                    disabled={count === 0}
                  >
                    <FaShoppingCart size={12} />
                  </button>
                </div>

                {item.preparationTime && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    {item.preparationTime} min
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MenuContainer;
