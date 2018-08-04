var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var log4js = require('log4js');
var compression = require('compression');

var logger = log4js.getLogger('app');

var index = require('./routes/index');
var plate = require('./controller/plate');
var gt = require('./controller/gt');
var login = require('./controller/login');
var logout = require('./controller/logout');
var admin = require('./controller/admin');
var user = require('./controller/user');
var menu = require('./controller/menu');
var device = require('./controller/device');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html',require("ejs").__express);
app.set('view engine', 'html'); // 设置模板引擎为html

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // 阻止请求提高性能
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));
app.use(bodyParser.json({limit: '2mb'})); // json大小限制
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression()); // 开启gzip压缩

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串
    cookie: {maxAge: 60 * 1000 * 60 * 24} // 过期时间（毫秒）
}));

// 方便从前台获取session的值
app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});

app.use('/login', login);

// 登录验证
app.use(function(req,res,next){
    if (!req.session.user) {
        if(req.url=="/login"){
            next();//如果请求的地址是登录则通过，进行下一个请求
        }
       res.render('login');//否则跳转到登陆页面
    }else if (req.session.user) {
        next();
    }
});

app.use('/', index);
app.use('/gt', gt);
app.use('/plate', plate);
app.use('/logout', logout);
app.use('/admin', admin);
app.use('/user', user);
app.use('/menu', menu);
app.use('/device', device);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//启动web服务
// var server = app.listen(8083, function () {
//     var host = server.address().address;
//     var port = server.address().port;
//
//     console.log('Example app listening at http://%s:%s', host, port);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        logger.error(err, req.host+req.url);
        res.status(err.status || 500);
        res.render('error/error-500', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    logger.error(err, req.host+req.url);
    res.status(err.status || 500);
    res.render('error/error-500', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
