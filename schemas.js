const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });

                if (clean !== value)
                    return helpers.error("string.escapeHTML", { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// THIS IS NOT A MONGOOSE SCHEMA, this just validates the data BEFORE we attempt to save it with mongoose
// ALSO, we only see this info if we get past the client-side validation.
// This is a pattern for a js object
module.exports.campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().escapeHTML().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().escapeHTML().required(),
        description: Joi.string().escapeHTML().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewJoiSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().escapeHTML().required()
    }).required()
});
