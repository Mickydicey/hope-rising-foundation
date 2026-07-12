// ============================================
// DLOVEOFTHEHELPERS - JAVASCRIPT
// With Flutterwave Payment Integration
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // === Back to Top ===
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
        updateActiveNavLink();
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // === Mobile Menu ===
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
    
    // === Active Nav Link ===
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    }
    
    // === Counter Animation ===
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        updateCounter();
    }
    
    let countersAnimated = false;
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersAnimated) {
                countersAnimated = true;
                document.querySelectorAll('.v-stat h3').forEach(el => {
                    const target = parseInt(el.getAttribute('data-count'));
                    animateCounter(el, target);
                });
            }
        });
    }, { threshold: 0.5 });
    
    const volunteerSection = document.querySelector('.volunteer-stats');
    if (volunteerSection) counterObserver.observe(volunteerSection);
    
    // === Scroll Animations ===
    const animateElements = document.querySelectorAll(
        '.service-card, .campaign-card, .donate-card, .testimonial-card, .event-card, .contact-info-card'
    );
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        scrollObserver.observe(el);
    });
    
    // === Form Handling ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
        });
    }
    
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Thank you for subscribing!', 'success');
            newsletterForm.reset();
        });
    }
    
    // === Smooth Scroll ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
    
    // === Progress Bar Animation ===
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fills = entry.target.querySelectorAll('.progress-fill');
                fills.forEach(fill => {
                    const width = fill.style.width;
                    fill.style.width = '0';
                    setTimeout(() => {
                        fill.style.width = width;
                    }, 100);
                });
            }
        });
    }, { threshold: 0.3 });
    
    const campaignsSection = document.querySelector('.campaigns');
    if (campaignsSection) progressObserver.observe(campaignsSection);
    
    console.log('💖 Dloveofthehelpers Website Loaded Successfully!');
});


// ============================================
// ============================================
// DONATION MODAL & FLUTTERWAVE - IMPROVED
// ============================================

// Global variables
let currentDonationAmount = 25;
let currentDonationPurpose = 'General Donation';
let donorName = '';
let donorEmail = '';

