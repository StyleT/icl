import {
    Request,
    Response,
} from 'express';

import db from '../../db';
import App from '../interfaces';
import preProcessResponse from '../../common/services/preProcessResponse';

const getApps = async (req: Request, res: Response): Promise<void> => {
    const apps = await db.select().from<App>('apps');

    res.status(200).send(preProcessResponse(apps));
};

export default getApps;
