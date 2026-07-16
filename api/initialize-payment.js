// api/initialize-payment.js
// Flutterwave V3 Integration

export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed' 
        });
    }

    // Get secret key
    const secretKey = process.env.FLW_SECRET_KEY;

    // Safety check
    if (!secretKey) {
        return res.status(500).json({ 
            error: 'Payment system not configured' 
        });
    }

    // Get donation details
    const { amount, purpose, email, name } = req.body;

    // Validate
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
        // Call Flutterwave V3
        const response = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
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

        // Get raw response
        const rawText = await response.text();
        console.log('Flutterwave Response:', rawText);

        // Parse JSON
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            return res.status(400).json({
                error: 'Flutterwave response error: ' + rawText
            });
        }

        // Check if successful
        if (data.status === 'success' && data.data && data.data.link) {
            return res.status(200).json({
                status: 'success',
                payment_link: data.data.link,
            });
        } else {
            return res.status(400).json({
                error: data.message || 'Could not initialize payment',
                details: data
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Server error: ' + error.message
        });
    }
}