const express = require('express');
const router = express.Router();


module.exports = (app) => {
  app.use('/', router);
};

router.get('/', (req, res, next) => {
	res.redirect('/posts');
});

 
router.get('/about', (req, res, next) => {
    res.render('blog/about', {
      title: '关于',
      pretty: true
    });
});

/**
 * 
 */
router.get('/contact', (req, res, next) => {
    res.render('blog/contact', {
      title: '联系',
      pretty: true
    });
});
