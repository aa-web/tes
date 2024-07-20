const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const util = require('util');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath);
});

app.post('/send-email', (req, res) => {
  const { host, port, secure, user, pass, fromEmail, fromName, toEmail, subject, body } = req.body;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: toEmail,
    subject: subject,
    html: body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send(`<span style="color:red">Email wasn't sent to ${toEmail} because : ${error}</span>`);
    } else {
      res.send(`<span style="color:green">Email sent successfully to ${toEmail}</span>`);
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
