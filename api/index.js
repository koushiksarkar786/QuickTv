// api/index.js - ShareChat QuickTV Login Proxy

export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ============= LOGIN/OTP FAKE RESPONSES =============
    
    // Send OTP - Always success
    if (urlPath.includes('/auth/v2/otp/send') || urlPath.includes('/auth/otp/send')) {
        return res.status(200).json({
            code: 200,
            message: "OTP sent successfully",
            data: {
                requestId: "mock_" + Date.now(),
                retryAfter: 30,
                expiresIn: 300,
                method: "sms",
                isNewUser: true
            }
        });
    }

    // Verify OTP - Always success with valid tokens
    if (urlPath.includes('/auth/v2/otp/verify') || urlPath.includes('/auth/otp/verify')) {
        return res.status(200).json({
            code: 200,
            message: "Login successful",
            data: {
                userId: "3377779474",
                authToken: "25efe4b6de088d05c888",
                refreshToken: "mock_refresh_" + Date.now(),
                sessionId: "3377779474_" + Math.random().toString(36).substring(2),
                expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
                isPremium: true,
                subscriptionStatus: "active"
            }
        });
    }

    // Social Login (Google/FB)
    if (urlPath.includes('/auth/v2/social/login')) {
        return res.status(200).json({
            code: 200,
            message: "Social login successful",
            data: {
                userId: "3377779474",
                authToken: "25efe4b6de088d05c888",
                refreshToken: "mock_refresh_" + Date.now(),
                sessionId: "3377779474_" + Math.random().toString(36).substring(2),
                isNewUser: false,
                isPremium: true
            }
        });
    }

    // Guest Login / Device Login
    if (urlPath.includes('/auth/v2/guest/login') || urlPath.includes('/auth/device/login')) {
        return res.status(200).json({
            code: 200,
            message: "Guest login successful",
            data: {
                userId: "3377779474",
                authToken: "25efe4b6de088d05c888",
                deviceId: "6caec8fc10dee519",
                sessionId: "3377779474_" + Math.random().toString(36).substring(2),
                isGuest: false,
                canConvert: true
            }
        });
    }

    // Token Refresh
    if (urlPath.includes('/auth/v2/token/refresh')) {
        return res.status(200).json({
            code: 200,
            message: "Token refreshed",
            data: {
                authToken: "25efe4b6de088d05c888",
                refreshToken: "mock_refresh_new_" + Date.now(),
                expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
            }
        });
    }

    // Logout
    if (urlPath.includes('/auth/v2/logout')) {
        return res.status(200).json({
            code: 200,
            message: "Logged out successfully"
        });
    }

    // ============= SUBSCRIPTION FAKE RESPONSES (Premium Bypass) =============
    
    if (urlPath.includes('/subscription/manage')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subscriptionStatus: "active",
                plan: "QuickTV Premium [ BAD BOY ]",
                validity: "Lifetime Active",
                isPremium: true,
                features: ["No Ads", "HD Quality", "Downloads"]
            }
        });
    }

    if (urlPath.includes('/subscription/state')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                isSubscribed: true,
                planType: "premium",
                mc: "0"
            }
        });
    }

    // ============= USER PROFILE RESPONSES =============
    
    if (urlPath.includes('/user/v1/profile')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                userId: "3377779474",
                userName: "Bad Boy Premium",
                email: "badboy@premium.com",
                phone: "+91XXXXXXXXXX",
                isVerified: true,
                isPremium: true,
                createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
                profileImage: "https://example.com/profile.jpg"
            }
        });
    }

    // ============= ANALYTICS/TRACKING FAKE RESPONSES =============
    
    const isAnalyticsUrl = urlPath.includes('/heartbeat') || 
                          urlPath.includes('/impression') || 
                          urlPath.includes('/analytics') || 
                          urlPath.includes('/track') ||
                          urlPath.includes('/event');
    if (isAnalyticsUrl) {
        return res.status(200).json({
            status: 200,
            message: "SUCCESS",
            data: null
        });
    }

    // ============= BAD BOY BRANDING INJECTOR =============
    
    const applyBadBoyBranding = (obj) => {
        const brandTag = " \n [ BAD BOY ] ";
        const targetKeys = ['title', 'name', 'drama_name', 'text', 'language', 'showName', 'videoName', 'category', 'description', 'userName'];

        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                    if (!obj[key].includes('[ BAD BOY ]')) {
                        obj[key] = obj[key].replace(/\[.*?\]/g, '').trim() + brandTag;
                    }
                } else if (typeof obj[key] === 'object') {
                    applyBadBoyBranding(obj[key]);
                }
            }
        }
    };

    // ============= REAL REQUEST PROXY (WITH PREMIUM HEADERS) =============
    
    // Premium credentials (force login)
    const QUICKTV_PREMIUM = {
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        deviceId: "6caec8fc10dee519",
        advertisingId: "da3a7af4-6991-421f-8750-d548adcee566",
        authVersion: "V2",
        codePushVersion: "20261004",
        appVersion: "202615003",
        appVersionName: "2026.15.03",
        clientType: "android",
        packageName: "in.mohalla.quicktv",
        tenant: "quicktv",
        client: "Android",
        osVersion: "29"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;
        console.log(`[Proxy] ${method} ${targetUrl}`);

        const headers = { ...req.headers };
        
        // Clean headers
        delete headers['host'];
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['connection'];
        
        // FORCE PREMIUM LOGIN HEADERS
        headers['x-sharechat-userid'] = QUICKTV_PREMIUM.userId;
        headers['x-sharechat-secret'] = QUICKTV_PREMIUM.secret;
        headers['x-sharechat-auth-token'] = QUICKTV_PREMIUM.authToken;
        headers['x-sharechat-auth-session-id'] = QUICKTV_PREMIUM.authSessionId;
        headers['session-id'] = QUICKTV_PREMIUM.sessionId;
        headers['device-id'] = QUICKTV_PREMIUM.deviceId;
        headers['advertising-id'] = QUICKTV_PREMIUM.advertisingId;
        headers['auth-version'] = QUICKTV_PREMIUM.authVersion;
        headers['code-push-version'] = QUICKTV_PREMIUM.codePushVersion;
        headers['app-version'] = QUICKTV_PREMIUM.appVersion;
        headers['app-version-name'] = QUICKTV_PREMIUM.appVersionName;
        headers['client-type'] = QUICKTV_PREMIUM.clientType;
        headers['package-name'] = QUICKTV_PREMIUM.packageName;
        headers['x-tenant'] = QUICKTV_PREMIUM.tenant;
        headers['client'] = QUICKTV_PREMIUM.client;
        headers['os-version'] = QUICKTV_PREMIUM.osVersion;
        
        // IP Spoofing (Indian IP)
        headers['x-forwarded-for'] = '122.168.2.40';
        headers['x-real-ip'] = '122.168.2.40';
        
        const fetchOptions = {
            method: method,
            headers: headers,
        };

        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            let data = await response.json();
            applyBadBoyBranding(data);
            
            // Add premium flag to response
            if (data.data && typeof data.data === 'object') {
                data.data.isPremiumProxy = true;
                data.data.proxyPoweredBy = "BAD BOY";
            }
            
            return res.status(response.status).json(data);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return res.status(response.status).send(buffer);
        }

    } catch (error) {
        console.error(`[Proxy Error] ${error.message}`);
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            status: "error"
        });
    }
}
