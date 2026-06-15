// pages/api/proxy/[...path].js
// This will handle ALL QuickTV API endpoints dynamically

export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Base URL for ShareChat APIs
  const BASE_URL = 'https://apis.sharechat.com';
  
  // Get the full API path from request
  const apiPath = req.query.path?.join('/') || '';
  const targetUrl = `${BASE_URL}/${apiPath}`;

  console.log('Proxying to:', targetUrl);
  console.log('Method:', req.method);

  // Extract and prepare headers from original request
  const headers = { ...req.headers };
  
  // Remove headers that might cause issues
  delete headers.host;
  delete headers['content-length'];
  delete headers['connection'];
  delete headers['accept-encoding']; // Let Vercel handle encoding
  
  // Ensure critical headers are present (use defaults if not provided)
  const defaultHeaders = {
    'x-sharechat-userid': '3377779474',
    'x-sharechat-secret': 'e91c564faeac1dee8135',
    'x-sharechat-auth-token': '25efe4b6de088d05c888',
    'x-sharechat-auth-session-id': '35e96e72-dda6-47d8-9dc6-229899cb3b85',
    'session-id': '3377779474_b2de8cd3-ab57-4348-8013-ce15111a7c33',
    'device-id': '6caec8fc10dee519',
    'advertising-id': 'da3a7af4-6991-421f-8750-d548adcee566',
    'auth-version': 'V2',
    'code-push-version': '20261004',
    'app-version': '202615003',
    'app-version-name': '2026.15.03',
    'client-type': 'android',
    'package-name': 'in.mohalla.quicktv',
    'x-tenant': 'quicktv',
    'client': 'Android',
    'os-version': '29',
    'locale-language': 'Hindi',
    'locale-skin': 'ENGLISH',
    'locale-skin-language': 'English',
    'region': 'maharashtra',
    'city': 'mumbai',
    'isp': 'reliance jio infocomm limited',
    'country-short': 'in',
    'radiotype': 'wifi',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7S Build/QKQ1.190910.002;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4638.74 Mobile Safari/537.36'
  };

  // Merge default headers with request headers (request headers take priority)
  Object.keys(defaultHeaders).forEach(key => {
    if (!headers[key]) {
      headers[key] = defaultHeaders[key];
    }
  });

  // Prepare fetch options
  const fetchOptions = {
    method: req.method,
    headers: headers,
    redirect: 'follow'
  };

  // Add body for non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
    headers['content-type'] = 'application/json';
  }

  try {
    // Make the actual API call
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get response as text (to handle any content type)
    const responseData = await response.text();
    
    // Forward response headers
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding'].includes(key)) {
        res.setHeader(key, value);
      }
    });
    
    // Set CORS headers again
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send response
    res.status(response.status).send(responseData);
    
    console.log(`Response status: ${response.status}`);
    
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      success: false,
      error: 'Proxy request failed',
      message: error.message,
      targetUrl: targetUrl
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    externalResolver: true
  }
};
