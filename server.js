const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

function makePolicyNo() {
  return 'GPC-' + Math.floor(100000 + Math.random() * 900000);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/submit', async (req, res) => {
  const data = req.body || {};
  if (!data.email) return res.status(400).json({ error: 'Missing email' });

  const policyNo = makePolicyNo();

  const fields = [
    ['Policy No', policyNo],
    ['Title', data.title],
    ['First Name', data.firstName],
    ['Last Name', data.lastName],
    ['Date of Birth', data.dob],
    ['Phone', data.phone],
    ['Email', data.email],
    ['Address', data.address],
    ['Postcode', data.postcode],
    ['License Number', data.licenseNo],
    ['License Length', data.licenseLength],
    ['Occupation', data.occupation],
    ['Registration', data.registration],
    ['Make', data.make],
    ['Model', data.model],
    ['Vehicle Year', data.vehicleYear],
    ['Engine Size (cc)', data.engineSize],
    ['Vehicle Value (£)', data.vehicleValue],
    ['Reason for Cover', data.reason],
    ['Start', (data.startDate||'') + ' ' + (data.startTime||'')],
    ['End', (data.endDate||'') + ' ' + (data.endTime||'')],
    ['Policy Price (£)', data.policyPrice]
  ];

  const rows = fields.map(([k,v]) => `<tr><td style="padding:6px;border-top:1px solid #eee"><strong>${k}</strong></td><td style="padding:6px;border-top:1px solid #eee">${v ?? ''}</td></tr>`).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#f8fafc;padding:20px">
      <h2>Policy Details</h2>
      <table cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;border-collapse:collapse;background:#fff">${rows}</table>
      <p style="font-size:12px;color:#555">Thank you. This is an automated message.</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || '"Policy App" <no-reply@example.com>',
      to: [process.env.ADMIN_EMAIL || '', data.email].filter(Boolean),
      subject: `Policy Confirmation ${policyNo}`,
      html
    });
    res.json({ ok: true, policyNo });
  } catch (err) {
    console.error('Email failed:', err);
    res.status(500).json({ error: 'Email failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
