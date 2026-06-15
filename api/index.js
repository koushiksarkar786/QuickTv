const TARGET_BASE = "https://apis.sharechat.com";

// Valid auth token from your smali/app
const VALID_AUTH_TOKEN = "25efe4b6de088d05c888";
const VALID_USER_ID = "3377779474";
const DEVICE_ID = "6caec8fc10dee519";

export default async function handler(req, res) {
  let urlPath = req.headers['x-invoke-path'] || req.url;

  // Handle CORS if needed
  res.setHeader('Access-Control-Allow-Origin', '*');

  // === QUICKTV PREMIUM FAKE RESPONSES ===
  if (urlPath.includes('/quicktv-service/v2/public/quicktv/subscription/manage')) {
    return res.status(200).json({
      status: "success",
      data: {
        is_premium: true,
        plan_type: "lifetime",
        expiry_timestamp: 4102444800000, // year 2099
        features: ["no_ads", "downloads", "hd_streaming"]
      }
    });
  }

  // Check subscription status
  if (urlPath.includes('/quicktv-service/v2/user/subscription')) {
    return res.status(200).json({
      is_active: true,
      plan: "premium_lifetime",
      valid_until: "2099-12-31"
    });
  }

  // Forward real request to ShareChat API
  const targetUrl = TARGET_BASE + urlPath;
  
  const headers = { ...req.headers };
  
  // Override with working credentials from app
  headers['x-sharechat-auth-token'] = VALID_AUTH_TOKEN;
  headers['x-sharechat-userid'] = VALID_USER_ID;
  headers['device-id'] = DEVICE_ID;
  headers['host'] = 'apis.sharechat.com';
  
  // Remove problematic headers
  delete headers['accept-encoding'];
  delete headers['content-length'];

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
