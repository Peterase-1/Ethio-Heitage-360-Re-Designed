import React, { useState } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import { 
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Tabs, Tab, List, ListItem, ListItemText, Avatar
} from '@mui/material';
import {
  MessageSquare,
  Mail,
  Send,
  User
} from 'lucide-react';

const MuseumCommunications = () => {
  const [tabValue, setTabValue] = useState(0);
  const [messages] = useState([
    {
      id: 1,
      from: 'Super Admin',
      subject: 'Exhibition Approval Status',
      message: 'Your latest virtual exhibition submission has been reviewed...',
      timestamp: '2024-08-14 14:30',
      type: 'admin'
    },
    {
      id: 2,
      from: 'visitor@email.com',
      subject: 'Feedback on Recent Visit',
      message: 'I really enjoyed the Ethiopian Heritage exhibit...',
      timestamp: '2024-08-14 10:15',
      type: 'feedback'
    }
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <MessageSquare className="mr-3" size={32} />
              Communications
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage communications with Super Admin and visitors
            </Typography>
          </Box>

          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
            <Tab label="Admin Messages" />
            <Tab label="Visitor Feedback" />
            <Tab label="Support Requests" />
          </Tabs>

          <Paper sx={{ p: 3 }}>
            <List>
              {messages.map((message) => (
                <ListItem key={message.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>
                    <User size={20} />
                  </Avatar>
                  <ListItemText
                    primary={`${message.from} - ${message.subject}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">{message.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {message.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button variant="outlined" startIcon={<Send size={16} />}>
                    Reply
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default MuseumCommunications;
