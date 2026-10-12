import { chatSlice } from "../reducer/chat/chat-slice";

export const {
  getChatRequest,
  getChatSuccess,
  getChatFailure,
  setActiveChatData,
} = chatSlice.actions;
