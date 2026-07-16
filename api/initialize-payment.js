// api/initialize-payment.js
// DIAGNOSTIC VERSION

export default async function handler(req, res) {

    const clientId = process.env.FLW_CLIENT_ID;
    const clientSecret = process.env.FLW_CLIENT_SECRET;

    return res.status(200).json({
        method: req.method,
        clientId_exists: !!clientId,
        clientSecret_exists: !!clientSecret,
        clientId_first5: clientId ? clientId.substring(0, 5) : 'NOT FOUND',
        clientSecret_first5: clientSecret ? clientSecret.substring(0, 5) : 'NOT FOUND',
        all_env_keys: Object.keys(process.env).filter(key => 
            key.startsWith('FLW') || 
            key.startsWith('PAYSTACK')
        ),
        node_env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}