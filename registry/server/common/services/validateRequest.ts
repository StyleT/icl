import {
    Request,
    Response,
} from 'express';
import Joi from 'joi';
import _ from 'lodash';
import {joiErrorToResponse} from '../../util/helpers';

interface ValidationConfig {
    schema: Joi.Schema,
    selector: string,
}

const validateRequestFactory = (validationConfig: ValidationConfig[]) => async (
    req: Request,
    res: Response,
    next: any,
) => {
    try {
        await Promise.all(_.map(
            validationConfig,
            async ({schema, selector}) => {
                const validObj = await schema.validateAsync(_.get(req, selector), {abortEarly: false});
                _.set(req, selector, validObj);
            }
        ));
        next();
    } catch (e) {
        res.status(422);
        if (e instanceof Joi.ValidationError) {
            res.send(joiErrorToResponse(e));
        } else {
            console.error(e);
            res.send('Unexpected validation error');
        }
    }
};

export default validateRequestFactory
