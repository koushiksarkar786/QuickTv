export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    // Sirf QuickTV/Sharechat APIs
    const SHARECHAT_BASE_URL = "https://apis.sharechat.com";

    res.setHeader('Content-Type', 'application/json; charset=UTF-8');

    // ✅ QuickTV Subscription API - Main target
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        const realApiUrl = SHARECHAT_BASE_URL + urlPath;
        
        const headers = { ...req.headers };
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['host'];
        
        const response = await fetch(realApiUrl, {
            method: method,
            headers: headers
        });
        
        let data = await response.json();
        
        // 🔥 BAD BOY INJECTION
        if (data.state === "ACTIVE_SUBSCRIPTION") {
            data.state = "🔥 ACTIVE [ BAD BOY PREMIUM ] 🔥";
            data.productId = "badboy_lifetime_pro_max";
            data.subsId = "BB_" + (data.subsId || "UNLIMITED");
            
            if (data.banner) {
                data.banner.bannerCtaText = "✨ BAD BOY MODE ACTIVE ✨";
                data.banner.bannerTitle = "💀 BAD BOY QuickTV Premium 💀";
                data.banner.bannerPaymentKey = "⏰ VALID UNTIL";
                data.banner.bannerPaymentValue = "31 DECEMBER 9999 [ LIFETIME ]";
                data.banner.bannerBenefitsTitle = "⚡ BAD BOY EXCLUSIVE BENEFITS ⚡";
                
                if (data.banner.benefits && Array.isArray(data.banner.benefits)) {
                    data.banner.benefits = data.banner.benefits.map(benefit => ({
                        ...benefit,
                        name: benefit.name + " [ BAD BOY ]"
                    }));
                }
                
                // Extra Bad Boy benefits
                const extraBenefits = [
                    { image: "", name: "🎁 Exclusive Bad Boy Content [ BAD BOY ]" },
                    { image: "", name: "🚫 Zero Ads Forever [ BAD BOY ]" },
                    { image: "", name: "📱 4K + HDR Quality [ BAD BOY ]" }
                ];
                
                if (data.banner.benefits) {
                    data.banner.benefits.push(...extraBenefits);
                } else {
                    data.banner.benefits = extraBenefits;
                }
            }
        }
        
        return res.status(200).json(data);
    }

    // ✅ Other Sharechat APIs - Pass through with Bad Boy touch
    try {
        const targetUrl = SHARECHAT_BASE_URL + urlPath;
        
        const headers = { ...req.headers };
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['host'];
        // Keep original device-id, auth tokens etc
        
        const fetchOptions = {
            method: method,
            headers: headers,
        };

        if (method !== 'GET' && method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            let data = await response.json();
            
            // Generic Bad Boy branding for all responses
            const addBadBoyTag = (obj) => {
                if (obj && typeof obj === 'object') {
                    if (obj.title) obj.title = obj.title + " [ BAD BOY ]";
                    if (obj.name) obj.name = obj.name + " [ BAD BOY ]";
                    if (obj.plan) obj.plan = obj.plan + " [ BAD BOY ]";
                }
                return obj;
            };
            
            data = addBadBoyTag(data);
            return res.status(response.status).json(data);
        } else {
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
        return res.status(500).json({ 
            code: 500, 
            message: "Proxy Error: " + error.message,
            status: "ERROR"
        });
    }
}
