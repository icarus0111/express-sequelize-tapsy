const firebase = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");


//-------------------------------------------------------------
//  Initializing firebase
//-------------------------------------------------------------
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://tapsy-156800.firebaseio.com"
});


const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24, // 1 day
};


const push = {};



//-------------------------------------------------------------
//  sending push notification method
//-------------------------------------------------------------
push.sendPushNotification = async(title, body, data, firebaseToken) => {
    const payload = {
        notification: {
            title: title,
            body: body,
            imageUrl: "https://res.cloudinary.com/tapsy/image/upload/v1572626759/no-image_fphbvu.png",
            icon: "drawable-ldpi-icon",
            sound: "push_sound.mp3",
            color: "#0356fc",
            click_action: "FCM_PLUGIN_ACTIVITY"
        },
        data: data
    };

    return await firebase.messaging().sendToDevice(firebaseToken, payload, options);
}





module.exports = push;