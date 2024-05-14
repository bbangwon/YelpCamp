import BaseJoi from 'joi';
import sanitizeHtml from 'sanitize-html';

const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.escapeHTML': '{{#label}}에는 HTML을 작성할 수 없습니다.'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, { 
          allowedTags: [], 
          allowedAttributes: {},
        });
        if (clean !== value) {
          return helpers.error('string.escapeHTML', { value });
        }
        return clean;
      }
    }  
  }
});

const joi = BaseJoi.extend(extension);

export const campgroundSchema = joi.object({
    title: joi.string().required().escapeHTML(),
    price: joi.number().required().min(0),
    location: joi.string().required().escapeHTML(),
    description: joi.string().required().escapeHTML(),
    deleteImages: joi.alternatives().try(joi.array(), joi.string())
  });

export const reviewSchema = joi.object({
    body: joi.string().required().escapeHTML(),
    rating: joi.number().required().min(1).max(5)
  });