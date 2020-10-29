import _ from 'lodash/fp';

import preProcessResponse from '../../common/services/preProcessResponse';

const prepareRouteToRespond = (appRoute: any) => {
    return preProcessResponse({
        id: appRoute.routeId,
        route: appRoute.route,
        next: Boolean(appRoute.next),
        specialRole: appRoute.specialRole,
        templateName: appRoute.templateName,
        orderPos: appRoute.orderPos,
    });
}

const prepareRoutesWithSlotsToRespond = _.compose(
    _.toArray,
    _.reduce((appRoutes: any, appRoute: any) => {
        const {
            routeId,
            name,
            appName,
            props,
            kind,
        } = appRoute;

        const prevSavedAppRouteSlots = _.has(routeId, appRoutes) && appRoutes[routeId].slots || {};
        const nextAppRouteSlot = {
            appName,
            props,
            kind,
        };

        const slots = { ...prevSavedAppRouteSlots };
        if (name) {
            slots[name] = preProcessResponse(nextAppRouteSlot);
        }

        return {
            ...appRoutes,
            [routeId]: {
                ...prepareRouteToRespond(appRoute),
                slots
            }
        };
    }, {}),
);

export const prepareAppRouteToRespond = _.compose(
    _.first,
    prepareRoutesWithSlotsToRespond,
);

export const prepareAppRoutesToRespond = (v: any[]) => v.map(row => prepareRouteToRespond(row))

