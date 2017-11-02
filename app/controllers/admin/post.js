const express = require('express');

const router = express.Router();
const slug = require('slug');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const User = mongoose.model('User');
const Category = mongoose.model('Category');

module.exports = (app) => {
    app.use('/admin/posts', router);
};

router.get('/', (req, res, next) => {
    //sort
    var sortby = req.query.sortby ? req.query.sortby : 'created';
    var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';

    if (['title', 'category', 'author', 'created', 'published'].indexOf(sortby) === -1) {
        sortby = 'created';
    }

    if (['desc', 'asc'].indexOf(sortdir) === -1) {
        sortdir = 'desc';
    }

    var sortobj = {};
    sortobj[sortby] = sortdir;

    var conditions = {};
    if (req.query.category) {
        conditions.category = req.query.category.trim();
    }
    if (req.query.author) {
        conditions.author = req.query.author.trim();
    }

    User.find({}, (err, authors) => {
        Post.find(conditions)
            .sort(sortobj)
            .populate('author')
            .populate('category')
            .exec((err, posts) => {
                // return res.jsonp(posts);
                if (err) return next(err);

                var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
                var pageSize = 10;

                var totalCount = posts.length;
                var pageCount = Math.ceil(totalCount / pageSize);

                if (pageNum > pageCount) {
                    pageNum = pageCount;
                }
                res.render('admin/post/index', {
                    posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
                    pageNum: pageNum,
                    pageCount: pageCount,
                    authors: authors,
                    sortdir: sortdir,
                    sortby: sortby,
                    pretty: true,
                    filter: {
                        category: req.query.category || "",
                        author: req.query.author || "",
                    }
                });
            });
    })
});

router.get('/add', (req, res, next) => {
    res.render('admin/post/add', {
        action: "/admin/posts/add",
        pretty: true,
        post: {
            category: { _id: '' },
        },
    });
});

router.post('/add', (req, res, next) => {
    // res.jsonp(req.body);

    var title = req.body.title.trim();
    var category = req.body.category.trim();
    var content = req.body.content;

    User.findOne({}, function (err, author) {
        if (err) {
            return next(err);
        }
        var post = new Post({
            title: title,
            slug: slug(title),
            category: category,
            content: content,
            author: author,
            published: true,
            meta: { favorite: 0 },
            comments: [],
            created: new Date(),
        });

        post.save((err, post) => {
            if (err) {
                console.log('post/add error:', err);
                req.flash('error', '文章发布失败');
                res.redirect('/admin/posts/add');
            } else {
                req.flash('info', '文章发布成功');
                res.redirect('/admin/posts');
            }
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
    Post.remove({
        _id: req.params.id
    }).exec((err, rowsRemoved) => {
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
