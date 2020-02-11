import uuidv4 from 'uuid/v4';
import {Request, Response, NextFunction} from 'express';

import noticeError from './noticeError';

async function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
    const errorId = uuidv4();

    noticeError(error, {
        errorId
    });

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.status(500).send('Internal server error occurred.');
};

export default errorHandler;
