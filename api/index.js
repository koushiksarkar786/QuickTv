// quicktv-premium-proxy.js
const express = require('express');
const app = express();

// Your premium credentials from the working request
const PREMIUM_CONFIG = {
    deviceId: "6caec8fc10dee519",
    userId: "3377779474",
    sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
    authToken: "25efe4b6de088d05c888",
    authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85"
};

// Proxy middleware
app.use('/quicktv-service', async (req, res) => {
    const targetUrl = `https://apis.sharechat.com${req.url}`;
    
    // Inject premium headers
    const headers = {
        ...req.headers,
        'device-id': PREMIUM_CONFIG.deviceId,
        'x-sharechat-userid': PREMIUM_CONFIG.userId,
        'session-id': PREMIUM_CONFIG.sessionId,
        'x-sharechat-auth-token': PREMIUM_CONFIG.authToken,
        'x-sharechat-auth-session-id': PREMIUM_CONFIG.authSessionId,
        'x-tenant': 'quicktv',
        'client-type': 'android',
        'app-version': '202615003'
    };
    
    try {
        const response = await fetch(targetUrl, { headers });
        const data = await response.json();
        
        // Inject premium flag if needed
        if (req.url.includes('/subscription')) {
            data.isPremium = true;
            data.customMessage = "BAD BOY Premium Active";
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('QuickTV Premium Proxy Active on port 3000');
});
