import { create } from 'zustand'
import axios from 'axios'
import { io } from 'socket.io-client'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"
const BASE = `${BASE_URL}/api/chat`

let socket = null

export const initSocket = (userId, role) => {
  if (socket) {
    socket.disconnect()
  }
  socket = io(BASE_URL, {
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    socket.emit('join', { userId, role })
  })

  return socket
}

export const getSocket = () => socket

const useChatStore = create((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
  socket: null,

  initializeSocket: (userId, role) => {
    const socket = initSocket(userId, role)
    set({ socket })
    
    socket.on('new_message', (message) => {
      const state = get()
      if (state.currentConversation === message.conversation_id) {
        set((s) => ({ messages: [...s.messages, message] }))
      }
      if (state.currentConversation !== message.conversation_id) {
        set((s) => ({ unreadCount: s.unreadCount + 1 }))
      }
    })
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  getToken: () => {
    return localStorage.getItem('token') || localStorage.getItem('farmer_token')
  },

  getConversations: async () => {
    set({ loading: true, error: null })
    try {
      const token = get().getToken()
      const response = await axios.get(`${BASE}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ conversations: response.data.conversations, loading: false })
      return response.data.conversations
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Failed to get conversations' })
      return []
    }
  },

  getMessages: async (conversationId) => {
    set({ loading: true, error: null })
    try {
      const token = get().getToken()
      const response = await axios.get(`${BASE}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ messages: response.data.messages, currentConversation: conversationId, loading: false })
      return response.data.messages
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Failed to get messages' })
      return []
    }
  },

  sendMessage: async (content, conversationId = null, farmerId = null, orderId = null) => {
    set({ loading: true, error: null })
    try {
      const token = get().getToken()
      const response = await axios.post(
        `${BASE}/message`,
        { content, conversationId, farmerId, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const newMessage = response.data.message
      set((state) => ({
        messages: [...state.messages, newMessage],
        loading: false
      }))
      return newMessage
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Failed to send message' })
      return null
    }
  },

  createConversation: async (farmerId, orderId = null) => {
    try {
      const token = get().getToken()
      const response = await axios.post(
        `${BASE}/conversation`,
        { farmerId, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data.conversation_id
    } catch (error) {
      console.error('Failed to create conversation:', error)
      return null
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  setCurrentConversation: (conversationId) => {
    set({ currentConversation: conversationId, messages: [] })
  },

  clearChat: () => {
    set({ conversations: [], currentConversation: null, messages: [], error: null })
  }
}))

export default useChatStore