// api/index.js - Simple version jo app ke liye kaam karega
export default async function handler(req, res) {
    const url = req.url;
    
    console.log(`[APP REQUEST] ${url}`);
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // FOR SUBSCRIPTION - Return premium
    if (url.includes('/subscription')) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: {
                subStat: "2",
                mc: "0"
            }
        });
    }
    
    // FOR ANY OTHER REQUEST - Forward to real API with premium headers
    try {
        const targetUrl = "https://apis.sharechat.com" + url;
        
        const response = await fetch(targetUrl, {
            headers: {
                'x-sharechat-userid': '3377779474',
                'x-sharechat-auth-token': '25efe4b6de088d05c888',
                'session-id': '3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33',
                'device-id': '6caec8fc10dee519',
                'user-agent': req.headers['user-agent'] || 'Android'
            }
        });
        
        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        return res.status(200).json({
            code: 200,
            message: "Success",
            data: null
        });
    }
}
