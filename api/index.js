export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ AAPKE ORIGINAL CREDENTIALS ============
    const YOUR_CREDENTIALS = {
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        deviceId: "6caec8fc10dee519",
        authToken: "25efe4b6de088d05c888",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33",
        authSessionId: "35e96e72-dda6-47d8-9dc6-229899cb3b85",
        advertisingId: "da3a7af4-6991-421f-8750-d548adcee566"
    };
    
    // ============ QUICKTV PREMIUM RESPONSE (AAPKE DATA KE SAATH) ============
    
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        return res.status(200).json({
            "backgroundImage": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/f42ea28_1754035031431_sc.webp",
            "state": "ACTIVE_SUBSCRIPTION",
            "subsId": "4d7109dc-4282-4503-a888-1501edef8529",
            "productId": "sc_episodic_quarterly_7",
            "banner": {
                "bannerCtaText": "ACTIVE",
                "bannerTitle": "QuickTV Premium [ BAD BOY ]",
                "bannerPaymentKey": "Expiring on",
                "bannerPaymentValue": "31 December 2099",
                "bannerBenefitsTitle": "Benefits",
                "benefits": [
                    {
                        "image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/1c70817a_1753944053666_sc.webp",
                        "name": "Unlimited Series"
                    },
                    {
                        "image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/11d8037c_1753944053663_sc.webp",
                        "name": "No Ads"
                    },
                    {
                        "image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/29f6cf98_1753944131980_sc.webp",
                        "name": "HD Videos"
                    }
                ]
            },
            "helpAndSupport": null,
            "subscriptionCancelledMeta": null,
            "faq": null
        });
    }
    
    // Subscription status check
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/state')) {
        return res.status(200).json({
            "state": "ACTIVE_SUBSCRIPTION",
            "isPremium": true,
            "userId": YOUR_CREDENTIALS.userId,
            "expiryDate": "2099-12-31T23:59:59Z"
        });
    }
    
    // ============ PROXY TO REAL API (AAPKE HEADERS KE SAATH) ============
    
    // Sirf QuickTV requests ko proxy karo
    if (urlPath.includes('/quicktv-service/') && 
        !urlPath.includes('/subscription/manage') && 
        !urlPath.includes('/subscription/status') &&
        !urlPath.includes('/subscription/state')) {
        
        const targetUrl = "https://apis.sharechat.com" + urlPath;
        
        try {
            const response = await fetch(targetUrl, {
                method: method,
                headers: {
                    'host': 'apis.sharechat.com',
                    'x-sharechat-userid': YOUR_CREDENTIALS.userId,
                    'x-sharechat-secret': YOUR_CREDENTIALS.secret,
                    'device-id': YOUR_CREDENTIALS.deviceId,
                    'x-sharechat-auth-token': YOUR_CREDENTIALS.authToken,
                    'session-id': YOUR_CREDENTIALS.sessionId,
                    'x-sharechat-auth-session-id': YOUR_CREDENTIALS.authSessionId,
                    'advertising-id': YOUR_CREDENTIALS.advertisingId,
                    'client-type': 'android',
                    'app-version': '202615003',
                    'auth-version': 'V2',
                    'x-tenant': 'quicktv',
                    'os-version': '29',
                    'region': 'maharashtra',
                    'city': 'mumbai',
                    'isp': 'reliance jio infocomm limited',
                    'country-short': 'in',
                    'radiotype': 'wifi',
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7S) AppleWebKit/537.36'
                }
            });
            
            const data = await response.json();
            return res.status(response.status).json(data);
            
        } catch (error) {
            return res.status(500).json({ 
                code: 500, 
                message: "Proxy Error: " + error.message 
            });
        }
    }
    
    // ============ STORYMAX PROXY (FOR BACKWARD COMPATIBILITY) ============
    
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ code: 200, message: "Success", data: { subStat: "2", mc: "0" } });
    }
    
    if (urlPath.includes('/profile/subscription')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                plan: "Premium Plan [ BAD BOY ]",
                cta: "Enjoy Premium",
                valdTxt: "Lifetime Active",
                valEp: 4102444800000,
                mdActv: true
            }
        });
    }
    
    // ============ DEFAULT FALLBACK ============
    
    return res.status(200).json({
        code: 200,
        message: "Proxy Active",
        data: {
            isPremium: true,
            message: "[ BAD BOY ] Premium Enabled"
        }
    });
}
