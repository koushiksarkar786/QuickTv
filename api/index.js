// api/index.js - Fixed authentication issues

export default async function handler(req, res) {
    // Get the actual path from request
    let urlPath = req.url;
    
    // Remove query parameters if needed
    const queryIndex = urlPath.indexOf('?');
    if (queryIndex !== -1) {
        urlPath = urlPath.substring(0, queryIndex);
    }
    
    const method = req.method;
    const targetBaseUrl = "https://apis.sharechat.com";

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Handle OPTIONS preflight
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    // BLOCK all Cloudflare CDN requests
    if (urlPath.includes('/cdn-cgi/') || urlPath.includes('cf.errors.css') || urlPath.includes('browser-bar.png')) {
        return res.status(404).json({ error: "Not found" });
    }

    // FIXED: Premium Credentials (Your actual working credentials)
    const QUICKTV_CREDENTIALS = {
        // Primary Headers
        'x-sharechat-userid': '3377779474',
        'x-sharechat-secret': 'e91c564faeac1dee8135',
        'x-sharechat-auth-token': '25efe4b6de088d05c888',
        'x-sharechat-auth-session-id': '35e96e72-dda6-47d8-9dc6-229899cb3b85',
        'session-id': '3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33',
        'device-id': '6caec8fc10dee519',
        'advertising-id': 'da3a7af4-6991-421f-8750-d548adcee566',
        
        // App Version
        'auth-version': 'V2',
        'code-push-version': '20261004',
        'app-version': '202615003',
        'app-version-name': '2026.15.03',
        'client-type': 'android',
        'package-name': 'in.mohalla.quicktv',
        'x-tenant': 'quicktv',
        'client': 'Android',
        
        // Device Info
        'os-version': '29',
        'device-ram-gb': '3',
        'device-high-performing': 'true',
        
        // Location
        'region': 'maharashtra',
        'city': 'mumbai',
        'isp': 'reliance jio infocomm limited',
        'country-short': 'in',
        'radiotype': 'wifi',
        
        // Language
        'locale-language': 'Hindi',
        'locale-skin': 'ENGLISH',
        'locale-skin-language': 'English',
        
        // Install time
        'x-sharechat-install-time': '1781458702',
        
        // User Agent
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4638.74 Mobile Safari/537.36'
    };

    // Special handling for problematic endpoints
    if (urlPath === '/' || urlPath === '') {
        return res.status(200).json({ 
            status: "ok", 
            message: "ShareChat QuickTV Proxy Running",
            premium: true 
        });
    }

    // Handle refresh token endpoint
    if (urlPath.includes('/refreshToken')) {
        return res.status(200).json({
            status: 200,
            message: "Token refreshed",
            data: {
                authToken: QUICKTV_CREDENTIALS['x-sharechat-auth-token'],
                sessionId: QUICKTV_CREDENTIALS['session-id']
            }
        });
    }

    // Handle splashConfig
    if (urlPath.includes('/splashConfig')) {
        return res.status(200).json({
            status: 200,
            data: {
                splashImage: "https://example.com/splash.jpg",
                config: { autoPlay: true, premiumOnly: false }
            }
        });
    }

    // Handle getLangList
    if (urlPath.includes('/getLangList')) {
        return res.status(200).json({
            status: 200,
            data: {
                languages: [
                    { code: "hi", name: "Hindi", isDefault: true },
                    { code: "en", name: "English", isDefault: false }
                ]
            }
        });
    }

    try {
        // Construct target URL
        const targetUrl = targetBaseUrl + req.url;
        
        console.log(`[Proxy] ${method} ${targetUrl}`);

        // Prepare headers - merge request headers with premium credentials
        const headers = {
            ...QUICKTV_CREDENTIALS,
            'host': 'apis.sharechat.com',
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9,hi;q=0.8',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'sec-ch-ua': '"Android WebView";v="101", "Chromium";v="101", "Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site'
        };

        // Remove any problematic headers from original request
        const excludeHeaders = ['host', 'connection', 'content-length', 'x-vercel-*', 'x-forwarded-*'];
        Object.keys(req.headers).forEach(key => {
            if (!excludeHeaders.some(h => key.toLowerCase().startsWith(h.replace('*', '')))) {
                if (!QUICKTV_CREDENTIALS[key] && !headers[key]) {
                    headers[key] = req.headers[key];
                }
            }
        });

        // Prepare fetch options
        const fetchOptions = {
            method: method,
            headers: headers,
            redirect: 'follow'
        };

        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        // Make the actual API call
        const response = await fetch(targetUrl, fetchOptions);
        
        console.log(`[Proxy] Response status: ${response.status}`);

        // Get response data
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Inject premium status in responses
            if (typeof data === 'object' && data !== null) {
                data._premium = true;
                data._premium_by = "BAD BOY";
                data._proxy_status = "active";
            }
            
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            res.setHeader('content-type', contentType);
            return res.status(response.status).send(text);
        }

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return res.status(500).json({ 
            error: "Proxy error",
            message: error.message,
            premium_status: "active"
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
