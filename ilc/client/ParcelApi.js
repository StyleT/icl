import {flattenFnArray} from './utils';
import {Intl as IlcIntl} from 'ilc-sdk/app';

export default class ParcelApi {
    #registryConf;
    #bundleLoader;
    #getAppSdkAdapter;

    constructor(registryConf, bundleLoader, getAppSdkAdapter) {
        this.#registryConf = registryConf;
        this.#bundleLoader = bundleLoader;
        this.#getAppSdkAdapter = getAppSdkAdapter;
    }

    importParcelFromApp = async (appName, parcelName) => {
        const app = this.#registryConf.apps[appName];
        if (!app) {
            throw new Error(`Unable to find requested app "${appName}" in Registry`);
        }

        const appBundle = await this.#bundleLoader.loadApp(appName);

        if (!appBundle.parcels || !appBundle.parcels[parcelName]) {
            throw new Error(`Looks like application "${appName}" doesn't export requested parcel: ${parcelName}`);
        }

        let parcelCallbacks = appBundle.parcels[parcelName];

        let intlInstances = {};
        return this.#propsInjector(parcelCallbacks, (props, lifecycleType) => {
            let intlForUnmount;
            if (lifecycleType === 'unmount') {
                intlForUnmount = intlInstances[props.name];
                delete intlInstances[props.name]; // We delete reference on unmount to cleanup memory

                if (intlForUnmount) {
                    intlForUnmount.unmount();
                }
            } else if (!intlInstances[props.name]) {
                const adapter = this.#getAppSdkAdapter(props.name);
                intlInstances[props.name] = new IlcIntl(props.name, adapter.intl);
            }


            return {
                parcelSdk: {
                    parcelId: props.name,
                    registryProps: app.props,
                    intl: intlInstances[props.name] || intlForUnmount,
                },
            };
        });
    };

    #propsInjector = (callbacks, extraPropsCb) => {
        for (let lifecycle in callbacks) {
            if (!callbacks.hasOwnProperty(lifecycle)) {
                continue;
            }

            const callback = flattenFnArray(callbacks, lifecycle);
            callbacks[lifecycle] = (props) => callback({...props, ...extraPropsCb(props, lifecycle)});
        }

        return callbacks;
    }
}
