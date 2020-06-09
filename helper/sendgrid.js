const request = require("request");
const moment = require('moment');

const template_id_list = {
    welcome:            'd-77ec5b6f99eb49d38ea93978eda2db44',
    receipt:            'd-2e46508d7bbb4df0b4c8863ebfd5465d',
    password_reset:     'd-8947b6812b1b424a98fe62c67fe2178a',
    email_verification: 'd-2bdf07a55afd4b9e9ea665b763147e40',
    withdraw:           'd-24d9431cb36247aaa7da19d1efa981ae'
};

const sendEmail = (to, content, subject, template_id) => {
    const options = { 
        method: 'POST',
        url: process.env.SENDGRID_API_URL,
        headers: { 
            'content-type': 'application/json',
            authorization: 'Bearer ' + process.env.SENDGRID_API_KEY
        },
        body: {
            personalizations: [{ 
                to: to,
                dynamic_template_data: content,
                subject: subject
            }],
            from: { email: 'online@rpsbet.com', name: 'Rpsbet' },
            reply_to: { email: 'online@rpsbet.com', name: 'Rpsbet' },
            template_id: template_id
        },
        json: true 
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

module.exports.sendWelcomeEmail = (email, name) => {
    sendEmail(
        [
            {email, name},
        ],
        {
            name,
            username: name, 
            action_url: 'https://rpsbet.com'
        }, 
        'Welcome to RPSBET', 
        template_id_list.welcome
    );
};

module.exports.sendResetPasswordEmail = (email, name, changePasswordId) => {
    sendEmail(
        [
            {email, name},
        ],
        {
            name,
            username: name, 
            action_url: 'http://localhost:3000/changePassword/' + changePasswordId
        }, 
        'Reset Password',
        template_id_list.password_reset
    );
};

module.exports.sendWithdrawEmail = (email, name, receipt_id, amount) => {
    const dateString = moment(new Date()).format('DD/MM/YYYY');

    sendEmail(
        [
            {email, name},
            {email: "payments@rpsbet.com", name: "rpsbet"}
        ], 
        { 
            name,
            receipt_id: receipt_id,
            date: dateString,
            receipt_details : [
                {"amount": "£" + amount},
            ],
            total: "£" + amount,
            action_url: 'https://rpsbet.com'
        },
        'Withdraw', 
        template_id_list.withdraw
    );
};

module.exports.sendReceiptEmail = (email, name, receipt_id, amount) => {
    const dateString = moment(new Date()).format('DD/MM/YYYY');

    sendEmail(
        [
            {email, name},
            {email: "payments@rpsbet.com", name: "rpsbet"},
        ], 
        { 
            name,
            receipt_id: receipt_id,
            date: dateString,
            receipt_details : [
                {"amount": "£" + amount},
            ],
            total: "£" + amount,
            action_url: 'https://rpsbet.com'
        },
        'Receipt', 
        template_id_list.receipt
    );
};
