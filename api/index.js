export default async function handler(req, res) {
    const urlPath = req.headers['x-invoke-path'] || req.url;
    const method = req.method;
    
    // Sab kuch real API se forward karo
    const targetUrl = "https://apis.sharechat.com" + urlPath;
    
    try {
        const response = await fetch(targetUrl, {
            method: method,
            headers: {
                'host': 'apis.sharechat.com',
                'x-sharechat-userid': '3377779474',
                'device-id': '6caec8fc10dee519',
                'x-sharechat-auth-token': '25efe4b6de088d05c888',
                'content-type': 'application/json'
            }
        });
        
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
