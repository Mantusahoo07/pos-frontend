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

  // Set first category as selected when menus load
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
    enqueueSnackbar(`${item.name} added to cart!`, { variant: "success" });
    
    // Reset count for this item
    setItemCounts(prev => ({
      ...prev,
      [item._id]: 0
    }));
  };

  if (isLoading) return <FullScreenLoader />;
  
  if (error) {
    return (
      <div className="text-center text-red-500 p-10">
        Error loading menu: {error.message}
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center text-[#ababab] p-10">
        <p className="text-xl mb-4">No menu items available</p>
        <p className="text-sm">Please add categories and menu items in the admin dashboard</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 sm:px-6 lg:px-10 py-4">
        {menus.map((menu) => {
          const isSelected = selected?._id === menu._id || selected?.id === menu.id;
          
          return (
            <div
              key={menu._id || menu.id}
              className="flex flex-col items-start justify-between p-3 sm:p-4 rounded-lg h-20 sm:h-24 cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemCounts({});
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-white text-sm sm:text-base font-semibold truncate">
                  {menu.icon} {menu.name}
                </h1>
                {isSelected && (
                  <GrRadialSelected className="text-white flex-shrink-0" size={16} />
                )}
              </div>
              <p className="text-gray-300 text-xs sm:text-sm">
                {menu.items.length} {menu.items.length === 1 ? 'Item' : 'Items'}
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mx-4 sm:mx-6 lg:mx-10" />

      {/* Menu Items */}
      {selected && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 lg:px-10 py-4">
          {selected.items.length > 0 ? (
            selected.items.map((item) => {
              const count = itemCounts[item._id] || 0;
              
              return (
                <div
                  key={item._id}
                  className="flex flex-col bg-[#1a1a1a] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base sm:text-lg">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {!item.isAvailable && (
                      <span className="text-xs bg-red-500 bg-opacity-20 text-red-500 px-2 py-1 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#f6b100] font-bold text-lg">
                      ₹{item.price}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => decrement(item._id, e)}
                        className="w-8 h-8 rounded-full bg-[#333] text-white flex items-center justify-center hover:bg-[#444] transition-colors"
                        disabled={!item.isAvailable}
                      >
                        −
                      </button>
                      <span className="text-white font-semibold w-6 text-center">
                        {count}
                      </span>
                      <button
                        onClick={(e) => increment(item._id, e)}
                        className="w-8 h-8 rounded-full bg-[#f6b100] text-black flex items-center justify-center hover:bg-yellow-500 transition-colors"
                        disabled={!item.isAvailable || count >= 10}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-gray-400 text-xs">
                      {item.preparationTime || 15} min
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(item, e)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                        count > 0
                          ? "bg-[#2e4a40] text-[#02ca3a] hover:bg-[#3a5e4a]"
                          : "bg-[#333] text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={count === 0 || !item.isAvailable}
                    >
                      <FaShoppingCart size={14} />
                      Add
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 py-10">
              No items in this category
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuContainer;
