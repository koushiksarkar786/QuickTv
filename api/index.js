// ============================================
// SHARECHAT/QUICKTV PROXY - FULL COMPLETE CODE
// WITH SSL PINNING BYPASS & PREMIUM FAKE
// ============================================

export default async function handler(req, res) {
    // Enable CORS for all
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Device-Id, Session-Id, x-sharechat-userid, x-sharechat-secret, x-sharechat-auth-token');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', '*');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const urlPath = req.url;
    const method = req.method;
    
    // ========== HEALTH CHECK ==========
    if (urlPath === '/' || urlPath === '/health' || urlPath === '/ping') {
        return res.status(200).json({
            status: 'success',
            message: 'Proxy is running [BAD BOY]',
            timestamp: Date.now(),
            server: 'vercel',
            version: '2.0'
        });
    }
    
    // ========== FAKE PREMIUM RESPONSES - ALL ENDPOINTS ==========
    
    // Subscription endpoints
    if (urlPath.includes('/subscription') || urlPath.includes('/subs')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                isSubscribed: true,
                subStat: "2",
                plan: "Lifetime Premium [ BAD BOY ]",
                planId: "premium_lifetime_001",
                status: "active",
                expiryDate: "2099-12-31T23:59:59Z",
                autoRenew: true,
                validTill: 4102444800000,
                isTrial: false,
                gracePeriod: false,
                paymentMethod: "MODDED_PROXY",
                benefits: ["No Ads", "All Content Unlocked", "Offline Download", "HD Streaming", "Exclusive Content"]
            }
        });
    }
    
    // Entitlements / Access check
    if (urlPath.includes('/entitlement') || urlPath.includes('/access') || urlPath.includes('/content/access')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                hasAccess: true,
                isPremium: true,
                canView: true,
                requiresPayment: false,
                unlockedCategories: ["all", "movies", "shows", "web-series", "originals", "exclusive", "live"],
                unlockedShows: [],
                adFree: true,
                unlimitedDownloads: true,
                hdStreaming: true
            }
        });
    }
    
    // Payment/Purchase endpoints - Bypass completely
    if (urlPath.includes('/payment') || urlPath.includes('/purchase') || urlPath.includes('/checkout') || urlPath.includes('/order')) {
        return res.status(200).json({
            code: 200,
            message: "Payment Successful (Bypassed by Proxy)",
            data: {
                success: true,
                transactionId: "MODDED_PROXY_" + Date.now(),
                orderId: "ORD_" + Math.random().toString(36).substr(2, 10),
                status: "completed",
                isPremium: true,
                amount: 0,
                currency: "INR"
            }
        });
    }
    
    // User info / Profile - Inject premium
    if (urlPath.includes('/user') || urlPath.includes('/profile')) {
        try {
            const targetUrl = 'https://apis.sharechat.com' + urlPath;
            const response = await fetch(targetUrl, {
                headers: buildHeaders(req.headers)
            });
            let data = await response.json();
            
            // Inject premium flags
            if (data && typeof data === 'object') {
                if (data.data) {
                    data.data.isPremium = true;
                    data.data.isSubscribed = true;
                    data.data.subscriptionStatus = "active";
                    data.data.badge = "Premium [BAD BOY]";
                } else {
                    data.isPremium = true;
                    data.isSubscribed = true;
                }
            }
            return res.status(response.status).json(data);
        } catch (e) {
            return res.status(200).json({ code: 200, data: { isPremium: true, isSubscribed: true } });
        }
    }
    
    // Content endpoints - Remove paywall
    if (urlPath.includes('/content') || urlPath.includes('/video') || urlPath.includes('/episode') || urlPath.includes('/show')) {
        try {
            const targetUrl = 'https://apis.sharechat.com' + urlPath;
            const response = await fetch(targetUrl, {
                headers: buildHeaders(req.headers)
            });
            let data = await response.json();
            
            // Remove locked flags
            if (data && typeof data === 'object') {
                const removeLocked = (obj) => {
                    if (typeof obj === 'object' && obj !== null) {
                        for (let key in obj) {
                            if (key === 'isLocked' || key === 'requiresPayment' || key === 'isPremiumOnly') {
                                obj[key] = false;
                            } else if (key === 'price' || key === 'amount') {
                                obj[key] = "0";
                            } else if (typeof obj[key] === 'object') {
                                removeLocked(obj[key]);
                            }
                        }
                    }
                };
                removeLocked(data);
                if (data.data) removeLocked(data.data);
            }
            return res.status(response.status).json(data);
        } catch (e) {
            return res.status(200).json({ code: 200, data: { isLocked: false, canPlay: true } });
        }
    }
    
    // Analytics, Tracking, Logs - Silence them
    if (urlPath.includes('/analytics') || urlPath.includes('/track') || urlPath.includes('/event') || 
        urlPath.includes('/log') || urlPath.includes('/metric') || urlPath.includes('/telemetry')) {
        return res.status(200).json({ code: 200, message: "OK", status: "success" });
    }
    
    // ========== DEFAULT FORWARD WITH FULL HEADERS ==========
    try {
        const targetUrl = 'https://apis.sharechat.com' + urlPath;
        
        const response = await fetch(targetUrl, {
            method: method,
            headers: buildHeaders(req.headers),
            body: (method !== 'GET' && method !== 'HEAD' && req.body) ? 
                  (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : 
                  undefined
        });
        
        const contentType = response.headers.get('content-type') || '';
        let data;
        
        if (contentType.includes('application/json')) {
            data = await response.json();
            // Inject premium flag in all responses
            if (data && typeof data === 'object') {
                if (data.data && typeof data.data === 'object') {
                    data.data.isPremium = true;
                    data.data.isSubscribed = true;
                    data.data._mod = "badboy";
                }
                data._proxy = "active";
                data._premium = true;
            }
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }
        
    } catch (error) {
        // Fallback - Return premium always
        return res.status(200).json({
            code: 200,
            message: "Premium Enabled [BAD BOY] - Fallback Mode",
            data: {
                isPremium: true,
                isSubscribed: true,
                subStat: "2",
                plan: "Lifetime Premium",
                status: "active"
            }
        });
    }
}

