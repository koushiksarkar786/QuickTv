export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // AAPKA ORIGINAL RESPONSE (jo aap dena chahte ho)
    const YOUR_RESPONSE = {
        code: 200,
        message: "Proxy Fallback - Premium Enabled",
        data: {
            isPremium: true,
            isSubscribed: true,
            plan: "BAD BOY PREMIUM"
        }
    };
    
    // ============ QUICKTV ENDPOINTS - AAPKE RESPONSE KO CONVERT KARO ============
    
    // Subscription manage - QuickTV specific format
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        return res.status(200).json({
            "state": "ACTIVE_SUBSCRIPTION",
            "subsId": "4d7109dc-4282-4503-a888-1501edef8529",
            "productId": "sc_episodic_quarterly_7",
            "banner": {
                "bannerCtaText": "ACTIVE",
                "bannerTitle": YOUR_RESPONSE.data.plan,
                "bannerPaymentKey": "Status",
                "bannerPaymentValue": "Premium Active",
                "bannerBenefitsTitle": "Benefits",
                "benefits": [
                    {"name": "No Ads"},
                    {"name": "HD Quality"},
                    {"name": "All Access"}
                ]
            }
        });
    }
    
    // Subscription status - Simple response
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/check')) {
        return res.status(200).json({
            state: "ACTIVE_SUBSCRIPTION",
            isPremium: YOUR_RESPONSE.data.isPremium,
            isSubscribed: YOUR_RESPONSE.data.isSubscribed,
            plan: YOUR_RESPONSE.data.plan
        });
    }
    
    // Generic QuickTV endpoint - Aapka original response directly
    if (urlPath.includes('/quicktv-service/')) {
        return res.status(200).json(YOUR_RESPONSE);
    }
    
    // ============ STORYMAX ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json(YOUR_RESPONSE);
    }
    
    if (urlPath.includes('/profile/subscription')) {
        return res.status(200).json({
            ...YOUR_RESPONSE,
            data: {
                subStat: "2",
                plan: YOUR_RESPONSE.data.plan,
                valdTxt: "Lifetime Active",
                valEp: 4102444800000
            }
        });
    }
    
    // ============ ANALYTICS ============
    if (urlPath.includes('/heartbeat') || urlPath.includes('/analytics') || urlPath.includes('/track')) {
        return res.status(200).json({ success: true });
    }
    
    // ============ DEFAULT - AAPKA RESPONSE ============
    return res.status(200).json(YOUR_RESPONSE);
}
