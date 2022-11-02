const static = require('./staticValues');
const client = require('twilio')(static.twilioSID, static.twilioAuthToken);

const twilio = {};


twilio.sendMsg = (to, otp) => {
    console.log('sending SMS to :..............', `${static.cuntryCode}${to}`, 'from : .....', static.twilioNumber, 'otp :......', otp);
    return client.messages.create({
        body: twilio.genOtpMsg(otp),
        from: static.twilioNumber,
        to: `${static.cuntryCode}${to}`,
    })
};



twilio.genOtpMsg = (otp) => {
    return `Use this code ${otp} for Tapsy account verification.`;
};




module.exports = twilio;