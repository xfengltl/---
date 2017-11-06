const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const md5 = require('md5');
const User = mongoose.model('User');
const passport = require('passport');

module.exports = (app) => {
    app.use('/admin/users', router);
}

module.exports.requireLogin = (req, res, next) => {
    if (req.user) {
        next();
    }else{
        req.flash('error', '只有登录用户才能访问');
        res.redirect('/admin/users/login');
        // next(new Error('只有登录用户才能访问'));
    }
}
router.get('/login', (req, res, next) => {
    res.render('admin/user/login', {
        pretty: true,
    });
});


router.post('/login', passport.authenticate('local', {
    failureRedirect: '/admin/users/login',
    failureFlash: '用户名或密码错误',
}), (req, res, next) => {
    console.log('user login success: ', req.body);
    res.redirect('/admin/posts');
});

router.get('/register', (req, res, next) => {
    res.render('admin/user/register', {
        pretty: true,
    });
});


router.post('/register', (req, res, next) => {
    //  res.jsonp(req.body);
    req.checkBody('email', '邮箱不能为空').notEmpty();
    req.checkBody('password', '密码不能为空').notEmpty();
    req.checkBody('confirmPassword', '两次密码不匹配').notEmpty().equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        return res.render('admin/user/register', req.body);
    }

    var user = new User({
        name: req.body.email.split('@').shift(),
        email: req.body.email,
        password: md5(req.body.password),
        created: new Date(),
    });

    user.save((err, user) => {
        if (err) {
            console.log('admin/user/register error: ', err);
            req.flash('error', '用户注册失败');
            res.render('admin/user/register');
        } else {
            req.flash('info', '用户注册成功');
            res.redirect('/admin/users/login');
        }
    });

});

/**
 * 用户注销
 */
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});


/**
 * 密码修改
 */
router.get('/password', (req, res, next) => {
    res.render('admin/user/password', {
        pretty: true,
    });
});

router.post('/password', passport.authenticate('local', {
    failureRedirect: '/admin/users/password',
    failureFlash: '用户名或密码错误',
}), (req, res, next) => {
    console.log('user login success: ', req.body);
    res.redirect('/admin/posts');
});
