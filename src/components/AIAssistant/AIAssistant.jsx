import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Drawer
} from '@mui/material';
import {
  SmartToy as AiIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import './AIAssistant.css';

const AIAssistant = ({ kpiData, filters, isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateFallbackAnswer = (question, kpiData) => {
    const lowerQuestion = question.toLowerCase();
    
    const total = kpiData?.totalTransactions || 0;
    const success = kpiData?.successCount || 0;
    const failed = kpiData?.failedCount || 0;
    const pending = kpiData?.pendingCount || 0;
    const totalAmount = kpiData?.totalAmount || 0;
    const totalDebit = kpiData?.totalDebit || 0;
    const totalCredit = kpiData?.totalCredit || 0;
    const netAmount = kpiData?.netAmount || 0;
    const avgAmount = kpiData?.avgAmount || 0;
    
    const successRate = total > 0 ? (success * 100 / total) : 0;
    const failedRate = total > 0 ? (failed * 100 / total) : 0;
    
    // Greetings
    if (lowerQuestion.match(/^(hi|hello|hey|greetings)/)) {
      return "👋 Hello! I'm your AI Data Assistant. Ask me about total transactions, success rate, failed count, or financial summary!";
    }
    
    // Total transactions
    if (lowerQuestion.includes('total') && lowerQuestion.includes('transaction')) {
      return `📊 Total transactions: ${total.toLocaleString()} records`;
    }
    
    // Success
    if (lowerQuestion.includes('success')) {
      return `✅ Success: ${success.toLocaleString()} transactions (${successRate.toFixed(1)}% of total)`;
    }
    
    // Failed
    if (lowerQuestion.includes('failed')) {
      return `❌ Failed: ${failed.toLocaleString()} transactions (${failedRate.toFixed(1)}% of total)`;
    }
    
    // Pending
    if (lowerQuestion.includes('pending')) {
      return `⏳ Pending: ${pending.toLocaleString()} transactions`;
    }
    
    // Amount
    if (lowerQuestion.includes('amount')) {
      return `💰 Total Amount: ₹${totalAmount.toLocaleString()}`;
    }
    
    // Summary
    if (lowerQuestion.includes('summary')) {
      return `📊 Dashboard Summary:\n• Total: ${total.toLocaleString()}\n• Success: ${success.toLocaleString()} (${successRate.toFixed(1)}%)\n• Failed: ${failed.toLocaleString()}\n• Amount: ₹${totalAmount.toLocaleString()}`;
    }
    
    // Debit
    if (lowerQuestion.includes('debit')) {
      return `💸 Total Debit: ₹${totalDebit.toLocaleString()}`;
    }
    
    // Credit
    if (lowerQuestion.includes('credit')) {
      return `💳 Total Credit: ₹${totalCredit.toLocaleString()}`;
    }
    
    // Net
    if (lowerQuestion.includes('net')) {
      return `⚖️ Net Amount: ₹${netAmount.toLocaleString()}`;
    }
    
    // Average
    if (lowerQuestion.includes('average')) {
      return `📈 Average Amount: ₹${avgAmount.toLocaleString()}`;
    }
    
    // Performance
    if (lowerQuestion.includes('performance') || lowerQuestion.includes('health')) {
      return `📈 Performance: ${successRate.toFixed(1)}% success rate. ${success > failed ? 'Good' : 'Needs improvement'}`;
    }
    
    // Default response
    return `💡 I can help you with:\n• Total transactions\n• Success/Failed counts\n• Total amount\n• Financial summary\n\nTry asking: "What is the total number of transactions?"`;
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { text: question, isUser: true, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/ai/ask', {
        question: question,
        kpiData: kpiData || {}
      });
      
      const aiMessage = {
        text: response.data.answer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('AI Error:', error);
      
      const fallbackAnswer = generateFallbackAnswer(question, kpiData);
      
      const aiMessage = {
        text: fallbackAnswer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      askQuestion();
    }
  };

  const suggestedQuestions = [
    "What is the total number of transactions?",
    "How many successful transactions?",
    "What is the success rate?",
    "Show me financial summary"
  ];

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} PaperProps={{ sx: { width: 400 } }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AiIcon />
            <Typography variant="h6">AI Assistant</Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages Area */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2, 
          bgcolor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <AiIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                👋 Hello! I'm your AI Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ask me anything about your transaction data
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try asking:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
                {suggestedQuestions.map((q, i) => (
                  <Chip
                    key={i}
                    label={q}
                    size="small"
                    onClick={() => {
                      setQuestion(q);
                      setTimeout(() => askQuestion(), 100);
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: msg.isUser ? 'row-reverse' : 'row',
                gap: 1,
                alignItems: 'flex-start'
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: msg.isUser ? '#4361ee' : '#e9ecef' }}>
                {msg.isUser ? '👤' : <AiIcon sx={{ fontSize: 16 }} />}
              </Avatar>
              <Box sx={{
                maxWidth: '70%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.isUser ? '#4361ee' : 'white',
                color: msg.isUser ? 'white' : 'inherit',
                boxShadow: 1,
                whiteSpace: 'pre-line'
              }}>
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                  {msg.timestamp}
                </Typography>
              </Box>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#e9ecef' }}>
                <AiIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'white' }}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: '#e9ecef', bgcolor: 'white', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask a question about your data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
          />
          <IconButton
            color="primary"
            onClick={askQuestion}
            disabled={loading || !question.trim()}
            sx={{ bgcolor: '#4361ee', color: 'white', '&:hover': { bgcolor: '#3a56d4' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AIAssistant;