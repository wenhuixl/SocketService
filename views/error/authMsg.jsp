<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>出错了</title>
	<link rel="stylesheet" href="css/style.css">
	<script src="js/jquery.js"></script>
	<script src="js/public.js"></script>
</head>
<body>
<div id="content" class="cf">
	<div id="duobei_wrap">
		<div class="logo_wrap cf">
			<a href="#" id="logo"></a>
			<div id="title"><i>停车收费管理系统</i></div>
		</div>
		<div class="reason">
			<p class="not_found_tip">Exception  :( 出错了</p>
			<p class="possible">请尝试以下操作：</p>
			<ul>
				<li>确保浏览器的地址栏中显示的网站地址的拼写和格式正确无误。 </li>
				<li>如果通过单击链接而到达了该网页，请与网站管理员联系，通知他们该链接的格式不正确。 </li>
			</ul>
		</div>
	</div>
	<!-- #duobei_wrap -->
	<div class="line"></div>

	<div class="not_found">
		<i class="ribbon"></i>
		<div class="not_found_404 cf">
			<span>E</span>
			<span>R</span>
			<span>R</span>
		</div>
		<div class="btn">
			<a href="/Conscript/login/login.do" class="button button-rounded">登录页</a>
			<a href="#" class="button button-rounded cancle">返回上页</a>
		</div>   
	</div>
	<!-- not_found -->

</div>
</body>
</html>