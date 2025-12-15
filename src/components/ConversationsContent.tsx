
"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider } from '@mui/material';

// Matches the `with` object from the API response
interface User {
  _id: string;
  username: string;
  role: string; // Added role
  profilePicture?: string;
}

// Matches the structure of each item in the API response array
interface Conversation {
  with: User;
  lastMessage: {
    content: string;
    createdAt: string;
  };
}

interface ConversationsContentProps {
  onUserSelect: (user: User) => void;
}

const ConversationsContent = ({ onUserSelect }: ConversationsContentProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (error) {
    return <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>Error: {error}</Typography>;
  }

  if (conversations.length === 0) {
    return <Typography sx={{ mt: 4, textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>No conversations yet.</Typography>;
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'transparent', color: 'white' }}>
      {conversations.map((convo, index) => (
        <div key={convo.with._id}>
          <ListItem 
            alignItems="flex-start"
            onClick={() => onUserSelect(convo.with)}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: '8px', mb: 1 }}
          >
            <ListItemAvatar>
              <Avatar alt={convo.with.username} src={convo.with.profilePicture} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="h6">{convo.with.username}</Typography>
              }
              secondary={
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {convo.lastMessage.content}
                </Typography>
              }
            />
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>
                {new Date(convo.lastMessage.createdAt).toLocaleTimeString()}
            </Typography>
          </ListItem>
          {index < conversations.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
        </div>
      ))}
    </List>
  );
};

export default ConversationsContent;
