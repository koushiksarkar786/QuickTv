export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    console.log("📱 Request:", method, urlPath);
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ HEALTH CHECK ============
    if (urlPath === '/' || urlPath === '' || urlPath === '/health') {
        return res.status(200).json({ status: "ok", timestamp: Date.now() });
    }
    
    // ============ QUICKTV ALL ENDPOINTS ============
    
    // Config/Init endpoints
    if (urlPath.includes('/quicktv-service/v2/public/config') || 
        urlPath.includes('/quicktv-service/v2/init')) {
        return res.status(200).json({
            status: "success",
            data: {
                minVersion: "2026.0.0",
                currentVersion: "2026.15.003",
                forceUpdate: false,
                maintenance: false
            }
        });
    }
    
    // Subscription Manage (your working format)
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
                    {"image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/1c70817a_1753944053666_sc.webp", "name": "Unlimited Series"},
                    {"image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/11d8037c_1753944053663_sc.webp", "name": "No Ads"},
                    {"image": "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/29f6cf98_1753944131980_sc.webp", "name": "HD Videos"}
                ]
            },
            "helpAndSupport": null,
            "subscriptionCancelledMeta": null,
            "faq": null
        });
    }
    
    // Subscription status - multiple variations
    if (urlPath.includes('/subscription/status') || 
        urlPath.includes('/subscription/state') ||
        urlPath.includes('/subscription/check')) {
        return res.status(200).json({
            state: "ACTIVE_SUBSCRIPTION",
            isPremium: true,
            isSubscribed: true,
            expiryDate: "2099-12-31T23:59:59Z",
            productId: "sc_episodic_quarterly_7"
        });
    }
    
    // Home Feed - Empty response for now
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/feed/home')) {
        return res.status(200).json({
            code: 200,
            message: "success",
            data: {
                sections: [],
                nextOffset: null
            }
        });
    }
    
    // Video details - Allow all videos
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/video/details')) {
        return res.status(200).json({
            code: 200,
            data: {
                canPlay: true,
                isPremium: true,
                quality: "1080p",
                ads: false,
                downloadEnabled: true
            }
        });
    }
    
    // User profile
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/user/profile')) {
        return res.status(200).json({
            userId: "3377779474",
            isPremium: true,
            premiumBadge: "👑 BAD BOY 👑",
            subscriptionState: "ACTIVE_SUBSCRIPTION",
            name: "Premium User [ BAD BOY ]"
        });
    }
    
    // Search endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/search')) {
        return res.status(200).json({
            code: 200,
            data: {
                results: [],
                totalCount: 0
            }
        });
    }
    
    // ============ ANALYTICS (always return success) ============
    if (urlPath.includes('/heartbeat') || 
        urlPath.includes('/impression') || 
        urlPath.includes('/analytics') ||
        urlPath.includes('/track') ||
        urlPath.includes('/event') ||
        urlPath.includes('/log')) {
        return res.status(200).json({ status: "success" });
    }
    
    // ============ STORYMAX ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ code: 200, message: "Success", data: { subStat: "2", mc: "0" } });
    }
    
    if (urlPath.includes('/profile/subscription') && !urlPath.includes('/state')) {
        return res.status(200).json({
            code: 200, message: "Success", data: {
                subStat: "2", plan: "Premium Plan [ BAD BOY ]",
                cta: "Enjoy Premium", valdTxt: "Lifetime Active",
                pvend: "JUSPAY", valEp: 4102444800000, mdActv: true
            }
        });
    }
    
    // ============ PROXY TO REAL API ============
    let targetBaseUrl = "https://api.storymax.app";
    if (urlPath.includes('/quicktv-service/')) {
        targetBaseUrl = "https://apis.sharechat.com";
    }
    
    try {
        const targetUrl = targetBaseUrl + urlPath;
        console.log("🔄 Proxying to:", targetUrl);
        
        const response = await fetch(targetUrl, {
            method: method,
            headers: {
                ...req.headers,
                'host': new URL(targetBaseUrl).host,
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: method !== 'GET' && method !== 'HEAD' && req.body ? 
                  (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : undefined
        });
        
        const data = await response.json();
        console.log("✅ Response status:", response.status);
        
        return res.status(response.status).json(data);
        
    } catch (error) {
        console.log("❌ Error:", error.message);
        return res.status(500).json({ code: 500, message: "Proxy Error: " + error.message });
    }
}
