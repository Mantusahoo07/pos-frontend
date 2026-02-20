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

  const increment = (itemId) => {
    setItemCounts(prev => ({
      ...prev,
      [itemId]: Math.min((prev[itemId] || 0) + 1, 10) // Max 10 items
    }));
  };

  const decrement = (itemId) => {
    setItemCounts(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const handleAddToCart = (item) => {
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
    <>
      {/* Categories */}
      <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
        {menus.map((menu) => {
          const isSelected = selected?._id === menu._id || selected?.id === menu.id;
          
          return (
            <div
              key={menu._id || menu.id}
              className="flex flex-col items-start justify-between p-4 rounded-lg h-[100px] cursor-pointer transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: menu.bgColor }}
              onClick={() => {
                setSelected(menu);
                setItemCounts({});
              }}
            >
              <div className="flex items-center justify-between w-full">
                <h1 className="text-[#f5f5f5] text-lg font-semibold">
                  {menu.icon} {menu.name}
                </h1>
                {isSelected && (
                  <GrRadialSelected className="text-white" size={20} />
                )}
              </div>
              <p className="text-[#ababab] text-sm font-semibold">
                {menu.items.length} {menu.items.length === 1 ? 'Item' : 'Items'}
              </p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mt-4" />

      {/* Menu Items */}
      {selected && (
        <div className="grid grid-cols-4 gap-4 px-10 py-4 w-[100%]">
          {selected.items.length > 0 ? (
            selected.items.map((item) => {
              const count = itemCounts[item._id] || 0;
              
              return (
                <div
                  key={item._id}
                  className="flex flex-col items-start justify-between p-4 rounded-lg h-[180px] cursor-pointer hover:bg-[#2a2a2a] bg-[#1a1a1a] transition-colors duration-200"
                >
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <h1 className="text-[#f5f5f5] text-lg font-semibold">
                        {item.name}
                      </h1>
                      {item.description && (
                        <p className="text-[#ababab] text-xs mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleAddToCart(item)} 
                      className="bg-[#2e4a40] text-[#02ca3a] p-2 rounded-lg hover:bg-[#3a5e4a] transition-colors duration-200"
                      disabled={count === 0}
                      title="Add to cart"
                    >
                      <FaShoppingCart size={20} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between w-full mt-2">
                    <p className="text-[#f5f5f5] text-xl font-bold">
                      ₹{item.price}
                    </p>
                    {!item.isAvailable && (
                      <span className="text-xs bg-red-500 bg-opacity-20 text-red-500 px-2 py-1 rounded">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full mt-2">
                    <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-2 rounded-lg gap-4 w-[60%]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decrement(item._id);
                        }}
                        className="text-yellow-500 text-2xl hover:text-yellow-600 w-6 h-6 flex items-center justify-center"
                        disabled={!item.isAvailable}
                      >
                        &minus;
                      </button>
                      <span className="text-white font-semibold">{count}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increment(item._id);
                        }}
                        className="text-yellow-500 text-2xl hover:text-yellow-600 w-6 h-6 flex items-center justify-center"
                        disabled={!item.isAvailable || count >= 10}
                      >
                        &#43;
                      </button>
                    </div>
                    {item.preparationTime && (
                      <span className="text-[#ababab] text-xs">
                        {item.preparationTime} min
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-4 text-center text-[#ababab] py-10">
              No items in this category
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default MenuContainer;