// ========== HELPER FUNCTION: Build Headers with Premium Credentials ==========
function buildHeaders(originalHeaders) {
    const headers = { ...originalHeaders };
    
    // Remove problematic headers
    delete headers['accept-encoding'];
    delete headers['content-length'];
    delete headers['host'];
    delete headers['x-request-id'];
    delete headers['x-b3-traceid'];
    delete headers['x-cloud-trace-context'];
    
    // Set correct host
    headers['host'] = 'apis.sharechat.com';
    
    // Premium credentials (working ones)
    headers['device-id'] = '6caec8fc10dee519';
    headers['x-sharechat-userid'] = '3377779474';
    headers['x-sharechat-secret'] = 'e91c564faeac1dee8135';
    headers['x-sharechat-auth-token'] = '25efe4b6de088d05c888';
    headers['session-id'] = '3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33';
    headers['x-sharechat-auth-session-id'] = '35e96e72-dda6-47d8-9dc6-229899cb3b85';
    
    // App info
    headers['client-type'] = 'android';
    headers['app-version'] = '202615003';
    headers['app-version-name'] = '2026.15.03';
    headers['package-name'] = 'in.mohalla.quicktv';
    headers['os-version'] = '29';
    headers['client'] = 'Android';
    headers['auth-version'] = 'V2';
    
    // Location spoofing
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
    
    // Standard headers
    headers['accept'] = 'application/json';
    headers['accept-charset'] = 'UTF-8';
    headers['content-type'] = 'application/json';
    headers['user-agent'] = 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7S) AppleWebKit/537.36';
    
    // Timestamp
    headers['ts'] = Math.floor(Date.now() / 1000).toString();
    
    return headers;
}
