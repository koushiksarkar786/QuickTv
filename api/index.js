// api/index.js - Exact same format as original ShareChat API
export default async function handler(req, res) {
    const url = req.url;
    const method = req.method;
    
    console.log(`[${method}] ${url}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // OPTIONS preflight
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Premium account data (exactly as ShareChat expects)
    const PREMIUM_USER_ID = "3377779474";
    const PREMIUM_AUTH_TOKEN = "25efe4b6de088d05c888";
    const PREMIUM_SESSION_ID = "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33";
    
    // ========== RETURN EXACT ORIGINAL FORMATS ==========
    
    // 1. Subscription endpoint
    if (url.includes('/subscription/manage') || url.includes('/subscription/state')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": {
                "subStat": "2",
                "mc": "0"
            }
        });
    }
    
    // 2. User profile endpoint
    if (url.includes('/getUserProfile') || url.includes('/user/profile')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": {
                "userId": PREMIUM_USER_ID,
                "userHandle": "premium_user",
                "profilePic": "https://cdn.sharechat.com/default.png",
                "isVerified": true,
                "followersCount": 1000,
                "followingCount": 500,
                "isPremium": true
            }
        });
    }
    
    // 3. Login/Verify endpoint
    if (url.includes('/login') || url.includes('/verify') || url.includes('/signUp')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": {
                "userId": PREMIUM_USER_ID,
                "authToken": PREMIUM_AUTH_TOKEN,
                "sessionId": PREMIUM_SESSION_ID,
                "isNewUser": false,
                "isPremium": true
            }
        });
    }
    
    // 4. Refresh token
    if (url.includes('/refreshToken')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": {
                "authToken": PREMIUM_AUTH_TOKEN,
                "sessionId": PREMIUM_SESSION_ID
            }
        });
    }
    
    // 5. Splash config
    if (url.includes('/splashConfig')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": {
                "splashImage": "https://cdn.sharechat.com/splash.jpg",
                "splashVideo": "https://cdn.sharechat.com/splash.mp4",
                "minVersion": "202615003",
                "forceUpdate": false
            }
        });
    }
    
    // 6. Language list
    if (url.includes('/getLangList')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": [
                { "id": 1, "name": "Hindi", "code": "hi", "isSelected": true },
                { "id": 2, "name": "English", "code": "en", "isSelected": false },
                { "id": 3, "name": "Tamil", "code": "ta", "isSelected": false },
                { "id": 4, "name": "Telugu", "code": "te", "isSelected": false }
            ]
        });
    }
    
    // 7. Feed/Content endpoint
    if (url.includes('/feed') || url.includes('/videos') || url.includes('/content')) {
        // Forward to real API but with premium headers
        try {
            const targetUrl = "https://apis.sharechat.com" + url;
            const response = await fetch(targetUrl, {
                headers: {
                    'x-sharechat-userid': PREMIUM_USER_ID,
                    'x-sharechat-auth-token': PREMIUM_AUTH_TOKEN,
                    'session-id': PREMIUM_SESSION_ID,
                    'device-id': '6caec8fc10dee519',
                    'user-agent': 'Mozilla/5.0 (Android)'
                }
            });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            // Fallback if real API fails
            return res.status(200).json({
                "code": 200,
                "message": "Success",
                "data": {
                    "content": [],
                    "hasMore": false
                }
            });
        }
    }
    
    // 8. Analytics/Tracking - Just return success
    if (url.includes('/heartbeat') || url.includes('/track') || url.includes('/analytics')) {
        return res.status(200).json({
            "code": 200,
            "message": "Success",
            "data": null
        });
    }
    
    // 9. Default response for unknown endpoints
    return res.status(200).json({
        "code": 200,
        "message": "Success",
        "data": null
    });
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true
    }
};
