import Joi from 'joi';

export const postBookingSchema = Joi.object({
    roomId: Joi.number().required()
})