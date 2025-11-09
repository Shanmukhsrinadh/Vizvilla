emailjs.init("Es-1PqvKO3CYG1B8g");

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    // Show loading state
    submitBtn.disabled = true;
    loading.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    const formData = new FormData(this);
    const userName = formData.get('name');
    const userEmail = formData.get('email');
    const userPhone = formData.get('phone');
    const userMessage = formData.get('message');
    // --- Admin Notification Email ---
    const adminTemplateParams = {
        from_name: userName,
        from_email: userEmail,
        phone: userPhone || 'Not provided',
        message: userMessage
    };

    // --- User Confirmation Email ---
    const userTemplateParams = {
        from_name: userName,
        from_email: userEmail
    };

    // Send email to admin first
    emailjs.send("service_589hpgk", "template_jpkit3m", adminTemplateParams)
        .then(function(response) {
            console.log('Admin email SUCCESS!', response.status, response.text);

            // Then send confirmation to the user
            return emailjs.send("service_589hpgk", "template_m54vnzo", userTemplateParams);
        })
        .then(function(response) {
            console.log('User confirmation email SUCCESS!', response.status, response.text);

            // Show success message
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('contactForm').reset();

            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 5000);
        })
        .catch(function(error) {
            console.log('FAILED...', error);
            document.getElementById('errorMessage').style.display = 'block';
        })
        .finally(function() {
            submitBtn.disabled = false;
            loading.style.display = 'none';
        });
});
