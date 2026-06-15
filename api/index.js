// api/index.js - Complete working proxy with premium injection

export default async function handler(req, res) {
    const method = req.method;
    let urlPath = req.url;
    
    // Remove query params for path detection
    const pathWithoutQuery = urlPath.split('?')[0];
    
    console.log(`[${method}] ${urlPath}`);
    
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', '*');
    
    // Handle OPTIONS preflight
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Block CDN requests
    if (urlPath.includes('/cdn-cgi/')) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    // Premium Account Data
    const PREMIUM = {
        userId: process.env.PREMIUM_USER_ID || "3377779474",
        authToken: process.env.PREMIUM_AUTH_TOKEN || "25efe4b6de088d05c888",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        deviceId: process.env.PREMIUM_DEVICE_ID || "6caec8fc10dee519",
        secret: "e91c564faeac1dee8135",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        advertisingId: "da3a7af4-6991-421f-8750-d548adcee566"
    };
    
    // Set premium cookies
    res.setHeader('Set-Cookie', [
        `userId=${PREMIUM.userId}; Path=/; Max-Age=31536000; Secure; SameSite=None`,
        `authToken=${PREMIUM.authToken}; Path=/; Max-Age=31536000; Secure; SameSite=None`,
        `isPremium=true; Path=/; Max-Age=31536000; Secure; SameSite=None`
    ]);
    
    // ============ INTERCEPT ENDPOINTS ============
    
    // 1. Subscription endpoints
    if (pathWithoutQuery.includes('/subscription')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                isPremium: true,
                plan: "Premium Lifetime [BAD BOY]",
                validity: "Lifetime Active",
                expiryDate: "4102444800000",
                features: ["No Ads", "All Content", "HD Quality", "Download"],
                userId: PREMIUM.userId
            }
        });
    }
    
    // 2. User profile endpoints
    if (pathWithoutQuery.includes('/getUserProfile') || pathWithoutQuery.includes('/user/profile')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                userId: PREMIUM.userId,
                username: "premium_user",
                email: "premium@sharechat.com",
                isVerified: true,
                isPremium: true,
                premiumType: "lifetime",
                subscriptionStatus: "active",
                joinDate: "2024-01-01"
            }
        });
    }
    
    // 3. Auth/Login endpoints
    if (pathWithoutQuery.includes('/login') || pathWithoutQuery.includes('/signUp') || pathWithoutQuery.includes('/verify')) {
        return res.status(200).json({
            code: 200,
            message: "Auto login successful",
            data: {
                userId: PREMIUM.userId,
                authToken: PREMIUM.authToken,
                sessionId: PREMIUM.sessionId,
                deviceId: PREMIUM.deviceId,
                isPremium: true,
                requiresProfileUpdate: false
            }
        });
    }
    
    // 4. Token refresh
    if (pathWithoutQuery.includes('/refreshToken')) {
        return res.status(200).json({
            code: 200,
            message: "Token refreshed",
            data: {
                authToken: PREMIUM.authToken,
                sessionId: PREMIUM.sessionId,
                expiryTime: Date.now() + 86400000
            }
        });
    }
    
    // 5. Splash config
    if (pathWithoutQuery.includes('/splashConfig')) {
        return res.status(200).json({
            code: 200,
            data: {
                isPremiumUser: true,
                showPremiumUI: true,
                adFree: true,
                splashImage: "https://example.com/splash.jpg",
                config: {
                    autoPlay: true,
                    downloadEnabled: true,
                    quality: "HD"
                }
            }
        });
    }
    
    // 6. Language list
    if (pathWithoutQuery.includes('/getLangList')) {
        return res.status(200).json({
            code: 200,
            data: {
                languages: [
                    { code: "hi", name: "हिन्दी", isDefault: true },
                    { code: "en", name: "English", isDefault: false },
                    { code: "te", name: "తెలుగు", isDefault: false },
                    { code: "ta", name: "தமிழ்", isDefault: false }
                ]
            }
        });
    }
    
    // 7. Feed endpoints (with premium content)
    if (pathWithoutQuery.includes('/feed') || pathWithoutQuery.includes('/videos') || pathWithoutQuery.includes('/content')) {
        // Forward to real API but mark as premium
        try {
            const targetUrl = "https://apis.sharechat.com" + urlPath;
            const response = await fetch(targetUrl, {
                headers: {
                    'x-sharechat-userid': PREMIUM.userId,
                    'x-sharechat-auth-token': PREMIUM.authToken,
                    'session-id': PREMIUM.sessionId,
                    'device-id': PREMIUM.deviceId
                }
            });
            let data = await response.json();
            
            // Inject premium flag
            if (data && typeof data === 'object') {
                data.isPremium = true;
                data.premiumAccess = true;
                if (data.data && data.data.content) {
                    data.data.premiumOnly = false; // Unlock all content
                }
            }
            return res.status(200).json(data);
        } catch (error) {
            return res.status(200).json({
                code: 200,
                isPremium: true,
                message: "Premium feed active",
                data: { content: [] }
            });
        }
    }
    
    // ============ FORWARD TO REAL API ============
    try {
        const targetUrl = "https://apis.sharechat.com" + urlPath;
        
        console.log(`[Forward] ${method} ${targetUrl}`);
        
        const headers = {
            'host': 'apis.sharechat.com',
            'x-sharechat-userid': PREMIUM.userId,
            'x-sharechat-secret': PREMIUM.secret,
            'x-sharechat-auth-token': PREMIUM.authToken,
            'x-sharechat-auth-session-id': PREMIUM.authSessionId,
            'session-id': PREMIUM.sessionId,
            'device-id': PREMIUM.deviceId,
            'advertising-id': PREMIUM.advertisingId,
            'auth-version': 'V2',
            'code-push-version': '20261004',
            'app-version': '202615003',
            'app-version-name': '2026.15.03',
            'client-type': 'android',
            'package-name': 'in.mohalla.quicktv',
            'x-tenant': 'quicktv',
            'client': 'Android',
            'os-version': '29',
            'device-ram-gb': '3',
            'device-high-performing': 'true',
            'region': 'maharashtra',
            'city': 'mumbai',
            'isp': 'reliance jio infocomm limited',
            'country-short': 'in',
            'radiotype': 'wifi',
            'locale-language': 'Hindi',
            'locale-skin': 'ENGLISH',
            'locale-skin-language': 'English',
            'x-sharechat-install-time': '1781458702',
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Android)',
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache'
        };
        
        const fetchOptions = {
            method: method,
            headers: headers
        };
        
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }
        
        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            let data = await response.json();
            // Inject premium in every response
            if (typeof data === 'object' && data !== null) {
                data._premium = true;
                data._premiumAccount = PREMIUM.userId;
                data._injectedBy = "BAD BOY PROXY";
            }
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }
        
    } catch (error) {
        console.error('Proxy Error:', error);
        return res.status(200).json({
            code: 200,
            success: true,
            isPremium: true,
            message: "Premium mode - Error fallback",
            error: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        },
        externalResolver: true
    }
};
