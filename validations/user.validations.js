const Joi = require('joi');

const createUserValidation = (data) =>  {
    const userSchema =  Joi.object({
        surname: Joi.string().required(),
        othernames: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
    return userSchema.validate(data)
}


module.exports = {
    createUserValidation
}