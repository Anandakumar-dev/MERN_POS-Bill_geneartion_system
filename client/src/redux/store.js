import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";

const preloadedState = {
  rootReducer: {
    loading: false,
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
  },
};

const store = configureStore({
  reducer: {
    rootReducer,
  },
  preloadedState,
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
