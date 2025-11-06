import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowLeft, FaImage, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import './CustomerChat.css';

const CustomerChat = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(`/api/chat/${orderId}`);
      setChat(response.data);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Failed to load chat');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const response = await axios.post(`/api/chat/${orderId}/messages`, {
        content: newMessage.trim()
      });

      // Add the new message to the messages array
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');

      // Update chat last message
      setChat(prev => ({ ...prev, lastMessage: new Date() }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`/api/chat/${orderId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Add the new message to the messages array
      setMessages(prev => [...prev, response.data.message]);

      // Update chat last message
      setChat(prev => ({ ...prev, lastMessage: new Date() }));

      toast.success('Image sent successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setSending(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading chat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Chat not found</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/orders')}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary me-3"
                    onClick={() => navigate(`/orders/${orderId}`)}
                  >
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h5 className="mb-0">Chat Support</h5>
                    <small className="text-muted">Order #{orderId.slice(-8)}</small>
                  </div>
                </div>
                <div className="text-muted small">
                  {chat.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="card" style={{ height: '60vh' }}>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '50vh' }}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <FaPaperPlane size={48} className="mb-3 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender._id === user._id;
                    const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                    return (
                      <div key={message._id || index}>
                        {showDate && (
                          <div className="text-center my-3">
                            <small className="text-muted bg-light px-2 py-1 rounded">
                              {formatDate(message.timestamp)}
                            </small>
                          </div>
                        )}
                        <div className={`d-flex mb-3 ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div className={`message-bubble ${isCurrentUser ? 'sent' : 'received'}`}>
                            <div className="message-content">
                              {message.messageType === 'image' ? (
                                <img
                                  src={message.content}
                                  alt="Shared image"
                                  className="chat-image"
                                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }}
                                />
                              ) : (
                                message.content
                              )}
                            </div>
                            <div className="message-time">
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {chat.isActive && (
                <div className="d-flex flex-column">
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="emoji-picker-container mb-2">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}

                  <form onSubmit={sendMessage} className="d-flex">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    {/* Emoji button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-1"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      disabled={sending}
                    >
                      <FaSmile />
                    </button>

                    {/* Image upload button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                    >
                      <FaImage />
                    </button>

                    <input
                      type="text"
                      className="form-control me-2"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sending || !newMessage.trim()}
                    >
                      {sending ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Sending...</span>
                        </div>
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </form>
                </div>
              )}

              {!chat.isActive && (
                <div className="alert alert-warning text-center">
                  This chat has been closed. Please contact support if you need further assistance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default CustomerChat;
