import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaComments } from 'react-icons/fa';

const ChatButton = ({ orderId, userId, size = 'md' }) => {
  const [hasChat, setHasChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingChat();
  }, [orderId]);

  const checkExistingChat = async () => {
    try {
      const response = await axios.get(`/api/chats/check/${orderId}`);
      setHasChat(response.data.hasChat);
      setLoading(false);
    } catch (error) {
      console.error('Error checking chat:', error);
      setLoading(false);
    }
  };

  const initiateChat = async () => {
    try {
      const response = await axios.post('/api/chats/initiate', {
        orderId,
        userId
      });

      // Open chat in a new tab
      window.open(`/admin/chats/${response.data.chatId}`, '_blank');

      toast.success('Chat initiated successfully');
    } catch (error) {
      console.error('Error initiating chat:', error);
      toast.error('Failed to initiate chat');
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4 text-lg'
  };

  if (loading) {
    return (
      <button className={`btn btn-outline-primary ${sizeClasses[size]} disabled`} disabled>
        <span className="spinner-border spinner-border-sm me-2"></span>
        Loading...
      </button>
    );
  }

  return (
    <button
      className={`btn btn-outline-primary ${sizeClasses[size]}`}
      onClick={initiateChat}
      title="Start Chat"
    >
      <FaComments className="me-2"></FaComments>
      Chat
    </button>
  );
};

export default ChatButton;
