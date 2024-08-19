<?php
$subsfile="subs";
$current_subs=[];
if(file_exists($subsfile)) {
 $cmd='$current_subs=array_merge(' . file_get_contents($subsfile)  . ',$current_subs)';
 error_log("cmd: $cmd");
 eval("$cmd;");
}

$subscription = json_decode(file_get_contents('php://input'), true);

if (!isset($subscription['endpoint'])) {
    echo 'Error: not a subscription';
    return;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
    case 'PUT':
        // create or update subscription entry in your database (endpoint is unique)
	$current_subs[$subscription["endpoint"]]=$subscription;
        break;
    case 'DELETE':
        // delete the subscription corresponding to the endpoint
	if (isset($current_subs[$subscription["endpoint"]])) {
		$offset=array_flip(array_keys($current_subs))[$subscription["endpoint"]];
		array_splice($current_subs,$offset,1);
	}
        break;
    default:
        echo "Error: method not handled";
        return;
}
file_put_contents($subsfile,var_export($current_subs,TRUE));
