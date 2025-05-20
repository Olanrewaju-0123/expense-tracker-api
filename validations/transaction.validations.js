const Joi = require("joi");

const createTransactionValidation = (data) => {
  const transactionSchema = Joi.object({
    amount: Joi.number().required(),
    transaction_type: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    date: Joi.string().required(),
  });

  return transactionSchema.validate(data);
};

module.exports = {
  createTransactionValidation,
};
