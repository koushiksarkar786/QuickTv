// api/index.js - Updated for direct app replacement

export default async function handler(req, res) {
    const method = req.method;
    let urlPath = req.url;
    
    console.log(`[APP] ${method} ${urlPath}`);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // FORCE SET PREMIUM COOKIES
    res.setHeader('Set-Cookie', [
        'userId=3377779474; Path=/; Max-Age=31536000',
        'authToken=25efe4b6de088d05c888; Path=/; Max-Age=31536000',
        'isPremium=true; Path=/; Max-Age=31536000'
    ]);
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // PREMIUM ACCOUNT DATA
    const PREMIUM = {
        userId: "3377779474",
        authToken: "25efe4b6de088d05c888",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        deviceId: "6caec8fc10dee519",
        secret: "e91c564faeac1dee8135"
    };
    
    // INTERCEPT ALL ENDPOINTS AND RETURN PREMIUM DATA
    // Account endpoints
    if (urlPath.includes('/account-service/')) {
        if (urlPath.includes('/getUserProfile')) {
            return res.status(200).json({
                code: 200,
                message: "Success",
                data: {
                    userId: PREMIUM.userId,
                    username: "premium_user",
                    isPremium: true,
                    premiumType: "lifetime",
                    subscriptionStatus: "active"
                }
            });
        }
        
        if (urlPath.includes('/getLangList')) {
            return res.status(200).json({
                code: 200,
                data: {
                    languages: [{ code: "hi", name: "Hindi" }, { code: "en", name: "English" }]
                }
            });
        }
    }
    
    // QuickTV endpoints
    if (urlPath.includes('/quicktv-service/')) {
        // Subscription status
        if (urlPath.includes('/subscription')) {
            return res.status(200).json({
                code: 200,
                message: "Success",
                data: {
                    subStat: "2",
                    isPremium: true,
                    plan: "Premium Lifetime",
                    validity: "Active Forever",
                    features: ["No Ads", "All Content", "HD Quality"]
                }
            });
        }
        
        // Video feed with premium content
        if (urlPath.includes('/feed') || urlPath.includes('/videos')) {
            return res.status(200).json({
                code: 200,
                data: {
                    premiumAccess: true,
                    content: [],
                    message: "Premium user - Full access"
                }
            });
        }
        
        // Splash config
        if (urlPath.includes('/splashConfig')) {
            return res.status(200).json({
                code: 200,
                data: {
                    isPremiumUser: true,
                    showPremiumUI: true,
                    adFree: true
                }
            });
        }
    }
    
    // Auth endpoints - Auto login with premium
    if (urlPath.includes('/auth-service/')) {
        if (urlPath.includes('/login') || urlPath.includes('/verify')) {
            return res.status(200).json({
                code: 200,
                message: "Auto login successful",
                data: {
                    userId: PREMIUM.userId,
                    authToken: PREMIUM.authToken,
                    sessionId: PREMIUM.sessionId,
                    isPremium: true
                }
            });
        }
        
        if (urlPath.includes('/refreshToken')) {
            return res.status(200).json({
                code: 200,
                data: {
                    authToken: PREMIUM.authToken,
                    sessionId: PREMIUM.sessionId
                }
            });
        }
    }
    
    // FOR ALL OTHER REQUESTS - Forward with premium headers
    try {
        const targetUrl = "https://apis.sharechat.com" + urlPath;
        
        const headers = {
            'host': 'apis.sharechat.com',
            'x-sharechat-userid': PREMIUM.userId,
            'x-sharechat-auth-token': PREMIUM.authToken,
            'x-sharechat-secret': PREMIUM.secret,
            'session-id': PREMIUM.sessionId,
            'device-id': PREMIUM.deviceId,
            'x-sharechat-auth-session-id': '35e96e72-dda6-47d8-9dc6-229899cb3b85',
            'auth-version': 'V2',
            'app-version': '202615003',
            'client-type': 'android',
            'package-name': 'in.mohalla.quicktv',
            'x-tenant': 'quicktv',
            'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Android)',
            'accept': 'application/json',
            'content-type': 'application/json'
        };
        
        const fetchOptions = {
            method: method,
            headers: headers
        };
        
        if (method !== 'GET' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }
        
        const response = await fetch(targetUrl, fetchOptions);
        let data;
        
        if (response.headers.get('content-type')?.includes('application/json')) {
            data = await response.json();
            // Inject premium in response
            if (typeof data === 'object') {
                data._isPremium = true;
                data._premiumUser = true;
            }
            return res.status(response.status).json(data);
        } else {
            data = await response.text();
            return res.status(response.status).send(data);
        }
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(200).json({
            code: 200,
            isPremium: true,
            message: "Premium mode active"
        });
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};
