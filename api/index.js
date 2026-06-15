// api/index.js - Force inject premium account

export default async function handler(req, res) {
    let urlPath = req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Set cookies to force premium account
    res.setHeader('Set-Cookie', [
        'userId=3377779474; Path=/; Domain=.vercel.app; Max-Age=31536000',
        'authToken=25efe4b6de088d05c888; Path=/; Domain=.vercel.app; Max-Age=31536000',
        'sessionId=3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33; Path=/; Domain=.vercel.app; Max-Age=31536000'
    ]);
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // BLOCK Cloudflare CDN
    if (urlPath.includes('/cdn-cgi/')) {
        return res.status(404).end();
    }

    // PREMIUM ACCOUNT DATA (Force inject)
    const PREMIUM_ACCOUNT = {
        // User Info
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        deviceId: "6caec8fc10dee519",
        
        // Premium Status
        isPremium: true,
        subscriptionStatus: "active",
        planType: "premium_lifetime",
        
        // User Profile
        profile: {
            userId: "3377779474",
            username: "premium_user",
            email: "premium@sharechat.com",
            phone: "+919876543210",
            isVerified: true,
            isPremium: true,
            premiumExpiry: "4102444800000"
        }
    };

    // INTERCEPT and INJECT premium response for ALL auth endpoints
    if (urlPath.includes('/login') || urlPath.includes('/signUp') || urlPath.includes('/auth')) {
        return res.status(200).json({
            status: 200,
            message: "Login successful",
            data: {
                userId: PREMIUM_ACCOUNT.userId,
                authToken: PREMIUM_ACCOUNT.authToken,
                sessionId: PREMIUM_ACCOUNT.sessionId,
                isPremium: true,
                profile: PREMIUM_ACCOUNT.profile
            }
        });
    }

    // Force inject subscription status
    if (urlPath.includes('/subscription')) {
        return res.status(200).json({
            status: 200,
            message: "Success",
            data: {
                subStat: "2",
                isPremium: true,
                plan: "Premium Lifetime [BAD BOY]",
                validity: "Lifetime Active",
                expiryDate: "4102444800000",
                features: ["No Ads", "All Content", "HD Quality", "Download"]
            }
        });
    }

    // Inject user profile
    if (urlPath.includes('/user/profile') || urlPath.includes('/getUserProfile')) {
        return res.status(200).json({
            status: 200,
            data: PREMIUM_ACCOUNT.profile
        });
    }

    // Handle splash config with premium flags
    if (urlPath.includes('/splashConfig')) {
        return res.status(200).json({
            status: 200,
            data: {
                isPremium: true,
                premiumUser: true,
                showPremiumUI: true,
                config: {
                    autoPlay: true,
                    premiumOnlyContent: true,
                    adFree: true
                }
            }
        });
    }

    // FORCE OVERRIDE: Always inject premium headers to original API
    try {
        const targetUrl = targetBaseUrl + req.url;
        
        console.log(`[Proxy] ${method} ${targetUrl}`);

        // Create headers with FORCED premium credentials
        const headers = {
            // FORCED premium credentials (app ke request ko override karega)
            'host': 'apis.sharechat.com',
            'x-sharechat-userid': PREMIUM_ACCOUNT.userId,
            'x-sharechat-secret': PREMIUM_ACCOUNT.secret,
            'x-sharechat-auth-token': PREMIUM_ACCOUNT.authToken,
            'x-sharechat-auth-session-id': PREMIUM_ACCOUNT.authSessionId,
            'session-id': PREMIUM_ACCOUNT.sessionId,
            'device-id': PREMIUM_ACCOUNT.deviceId,
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
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36',
            'accept': 'application/json',
            'accept-language': 'en-US,en;q=0.9,hi;q=0.8',
            'cache-control': 'no-cache'
        };

        // OVERRIDE any headers from app with premium ones
        // Iska matlab app bhej kuch bhi, hum premium hi bhejenge
        const fetchOptions = {
            method: method,
            headers: headers,
            redirect: 'follow'
        };

        // Add body for POST requests
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make API call
        const response = await fetch(targetUrl, fetchOptions);
        
        let responseData;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            responseData = await response.json();
            
            // INJECT premium fields in every JSON response
            if (typeof responseData === 'object' && responseData !== null) {
                responseData.isPremium = true;
                responseData.premiumAccount = true;
                responseData.premiumBy = "BAD BOY";
                responseData.userId = PREMIUM_ACCOUNT.userId;
                
                // Inject in nested objects
                if (responseData.data && typeof responseData.data === 'object') {
                    responseData.data.isPremium = true;
                    responseData.data.subStat = "2";
                }
                
                if (responseData.user && typeof responseData.user === 'object') {
                    responseData.user.isPremium = true;
                    responseData.user.subscriptionType = "premium_lifetime";
                }
            }
            
            return res.status(200).json(responseData);
        } else {
            responseData = await response.text();
            return res.status(response.status).send(responseData);
        }

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return res.status(500).json({ 
            error: "Proxy error",
            isPremium: true,
            message: "Using premium account"
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
