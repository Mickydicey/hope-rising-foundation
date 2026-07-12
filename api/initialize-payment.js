// api/initialize-payment.js
// Paystack Payment Integration

export default async function handler(req, res) {

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed' 
        });
    }

    // Get keys from Vercel environment
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const publicKey = process.env.PAYSTACK_PUBLIC_KEY;

    // Safety check
    if (!secretKey) {
        return res.status(500).json({ 
            error: 'Payment system not configured' 
        });
    }

    // Get donation details from frontend
    const { amount, purpose, email, name } = req.body;

    // Validate
    if (!amount || amount < 1) {
        return res.status(400).json({ 
            error: 'Invalid donation amount' 
        });
    }

    if (!email) {
        return res.status(400).json({ 
            error: 'Email is required' 
        });
    }

    try {
        // Paystack amount is in KOBO (multiply by 100)
        // For USD we use USD * 100
        const amountInKobo = Math.round(amount * 100);

        // Call Paystack API
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                amount: amountInKobo,
                currency: 'USD',
                reference: 'dloveofthehelpers-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                callback_url: 'https://dloveofthehelpers.vercel.app/success.html',
                metadata: {
                    custom_fields: [
                        {
                            display_name: 'Donor Name',
                            variable_name: 'donor_name',
                            value: name || 'Anonymous'
                        },
                        {
                            display_name: 'Donation Purpose',
                            variable_name: 'donation_purpose',
                            value: purpose || 'General Donation'
                        }
                    ],
                    donor_name: name || 'Anonymous',
                    donation_purpose: purpose || 'General Donation',
                    cancel_action: 'https://dloveofthehelpers.vercel.app/success.html?status=cancelled'
                },
            }),
        });

        const data = await response.json();

        // Check if Paystack returned payment link
        if (data.status === true && data.data && data.data.authorization_url) {
            return res.status(200).json({
                status: 'success',
                payment_link: data.data.authorization_url,
                reference: data.data.reference,
                public_key: publicKey,
            });
        } else {
            console.error('Paystack Error:', data);
            return res.status(400).json({
                error: 'Could not initialize payment',
                details: data.message,
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Server error. Please try again.' 
        });
    }
}