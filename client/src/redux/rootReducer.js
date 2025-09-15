const initialState = {
  loading: true,
  cartItems: [],
};

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHOW_LOADING":
      return {
        ...state,
        loading: true
      }
    case "HIDE_LOADING":
      return {
        ...state,
        loading: false
      }
    // updated content for multiple times Added the selected items:

    case "ADD_TO_CART":
      const exists = state.cartItems.find((item) => item._id === action.payload._id);

      if (exists) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
        };
      }

    case "UPDATE_CART":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "DELETE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter((item) =>
          item._id !== action.payload._id

        ),
      };
    default:
      return state;
  }
};
