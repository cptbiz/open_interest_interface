require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Chatwoot configuration
const CHATWOOT_BASE_URL = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
const CHATWOOT_ACCESS_TOKEN = process.env.CHATWOOT_ACCESS_TOKEN;
const CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;

// Store for active conversations
const activeConversations = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Chatwoot Webhook Server',
        chatwoot_url: CHATWOOT_BASE_URL
    });
});

// Main webhook endpoint for Chatwoot
app.post('/webhook', async (req, res) => {
    try {
        console.log('📱 Received webhook from Chatwoot:', JSON.stringify(req.body, null, 2));
        
        const { event, conversation, message, sender } = req.body;
        
        if (!event || !conversation) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Handle different events
        switch (event) {
            case 'message_created':
                await handleMessageCreated(conversation, message, sender);
                break;
            case 'conversation_created':
                await handleConversationCreated(conversation);
                break;
            case 'conversation_updated':
                await handleConversationUpdated(conversation);
                break;
            default:
                console.log(`📝 Unhandled event: ${event}`);
        }
        
        res.json({ status: 'success' });
        
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Handle new message
async function handleMessageCreated(conversation, message, sender) {
    console.log(`💬 New message in conversation ${conversation.id}:`, message.content);
    
    // Store conversation info
    activeConversations.set(conversation.id, {
        id: conversation.id,
        inbox_id: conversation.inbox_id,
        status: conversation.status,
        contact: conversation.contact,
        last_message: message.content,
        last_updated: new Date().toISOString()
    });
    
    // If it's a customer message, you can add auto-reply logic here
    if (sender.type === 'contact') {
        console.log('👤 Customer message received');
        
        // Example: Auto-reply for first message
        if (message.content.toLowerCase().includes('привет') || message.content.toLowerCase().includes('hello')) {
            await sendAutoReply(conversation.id, 'Привет! Добро пожаловать в нашу службу поддержки! 👋');
        }
    }
}

// Handle new conversation
async function handleConversationCreated(conversation) {
    console.log(`🆕 New conversation created: ${conversation.id}`);
    
    activeConversations.set(conversation.id, {
        id: conversation.id,
        inbox_id: conversation.inbox_id,
        status: conversation.status,
        contact: conversation.contact,
        created_at: new Date().toISOString()
    });
}

// Handle conversation update
async function handleConversationUpdated(conversation) {
    console.log(`🔄 Conversation updated: ${conversation.id}`);
    
    const existing = activeConversations.get(conversation.id);
    if (existing) {
        activeConversations.set(conversation.id, {
            ...existing,
            status: conversation.status,
            last_updated: new Date().toISOString()
        });
    }
}

// Send auto-reply to conversation
async function sendAutoReply(conversationId, message) {
    try {
        if (!CHATWOOT_ACCESS_TOKEN) {
            console.log('⚠️ No Chatwoot access token configured');
            return;
        }
        
        const response = await axios.post(
            `${CHATWOOT_BASE_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
            {
                content: message,
                message_type: 'outgoing'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api_access_token': CHATWOOT_ACCESS_TOKEN
                }
            }
        );
        
        console.log('✅ Auto-reply sent successfully');
        
    } catch (error) {
        console.error('❌ Error sending auto-reply:', error.response?.data || error.message);
    }
}

// Get active conversations
app.get('/conversations', (req, res) => {
    const conversations = Array.from(activeConversations.values());
    res.json({
        conversations,
        total: conversations.length
    });
});

// Get specific conversation
app.get('/conversations/:id', (req, res) => {
    const conversation = activeConversations.get(parseInt(req.params.id));
    if (conversation) {
        res.json(conversation);
    } else {
        res.status(404).json({ error: 'Conversation not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Chatwoot Webhook Server running on port ${PORT}`);
    console.log(`📱 Webhook URL: http://66.55.74.199:${PORT}/webhook`);
    console.log(`🏥 Health check: http://66.55.74.199:${PORT}/health`);
    console.log(`💬 Conversations: http://66.55.74.199:${PORT}/conversations`);
    
    if (!CHATWOOT_ACCESS_TOKEN) {
        console.log('⚠️ Warning: CHATWOOT_ACCESS_TOKEN not configured');
    }
    
    if (!CHATWOOT_ACCOUNT_ID) {
        console.log('⚠️ Warning: CHATWOOT_ACCOUNT_ID not configured');
    }
});

module.exports = app; 