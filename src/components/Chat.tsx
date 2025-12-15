
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Avatar, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import io, { Socket } from 'socket.io-client';

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  role?: string;
}

interface Message {
  text: string;
  sender: 'currentUser' | 'otherUser';
}

interface ChatProps {
  currentUser: User;
  otherUser: User;
}

const Chat = ({ currentUser, otherUser }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser || !otherUser) return;

    fetch('/api/socket');
    socketRef.current = io({ path: '/api/socket' });
    const socket = socketRef.current;

    socket.emit('register', currentUser._id);

    socket.on('receive_message', (message) => {
      if (message.from === currentUser._id) return; // Should be handled by optimistic update

      const receivedMessage: Message = {
        text: message.text,
        sender: 'otherUser',
      };
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    });

    // Optional: Fetch message history
    const fetchHistory = async () => {
      const response = await fetch(`/api/messages/${otherUser._id}`);
      const data = await response.json();
      const formattedMessages = data.map((msg: any) => ({
        text: msg.text,
        sender: msg.from === currentUser._id ? 'currentUser' : 'otherUser',
      }));
      setMessages(formattedMessages);
    };
    fetchHistory();

    return () => {
      socket.disconnect();
    };
  }, [currentUser, otherUser]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !socketRef.current || !currentUser?._id) return;

    const messagePayload = {
      text: newMessage,
      from: currentUser._id,
      to: otherUser._id,
    };

    socketRef.current.emit('private_message', messagePayload);

    const optimisticMessage: Message = {
      text: newMessage,
      sender: 'currentUser',
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!otherUser) {
    return <Typography>Select a conversation to start chatting.</Typography>;
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid #e0e0e0'
    }}>
      <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2, background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <Avatar src={otherUser.profilePicture || ''} alt={otherUser.username} />
        <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>{otherUser.username}</Typography>
      </Paper>
      
      <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', color: 'black' }}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: msg.sender === 'currentUser' ? 'flex-end' : 'flex-start',
              mb: 1.5
            }}
          >
            <Paper sx={{
              p: 1.5,
              background: msg.sender === 'currentUser' ? '#006D5B' : '#f0f0f0',
              color: msg.sender === 'currentUser' ? 'white' : 'black',
              maxWidth: '70%',
              borderRadius: msg.sender === 'currentUser' ? '20px 20px 4px 20px' : '20px 20px 20px 4px'
            }}>
              {msg.text}
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 1.5, background: '#f5f5f5', display: 'flex', alignItems: 'center', borderTop: '1px solid #e0e0e0' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: 'white',
              color: 'black',
              '& fieldset': { borderColor: '#e0e0e0' },
              '&:hover fieldset': { borderColor: '#bdbdbd' },
              '&.Mui-focused fieldset': { borderColor: '#006D5B' },
            },
            '& .MuiInputBase-input': { color: 'black' }
          }}
        />
        <IconButton
          onClick={handleSendMessage}
          sx={{ ml: 1, background: '#006D5B', color: 'white', '&:hover': { background: '#004D3F'} }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
