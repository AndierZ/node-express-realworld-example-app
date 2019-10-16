var mongoose = require('mongoose');
var uniqueValidate = require('mongoose-unique-validator');
var slug = require('slug');
var User = mongoose.model('User');

var ArticleSchema = mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: {type: Number, default: 0},
    tagList: [{type: String}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}  
}, {timestamp: true});

ArticleSchema.plugin(uniqueValidate, {message: 'already taken'});

ArticleSchema.methods.slugify = function(){
    this.slug = slug(this.title) + "-" + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

ArticleSchema.pre('validate', function(next){
    if(!this.slug) {
        this.slugify();
    }

    next();
});

ArticleSchema.methods.toJSONFor = function(user){
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: this.tagList,
      favoritesCount: this.favoritesCount,
      author: this.author.toProfileJSONFor(user),
      favorited: user ? user.isFavorite(this._id) : false
    };
  };

  ArticleSchema.methods.updateFavoriteCount = function() {
    var article = this;
    return User.count({favorites: {$in: [article._id]}}).then(function(count) {
        article.favoritesCount = count;
        return article.save();
    });
  };

  // has to be placed at the bottom
  mongoose.model('Article', ArticleSchema);