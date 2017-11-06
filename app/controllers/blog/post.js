const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Category = mongoose.model('Category');

module.exports = (app) => {
  app.use('/posts', router);
};

router.get('/', (req, res, next) => {

  var conditions = { published: true };

  if (req.query.keyword) {
      conditions.title = new RegExp(req.query.keyword.trim(), 'i');
      conditions.content = new RegExp(req.query.keyword.trim(), 'i');
  }

  Post.find(conditions)
    .sort('-created')
    .populate('author')
    .populate('category')
    .exec((err, posts) => {

      if (err) return next(err);

      var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
      var pageSize = 10;

      var totalCount = posts.length;
      var pageCount = Math.ceil(totalCount / pageSize);

      if (pageNum > pageCount) {
        pageNum = pageCount;
      }


      res.render('blog/index', {
        posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
        pageNum: pageNum,
        pageCount: pageCount,
        pretty: true,
      });
    });
});

/**
 * 获取当前分类下的所有的文章
 */
router.get('/category/:name', (req, res, next) => {
  // res.jsonp(req.params);
  Category.findOne({
    name: req.params.name
  }).exec((err, category) => {
    if (err) {
      return next(err);
    }

    Post.find({
      category: category,
      published: true
    })
      .sort('created')
      .populate('category')
      .populate('author')
      .exec((err, posts) => {
        if (err) {
          return next(err);
        }

        console.log(category);
        res.render('blog/category', {
          posts: posts,
          category: category,
          pretty: true,
        });
      });

  });
});

/**
 * 获取当前文章的详情
 */
router.get('/view/:id', (req, res, next) => {
  // res.jsonp(req.params);
  // 如果没有文章id，返回错误提示
  if (!req.params.id) {
    return next(new Error('no post id provided'));
  }
  var conditions = {};
  try {
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    conditions.slug = req.params.id;
  }
  // 数据库查找数据  // _id: req.params.id
  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec((err, post) => {
      if (err) {
        return next(err);
      }

      res.render('blog/view', {
        post: post,
      })
    });
});
/**
 * 点赞
 */
router.get('/favorite/:id', (req, res, next) => {
  // 如果没有文章id，返回错误提示
  if (!req.params.id) {
    return next(new Error('no post id provided'));
  }

  var conditions = {};
  try {
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    conditions.slug = req.params.id;
  }

  // 数据库查找数据  // _id: req.params.id
  Post.findOne(conditions)
    .populate('category')
    .populate('author')
    .exec((err, post) => {
      if (err) {
        return next(err);
      }

      post.meta.favorite = post.meta.favorite ? post.meta.favorite + 1 : 1;
      post.markModified('meta');
      post.save((err) => {
        res.redirect('/posts/view/' + post.slug);
      });


    });
});

/**
 * 评论
 */
router.post('/comment/:id', (req, res, next) => {
  if (!req.body.email) {
    return next(new Error('no email provided for commenter'));
  }
  if (!req.body.content) {
    return next(new Error('no content provided for commenter'));
  }

  var conditions = {};
  try {
    conditions._id = mongoose.Types.ObjectId(req.params.id);
  } catch (err) {
    conditions.slug = req.params.id;
  }

  Post.findOne(conditions).exec((err, post) => {
    if (err) {
      return next(err);
    }

    var comment = {
      email: req.body.email,
      content: req.body.content,
      created: new Date(),
    };

    post.comments.unshift(comment);
    post.markModified('comments');

    post.save((err, post) => {
      req.flash('info', '评论添加成功')
      res.redirect('/posts/view/' + post.slug);
    });
  });
});
