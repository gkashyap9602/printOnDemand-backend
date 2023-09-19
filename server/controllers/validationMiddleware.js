const helperFunction = require("../services/helper/index");

module.exports = function (schema) {

    return function (req, res, next) {
        try {
            if (schema.body) {
                console.log(req.body,"reqbody")
                const { error, value } = schema.body.validate(req.body);
                if (error) throw error;
                req.body = value;
                next()
            }
            else if(schema.query) {
                const { error, value } = schema.query.validate(req.query);
                if (error) throw error;
                req.query = value;
                next()
            }
            else {
                const { error, value } = schema.params.validate(req.params);
                if (error) throw error;
                req.params = value;
                next()
            }
        } catch (error) {
            return helperFunction.validationError(res, error);
        }
    }
}