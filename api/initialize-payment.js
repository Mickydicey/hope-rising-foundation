// api/initialize-payment.js
// Flutterwave V4 Live Integration - Fixed Auth URL

export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed' 
        });
    }

    // Get V4 credentials from Vercel
    const clientId = process.env.FLW_CLIENT_ID;
    const clientSecret = process.env.FLW_CLIENT_SECRET;

    // Safety check
    if (!clientId || !clientSecret) {
        return res.status(500).json({ 
            error: 'Payment system not configured' 
        });
    }

    // Get donation details from frontend
    const { amount, purpose, email, name } = req.body;

    // Validate inputs
    if (!amount || amount < 1) {
        return res.status(400).json({ 
            error: 'Invalid donation amount' 
        });
    }

    if (!email) {
        return res.status(400).json({ 
            error: 'Email address is required' 
        });
    }

    try {

        // ============================================
        // STEP 1: Get Access Token - Fixed URL
        // ============================================
        const tokenResponse = await fetch('https://auth.flutterwave.com/v4/token', {
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

        // Get raw text first to see exactly what Flutterwave returns
        const rawTokenText = await tokenResponse.text();
        console.log('Token Raw Response:', rawTokenText);

        // Try to parse as JSON
        let tokenData;
        try {
            tokenData = JSON.parse(rawTokenText);
        } catch (e) {
            return res.status(400).json({
                error: 'Flutterwave auth failed: ' + rawTokenText,
            });
        }

        console.log('Token Data:', JSON.stringify(tokenData));

        // If token failed
        if (!tokenData.access_token) {
            return res.status(400).json({
                error: tokenData.message || 'Could not get access token',
                details: tokenData
            });
        }

        const accessToken = tokenData.access_token;

        // ============================================
        // STEP 2: Initialize Payment
        // ============================================
        const paymentResponse = await fetch('https://api.flutterwave.com/v4/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tx_ref: 'dlove-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
                amount: amount,
                currency: 'NGN',
                redirect_url: 'https://dloveofthehelpers.vercel.app/success.html',
                customer: {
                    email: email,
                    name: name || 'Anonymous Donor',
                },
                customizations: {
                    title: 'Dloveofthehelpers',
                    description: 'Donation for ' + (purpose || 'General Donation'),
                    logo: 'https://dloveofthehelpers.vercel.app/logo.png',
                },
                payment_options: 'card, banktransfer, ussd',
                meta: {
                    donor_name: name || 'Anonymous',
                    donation_purpose: purpose || 'General Donation',
                    source: 'website'
                }
            }),
        });

        // Get raw payment response
        const rawPaymentText = await paymentResponse.text();
        console.log('Payment Raw Response:', rawPaymentText);

        // Try to parse payment response
        let paymentData;
        try {
            paymentData = JSON.parse(rawPaymentText);
        } catch (e) {
            return res.status(400).json({
                error: 'Payment response error: ' + rawPaymentText,
            });
        }

        console.log('Payment Data:', JSON.stringify(paymentData));

        // If payment link created successfully
        if (paymentData.status === 'success' && paymentData.data && paymentData.data.link) {
            return res.status(200).json({
                status: 'success',
                payment_link: paymentData.data.link,
            });
        } else {
            return res.status(400).json({
                error: paymentData.message || 'Could not create payment link',
                details: paymentData
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Server error: ' + error.message
        });
    }
}