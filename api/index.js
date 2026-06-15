// filename: api/quicktv.js (Vercel Serverless Function)

export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    // Target base URL
    const targetBaseUrl = "https://apis.sharechat.com";
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ FAKE PREMIUM RESPONSES ============
    
    // 1. Subscription manage endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        return res.status(200).json({
            backgroundImage: "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/f42ea28_1754035031431_sc.webp",
            state: "ACTIVE_SUBSCRIPTION",
            subsId: "4d7109dc-4282-4503-a888-1501edef8529",
            productId: "sc_episodic_quarterly_7",
            banner: {
                bannerCtaText: "ACTIVE",
                bannerTitle: "QuickTV Premium [BAD BOY]",
                bannerPaymentKey: "Expiring on",
                bannerPaymentValue: "02 October 2026",
                bannerBenefitsTitle: "Benefits",
                benefits: [
                    { image: "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/1c70817a_1753944053666_sc.webp", name: "Unlimited Series" },
                    { image: "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/11d8037c_1753944053663_sc.webp", name: "No Ads" },
                    { image: "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/29f6cf98_1753944131980_sc.webp", name: "HD Videos" }
                ]
            },
            helpAndSupport: null,
            subscriptionCancelledMeta: null,
            faq: null
        });
    }
    
    // 2. Any other subscription status endpoint
    if (urlPath.includes('/subscription/state') || urlPath.includes('/subscription/status')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                plan: "QuickTV Premium [BAD BOY]",
                expiryDate: "2026-10-02",
                lifetime: false,
                validTill: 4102444800000
            }
        });
    }
    
    // 3. Watched/History endpoints - fake success
    if (urlPath.includes('/watched') || urlPath.includes('/history')) {
        return res.status(200).json({ code: 200, message: "Updated", data: null });
    }
    
    // 4. Analytics/Heartbeat - silent drop
    if (urlPath.includes('/heartbeat') || urlPath.includes('/impression') || 
        urlPath.includes('/analytics') || urlPath.includes('/event')) {
        return res.status(200).json({ status: 200, message: "OK" });
    }
    
    // ============ LIVE PROXY WITH PREMIUM HEADERS ============
    
    // Hardcoded QuickTV Premium credentials (from your capture)
    const QUICKTV_PREMIUM = {
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        sessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        deviceId: "6caec8fc10dee519",
        appVersion: "202615003",
        appVersionName: "2026.15.03",
        codePushVersion: "20261004",
        osVersion: "29",
        region: "maharashtra",
        city: "mumbai",
        country: "in",
        isp: "reliance jio infocomm limited",
        userAgent: "Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.-001.484576 Mobile Safari/537.36"
    };
    
    try {
        const targetUrl = targetBaseUrl + urlPath;
        
        // Build headers
        const headers = {
            'host': 'apis.sharechat.com',
            'x-sharechat-userid': QUICKTV_PREMIUM.userId,
            'x-sharechat-secret': QUICKTV_PREMIUM.secret,
            'x-sharechat-auth-token': QUICKTV_PREMIUM.authToken,
            'x-sharechat-auth-session-id': QUICKTV_PREMIUM.sessionId,
            'device-id': QUICKTV_PREMIUM.deviceId,
            'client-type': 'android',
            'client': 'Android',
            'package-name': 'in.mohalla.quicktv',
            'app-version': QUICKTV_PREMIUM.appVersion,
            'app-version-name': QUICKTV_PREMIUM.appVersionName,
            'code-push-version': QUICKTV_PREMIUM.codePushVersion,
            'os-version': QUICKTV_PREMIUM.osVersion,
            'device-ram-gb': '3',
            'device-high-performing': 'true',
            'region': QUICKTV_PREMIUM.region,
            'city': QUICKTV_PREMIUM.city,
            'country-short': QUICKTV_PREMIUM.country,
            'isp': QUICKTV_PREMIUM.isp,
            'radiotype': 'wifi',
            'locale-language': 'Hindi',
            'locale-skin': 'ENGLISH',
            'locale-skin-language': 'English',
            'auth-version': 'V2',
            'x-tenant': 'quicktv',
            'user-agent': QUICKTV_PREMIUM.userAgent,
            'accept': 'application/json',
            'accept-charset': 'UTF-8',
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        };
        
        // Copy original headers but override with premium
        if (req.headers) {
            Object.keys(req.headers).forEach(key => {
                const lowerKey = key.toLowerCase();
                if (!['host', 'accept-encoding', 'content-length', 'connection'].includes(lowerKey)) {
                    if (!headers[key]) {
                        headers[key] = req.headers[key];
                    }
                }
            });
        }
        
        // Add timestamp for anti-detection
        headers['ts'] = Math.floor(Date.now() / 1000).toString();
        headers['x-sharechat-install-time'] = (Math.floor(Date.now() / 1000) - 86400).toString();
        
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
            // Add Bad Boy branding if you want
            data = applyBadBoyBranding(data);
            return res.status(response.status).json(data);
        } else {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            response.headers.forEach((value, key) => {
                if (!['content-encoding', 'content-length'].includes(key)) {
                    res.setHeader(key, value);
                }
            });
            return res.status(response.status).send(buffer);
        }
        
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ code: 500, message: "Proxy Error: " + error.message });
    }
}

// Bad Boy branding function (same as before)
function applyBadBoyBranding(obj) {
    const brandTag = " \n [ BAD BOY ] ";
    const targetKeys = ['title', 'name', 'drama_name', 'text', 'language', 'bannerTitle'];
    
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
    return obj;
}
