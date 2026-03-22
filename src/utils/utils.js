export function GenerateOtp(){
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export function getOtpHtml(otp, username, email){
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .otp-box {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .otp-code {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="otp-box">
            <h1>OTP Verification</h1>
            <p>Dear ${username},</p>
            <p>Your One-Time Password (OTP) is: <span class="otp-code">${otp}</span></p>
            <p>For your security, please do not share this code with anyone. This OTP will remain valid for 10 minutes.</p>
            <p><strong>Account Details:</strong><br>
            Username: ${username}<br>
            Email: ${email}</p>
            <p>If you did not request this OTP, please safely disregard this email.</p>
            <p>Sincerely,</p>
            <p>Your Company Name</p>
        </div>
    </div>
</body>
</html> 
    `
}

