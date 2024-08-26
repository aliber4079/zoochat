<!DOCTYPE html>
<html>
<head>
<meta name='robots' content='noindex,nofollow' />
<style>
#chatbox {
	width: 500px;
	height: 500px;
	display: flex;
	flex-direction: column;
	border: solid thin black;
}
#chatbox input,#textarea {
	font-size: 21px;
	font-family: arial;
}

#recv_box {
	
	flex-grow: 1;
	overflow: auto;
}
#send_box {
	display:flex;
}
#send_box input {
	flex-grow: 1;
}
#textarea {
	width: 100%;
	height: 100%;
	resize: none;
}
#textarea>div:nth-child(odd) {
	background-color: lightgrey;
}
</style>
</head>
<body>
	<div id="chatbox">
		<div id="recv_box" >
			<div id="textarea"></div> 
		</div>
		<div id="send_box" >
			<input type="text">
			<button id="send-push-button">send</button>
		</div>
	</div><!-- end chatbox -->
	<script type="text/javascript" src="app.js"></script>
</body>
</html>
