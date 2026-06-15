export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ QUICKTV - HAR ENDPOINT PE RESPONSE ============
    
    // 1. Main subscription page
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
    
    // 2. Subscription status - Jaldi response do
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/state') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/check')) {
        return res.status(200).json({
            state: "ACTIVE_SUBSCRIPTION",
            isPremium: true,
            isSubscribed: true,
            userId: "3377779474",
            expiryDate: "2099-12-31",
            productId: "sc_episodic_quarterly_7"
        });
    }
    
    // 3. Home feed / content listing
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/feed/') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/home') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/content/')) {
        return res.status(200).json({
            code: 200,
            message: "success",
            data: [],
            hasMore: false,
            isPremiumUser: true
        });
    }
    
    // 4. Video playback permission
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/video/') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/playback/')) {
        return res.status(200).json({
            canPlay: true,
            isPremium: true,
            adsEnabled: false,
            quality: "1080p",
            drmEnabled: false
        });
    }
    
    // 5. Download permission
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/download/')) {
        return res.status(200).json({
            canDownload: true,
            maxDownloads: 999,
            isPremium: true
        });
    }
    
    // 6. User profile
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/user/')) {
        return res.status(200).json({
            userId: "3377779474",
            isPremium: true,
            premiumBadge: "👑 BAD BOY 👑",
            subscriptionState: "ACTIVE_SUBSCRIPTION"
        });
    }
    
    // 7. Ads removal
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/ads/') ||
        urlPath.includes('/ad/') ||
        urlPath.includes('/adserver/')) {
        return res.status(200).json({
            adsEnabled: false,
            noAds: true,
            message: "Premium user - no ads"
        });
    }
    
    // 8. Analytics / Tracking - Immediately return
    if (urlPath.includes('/heartbeat') || 
        urlPath.includes('/impression') || 
        urlPath.includes('/analytics') ||
        urlPath.includes('/track') ||
        urlPath.includes('/event') ||
        urlPath.includes('/log')) {
        return res.status(200).json({ success: true });
    }
    
    // 9. Config / Settings endpoints
    if (urlPath.includes('/config') || 
        urlPath.includes('/settings') ||
        urlPath.includes('/feature')) {
        return res.status(200).json({
            premiumFeatures: {
                adFree: true,
                downloads: true,
                hdQuality: true,
                offlineMode: true
            }
        });
    }
    
    // 10. Any other QuickTV endpoint - Generic success
    if (urlPath.includes('/quicktv-service/')) {
        return res.status(200).json({
            code: 200,
            message: "success",
            isPremium: true,
            data: null
        });
    }
    
    // ============ STORYMAX ENDPOINTS ============
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
    
    if (urlPath.includes('/feedservice/')) {
        return res.status(200).json({ code: 200, message: "Updated", data: null });
    }
    
    // ============ FALLBACK FOR ANY OTHER REQUEST ============
    return res.status(200).json({
        code: 200,
        message: "BAD BOY Premium Active",
        isPremium: true,
        timestamp: Date.now()
    });
}
