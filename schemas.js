import joi from 'joi';

export const campgroundSchema = joi.object({
    title: joi.string().required(),
    price: joi.number().required().min(0),
    location: joi.string().required(),
    description: joi.string().required(),
    deleteImages: joi.alternatives().try(joi.array(), joi.string())
  });

export const reviewSchema = joi.object({
    body: joi.string().required(),
    rating: joi.number().required().min(1).max(5)
  });