navigator.serviceWorker.addEventListener('message', (e) => {
	document.querySelector('textarea').value+=e.data + "\n";
});
document.addEventListener('DOMContentLoaded', () => {
  const applicationServerKey =
    'BPyV6JJHqCBnp-P6BFICVAdOS_sn_qfBy0-Rh9ITBSbaI3FHWf2MhXDRtRsCOIUIzyYbJ7QEJs7UX3sbdAkrBPY';
  let isPushEnabled = false;


  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported by this browser');
    return;
  }

  if (!('PushManager' in window)) {
    console.warn('Push notifications are not supported by this browser');
    return;
  }

  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    console.warn('Notifications are not supported by this browser');
    return;
  }

  // Check the current Notification permission.
  // If its denied, the button should appears as such, until the user changes the permission manually
  if (Notification.permission === 'denied') {
    console.warn('Notifications are denied by the user');
    return;
  }

  navigator.serviceWorker.register('serviceWorker.js').then(
    () => {
      console.log('[SW] Service worker has been registered');
      push_updateSubscription();
    },
    e => {
      console.error('[SW] Service worker registration failed', e);
    }
  );

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function checkNotificationPermission() {
    return new Promise((resolve, reject) => {
      if (Notification.permission === 'denied') {
        return reject(new Error('Push messages are blocked.'));
      }

      if (Notification.permission === 'granted') {
        return resolve();
      }

      if (Notification.permission === 'default') {
        return Notification.requestPermission().then(result => {
          if (result !== 'granted') {
            reject(new Error('Bad permission result'));
          } else {
            resolve();
          }
        });
      }

      return reject(new Error('Unknown permission'));
    });
  }

  function push_subscribe() {

    return checkNotificationPermission()
      .then(() => navigator.serviceWorker.ready)
      .then(serviceWorkerRegistration =>
        serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
        })
      )
      .then(subscription => {
        // Subscription was successful
        // create subscription on your server
        return push_sendSubscriptionToServer(subscription, 'POST');
      })
      .catch(e => {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          console.warn('Notifications are denied by the user.');
        } else {
          // A problem occurred with the subscription; common reasons
          // include network errors or the user skipped the permission
          console.error('Impossible to subscribe to push notifications', e);
        }
      });
  }

  function push_updateSubscription() {
    navigator.serviceWorker.ready
      .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
      .then(subscription => {

        if (!subscription) {
          // We aren't subscribed to push, so set UI to allow the user to enable push
	  console.log("not subscribed so subscribing");
          push_subscribe();
          return;
        }
	console.log("already subscribed");

        // Keep your server in sync with the latest endpoint
        return push_sendSubscriptionToServer(subscription, 'PUT');
      })
      .catch(e => {
        console.error('Error when updating the subscription', e);
      });
  }

  function push_unsubscribe() {

    // To unsubscribe from push messaging, you need to get the subscription object
    navigator.serviceWorker.ready
      .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
      .then(subscription => {
        // Check that we have a subscription to unsubscribe
        if (!subscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          return;
        }

        // We have a subscription, unsubscribe
        // Remove push subscription from server
        return push_sendSubscriptionToServer(subscription, 'DELETE');
      })
      .then(subscription => subscription.unsubscribe())
      .catch(e => {
        // We failed to unsubscribe, this can lead to
        // an unusual state, so  it may be best to remove
        // the users data from your data store and
        // inform the user that you have done so
        console.error('Error when unsubscribing the user', e);
      });
  }

  function push_sendSubscriptionToServer(subscription, method) {
    const key = subscription.getKey('p256dh');
    const token = subscription.getKey('auth');
    const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];

    return fetch('push_subscription.php', {
      method,
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        publicKey: key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : null,
        authToken: token ? btoa(String.fromCharCode.apply(null, new Uint8Array(token))) : null,
        contentEncoding,
      }),
    }).then(() => subscription);
  }

  /**
   * START send_push_notification
   * this part handles the button that calls the endpoint that triggers a notification
   * in the real world, you wouldn't need this, because notifications are typically sent from backend logic
   */

  const sendPushButton = document.querySelector('#send-push-button');
  if (!sendPushButton) {
    return;
  }
  const inputButton = document.querySelector('input[type=text]');
  inputButton.addEventListener('keyup',(e)=> {
	if (e.keyCode==13) {
		sendPushButton.click();
	}
  });
  

  sendPushButton.addEventListener('click', () =>
    navigator.serviceWorker.ready
      .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager.getSubscription())
      .then(subscription => {
        if (!subscription) {
          alert('Please enable push notifications');
          return;
        }

    	if (document.querySelector('input[type=text]').value === '') {
		return;
	}
        const contentEncoding = (PushManager.supportedContentEncodings || ['aesgcm'])[0];
        const jsonSubscription = subscription.toJSON();
        fetch('send_push_notification.php', {
          method: 'POST',
          body: JSON.stringify({"message": document.querySelector('input[type=text]').value})
	}).then( () => document.querySelector('input[type=text]').value='' );
      })
  );
  /**
   * END send_push_notification
   */
});
