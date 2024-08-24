self.addEventListener('push', function (event) {
	if (!(self.Notification && self.Notification.permission === 'granted')) {
		return;
	}

	const sendNotification = body => {
		const title = "zoosmart";
		return self.registration.showNotification(title, {
			body: body,
			icon: 'ele.jpg',
			tag: 'applet'
		});
	};
	if (event.data) {
		let message=null, matches=null;
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
					sendNotification(payload.message.substr(payload.message.indexOf('\t')+1));
				}
			}) //end then
		) //end event.waitUntil
	}// end if event.data
});
