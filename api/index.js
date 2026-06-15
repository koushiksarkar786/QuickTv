// quicktv-client.js
class QuickTVClient {
    constructor() {
        this.baseUrl = "https://apis.sharechat.com";
        this.deviceId = "6caec8fc10dee519";
        this.userId = "3377779474";
        
        // Premium credentials from the smali/dex analysis
        this.headers = {
            "host": "apis.sharechat.com",
            "cache-control": "no-cache",
            "x-sharechat-userid": this.userId,
            "x-sharechat-secret": "e91c564faeac1dee8135",
            "code-push-version": "20261004",
            "app-version": "202615003",
            "app-version-name": "2026.15.03",
            "device-id": this.deviceId,
            "client-type": "android",
            "device-high-performing": "true",
            "device-ram-gb": "3",
            "locale-language": "Hindi",
            "locale-skin": "ENGLISH",
            "locale-skin-language": "English",
            "session-id": `${this.userId}_b2de8cd3-ab57-4348-8013-ce15111a7c33`,
            "x-sharechat-install-time": "1781458702",
            "x-tenant": "quicktv",
            "auth-version": "V2",
            "x-sharechat-auth-session-id": "35e96e72-dda6-47d8-9dc6-229899cb3b85",
            "x-sharechat-auth-token": "25efe4b6de088d05c888",
            "client": "Android",
            "package-name": "in.mohalla.quicktv",
            "os-version": "29",
            "user-agent": "Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.-001.484576 Mobile Safari/537.36",
            "region": "maharashtra",
            "city": "mumbai",
            "isp": "reliance jio infocomm limited",
            "country-short": "in",
            "advertising-id": "da3a7af4-6991-421f-8750-d548adcee566",
            "radiotype": "wifi",
            "accept-encoding": "gzip",
            "accept": "application/json",
            "content-type": "application/json"
        };
    }

    // Make authenticated request
    async request(endpoint, method = 'GET', body = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: this.headers,
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`Request failed: ${response.status}`);
    }

    // Get subscription management page
    async getSubscriptionManage() {
        return this.request('/quicktv-service/v2/public/quicktv/subscription/manage');
    }

    // Get subscription state (Premium status)
    async getSubscriptionState() {
        // From the proxy - this returns premium status
        return {
            code: 200,
            message: "Success",
            data: {
                subStat: "2",  // Premium active
                mc: "0"
            }
        };
    }

    // Get full subscription details
    async getSubscriptionDetails() {
        return {
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                plan: "Premium Plan [ BAD BOY ]",
                cta: "Enjoy Premium",
                valdTxt: "Lifetime Active",
                pvend: "JUSPAY",
                sectionTile: {
                    id: "18",
                    lyt: "TS1",
                    acttxt: "",
                    text: "Top 10"
                },
                valEp: 4102444800000,
                mdActv: true
            }
        };
    }

    // Get feed/videos
    async getFeed(category = 'recommended', page = 1) {
        return this.request(`/feedservice/v1/feed?category=${category}&page=${page}`);
    }

    // Get show details
    async getShowDetails(showId) {
        return this.request(`/content-service/v2/shows/${showId}`);
    }

    // Get episodes for a show
    async getShowEpisodes(showId, page = 1) {
        return this.request(`/content-service/v2/shows/${showId}/episodes?page=${page}`);
    }

    // Watch/stream content
    async getStreamUrl(contentId) {
        return this.request(`/streaming-service/v1/content/${contentId}/playback`);
    }

    // Update watch progress
    async updateWatchProgress(contentId, progress, duration) {
        return this.request('/feedservice/v1/shows/watched', 'POST', {
            contentId: contentId,
            progress: progress,
            duration: duration,
            timestamp: Date.now()
        });
    }

    // Search content
    async search(query, page = 1) {
        return this.request(`/search-service/v2/search?q=${encodeURIComponent(query)}&page=${page}`);
    }

    // Get user history
    async getHistory(page = 1) {
        return this.request(`/user-service/v1/history?page=${page}`);
    }

    // Get recommendations
    async getRecommendations(limit = 20) {
        return this.request(`/recommendation-service/v1/recommendations?limit=${limit}`);
    }

    // Get categories/Genres
    async getCategories() {
        return this.request('/content-service/v1/categories');
    }

    // Get trending content
    async getTrending(timeframe = 'week', limit = 20) {
        return this.request(`/trending-service/v1/trending?timeframe=${timeframe}&limit=${limit}`);
    }

    // Get user profile
    async getUserProfile() {
        return this.request(`/user-service/v1/profile/${this.userId}`);
    }
}

// Usage example
async function main() {
    const client = new QuickTVClient();
    
    try {
        // Check subscription status (Premium)
        const subState = await client.getSubscriptionState();
        console.log('Subscription Status:', subState);
        
        // Get subscription management
        const manage = await client.getSubscriptionManage();
        console.log('Manage Page:', manage);
        
        // Get feed
        const feed = await client.getFeed('recommended', 1);
        console.log('Feed items:', feed.data?.items?.length || 0);
        
        // Search for content
        const searchResults = await client.search("action movie");
        console.log('Search results:', searchResults);
        
        // Get trending
        const trending = await client.getTrending('week', 10);
        console.log('Trending:', trending);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Export for use in Node.js/Express
module.exports = { QuickTVClient };
