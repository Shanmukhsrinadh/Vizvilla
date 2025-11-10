// =======================
// Contact.js (Email + Phone validation)
// =======================

(function () {
    emailjs.init({
        publicKey: "Es-1PqvKO3CYG1B8g",
    });
})();

document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById("contactForm");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");
    const submitBtn = document.getElementById("submitBtn");
    const loading = document.getElementById("loading");

    // --- Contact Form ---
    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            // Hide messages
            successMessage.style.display = "none";
            errorMessage.style.display = "none";

            // Get input values
            const userName = document.getElementById("name").value.trim();
            const userEmail = document.getElementById("email").value.trim();
            const userPhone = document.getElementById("phone").value.trim();
            const userMessage = document.getElementById("message").value.trim();

            // Validation patterns
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^[0-9]{10}$/;

            // === Basic Validation ===
            if (!userName || !userEmail || !userMessage) {
                return showError("⚠️ Please fill all required fields (Name, Email, and Message).");
            }

            if (!emailPattern.test(userEmail)) {
                return showError("❌ Invalid email format. Please check your email address.");
            }

            if (userPhone && !phonePattern.test(userPhone)) {
                return showError("❌ Invalid phone number. Please enter a 10-digit number.");
            }

            // --- Start Loading ---
            submitBtn.disabled = true;
            loading.style.display = "block";

            // === 1️⃣ Verify Email Existence via MailboxLayer ===
            try {
                const mailboxAPI = "f4fc95e2df9dda3405535446c83c86a0"; // your MailboxLayer API key
                const verifyResponse = await fetch(
                    `https://apilayer.net/api/check?access_key=${mailboxAPI}&email=${userEmail}`
                );
                const data = await verifyResponse.json();

                if (!data.format_valid || !data.smtp_check) {
                    resetUI();
                    return showError("❌ The provided email address does not exist or cannot receive messages.");
                }
            } catch (error) {
                console.error("Email verification failed:", error);
                resetUI();
                return showError("⚠️ Could not verify email address. Please try again later.");
            }

            // === 2️⃣ Verify Phone Number via Numverify API ===
            if (userPhone) {
                try {
                    const numVerifyAPI = "78c95356705a74edf974f3061a696550"; // replace with your API key
                    const phoneResponse = await fetch(
                        `https://apilayer.net/api/validate?access_key=${numVerifyAPI}&number=${userPhone}&country_code=IN&format=1`
                    );
                    const phoneData = await phoneResponse.json();

                    if (!phoneData.valid) {
                        resetUI();
                        return showError("❌ The provided phone number is invalid or does not exist.");
                    }
                } catch (error) {
                    console.error("Phone verification failed:", error);
                    resetUI();
                    return showError("⚠️ Could not verify phone number. Please try again later.");
                }
            }

            // === Send Email (only if all checks pass) ===
            const adminParams = {
                from_name: userName,
                from_email: userEmail,
                phone: userPhone || "Not provided",
                message: userMessage,
            };

            const userParams = {
                from_name: userName,
                from_email: userEmail,
            };

            try {
                await emailjs.send("service_589hpgk", "template_jpkit3m", adminParams);
                await emailjs.send("service_589hpgk", "template_m54vnzo", userParams);

                successMessage.innerText = "✅ Message sent successfully!";
                successMessage.style.display = "block";
                contactForm.reset();

                setTimeout(() => (successMessage.style.display = "none"), 5000);
            } catch (error) {
                console.error("EmailJS send failed:", error);
                showError("⚠️ Failed to send your message. Please try again later.");
            } finally {
                resetUI();
            }
        });
    }

    // === Helper Functions ===
    function showError(msg) {
        errorMessage.innerText = msg;
        errorMessage.style.display = "block";
    }

    function resetUI() {
        loading.style.display = "none";
        submitBtn.disabled = false;
    }
});
