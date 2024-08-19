<!DOCTYPE html>
<html>
<head>
<style>
#chatbox {
	width: 500px;
	height: 500px;
	display: flex;
	flex-direction: column;
	border: solid thin black;
}
#recv_box {
	
	flex-grow: 1;
}
#send_box {
	display:flex;
}
#send_box input {
	flex-grow: 1;
}
textarea {
	width: 100%;
	height: 100%;
	resize: none;
}
</style>
</head>
<body>
	<div id="chatbox">
		<div id="recv_box" >
			<textarea readonly><?php system("tail -15 messages.txt");  ?></textarea>
		</div>
		<div id="send_box" >
			<input type="text">
			<button id="send-push-button">send</button>
		</div>
	</div><!-- end chatbox -->
	<script type="text/javascript" src="app.js"></script>
</body>
</html>
