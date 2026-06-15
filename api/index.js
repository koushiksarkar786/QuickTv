// ============================================
// SHARECHAT/QUICKTV PROXY - WORKING VERSION
// ============================================

export default async function handler(req, res) {
    // Enable CORS for all - NO 403 ERROR
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const urlPath = req.url;
    
    // ========== HEALTH CHECK (TEST KARNE KE LIYE) ==========
    if (urlPath === '/' || urlPath === '/health' || urlPath === '/ping') {
        return res.status(200).json({
            status: 'success',
            message: 'Proxy is running [BAD BOY]',
            timestamp: Date.now(),
            server: 'vercel'
        });
    }
    
    // ========== FAKE PREMIUM RESPONSES ==========
    
    // Subscription check - Always return premium
    if (urlPath.includes('/quicktv/subscription')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                isSubscribed: true,
                plan: "Lifetime Premium [ BAD BOY ]",
                status: "active",
                expiryDate: "2099-12-31T23:59:59Z",
                autoRenew: true,
                benefits: ["No Ads", "All Content", "HD Streaming", "Offline Download"]
            }
        });
    }
    
    // User entitlements - All content unlocked
    if (urlPath.includes('/entitlement') || urlPath.includes('/access')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                hasAccess: true,
                isPremium: true,
                unlockedCategories: ["all", "movies", "shows", "originals", "exclusive"],
                adFree: true
            }
        });
    }
    
    // Payment/Purchase endpoints - Bypass
    if (urlPath.includes('/payment') || urlPath.includes('/purchase') || urlPath.includes('/checkout')) {
        return res.status(200).json({
            code: 200,
            message: "Payment Successful (Bypassed)",
            data: {
                transactionId: "MOD_" + Date.now(),
                status: "completed",
                isPremium: true
            }
        });
    }
    
    // Analytics - Silence them
    if (urlPath.includes('/analytics') || urlPath.includes('/track') || urlPath.includes('/event')) {
        return res.status(200).json({ code: 200, message: "OK" });
    }
    
    // ========== FORWARD TO REAL API ==========
    try {
        const targetUrl = 'https://apis.sharechat.com' + urlPath;
        
        console.log(`[PROXY] Forwarding: ${req.method} ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Host': 'apis.sharechat.com',
                'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 10)',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive'
            }
        });
        
        const data = await response.json();
        
        // Inject premium flag into response
        if (data && typeof data === 'object') {
            data._proxy = 'badboy';
            if (data.data && typeof data.data === 'object') {
                data.data.isPremium = true;
                data.data.isSubscribed = true;
            }
        }
        
        return res.status(response.status).json(data);
        
    } catch (error) {
        console.error(`[PROXY] Error: ${error.message}`);
        return res.status(200).json({
            code: 200,
            message: "Proxy Fallback - Premium Enabled",
            data: {
                isPremium: true,
                isSubscribed: true,
                plan: "BAD BOY PREMIUM"
            }
        });
    }
}
