// api/initialize-payment.js
// Flutterwave V4 with detailed error logging

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientId = process.env.FLW_CLIENT_ID;
    const clientSecret = process.env.FLW_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).json({ 
            error: 'Credentials missing',
            clientId_exists: !!clientId,
            clientSecret_exists: !!clientSecret
        });
    }

    const { amount, purpose, email, name } = req.body;

    if (!amount || amount < 1) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    try {

        // ============================================
        // STEP 1: Get Access Token
        // ============================================
        console.log('Getting access token...');
        
        const tokenResponse = await fetch('https://api.flutterwave.com/v4/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            }),
        });

        const tokenData = await tokenResponse.json();

        console.log('Token Response Status:', tokenResponse.status);
        console.log('Token Response:', JSON.stringify(tokenData, null, 2));

        if (!tokenData.access_token) {
            return res.status(400).json({
                error: 'Failed to get access token',
                status: tokenResponse.status,
                response: tokenData
            });
        }

        const accessToken = tokenData.access_token;
        console.log('Got access token successfully');

        // ============================================
        // STEP 2: Create Payment
        // ============================================
        console.log('Creating payment...');

        const paymentResponse = await fetch('https://api.flutterwave.com/v4/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tx_ref: 'dlove-' + Date.now(),
                amount: amount,
                currency: 'NGN',
                redirect_url: 'https://dloveofthehelpers.vercel.app/success.html',
                customer: {
                    email: email,
                    name: name || 'Anonymous',
                },
                customizations: {
                    title: 'Dloveofthehelpers',
                    description: 'Donation for ' + (purpose || 'General Donation'),
                },
                payment_options: 'card, banktransfer, ussd',
            }),
        });

        const paymentData = await paymentResponse.json();

        console.log('Payment Response Status:', paymentResponse.status);
        console.log('Payment Response:', JSON.stringify(paymentData, null, 2));

        if (paymentData.status === 'success' && paymentData.data && paymentData.data.link) {
            return res.status(200).json({
                status: 'success',
                payment_link: paymentData.data.link,
            });
        } else {
            return res.status(400).json({
                error: paymentData.message || 'Payment creation failed',
                status: paymentResponse.status,
                response: paymentData
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
}