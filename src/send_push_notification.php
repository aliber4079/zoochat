<?php
require __DIR__ . '/../vendor/autoload.php';
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

// here I'll get the subscription endpoint in the POST parameters
// but in reality, you'll get this information in your database
// because you already stored it (cf. push_subscription.php)
$payload=json_decode(file_get_contents('php://input'), true);
if(!isset($payload["message"])){
 exit;
}
$message= time() . "\t" . $payload["message"];

$auth = array(
    'VAPID' => array(
        'subject' => 'ele',
        'publicKey' => file_get_contents(__DIR__ . '/../keys/public_key.txt'), // don't forget that your public key also lives in app.js
        'privateKey' => file_get_contents(__DIR__ . '/../keys/private_key.txt'), // in the real world, this would be in a secret file
    ),
);

$webPush = new WebPush($auth,[],NULL,['debug' => true]);

$subsfile="subs";
if(file_exists($subsfile)) {
 $cmd='$current_subs=' . file_get_contents($subsfile);
 error_log("cmd: $cmd");
 eval("$cmd;");
} else {
 exit;
}

file_put_contents("src/messages.txt",$message . "\n", FILE_APPEND);
// send multiple notifications with payload
$outbound_payload=["message"=>$message];
if (isset($payload["endpoint"])) {
	$outbound_payload["endpoint"]=$payload["endpoint"];
}
foreach ($current_subs as $subscription) {
    $webPush->queueNotification(Subscription::create($subscription),json_encode($outbound_payload));
} 

foreach ($webPush->flush() as $report) {
    $endpoint = $report->getRequest()->getUri()->__toString();
    if (!$report->isSuccess()) {
         error_log("[x] Message failed to sent for subscription {$endpoint}: {$report->getReason()}");
	 if ($report->isSubscriptionExpired() && isset($current_subs[$subscription["endpoint"]])) {
                $offset=array_flip(array_keys($current_subs))[$endpoint];
                array_splice($current_subs,$offset,1);
		file_put_contents($subsfile,var_export($current_subs,TRUE));
        }
    }
}
