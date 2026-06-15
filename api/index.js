export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // ============ CREDENTIALS (AAPKE) ============
    const creds = {
        userId: "3377779474",
        secret: "e91c564faeac1dee8135",
        deviceId: "6caec8fc10dee519",
        authToken: "25efe4b6de088d05c888",
        sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33"
    };
    
    // ============ HAR POSSIBLE INITIAL REQUEST KO HANDLE KARO ============
    
    // 1. Config / Init endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/config') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/init') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/bootstrap')) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                isPremium: true,
                features: {
                    ads: false,
                    downloads: true,
                    hd: true
                },
                config: {
                    appVersion: "202615003",
                    minVersion: "202615000"
                }
            }
        });
    }
    
    // 2. User Profile (sabse important)
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/user/profile')) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                userId: creds.userId,
                isPremium: true,
                premiumStatus: "ACTIVE",
                username: "BadBoy",
                name: "BAD BOY PREMIUM",
                profileImage: "https://cdn-sc-g.sharechat.com/default_avatar.png",
                subscription: {
                    active: true,
                    plan: "Premium",
                    validTill: "2099-12-31"
                }
            }
        });
    }
    
    // 3. Subscription Manage (full details)
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        return res.status(200).json({
            backgroundImage: "https://cdn-sc-g.sharechat.com/33d5318_1c8/tools/f42ea28_1754035031431_sc.webp",
            state: "ACTIVE_SUBSCRIPTION",
            subsId: "4d7109dc-4282-4503-a888-1501edef8529",
            productId: "sc_episodic_quarterly_7",
            banner: {
                bannerCtaText: "ACTIVE",
                bannerTitle: "QuickTV Premium [ BAD BOY ]",
                bannerPaymentKey: "Expiring on",
                bannerPaymentValue: "31 December 2099",
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
    
    // 4. Subscription status
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/state') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/check')) {
        return res.status(200).json({
            status: "success",
            state: "ACTIVE_SUBSCRIPTION",
            isPremium: true,
            isSubscribed: true,
            validTill: "2099-12-31",
            userId: creds.userId
        });
    }
    
    // 5. Feed / Home (dummy data do taaki app crash na ho)
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/feed/home') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/feed/recommended')) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                sections: [
                    {
                        type: "premium_banner",
                        title: "🔥 BAD BOY PREMIUM ACTIVATED 🔥",
                        items: []
                    }
                ]
            }
        });
    }
    
    // 6. Premium content access check
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/content/') &&
        urlPath.includes('/access')) {
        return res.status(200).json({
            hasAccess: true,
            isPremium: true,
            reason: "Active Premium Subscription"
        });
    }
    
    // 7. Any other QuickTV request - proxy with your credentials
    if (urlPath.includes('/quicktv-service/')) {
        try {
            const targetUrl = "https://apis.sharechat.com" + urlPath;
            
            const response = await fetch(targetUrl, {
                method: method,
                headers: {
                    'host': 'apis.sharechat.com',
                    'x-sharechat-userid': creds.userId,
                    'x-sharechat-secret': creds.secret,
                    'device-id': creds.deviceId,
                    'x-sharechat-auth-token': creds.authToken,
                    'session-id': creds.sessionId,
                    'client-type': 'android',
                    'app-version': '202615003',
                    'auth-version': 'V2',
                    'x-tenant': 'quicktv',
                    'accept': 'application/json',
                    'content-type': 'application/json'
                }
            });
            
            let data = await response.json();
            return res.status(response.status).json(data);
            
        } catch (error) {
            // Agar proxy fail ho toh bhi fallback response do - app crash na ho
            return res.status(200).json({
                status: "success",
                code: 200,
                message: "Premium Mode Active",
                data: null
            });
        }
    }
    
    // ============ STORYMAX ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ code: 200, message: "Success", data: { subStat: "2", mc: "0" } });
    }
    
    if (urlPath.includes('/profile/subscription')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: { subStat: "2", plan: "Premium Plan [ BAD BOY ]", valdTxt: "Lifetime Active", valEp: 4102444800000, mdActv: true }
        });
    }
    
    if (urlPath.includes('/feedservice/v1/shows/watched')) {
        return res.status(200).json({ code: 200, message: "Updated lastwatched", data: null });
    }
    
    // Analytics requests - ignore
    if (urlPath.includes('/heartbeat') || urlPath.includes('/impression') || urlPath.includes('/analytics')) {
        return res.status(200).json({ status: "success" });
    }
    
    // StoryMax proxy
    if (urlPath.includes('/api/') || urlPath.includes('/v1/') || urlPath.includes('/v2/')) {
        try {
            const targetUrl = "https://api.storymax.app" + urlPath;
            const response = await fetch(targetUrl, { method: method, headers: req.headers });
            const data = await response.json();
            return res.status(response.status).json(data);
        } catch (error) {
            return res.status(200).json({ code: 200, message: "Proxy Active", data: { premium: true } });
        }
    }
    
    // Final fallback
    return res.status(200).json({
        status: "success",
        code: 200,
        message: "BAD BOY PREMIUM PROXY ACTIVE",
        timestamp: Date.now()
    });
}
