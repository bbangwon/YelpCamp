import joi from 'joi';

export const campgroundSchema = joi.object({
    title: joi.string().required(),
    price: joi.number().required().min(0),
    image: joi.string().required(),
    location: joi.string().required(),
    description: joi.string().required()
  });

export const reviewSchema = joi.object({
    body: joi.string().required(),
    rating: joi.number().required().min(1).max(5)
  });