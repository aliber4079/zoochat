self.addEventListener('push', function (event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    const sendNotification = body => {
        // you could refresh a notification badge here with postMessage API
        const title = "zoosmart";

        return self.registration.showNotification(title, {
		body: body,
		icon: 'ele.jpg'
        });
    };
    if (event.data) {
	let message=null, matches=null;
    	const payload = event.data.json();
	matches=payload.message.split("\t");
	if (matches) {
		message=matches[1];
	} else {
		message=payload.message;
	}
    	let sendNotif=true;
	event.waitUntil(
		clients.matchAll({
			type: "window",
		})
		.then((clientList) => {
			for (const client of clientList) {
				if (new RegExp("^https://www.zoosmart.us").exec(client.url)) {
					client.postMessage(message);
					if (client.visibilityState==="visible") {
						sendNotif=false;
					}
				}
			}
	    	if (sendNotif) {
			sendNotification(message);
		}
	})) //end event.waitUntil
     }// end if event.data
});
