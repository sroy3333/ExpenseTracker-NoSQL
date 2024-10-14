const uuid = require('uuid');
const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const ForgotPassword = require('../models/forgotpassword');

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            const id = uuid.v4();
            const forgotPasswordRequest = new ForgotPassword({
                _id: id,
                userId: user._id,
                active: true
            });
            await forgotPasswordRequest.save();

            // Set up Brevo API key
            const brevoApiKey = process.env.BREVO_API_KEY;

            // Initialize the TransactionalEmailsApi with the API key
            const apiInstance = new TransactionalEmailsApi();
            const apiKey = apiInstance.authentications['apiKey'];
            apiKey.apiKey = brevoApiKey;

            // Create a new SendSmtpEmail object
            const sendSmtpEmail = new SendSmtpEmail();

            // Fill in the email details
            sendSmtpEmail.subject = 'Reset Password Request';
            sendSmtpEmail.htmlContent = `<p>Click the link below to reset your password.</p><a href="http://localhost:5000/password/resetpassword/${id}">Reset password</a>`;
            sendSmtpEmail.sender = { name: 'Sukanya Roy', email: 'sukanyaindia2222@gmail.com' };
            sendSmtpEmail.to = [{ email }];
            // Add any other necessary email fields here (cc, bcc, replyTo, headers, etc.)

            // Send the email using the Brevo API
            apiInstance.sendTransacEmail(sendSmtpEmail)
                .then((data) => {
                    console.log('Email sent successfully:', data);
                    return res.status(200).json({ message: 'Link to reset password sent to your email', success: true });
                })
                .catch((error) => {
                    console.error('Error sending email:', error);
                    throw new Error('Failed to send email');
                });
        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
}

// Function to render password reset form
const resetPassword = async (req, res) => {
    const id = req.params.id;
    try {
        const forgotPasswordRequest = await ForgotPassword.findOne({ _id: id });

        if (forgotPasswordRequest && forgotPasswordRequest.active) {
            await forgotPasswordRequest.updateOne({ active: true });

            // Render the HTML form for resetting password
            res.status(200).send(`
                <html>
                    <form action="/password/updatepassword/${id}" method="post">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>Reset Password</button>
                    </form>
                </html>`
            );
        } else {
            res.status(400).json({ message: 'Invalid or expired reset link', success: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
}

// Function to update user's password
const updatePassword = async (req, res) => {
    try {
        const { newpassword } = req.body;
        const { resetpasswordid } = req.params;

        const forgotPasswordRequest = await ForgotPassword.findById(resetpasswordid);

        if (forgotPasswordRequest && forgotPasswordRequest.active) {
            const user = await User.findById(forgotPasswordRequest.userId);

            if (user) {
                // Encrypt the new password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
                
                user.password = hashedPassword;
                await user.save();

                res.status(201).json({ message: 'Successfully updated the new password' });
            } else {
                res.status(404).json({ error: 'No user exists', success: false });
            }
        } else {
            res.status(400).json({ message: 'Invalid or expired reset request', success: false });
        }
    } catch (error) {
        console.error(error);
        res.status(403).json({ error: error.message, success: false });
    }
}




module.exports = {
    forgotPassword,
    updatePassword,
    resetPassword
}