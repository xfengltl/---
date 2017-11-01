const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');

module.exports = (app) => {
	app.use('/admin/posts', router);
};

router.get('/', (req, res, next) => {
	Post.find().populate('author').populate('category').exec((err, posts) => {
		// return res.jsonp(posts);
		if (err) return next(err);

		var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
		var pageSize = 10;

		var totalCount = posts.length;
		var pageCount = Math.ceil(totalCount / pageSize);

		if (pageNum > pageCount) {
			pageNum = pageCount;
		}
		console.log('页数'+ pageCount);
		res.render('admin/post/index', {
			posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
			pageNum: pageNum,
			pageCount: pageCount,
			pretty: true,
		});
	});
});


router.get('/edit/:id', (req, res, next) => {

});


router.post('/edit/:id', (req, res, next) => {

});

/**
 * delete 
 */
router.get('/delete/:id', (req, res, next) => {
	if (!req.params.id) {
		return next(new Error('no post id provided'));
	}

	console.log('删除文章');
	Post.remove({ _id: req.params.id}).exec((err,rowsRemoved )=> {
		if (err) {
			return next(err);
		}

		if (rowsRemoved) {
			req.flash('success', '文章删除成功');
		} else {
			req.flash('success', '文章删除失败');
		}

		res.redirect('/admin/posts');
	});

	
});

