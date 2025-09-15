// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams, useNavigate } from 'react-router-dom';

// const CloneBillForm = () => {
//   const { billId } = useParams();
//   const navigate = useNavigate();

//   const [items, setItems] = useState([]);
//   const [formItems, setFormItems] = useState([]);
//   const [allItems, setAllItems] = useState([]);

//   useEffect(() => {
//     const fetchBillAndItems = async () => {
//       try {
//         const billRes = await axios.get(`/api/quickbilling/bill/${billId}`);
//         const itemListRes = await axios.get(`/api/items`);

//         setItems(billRes.data.items);
//         setFormItems(billRes.data.items.map(item => ({
//           itemId: item.itemId,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//         })));
//         setAllItems(itemListRes.data);
//       } catch (error) {
//         console.error("Error loading bill data", error);
//       }
//     };

//     fetchBillAndItems();
//   }, [billId]);

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...formItems];
//     if (field === 'itemId') {
//       const selectedItem = allItems.find(i => i._id === value);
//       updatedItems[index] = {
//         itemId: selectedItem._id,
//         name: selectedItem.name,
//         price: selectedItem.price,
//         quantity: 1,
//       };
//     } else {
//       updatedItems[index][field] = value;
//     }
//     setFormItems(updatedItems);
//   };

//   const handleAddItem = () => {
//     setFormItems([...formItems, { itemId: '', name: '', price: 0, quantity: 1 }]);
//   };

//   const handleRemoveItem = (index) => {
//     const updatedItems = [...formItems];
//     updatedItems.splice(index, 1);
//     setFormItems(updatedItems);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('/api/quickbilling/clone', { items: formItems });
//       alert("Bill generated successfully!");
//       navigate("/quickaccess");
//     } catch (err) {
//       alert("Billing failed");
//       console.error(err);
//     }
//   };

//   const totalAmount = formItems.reduce((sum, item) => {
//     return sum + item.price * item.quantity;
//   }, 0);

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
//       <h2 className="text-2xl font-bold mb-4 text-center">🧾 Clone Bill & Modify</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         {formItems.map((item, index) => (
//           <div key={index} className="grid grid-cols-12 gap-4 items-center">
//             <div className="col-span-4">
//               <select
//                 value={item.itemId}
//                 onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
//                 className="w-full p-2 border rounded"
//                 required
//               >
//                 <option value="">-- Select Item --</option>
//                 {allItems.map((opt) => (
//                   <option key={opt._id} value={opt._id}>{opt.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="col-span-3">
//               <input
//                 type="number"
//                 value={item.price}
//                 disabled
//                 className="w-full p-2 border rounded bg-gray-100"
//               />
//             </div>

//             <div className="col-span-3">
//               <input
//                 type="number"
//                 value={item.quantity}
//                 onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
//                 className="w-full p-2 border rounded"
//                 min="1"
//               />
//             </div>

//             <div className="col-span-2 flex justify-end">
//               <button
//                 type="button"
//                 onClick={() => handleRemoveItem(index)}
//                 className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
//               >
//                 ❌
//               </button>
//             </div>
//           </div>
//         ))}

//         <div className="flex justify-between mt-6">
//           <button
//             type="button"
//             onClick={handleAddItem}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             ➕ Add Item
//           </button> 

//           <div className="text-lg font-semibold">
//             Total: ₹ {totalAmount.toFixed(2)}
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-4">
//           <button
//             type="button"
//             onClick={() => navigate("/quickaccess")}
//             className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
//           >
//             ⬅ Back
//           </button>
//           <button
//             type="submit"
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
//           >
//             ✅ Generate Bill
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CloneBillForm;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const CloneBillForm = () => {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [formItems, setFormItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    const fetchBillAndItems = async () => {
      try {
        const billRes = await axios.get(`/api/quickbilling/bill/${billId}`);
        const itemListRes = await axios.get(`/api/items`);

        setBillData(billRes.data); // Store entire bill
        setFormItems(
          billRes.data.cartItems.map(item => ({
            itemId: item.itemId || "", // fallback if missing
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        );
        setAllItems(itemListRes.data);
      } catch (error) {
        console.error("Error loading bill data", error);
      }
    };

    fetchBillAndItems();
  }, [billId]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formItems];

    if (field === 'itemId') {
      const selectedItem = allItems.find(i => i._id === value);
      if (selectedItem) {
        updatedItems[index] = {
          itemId: selectedItem._id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity: 1,
        };
      }
    } else {
      updatedItems[index][field] = value;
    }

    setFormItems(updatedItems);
  };

  const handleAddItem = () => {
    setFormItems([...formItems, { itemId: '', name: '', price: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formItems];
    updatedItems.splice(index, 1);
    setFormItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billData) {
      alert("Bill data not loaded yet.");
      return;
    }

    try {
      const payload = {
        cartItems: formItems,
        customerName: billData.customerName,
        customerNumber: billData.customerNumber,
        paymentMode: billData.paymentMode,
      };

      const res = await axios.post(`/api/quickbilling/clone/${billId}`, payload);
      alert("Bill generated successfully!");
      navigate(`/invoice/${res.data.newBillId}`);
    } catch (err) {
      alert("Billing failed");
      console.error("Error generating cloned bill:", err.message, err);
    }
  };

  const totalAmount = formItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">🧾 Clone Bill & Modify</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <select
                value={item.itemId}
                onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">-- Select Item --</option>
                {allItems.map((opt) => (
                  <option key={opt._id} value={opt._id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <input
                type="number"
                value={item.price}
                disabled
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="col-span-3">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                className="w-full p-2 border rounded"
                min="1"
              />
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                ❌
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            ➕ Add Item
          </button>

          <div className="text-lg font-semibold">
            Total: ₹ {totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/quickaccess")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            ⬅ Back
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            ✅ Generate Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default CloneBillForm;
