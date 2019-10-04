var router = require('express').Router();

router.use('/', require('./users'));
router.use('/profiles', require('./profiles'));
router.use('/articles', require('./articles'));

router.use(function(err, req, res, next){
    if (err.name === 'ValidationError') {

        if (err.errors) {
            return res.status(422).send({
                errors: Object.keys(err.errors).reduce(function(errors, key) {
                    errors[key] = err.errors[key].message; 
    
                    return errors;
                }, {})
            })
        }
        else {
            return res.status(422).send({
                errors: err.message
            }); 
        }
    }

    return next(err);
});

module.exports = router;
