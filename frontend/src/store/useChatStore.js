import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: JSON.parse(localStorage.getItem("unreadMessages")) || {},

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
  
      const { unreadMessages } = get();
  
      // Agregar la cantidad de mensajes no leídos a cada usuario
      const usersWithUnread = res.data.map((user) => ({
        ...user,
        unreadCount: unreadMessages[user._id] || user.unreadCount || 0, // Mantener mensajes no leídos
      }));
  
      // Ordenar por mensajes no leídos y último mensaje recibido
      const sortedUsers = usersWithUnread.sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        }
        return 0;
      });
  
      set({ users: sortedUsers });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al obtener usuarios");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  
  

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // Resetear mensajes no leídos y guardar en localStorage
      set((state) => {
        const newUnreadMessages = { ...state.unreadMessages, [userId]: 0 };
        localStorage.setItem("unreadMessages", JSON.stringify(newUnreadMessages));
        return { unreadMessages: newUnreadMessages };
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al obtener mensajes");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar mensaje");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadMessages } = get();

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        set((state) => {
          const newUnreadMessages = {
            ...state.unreadMessages,
            [newMessage.senderId]: (state.unreadMessages[newMessage.senderId] || 0) + 1,
          };

          localStorage.setItem("unreadMessages", JSON.stringify(newUnreadMessages)); // Guardar en localStorage

          return { unreadMessages: newUnreadMessages };
        });
      }

      // Reproducir sonido de notificación
      const audio = new Audio("/livechat.mp3");
      audio.play();
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
