const express = require('express');
const nodemailer = require('nodemailer');
const imap = require('imap');
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

app.post('/get-latest', (req, res) => {
  const { host, port, user, pass } = req.body;
  const imapClient = new imap({
    user,
    password: pass,
    host,
    port,
    tls: true
  });

  imapClient.connect();

  imapClient.on('ready', () => {
    imapClient.search(['UNSEEN'], (err, results) => {
      if (err) {
        res.status(500).send({ error: 'Failed to search for emails' });
      } else {
        const latestEmail = results[0];
        imapClient.fetch(latestEmail, { bodies: '' }, (err, messages) => {
          if (err) {
            res.status(500).send({ error: 'Failed to fetch email' });
          } else {
            const email = messages[0];
            const title = email.attributes[0].value;
            console.log(title)
            const content = email.parts[0].body;
            console.log(content)
            res.send({ title, content });
          }
        });
      }
    });
  });

  imapClient.on('error', (err) => {
    res.status(500).send({ error: err });
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
