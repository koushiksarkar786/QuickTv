// pages/api/index.js
export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // ============ FAKE PREMIUM RESPONSES FOR QUICKTV ============
    
    // 1. Subscription Manage - Premium status
    if (urlPath.includes('/subscription/manage')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                isPremium: true,
                subscriptionStatus: "active",
                plan: "QuickTV Premium [ BAD BOY ]",
                validUntil: "2099-12-31T23:59:59Z",
                features: ["no_ads", "downloads", "hd_quality", "offline_mode"],
                paymentMethod: "LIFETIME_ACTIVE"
            }
        });
    }

    // 2. Subscription State Check
    if (urlPath.includes('/subscription/state')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",  // 2 = Active Premium
                mc: "0",
                planName: "BAD BOY Premium",
                expiryDays: 99999,
                isAutoRenew: true
            }
        });
    }

    // 3. Video Playback - Remove ads for premium
    if (urlPath.includes('/video/playback') || urlPath.includes('/getPlaybackInfo')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                ads: [], // No ads for premium
                skipIntro: true,
                quality: "1080p",
                drm: false
            }
        });
    }

    // 4. Content List - Premium content unlock
    if (urlPath.includes('/content/list') || urlPath.includes('/feed')) {
        // Let real API come through but modify response
        // Fallback to proxy
    }

    // 5. Remove ads from ad requests
    if (urlPath.includes('/ad/') || urlPath.includes('/advertisement')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                ads: [],
                shouldShowAd: false,
                nextAdTime: 999999
            }
        });
    }

    // 6. Analytics tracking - Silent ignore (just return success)
    const isAnalyticsUrl = urlPath.includes('/analytics') || 
                          urlPath.includes('/track') || 
                          urlPath.includes('/event') ||
                          urlPath.includes('/heartbeat') ||
                          urlPath.includes('/impression') ||
                          urlPath.includes('/telemetry');
    
    if (isAnalyticsUrl) {
        return res.status(200).json({ 
            code: 200, 
            message: "SUCCESS", 
            data: null 
        });
    }

    // ============ BAD BOY BRANDING INJECTOR ============
    const applyBadBoyBranding = (obj) => {
        const brandTag = " \n [ BAD BOY ] ";
        const targetKeys = ['title', 'name', 'drama_name', 'text', 'showName', 
                           'videoTitle', 'category', 'description', 'language'];

        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                    if (!obj[key].includes('[ BAD BOY ]')) {
                        obj[key] = obj[key].replace(/\[ MODS \]/g, '')
                                           .replace(/\[ REAL APK \]/g, '')
                                           .replace(/\[ \]/g, '')
                                           .trim() + brandTag;
                    }
                } else if (typeof obj[key] === 'object') {
                    applyBadBoyBranding(obj[key]);
                } else if (Array.isArray(obj[key])) {
                    obj[key].forEach(item => applyBadBoyBranding(item));
                }
            }
        }
    };

    // ============ QUICKTV PREMIUM CREDENTIALS (Working ones from your request) ============
    const QUICKTV_PREMIUM = {
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        deviceId: "6caec8fc10dee519",
        advertisingId: "da3a7af4-6991-421f-8750-d548adcee566",
        installTime: "1781458702",
        codePushVersion: "20261004",
        appVersion: "202615003",
        appVersionName: "2026.15.03",
        userAgent: "Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4638.74 Mobile Safari/537.36"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;
        
        console.log(`[PROXY] ${method} ${targetUrl}`);

        // Prepare headers from original request
        const headers = { ...req.headers };
        
        // Clean up problematic headers
        delete headers['host'];
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['connection'];
        
        // Override with premium credentials (THIS IS THE KEY)
        headers['x-sharechat-userid'] = QUICKTV_PREMIUM.userId;
        headers['x-sharechat-secret'] = QUICKTV_PREMIUM.secret;
        headers['x-sharechat-auth-token'] = QUICKTV_PREMIUM.authToken;
        headers['x-sharechat-auth-session-id'] = QUICKTV_PREMIUM.authSessionId;
        headers['session-id'] = QUICKTV_PREMIUM.sessionId;
        headers['device-id'] = QUICKTV_PREMIUM.deviceId;
        headers['advertising-id'] = QUICKTV_PREMIUM.advertisingId;
        headers['x-sharechat-install-time'] = QUICKTV_PREMIUM.installTime;
        headers['code-push-version'] = QUICKTV_PREMIUM.codePushVersion;
        headers['app-version'] = QUICKTV_PREMIUM.appVersion;
        headers['app-version-name'] = QUICKTV_PREMIUM.appVersionName;
        headers['user-agent'] = QUICKTV_PREMIUM.userAgent;
        
        // Essential headers for QuickTV
        headers['auth-version'] = 'V2';
        headers['client-type'] = 'android';
        headers['x-tenant'] = 'quicktv';
        headers['client'] = 'Android';
        headers['os-version'] = '29';
        headers['package-name'] = 'in.mohalla.quicktv';
        headers['locale-language'] = 'Hindi';
        headers['locale-skin'] = 'ENGLISH';
        headers['region'] = 'maharashtra';
        headers['city'] = 'mumbai';
        headers['isp'] = 'reliance jio infocomm limited';
        headers['country-short'] = 'in';
        headers['radiotype'] = 'wifi';
        headers['network_type'] = 'wifi';
        
        // IP spoofing (Mumbai IP)
        headers['x-forwarded-for'] = '103.251.217.10';
        headers['x-real-ip'] = '103.251.217.10';
        
        // Timestamp for anti-tampering (if needed)
        headers['ts'] = Math.floor(Date.now() / 1000).toString();

        const fetchOptions = {
            method: method,
            headers: headers,
        };

        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make the actual API call
        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        // Process JSON response and inject branding
        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Apply BAD BOY branding to response
            applyBadBoyBranding(data);
            
            // Modify subscription data if present
            if (data?.data?.subscription) {
                data.data.subscription.isPremium = true;
                data.data.subscription.status = "active";
            }
            
            return res.status(response.status).json(data);
        } 
        // Handle non-JSON responses (videos, images, etc.)
        else {
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
        console.error('[PROXY ERROR]', error);
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            success: false
        });
    }
}
