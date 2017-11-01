/**
 * 文件随机插入大量数据
 */


const loremipsum = require('lorem-ipsum');
const slug = require('slug');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.connect(config.db);
const db = mongoose.connection;
db.on('error', () => {
  throw new Error('unable to connect to database at ' + config.db);
});

const models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Category = mongoose.model('Category');

User.findOne(function (err, user) {
  if (err) {
    return console.log('cannot find user');
  }

  Category.find(function (err, categories) {
    if (err) {
      return console.log('cannot find categories');
    }
    categories.forEach(function (category) {
      for (var i = 0; i < 35; i++) {
        var title = loremipsum({
          count: 1,
          units: 'sentence'
        });
        var post = new Post({
          title: title,
          slug: slug(title),
          content: loremipsum({
            count: 30,
            units: 'sentence'
          }),
          category: category,
          author: user,
          published: true,
          meta: {
            favorites: 0
          },
          comments: [],
          created: new Date
        });

        post.save(function (err, post) {
          console.log('saved post: ', post.slug);
        });
      }

    });

  });
});
