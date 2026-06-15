export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ COMPLETE QUICKTV FAKE RESPONSES ============
    
    // 1. Main subscription manage page
    if (urlPath === '/' || urlPath === '/quicktv-service/v2/public/quicktv/subscription/manage') {
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
    
    // 2. Subscription status check
    if (urlPath.includes('/subscription/status') || urlPath.includes('/subscription/state')) {
        return res.status(200).json({
            "state": "ACTIVE_SUBSCRIPTION",
            "isActive": true,
            "planType": "premium",
            "expiryDate": "2099-12-31T23:59:59Z"
        });
    }
    
    // 3. User profile endpoint
    if (urlPath.includes('/user/profile') || urlPath.includes('/me')) {
        return res.status(200).json({
            "userId": "3377779474",
            "isPremium": true,
            "premiumBadge": "👑 BAD BOY 👑",
            "subscriptionState": "ACTIVE_SUBSCRIPTION",
            "name": "Bad Boy User",
            "email": "badboy@premium.com"
        });
    }
    
    // 4. Video playback access
    if (urlPath.includes('/video/playback') || urlPath.includes('/content/access')) {
        return res.status(200).json({
            "canPlay": true,
            "hasAccess": true,
            "isPremiumContent": true,
            "quality": "1080p",
            "adsEnabled": false,
            "downloadEnabled": true
        });
    }
    
    // 5. Feed/home data
    if (urlPath.includes('/feed') || urlPath.includes('/home')) {
        return res.status(200).json({
            "status": "success",
            "data": {
                "shows": [],
                "recommendations": [],
                "premiumUser": true
            }
        });
    }
    
    // 6. Ads endpoint - return no ads
    if (urlPath.includes('/ads') || urlPath.includes('/ad')) {
        return res.status(200).json({
            "ads": [],
            "shouldShowAd": false,
            "message": "Premium user - no ads"
        });
    }
    
    // 7. Downloads endpoint
    if (urlPath.includes('/download')) {
        return res.status(200).json({
            "canDownload": true,
            "maxDownloads": 999,
            "downloadLimitReached": false
        });
    }
    
    // 8. Watch history
    if (urlPath.includes('/history') || urlPath.includes('/watched')) {
        return res.status(200).json({
            "status": "success",
            "data": []
        });
    }
    
    // 9. Any other QuickTV endpoint - default premium response
    if (urlPath.includes('/quicktv-service/')) {
        return res.status(200).json({
            "status": "success",
            "code": 200,
            "message": "Success",
            "data": {
                "isPremium": true,
                "hasAccess": true
            }
        });
    }
    
    // ============ ANALYTICS / HEARTBEAT ============
    if (urlPath.includes('/heartbeat') || urlPath.includes('/impression') || 
        urlPath.includes('/analytics') || urlPath.includes('/track') || 
        urlPath.includes('/event') || urlPath.includes('/log')) {
        return res.status(200).json({ status: "success" });
    }
    
    // ============ STORYMAX (your existing) ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ code: 200, message: "Success", data: { subStat: "2", mc: "0" } });
    }
    
    if (urlPath.includes('/profile/subscription')) {
        return res.status(200).json({
            code: 200, message: "Success",
            data: { subStat: "2", plan: "Premium Plan [ BAD BOY ]", cta: "Enjoy Premium", 
                    valdTxt: "Lifetime Active", pvend: "JUSPAY", valEp: 4102444800000, mdActv: true }
        });
    }
    
    if (urlPath.includes('/feedservice/v1/shows/watched')) {
        return res.status(200).json({ code: 200, message: "Updated lastwatched", data: null });
    }
    
    // ============ FALLBACK FOR ANY OTHER REQUEST ============
    return res.status(200).json({
        status: "success",
        code: 200,
        message: "Premium access granted [ BAD BOY ]",
        data: { isPremium: true }
    });
}