// === Open Donation Modal ===
function openDonateModal(amount, purpose) {
    currentDonationAmount = amount;
    currentDonationPurpose = purpose;

    // Update display
    document.getElementById('modalAmount').textContent = '$' + amount;
    document.getElementById('modalPurpose').textContent = purpose;
    document.getElementById('modalAmount2').textContent = '$' + amount;
    document.getElementById('modalPurpose2').textContent = purpose;

    // Hide custom amount, show donor form
    document.getElementById('customAmountInput').style.display = 'none';
    document.getElementById('donorForm').style.display = 'block';

    // Show Step 1
    showStep('stepDetails');

    // Open modal
    document.getElementById('donationModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// === Open Custom Amount Modal ===
function openCustomDonateModal() {
    document.getElementById('modalAmount').textContent = '$0';
    document.getElementById('modalPurpose').textContent = 'General Donation';

    // Show custom amount input
    document.getElementById('customAmountInput').style.display = 'block';
    document.getElementById('donorForm').style.display = 'block';

    showStep('stepDetails');

    document.getElementById('donationModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// === Show a Step ===
function showStep(stepId) {
    // Hide all steps
    document.querySelectorAll('.modal-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show requested step
    document.getElementById(stepId).style.display = 'block';
}

// === Proceed to Payment (validate first) ===
function proceedToPayment() {

    // If custom amount, validate it first
    const customInput = document.getElementById('customAmountInput');
    if (customInput.style.display !== 'none') {
        const amount = parseFloat(document.getElementById('customAmountField').value);
        if (!amount || amount < 1) {
            showInputError('customAmountField', 'Please enter a valid amount (minimum $1)');
            return;
        }
        currentDonationAmount = amount;
        currentDonationPurpose = 'General Donation';
        document.getElementById('modalAmount2').textContent = '$' + amount;
        document.getElementById('modalPurpose2').textContent = 'General Donation';
    }

    // Validate name
    const nameInput = document.getElementById('donorName');
    const name = nameInput.value.trim();
    if (!name) {
        showInputError('donorName', 'Please enter your full name');
        nameInput.classList.add('error');
        return;
    }

    // Validate email
    const emailInput = document.getElementById('donorEmail');
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showInputError('donorEmail', 'Please enter a valid email address');
        emailInput.classList.add('error');
        return;
    }

    // Save donor details
    donorName = name;
    donorEmail = email;

    // Update amount display on step 2
    document.getElementById('modalAmount2').textContent = '$' + currentDonationAmount;
    document.getElementById('modalPurpose2').textContent = currentDonationPurpose;

    // Go to payment step
    showStep('stepPayment');
}

// === Show Input Error ===
function showInputError(inputId, message) {
    // Remove existing error
    const existing = document.querySelector('.input-error-msg');
    if (existing) existing.remove();

    const input = document.getElementById(inputId);
    input.classList.add('error');

    const errorMsg = document.createElement('p');
    errorMsg.className = 'input-error-msg';
    errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    input.parentNode.appendChild(errorMsg);

    // Remove error on input
    input.addEventListener('input', function() {
        input.classList.remove('error');
        if (errorMsg.parentNode) errorMsg.remove();
    }, { once: true });

    // Shake animation
    input.style.animation = 'shake 0.4s ease';
    setTimeout(() => input.style.animation = '', 400);
}

// === Go Back to Details Step ===
function goBackToDetails() {
    showStep('stepDetails');
}

// === Close Donation Modal ===
function closeDonateModal() {
    document.getElementById('donationModal').classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset everything after animation
    setTimeout(() => {
        showStep('stepDetails');
        document.getElementById('donorName').value = '';
        document.getElementById('donorEmail').value = '';
        document.getElementById('donorName').classList.remove('error');
        document.getElementById('donorEmail').classList.remove('error');
        document.getElementById('paymentMethods').style.display = 'block';
        document.getElementById('paymentLoading').style.display = 'none';

        // Remove any error messages
        document.querySelectorAll('.input-error-msg').forEach(el => el.remove());

        // Remove bank details if showing
        const existingBank = document.querySelector('.bank-details-info');
        if (existingBank) existingBank.remove();
    }, 300);
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeDonateModal();
});

// === Paystack Payment Function ===
async function payWithFlutterwave() {

    // Show loading state
    document.getElementById('paymentMethods').style.display = 'none';
    document.getElementById('paymentLoading').style.display = 'block';

    try {
        const response = await fetch('/api/initialize-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: currentDonationAmount,
                purpose: currentDonationPurpose,
                email: donorEmail,
                name: donorName,
            }),
        });

        const data = await response.json();

        if (data.status === 'success' && data.payment_link) {

            // Save donation info to sessionStorage
            sessionStorage.setItem('donorName', donorName);
            sessionStorage.setItem('donorEmail', donorEmail);
            sessionStorage.setItem('donationAmount', currentDonationAmount);
            sessionStorage.setItem('donationPurpose', currentDonationPurpose);
            sessionStorage.setItem('paymentReference', data.reference);

            // Redirect to Paystack payment page
            window.location.href = data.payment_link;

        } else {
            throw new Error(data.error || 'Payment initialization failed');
        }

    } catch (error) {
        console.error('Payment Error:', error);

        // Hide loading show payment methods again
        document.getElementById('paymentLoading').style.display = 'none';
        document.getElementById('paymentMethods').style.display = 'block';

        showNotification(
            '⚠️ ' + error.message + '. Please try again or use Bank Transfer.',
            'error'
        );
    }
}

// === Show Bank Transfer Details ===
function showBankDetails() {
    const paymentMethods = document.getElementById('paymentMethods');

    // Toggle off if already showing
    const existing = document.querySelector('.bank-details-info');
    if (existing) {
        existing.remove();
        return;
    }

    const bankInfo = document.createElement('div');
    bankInfo.className = 'bank-details-info';
    bankInfo.innerHTML = `
        <h4><i class="fas fa-university"></i> Bank Transfer Details</h4>
        <div class="bank-detail-row">
            <span>Bank Name:</span>
            <strong>First Bank Nigeria</strong>
        </div>
        <div class="bank-detail-row">
            <span>Account Name:</span>
            <strong>Dloveofthehelpers Foundation</strong>
        </div>
        <div class="bank-detail-row">
            <span>Account Number:</span>
            <strong>XXXX-XXXX-XXXX
                <button class="copy-btn" onclick="copyToClipboard('XXXXXXXXXX', this)">Copy</button>
            </strong>
        </div>
        <div class="bank-detail-row">
            <span>SWIFT Code:</span>
            <strong>FBNINGLA</strong>
        </div>
        <div class="bank-detail-row">
            <span>Amount:</span>
            <strong>$${currentDonationAmount}</strong>
        </div>
        <div class="bank-detail-row">
            <span>Reference:</span>
            <strong>${currentDonationPurpose}</strong>
        </div>
        <div style="margin-top:15px; font-size:13px; color:#666; padding-top:10px; border-top:1px dashed #ddd;">
            <i class="fas fa-info-circle" style="color:var(--primary)"></i>
            After transfer, email proof to <strong>info@dloveofthehelpers.org</strong>
        </div>
    `;

    paymentMethods.appendChild(bankInfo);
}

// === Copy to Clipboard ===
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(function() {
        const original = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = '#27ae60';
        setTimeout(() => {
            button.textContent = original;
            button.style.background = '';
        }, 2000);
    });
}
// === Notification System ===
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#27ae60' : '#e74c3c',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: '10001',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '14px'
    });
    
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0 0 0 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}