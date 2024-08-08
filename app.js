const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Utility functions
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

async function isValidDomain(email) {
    const domain = email.split('@')[1];
    try {
        await dns.resolveMx(domain);
        return true;
    } catch (error) {
        return false;
    }
}

async function isActiveEmail(email) {
    const domain = email.split('@')[1];
    try {
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
            const mxRecord = mxRecords[0].exchange;

            let transporter = nodemailer.createTransport({
                host: mxRecord,
                port: 25,
                secure: false,
                tls: {
                    rejectUnauthorized: false
                }
            });

            return new Promise((resolve) => {
                transporter.verify(function (error) {
                    if (error) {
                        resolve(false);
                    } else {
                        transporter.sendMail({
                            from: 'test@example.com',
                            to: email,
                        }, (err) => {
                            resolve(!err);
                        });
                    }
                });
            });
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

app.post('/validate-emails', async (req, res) => {
    const emails = req.body.emails;  // Expecting an array of emails
    const activeEmails = [];
    const inactiveEmails = [];

    if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ message: 'Invalid email array.' });
    }

    for (let email of emails) {
        if (isValidEmail(email)) {
            const domainIsValid = await isValidDomain(email);
            if (domainIsValid) {
                const emailIsActive = await isActiveEmail(email);
                if (emailIsActive) {
                    activeEmails.push(email);
                } else {
                    inactiveEmails.push(email);
                }
            } else {
                inactiveEmails.push(email);
            }
        } else {
            inactiveEmails.push(email);
        }
    }

    res.json({
        activeEmails: activeEmails,
        inactiveEmails: inactiveEmails
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
