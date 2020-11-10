import extendError from '@namecheap/error-extender';

export const HttpError = extendError('HttpError');
export const NotFoundError = extendError('NotFoundError', {parent: HttpError});
