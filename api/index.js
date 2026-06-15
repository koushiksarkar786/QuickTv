// api/index.js - ShareChat QuickTV Proxy (Same logic as Story Max)

export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // Fake Premium Response for QuickTV (Subscription)
    if (urlPath.includes('/subscription/manage')) {
        return res.status(200).json({ 
            code: 200, 
            message: "Success", 
            data: { 
                subStat: "2", 
                plan: "Premium", 
                isPremium: true,
                validity: "Lifetime Active",
                message: "Enjoy Premium [ BAD BOY ]"
            } 
        });
    }

    if (urlPath.includes('/subscription/state')) {
        return res.status(200).json({ 
            code: 200, 
            message: "Success", 
            data: { 
                subStat: "2", 
                mc: "0",
                isSubscribed: true,
                expiryDate: "4102444800000"
            } 
        });
    }

    // Block Analytics/Heartbeat requests
    const isAnalyticsUrl = urlPath.includes('/heartbeat') || urlPath.includes('/impression') || urlPath.includes('/analytics') || urlPath.includes('/track');
    if (isAnalyticsUrl) {
        return res.status(200).json({ status: 200, message: "SUCCESS", data: null });
    }

    // [BAD BOY] Branding Injector (Optional)
    const applyBadBoyBranding = (obj) => {
        const brandTag = " \n [ BAD BOY ] ";
        const targetKeys = ['title', 'name', 'showName', 'videoTitle', 'description', 'text', 'category'];

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

    // PREMIUM ACCOUNT CREDENTIALS (Your ShareChat Premium Account Details)
    const QUICKTV_PREMIUM = {
        // Device & User Info
        deviceId: "6caec8fc10dee519",
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        authToken: "25efe4b6de088d05c888",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        advertisingId: "da3a7af4-6991-421f-8750-d548adcee566",
        
        // App Info
        appVersion: "202615003",
        appVersionName: "2026.15.03",
        codePushVersion: "20261004",
        packageName: "in.mohalla.quicktv",
        clientType: "android",
        client: "Android",
        
        // System Info
        osVersion: "29",
        deviceRamGb: "3",
        deviceHighPerforming: "true",
        
        // Location & Network
        region: "maharashtra",
        city: "mumbai",
        isp: "reliance jio infocomm limited",
        countryShort: "in",
        radioType: "wifi",
        
        // Auth
        authVersion: "V2",
        tenant: "quicktv",
        
        // User Agent
        userAgent: "Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4638.74 Mobile Safari/537.36",
        
        // Install Time
        installTime: "1781458702"
    };

    try {
        const targetUrl = targetBaseUrl + urlPath;

        // Prepare headers from original request
        const headers = { ...req.headers };
        
        // Remove problematic headers
        delete headers['host'];
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['connection'];
        
        // OVERRIDE WITH PREMIUM ACCOUNT CREDENTIALS
        // Device & User Headers
        headers['device-id'] = QUICKTV_PREMIUM.deviceId;
        headers['x-sharechat-userid'] = QUICKTV_PREMIUM.userId;
        headers['x-sharechat-secret'] = QUICKTV_PREMIUM.secret;
        headers['x-sharechat-auth-token'] = QUICKTV_PREMIUM.authToken;
        headers['x-sharechat-auth-session-id'] = QUICKTV_PREMIUM.authSessionId;
        headers['session-id'] = QUICKTV_PREMIUM.sessionId;
        headers['advertising-id'] = QUICKTV_PREMIUM.advertisingId;
        
        // App Headers
        headers['app-version'] = QUICKTV_PREMIUM.appVersion;
        headers['app-version-name'] = QUICKTV_PREMIUM.appVersionName;
        headers['code-push-version'] = QUICKTV_PREMIUM.codePushVersion;
        headers['package-name'] = QUICKTV_PREMIUM.packageName;
        headers['client-type'] = QUICKTV_PREMIUM.clientType;
        headers['client'] = QUICKTV_PREMIUM.client;
        
        // System Headers
        headers['os-version'] = QUICKTV_PREMIUM.osVersion;
        headers['device-ram-gb'] = QUICKTV_PREMIUM.deviceRamGb;
        headers['device-high-performing'] = QUICKTV_PREMIUM.deviceHighPerforming;
        
        // Location Headers
        headers['region'] = QUICKTV_PREMIUM.region;
        headers['city'] = QUICKTV_PREMIUM.city;
        headers['isp'] = QUICKTV_PREMIUM.isp;
        headers['country-short'] = QUICKTV_PREMIUM.countryShort;
        headers['radiotype'] = QUICKTV_PREMIUM.radioType;
        
        // Auth Headers
        headers['auth-version'] = QUICKTV_PREMIUM.authVersion;
        headers['x-tenant'] = QUICKTV_PREMIUM.tenant;
        headers['x-sharechat-install-time'] = QUICKTV_PREMIUM.installTime;
        
        // User Agent
        headers['user-agent'] = QUICKTV_PREMIUM.userAgent;
        
        // Content Headers
        headers['accept'] = 'application/json';
        headers['accept-charset'] = 'UTF-8';
        headers['content-type'] = 'application/json';
        headers['cache-control'] = 'no-cache';
        
        // Add timestamp
        headers['ts'] = Math.floor(Date.now() / 1000).toString();
        
        // Spoof IP
        headers['x-forwarded-for'] = '122.168.2.40';
        headers['x-real-ip'] = '122.168.2.40';
        headers['x-client-ip'] = '122.168.2.40';
        
        // Remove any tracking headers
        delete headers['x-request-id'];
        delete headers['x-b3-traceid'];
        delete headers['x-cloud-trace-context'];
        delete headers['x-vercel-id'];
        delete headers['x-vercel-proxy-signature'];

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
            
            // Apply Bad Boy branding (optional)
            if (!urlPath.includes('/heartbeat') && !urlPath.includes('/track')) {
                applyBadBoyBranding(data);
            }
            
            // Add premium status in response
            if (urlPath.includes('/subscription')) {
                data.premium = true;
                data.premium_by = "BAD BOY";
            }
            
            return res.status(response.status).json(data);
        } 
        // Handle binary/other responses
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
        console.error('Proxy Error:', error);
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            premium_status: "active",
            note: "BAD BOY Premium Proxy"
        });
    }
}
