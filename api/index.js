// api/index.js - ShareChat QuickTV Proxy (Same pattern as Story Max)

export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // ============= FAKE RESPONSES FOR QUICKTV =============
    
    // Subscription Manage Fake Response
    if (urlPath.includes('/subscription/manage')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subscriptionStatus: "active",
                plan: "QuickTV Premium [ BAD BOY ]",
                validity: "Lifetime Active",
                expiryDate: 4102444800000,
                features: ["No Ads", "HD Quality", "Downloads Available", "Multi-device Support"],
                isPremium: true
            }
        });
    }

    // Subscription State Fake Response
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

    // Watch History Fake Response
    if (urlPath.includes('/history') || urlPath.includes('/watched')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                status: "updated",
                lastUpdated: Date.now()
            }
        });
    }

    // Analytics/Heartbeat Fake Response
    const isAnalyticsUrl = urlPath.includes('/heartbeat') || urlPath.includes('/impression') || urlPath.includes('/analytics') || urlPath.includes('/track');
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
        const targetKeys = ['title', 'name', 'drama_name', 'text', 'language', 'showName', 'videoName', 'category', 'description'];

        if (typeof obj === 'object' && obj !== null) {
            for (let key in obj) {
                if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                    if (!obj[key].includes('[ BAD BOY ]')) {
                        obj[key] = obj[key].replace(/\[ MODS \]/g, '').replace(/\[ REAL APK \]/g, '').replace(/\[ \]/g, '').trim() + brandTag;
                    }
                } else if (typeof obj[key] === 'object') {
                    applyBadBoyBranding(obj[key]);
                }
            }
        }
    };

    // ============= QUICKTV PREMIUM CREDENTIALS (from your request) =============
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
        osVersion: "29",
        localeLanguage: "Hindi",
        localeSkin: "ENGLISH",
        localeSkinLanguage: "English",
        region: "maharashtra",
        city: "mumbai",
        isp: "reliance jio infocomm limited",
        countryShort: "in",
        radioType: "wifi",
        userAgent: "Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4638.74 Mobile Safari/537.36"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;
        
        console.log(`[Proxy] ${method} ${targetUrl}`);

        // Prepare headers
        const headers = { ...req.headers };
        
        // Remove problematic headers
        delete headers['host'];
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['connection'];
        
        // Override with premium credentials (FORCE PREMIUM)
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
        headers['locale-language'] = QUICKTV_PREMIUM.localeLanguage;
        headers['locale-skin'] = QUICKTV_PREMIUM.localeSkin;
        headers['locale-skin-language'] = QUICKTV_PREMIUM.localeSkinLanguage;
        headers['region'] = QUICKTV_PREMIUM.region;
        headers['city'] = QUICKTV_PREMIUM.city;
        headers['isp'] = QUICKTV_PREMIUM.isp;
        headers['country-short'] = QUICKTV_PREMIUM.countryShort;
        headers['radiotype'] = QUICKTV_PREMIUM.radioType;
        headers['user-agent'] = QUICKTV_PREMIUM.userAgent;
        
        // Additional required headers
        headers['cache-control'] = 'no-cache';
        headers['accept'] = 'application/json';
        headers['accept-charset'] = 'UTF-8';
        headers['content-type'] = 'application/json';
        
        // Add timestamp
        headers['ts'] = Math.floor(Date.now() / 1000).toString();
        
        // IP Spoofing (Mumbai, Maharashtra)
        headers['x-forwarded-for'] = '122.168.2.40';
        headers['x-real-ip'] = '122.168.2.40';
        headers['x-client-ip'] = '122.168.2.40';
        
        // Remove tracking headers
        delete headers['x-request-id'];
        delete headers['x-b3-traceid'];
        delete headers['x-cloud-trace-context'];
        delete headers['x-vercel-*'];
        
        // Prepare fetch options
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

        // Handle JSON response
        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Inject Bad Boy branding
            applyBadBoyBranding(data);
            
            // Add premium status to response
            if (data.data && typeof data.data === 'object') {
                data.data.isPremiumProxy = true;
                data.data.proxyStatus = "active";
                data.data.poweredBy = "BAD BOY";
            }
            
            console.log(`[Proxy] Response status: ${response.status}`);
            return res.status(response.status).json(data);
        } 
        // Handle binary/non-JSON response
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
        console.error(`[Proxy Error] ${error.message}`);
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            status: "error"
        });
    }
}
