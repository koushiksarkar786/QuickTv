export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ QUICKTV - EXACT RESPONSE FORMAT (LIFETIME PREMIUM) ============
    
    // Subscription Manage - Main endpoint
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
                "bannerPaymentValue": "Lifetime Active",
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
    
    // Subscription status check - Jaldi response
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/state') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/check')) {
        return res.status(200).json({
            state: "ACTIVE_SUBSCRIPTION",
            isPremium: true,
            userId: "3377779474",
            expiryDate: "Lifetime",
            productId: "sc_episodic_quarterly_7"
        });
    }
    
    // Home feed / Content listing - Empty array with premium flag
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/feed/') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/home')) {
        return res.status(200).json({
            code: 200,
            message: "success",
            data: [],
            hasMore: false,
            isPremiumUser: true
        });
    }
    
    // Video playback permission
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/video/') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/playback/')) {
        return res.status(200).json({
            canPlay: true,
            isPremium: true,
            adsEnabled: false,
            quality: "1080p"
        });
    }
    
    // Download permission
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/download/')) {
        return res.status(200).json({
            canDownload: true,
            maxDownloads: 999,
            isPremium: true
        });
    }
    
    // User profile
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/user/')) {
        return res.status(200).json({
            userId: "3377779474",
            isPremium: true,
            premiumBadge: "👑 BAD BOY 👑",
            subscriptionState: "ACTIVE_SUBSCRIPTION"
        });
    }
    
    // Ads removal
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/ads/') ||
        urlPath.includes('/ad/')) {
        return res.status(200).json({
            adsEnabled: false,
            noAds: true,
            message: "Premium user - no ads"
        });
    }
    
    // Analytics / Heartbeat - Immediate success
    if (urlPath.includes('/heartbeat') || 
        urlPath.includes('/impression') || 
        urlPath.includes('/analytics') ||
        urlPath.includes('/track') ||
        urlPath.includes('/event')) {
        return res.status(200).json({ success: true });
    }
    
    // Config endpoints
    if (urlPath.includes('/config') || urlPath.includes('/settings')) {
        return res.status(200).json({
            premiumFeatures: {
                adFree: true,
                downloads: true,
                hdQuality: true,
                offlineMode: true
            }
        });
    }
    
    // ============ STORYMAX (Existing) ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ 
            code: 200, 
            message: "Success", 
            data: { subStat: "2", mc: "0" } 
        });
    }
    
    if (urlPath.includes('/profile/subscription') && !urlPath.includes('/state')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                plan: "Premium Plan [ BAD BOY ]",
                cta: "Enjoy Premium",
                valdTxt: "Lifetime Active",
                pvend: "JUSPAY",
                sectionTile: { id: "18", lyt: "TS1", acttxt: "", text: "Top 10" },
                valEp: 4102444800000,
                mdActv: true
            }
        });
    }
    
    if (urlPath.includes('/feedservice/v1/shows/watched')) {
        return res.status(200).json({ 
            code: 200, 
            message: "Updated lastwatched", 
            data: null 
        });
    }
    
    // ============ CATCH ALL FOR ANY OTHER QUICKTV REQUEST ============
    if (urlPath.includes('/quicktv-service/')) {
        return res.status(200).json({
            code: 200,
            message: "success",
            isPremium: true
        });
    }
    
    // ============ PROXY TO STORYMAX API ============
    const targetBaseUrl = "https://api.storymax.app";
    const targetUrl = targetBaseUrl + urlPath;
    
    try {
        const headers = { ...req.headers };
        headers['host'] = 'api.storymax.app';
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['x-request-id'];
        
        // StoryMax premium credentials
        headers['deviceid'] = "6caec8fc10dee519";
        headers['authorization'] = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDItMDEgMjI6Mjk6NDQuMjMiLCJzZXNzaW9uSWQiOiIxMjQ5MjM4MyIsImRldmljZUlkIjoiNjkwZmM1ODNiNzM5ODM0Iiwic3ViIjoiODM2MyIsImV4cCI6MTc4MTY4MTI4Nn0.AM0mvoEwlxPothDJ4L_vsiJS7IgbPwAEjGI2fyBxdI0";
        headers['os'] = "Android 15 (API 29)";
        headers['platform'] = "0";
        headers['appversion'] = "12";
        headers['network_type'] = 'WIFI';
        
        const fetchOptions = {
            method: method,
            headers: headers,
        };
        
        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json();
        
        // Add Bad Boy branding
        const applyBadBoyBranding = (obj) => {
            const brandTag = " \n [ BAD BOY ] ";
            const targetKeys = ['title', 'name', 'drama_name', 'text', 'language'];
            
            if (typeof obj === 'object' && obj !== null) {
                for (let key in obj) {
                    if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                        if (!obj[key].includes('[ BAD BOY ]')) {
                            obj[key] = obj[key].replace(/\[ MODS \]/g, '').trim() + brandTag;
                        }
                    } else if (typeof obj[key] === 'object') {
                        applyBadBoyBranding(obj[key]);
                    }
                }
            }
        };
        
        applyBadBoyBranding(data);
        return res.status(response.status).json(data);
        
    } catch (error) {
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message 
        });
    }
}
