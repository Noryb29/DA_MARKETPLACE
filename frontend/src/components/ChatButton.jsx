import { useNavigate } from 'react-router-dom'
import useChatStore from '../store/ChatStore'
import { MessageCircle } from 'lucide-react'

const ChatButton = ({ farmerId, farmerName, orderId, className = '' }) => {
  const navigate = useNavigate()
  const { createConversation, getConversations } = useChatStore()

  const handleChat = async () => {
    if (!farmerId) return

    const conversationId = await createConversation(farmerId, orderId || null)
    if (conversationId) {
      await getConversations()
      navigate('/user/dashboard/chat')
    }
  }

  return (
    <button
      onClick={handleChat}
      className={`btn btn-sm btn-outline btn-primary gap-2 ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      Chat with Farmer
    </button>
  )
}

export default ChatButton