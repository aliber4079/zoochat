self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const sendNotification = body => {
        // you could refresh a notification badge here with postMessage API
        const title = "zoosmart";

        return self.registration.showNotification(title, {
            body,
        });
    };
    if (event.data) {
    	const payload = event.data.json();
    	let sendNotif=true;
	event.waitUntil(
		clients.matchAll({
			type: "window",
		})
		.then((clientList) => {
			for (const client of clientList) {
				if (new RegExp("^https://www.zoosmart.us").exec(client.url)) {
					client.postMessage(payload.message);
					if (client.visibilityState==="visible") {
						sendNotif=false;
					}
				}
			}
	    	if (sendNotif) {
			sendNotification(payload.message);
		}
	})) //end event.waitUntil
     }// end if event.data
});
