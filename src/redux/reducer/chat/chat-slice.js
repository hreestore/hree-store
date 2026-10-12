import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  chats: [],
  activeChatId: "",
  activeChatMessages: [],
  activeChatProduct: {},
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    getChatRequest: (state) => {
      state.isLoading = true;
    },

    getChatSuccess: (state, action) => {
      state.isLoading = false;

      state.chats = action.payload;
    },

    getChatFailure: (state) => {
      state.isLoading = false;
    },

    setActiveChatData: (state, action) => {
      const { id, messages, product } = action.payload;

      state.activeChatId = id;

      state.activeChatMessages = messages;

      state.activeChatProduct = product;
    },
  },
});
