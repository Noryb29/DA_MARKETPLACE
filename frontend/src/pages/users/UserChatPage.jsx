import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useChatStore, { initSocket, getSocket } from '../../store/ChatStore'
import useUserStore from '../../store/UserStore'
import Sidebar from '../public/components/SideBar'
import { MessageCircle, Send, ArrowLeft } from 'lucide-react'

const UserChatPage = () => {
  const navigate = useNavigate()
  const { conversations, messages, loading, getConversations, getMessages, sendMessage, currentConversation, setCurrentConversation } = useChatStore()
  const { logout } = useUserStore()
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showConversations, setShowConversations] = useState(true)
  const messagesEndRef = useRef(null)
  const userId = JSON.parse(localStorage.getItem('user'))?.user_id
  const role = 'user'

  useEffect(() => {
    if (userId) {
      initSocket(userId, role)
    }
    getConversations()
    return () => {
      const socket = getSocket()
      if (socket) socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (currentConversation) getMessages(currentConversation)
  }, [currentConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !currentConversation) return
    setSending(true)
    const result = await sendMessage(messageInput, currentConversation)
    if (result) {
      setMessageInput('')
      getConversations()
    }
    setSending(false)
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const selectedConv = conversations.find(c => c.conversation_id === currentConversation)
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 flex overflow-hidden">
          {/* Conversation List */}
          <div className={`${showConversations ? 'w-full md:w-80' : 'w-0'} transition-all duration-300 overflow-hidden md:overflow-visible border-r border-gray-200 bg-white`}>
            <div className="w-full md:w-80 h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Messages
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500"><p className="text-sm">No conversations yet</p></div>
                ) : (
                  conversations.map((conv) => (
                    <div key={conv.conversation_id} onClick={() => { setCurrentConversation(conv.conversation_id); if (window.innerWidth < 768) setShowConversations(false) }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-green-50 ${currentConversation === conv.conversation_id ? 'bg-green-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                          {conv.firstname?.charAt(0)}{conv.lastname?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">Farmer {conv.firstname} {conv.lastname}</p>
                          <p className="text-xs text-gray-500 truncate">{conv.last_message || 'No messages'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showConversations ? 'w-full' : 'hidden md:flex'}`}>
            {currentConversation ? (
              <>
                <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
                  <button onClick={() => setShowConversations(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {selectedConv && (
                    <>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                        {selectedConv.firstname?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Farmer {selectedConv.firstname} {selectedConv.lastname}</h3>
                        <p className="text-xs text-gray-500">Farmer</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_type === 'user'
                    return (
                      <div key={msg.message_id} className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-lg ${isOwn ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..." className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-green-500" />
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50">
                      {sending ? '...' : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserChatPage