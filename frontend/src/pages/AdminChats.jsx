import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { FaSearch, FaPaperPlane, FaComments, FaUser, FaImage, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import './AdminChats.css';

const AdminChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, [pagination.currentPage, search, isActive]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatDetails(selectedChat.order._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20
      });

      if (search) params.append('search', search);
      if (isActive !== '') params.append('isActive', isActive);

      const response = await axios.get(`/api/admin/chats?${params}`);
      setChats(response.data.chats);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatDetails = async (orderId) => {
    try {
      setMessageLoading(true);
      const response = await axios.get(`/api/admin/chats/${orderId}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat details:', error);
      toast.error('Failed to load chat messages');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(`/api/admin/chats/${selectedChat.order._id}/messages`, {
        content: newMessage.trim(),
        messageType: 'text'
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      messageInputRef.current?.focus();

      // Update last message in chat list
      setChats(prev => prev.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, lastMessage: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
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

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`/api/admin/chats/${selectedChat.order._id}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessages(prev => [...prev, response.data.message]);

      // Update last message in chat list
      setChats(prev => prev.map(chat =>
        chat._id === selectedChat._id
          ? { ...chat, lastMessage: new Date() }
          : chat
      ));

      toast.success('Image sent successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (chat) => {
    const customer = chat.participants.find(p => p.role !== 'admin');
    return customer?.name || 'Unknown Customer';
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return 'No messages yet';
    }
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.content.length > 50
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Chat List */}
        <div className="col-md-4 col-lg-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Chats</h5>
            </div>
            <div className="card-body p-0">
              {/* Filters */}
              <div className="p-3 border-bottom">
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="form-select"
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                >
                  <option value="">All Chats</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Chat List */}
              <div className="chat-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <FaComments size={48} className="mb-3 opacity-50" />
                    <p>No chats found</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat._id}
                      className={`chat-item p-3 border-bottom cursor-pointer ${
                        selectedChat?._id === chat._id ? 'bg-light' : ''
                      }`}
                      onClick={() => setSelectedChat(chat)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-3">
                          <FaUser size={32} className="text-secondary" />
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{getCustomerName(chat)}</div>
                          <small className="text-muted">
                            Order #{chat.order._id.slice(-8)}
                          </small>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            {chat.lastMessage ? formatTime(chat.lastMessage) : ''}
                          </small>
                          {!chat.isActive && (
                            <div className="badge bg-secondary ms-2">Inactive</div>
                          )}
                        </div>
                      </div>
                      <div className="text-muted small">
                        {getLastMessagePreview(chat)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-3 border-top">
                  <nav>
                    <ul className="pagination pagination-sm justify-content-center mb-0">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        >
                          ‹
                        </button>
                      </li>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        >
                          ›
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="col-md-8 col-lg-9">
          <div className="card h-100">
            {selectedChat ? (
              <>
                <div className="card-header">
                  <div className="d-flex align-items-center">
                    <FaUser size={24} className="me-3 text-secondary" />
                    <div>
                      <h6 className="mb-0">{getCustomerName(selectedChat)}</h6>
                      <small className="text-muted">
                        Order #{selectedChat.order._id.slice(-8)} •
                        Status: {selectedChat.order.status} •
                        Total: ${selectedChat.order.totalAmount}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="card-body d-flex flex-column" style={{ height: '500px' }}>
                  {/* Messages */}
                  <div className="messages flex-grow-1 overflow-auto mb-3 p-3 border rounded">
                    {messageLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <FaComments size={48} className="mb-3 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`message mb-3 ${
                            message.sender.role === 'admin' ? 'text-end' : 'text-start'
                          }`}
                        >
                          <div
                            className={`d-inline-block p-3 rounded ${
                              message.sender.role === 'admin'
                                ? 'bg-primary text-white'
                                : 'bg-light'
                            }`}
                            style={{ maxWidth: '70%' }}
                          >
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
                            <small className={`d-block mt-1 ${
                              message.sender.role === 'admin' ? 'text-white-50' : 'text-muted'
                            }`}>
                              {formatTime(message.timestamp)}
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="d-flex align-items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload image"
                    >
                      <FaImage />
                    </button>
                    <div className="position-relative me-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Add emoji"
                      >
                        <FaSmile />
                      </button>
                      {showEmojiPicker && (
                        <div className="emoji-picker-container">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleSendMessage} className="d-flex flex-grow-1">
                      <input
                        ref={messageInputRef}
                        type="text"
                        className="form-control me-2"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!newMessage.trim()}
                      >
                        <FaPaperPlane />
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body d-flex align-items-center justify-content-center h-100">
                <div className="text-center text-muted">
                  <FaComments size={64} className="mb-3 opacity-50" />
                  <h5>Select a chat to start messaging</h5>
                  <p>Choose a conversation from the list to view messages and respond to customers.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminChats;
