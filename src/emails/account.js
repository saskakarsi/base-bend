const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (to, from, name) => {
    sgMail.send({
        to,
        from,
        subject: 'Thanks for joining',
        text: `Welcome to the app, ${name}. Let me know how you get along.`
    })
}

const sendCancellationEmail = (to, from, name) => {
    sgMail.send({
        to,
        from,
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}, hope we'll meet again!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}