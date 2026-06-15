// api/index.js - Simple working version
export default async function handler(req, res) {
    const url = req.url;
    const method = req.method;
    
    console.log(`[${method}] ${url}`);
    
    // ALWAYS return premium response for any request
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    // Premium account data
    const premiumData = {
        code: 200,
        message: "Success",
        premium: true,
        premiumAccount: "3377779474",
        premiumBy: "BAD BOY",
        data: {
            subStat: "2",
            isPremium: true,
            plan: "Premium Lifetime",
            validity: "Active",
            userId: "3377779474",
            authToken: "25efe4b6de088d05c888",
            sessionId: "3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33"
        }
    };
    
    // Return premium data for ALL requests
    return res.status(200).json(premiumData);
}
