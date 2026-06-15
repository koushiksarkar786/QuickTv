export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // ========== FAKE PREMIUM RESPONSES ==========
    
    // Subscription management - fake premium
    if (urlPath.includes('/quicktv/subscription/manage')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                isSubscribed: true,
                plan: "QuickTV Premium [ BAD BOY ]",
                planId: "premium_lifetime",
                status: "active",
                expiryDate: "2099-12-31T23:59:59Z",
                autoRenew: true,
                benefits: [
                    "No Ads",
                    "All Shows Unlocked",
                    "Offline Download",
                    "HD Streaming"
                ],
                paymentMethod: "Lifetime Free [ MODDED ]"
            }
        });
    }

    // Subscription status endpoint
    if (urlPath.includes('/quicktv/subscription/status')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                status: "active",
                validTill: 4102444800000,  // Year 2099
                isTrial: false,
                gracePeriod: false
            }
        });
    }

    // User entitlements / what user can access
    if (urlPath.includes('/quicktv/entitlements') || urlPath.includes('/quicktv/user/entitlements')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                hasPremium: true,
                unlockedCategories: ["all", "movies", "shows", "web-series", "originals"],
                unlockedShows: [],  // Empty array means all shows unlocked
                unlimitedDownloads: true,
                adFree: true
            }
        });
    }

    // Check if specific content is accessible
    if (urlPath.includes('/quicktv/content/access')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                canAccess: true,
                requiresPayment: false,
                reason: "Premium active"
            }
        });
    }

    // Payment/checkout endpoints - bypass
    if (urlPath.includes('/quicktv/payment') || urlPath.includes('/quicktv/checkout')) {
        return res.status(200).json({
            code: 200,
            message: "Payment bypassed - Premium enabled",
            data: {
                success: true,
                transactionId: "MODDED_" + Date.now(),
                status: "completed"
            }
        });
    }

    // ========== FAKE USER STATS ==========
    
    if (urlPath.includes('/quicktv/user/stats') || urlPath.includes('/quicktv/profile/stats')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                watchTime: 999999,
                showsCompleted: 999,
                badges: ["Premium User", "Bad Boy", "Legend"],
                rank: 1
            }
        });
    }

    // ========== ANALYTICS BYPASS ==========
    
    const isAnalyticsUrl = urlPath.includes('/analytics') || urlPath.includes('/track') || urlPath.includes('/event') || urlPath.includes('/log');
    if (isAnalyticsUrl) {
        return res.status(200).json({ code: 200, message: "SUCCESS", data: null });
    }

    // ========== BAD BOY BRANDING INJECTOR ==========
    
    const applyBadBoyBranding = (obj) => {
        const brandTag = " \n [ BAD BOY ] ";
        const targetKeys = ['title', 'name', 'showName', 'episodeName', 'description', 'category', 'language', 'text'];

        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                    if (!obj[key].includes('[ BAD BOY ]')) {
                        obj[key] = obj[key].replace(/\[ MODS \]/g, '').replace(/\[ REAL APK \]/g, '').trim() + brandTag;
                    }
                } else if (typeof obj[key] === 'object') {
                    applyBadBoyBranding(obj[key]);
                }
            }
        }
    };

    // ========== SHARECHAT CREDENTIALS ==========
    
    const SHARECHAT_CONFIG = {
        deviceId: "6caec8fc10dee519",
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        os: "Android 10 (API 29)",
        appVersion: "202615003",
        appVersionName: "2026.15.03",
        clientType: "android",
        packageName: "in.mohalla.quicktv"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;

        const headers = { ...req.headers };
        headers['host'] = 'apis.sharechat.com';
        delete headers['accept-encoding'];
        delete headers['content-length'];

        // ========== OVERRIDE WITH PREMIUM CREDENTIALS ==========
        
        // Auth headers
        headers['device-id'] = SHARECHAT_CONFIG.deviceId;
        headers['x-sharechat-userid'] = SHARECHAT_CONFIG.userId;
        headers['x-sharechat-secret'] = SHARECHAT_CONFIG.secret;
        headers['x-sharechat-auth-token'] = SHARECHAT_CONFIG.authToken;
        headers['session-id'] = SHARECHAT_CONFIG.sessionId;
        headers['x-sharechat-auth-session-id'] = SHARECHAT_CONFIG.authSessionId;
        
        // App info
        headers['client-type'] = SHARECHAT_CONFIG.clientType;
        headers['app-version'] = SHARECHAT_CONFIG.appVersion;
        headers['app-version-name'] = SHARECHAT_CONFIG.appVersionName;
        headers['package-name'] = SHARECHAT_CONFIG.packageName;
        headers['os-version'] = SHARECHAT_CONFIG.os.split('(')[1]?.replace(')', '') || "29";
        
        // Additional headers needed for ShareChat
        headers['auth-version'] = 'V2';
        headers['client'] = 'Android';
        headers['accept'] = 'application/json';
        headers['content-type'] = 'application/json';
        
        // Location spoofing (Mumbai, India)
        headers['region'] = 'maharashtra';
        headers['city'] = 'mumbai';
        headers['isp'] = 'reliance jio infocomm limited';
        headers['country-short'] = 'in';
        
        // IP spoofing
        headers['x-forwarded-for'] = '122.168.2.40';
        headers['x-real-ip'] = '122.168.2.40';
        headers['x-client-ip'] = '122.168.2.40';
        
        // Device capabilities
        headers['device-high-performing'] = 'true';
        headers['device-ram-gb'] = '3';
        headers['radiotype'] = 'wifi';
        
        // Remove problematic headers
        delete headers['x-request-id'];
        delete headers['x-b3-traceid'];
        delete headers['x-cloud-trace-context'];

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
            return res.status(response.status).json(data);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            response.headers.forEach((value, key) => {
                if (key !== 'content-encoding' && key !== 'content-length') {
                    res.setHeader(key, value);
                }
            });
            return res.status(response.status).send(buffer);
        }

    } catch (error) {
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            data: null
        });
    }
}
