var mongoose = require('mongoose');
var uniqueValidate = require('mongoose-unique-validator');
var slug = require('slug');

var ArticleSchema = mongoose.Schema({
    slug: {type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: {type: Number, default: 0},
    tagList: [{type: String}],
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}  
}, {timestamp: true});

ArticleSchema.plugin(uniqueValidate, {message: 'already taken'});

mongoose.model('Article', ArticleSchema);

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
      author: this.author.toProfileJSONFor(user)
    };
  };