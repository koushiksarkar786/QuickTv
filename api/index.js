export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    
    // ============ QUICKTV FAKE PREMIUM RESPONSES ============
    
    // 1. Subscription Manage endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                isActive: true,
                planType: "premium",
                planName: "QuickTV Premium [ BAD BOY ]",
                validTill: "2099-12-31T23:59:59Z",
                autoRenew: true,
                features: ["ad_free", "downloads", "hd_quality", "offline_mode"]
            }
        });
    }
    
    // 2. Subscription status/state endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/status') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/state')) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: {
                subStat: "active",
                plan: "QuickTV Premium [ BAD BOY ]",
                expiryDate: "2099-12-31",
                isLifetime: true,
                features: {
                    adsEnabled: false,
                    maxQuality: "1080p",
                    downloadsEnabled: true,
                    multiDevice: true
                }
            }
        });
    }
    
    // 3. Check if user has active subscription
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/check')) {
        return res.status(200).json({
            status: "success",
            hasActiveSubscription: true,
            isTrial: false,
            daysRemaining: 99999
        });
    }
    
    // 4. Premium content access (video playback)
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/content/premium/') ||
        urlPath.includes('/quicktv-service/v2/public/quicktv/video/premium')) {
        return res.status(200).json({
            status: "success",
            hasAccess: true,
            message: "Premium content unlocked"
        });
    }
    
    // 5. Ad removal endpoint
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/ads/')) {
        return res.status(200).json({
            status: "success",
            adsEnabled: false,
            message: "Premium user - no ads"
        });
    }
    
    // 6. Download/premium feature access
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/download/')) {
        return res.status(200).json({
            status: "success",
            canDownload: true,
            maxDownloads: 999,
            message: "Premium download access granted"
        });
    }
    
    // 7. User profile with premium badge
    if (urlPath.includes('/quicktv-service/v2/public/quicktv/user/profile')) {
        return res.status(200).json({
            status: "success",
            data: {
                userId: "3377779474",
                isPremium: true,
                premiumBadge: "👑 BAD BOY 👑",
                joinDate: "2024-01-01"
            }
        });
    }
    
    // ============ ANALYTICS / HEARTBEAT (ignore) ============
    const isAnalyticsUrl = urlPath.includes('/heartbeat') || 
                          urlPath.includes('/impression') || 
                          urlPath.includes('/analytics') ||
                          urlPath.includes('/track');
    if (isAnalyticsUrl) {
        return res.status(200).json({ status: 200, message: "SUCCESS", data: null });
    }
    
    // ============ STORYMAX FAKE PREMIUM (your existing code) ============
    if (urlPath.includes('/profile/subscription/state')) {
        return res.status(200).json({ code: 200, message: "Success", data: { subStat: "2", mc: "0" } });
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
        return res.status(200).json({ code: 200, message: "Updated lastwatched", data: null });
    }
    
    // ============ PROXY TO ORIGINAL API ============
    // Determine target API based on path
    let targetBaseUrl = "https://api.storymax.app";
    if (urlPath.includes('/quicktv-service/')) {
        targetBaseUrl = "https://apis.sharechat.com";
    }
    
    const targetUrl = targetBaseUrl + urlPath;
    
    try {
        // Build headers
        const headers = { ...req.headers };
        headers['host'] = new URL(targetBaseUrl).host;
        delete headers['accept-encoding'];
        delete headers['content-length'];
        delete headers['x-request-id'];
        delete headers['x-b3-traceid'];
        delete headers['x-cloud-trace-context'];
        
        // QuickTV specific headers (your working credentials)
        if (urlPath.includes('/quicktv-service/')) {
            headers['x-sharechat-userid'] = '3377779474';
            headers['x-sharechat-secret'] = 'e91c564faeac1dee8135';
            headers['device-id'] = '6caec8fc10dee519';
            headers['x-sharechat-auth-token'] = '25efe4b6de088d05c888';
            headers['client-type'] = 'android';
            headers['app-version'] = '202615003';
            headers['auth-version'] = 'V2';
            headers['x-tenant'] = 'quicktv';
            headers['accept'] = 'application/json';
            headers['content-type'] = 'application/json';
        }
        
        // StoryMax premium credentials
        if (targetBaseUrl === "https://api.storymax.app") {
            headers['deviceid'] = "6caec8fc10dee519";
            headers['authorization'] = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDItMDEgMjI6Mjk6NDQuMjMiLCJzZXNzaW9uSWQiOiIxMjQ5MjM4MyIsImRldmljZUlkIjoiNjkwZmM1ODNiNzM5ODM0Iiwic3ViIjoiODM2MyIsImV4cCI6MTc4MTY4MTI4Nn0.AM0mvoEwlxPothDJ4L_vsiJS7IgbPwAEjGI2fyBxdI0";
            headers['os'] = "Android 15 (API 29)";
            headers['platform'] = "0";
            headers['appversion'] = "12";
            headers['network_type'] = 'WIFI';
        }
        
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
            
            // Apply Bad Boy branding if needed
            const applyBadBoyBranding = (obj) => {
                const brandTag = " \n [ BAD BOY ] ";
                const targetKeys = ['title', 'name', 'drama_name', 'text', 'language'];
                
                if (typeof obj === 'object' && obj !== null) {
                    for (let key in obj) {
                        if (typeof obj[key] === 'string' && targetKeys.includes(key)) {
                            if (!obj[key].includes('[ BAD BOY ]')) {
                                obj[key] = obj[key].replace(/\[ MODS \]/g, '').replace(/\[ REAL APK \]/g, '').replace(/\[ \]/g, '').trim() + brandTag;
                            }
                        } else if (typeof obj[key] === 'object') {
                            applyBadBoyBranding(obj[key]);
                        }
                    }
                }
            };
            
            applyBadBoyBranding(data);
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
        return res.status(500).json({ code: 500, message: "Proxy Error: " + error.message });
    }
}
