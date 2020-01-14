import * as singleSpa from 'single-spa';
import * as uuidv4 from 'uuid/v4';
import * as ejs from 'ejs/ejs.min.js';
import ApiPage500 from './ApiPage500';

const System = window.System;
const newrelic = window.newrelic;

// Initializing 500 error page to cache template of this page
// to avoid a situation when localhost can't return this template in future
const apiPage500 = new ApiPage500();
apiPage500.getTemplate()
    .then(() => console.log('500 error page template cached'))
    .catch((err) => {
        noticeError(err, {
            type: 'FETCH_PAGE_ERROR',
            name: err.toString(),
            extraInfo: {
                errorId: uuidv4(),
            },
        });
    });

const FRAGMENT_KIND = Object.freeze({
    primary: 'primary',
    essential: 'essential',
    regular: 'regular',
});

const selectFragmentKind = (registryConf, path, appName, slotName) => {
    const appKind = registryConf.apps[appName].kind;
    const slotKind = path.slots[slotName] && path.slots[slotName].kind;

    return slotKind || appKind;
}

const isEssentialOrPrimaryFragment = (fragmentKind) => [
    FRAGMENT_KIND.primary,
    FRAGMENT_KIND.essential,
].includes(fragmentKind);

export default function ({
    registryConf,
    getCurrentPath,
}) {
    singleSpa.addErrorHandler((err) => {
        if (!navigator.onLine) {
            return window.location.reload();
        }

        const errorId = uuidv4();
        const [appName, slotName] = err.appOrParcelName.split('__at__');

        const currentPath = getCurrentPath();
        const fragmentKind = selectFragmentKind(registryConf, currentPath, `@portal/${appName}`, slotName);

        if (isEssentialOrPrimaryFragment(fragmentKind)) {
            apiPage500.getTemplate()
                .then((data) => {
                    document.querySelector('html').innerHTML = ejs.render(data.template, {
                        errorId,
                    });
                })
                .catch((err) => {
                    alert('Something went wrong!');

                    noticeError(err, {
                        type: 'FETCH_PAGE_ERROR',
                        name: err.toString(),
                        extraInfo: {
                            errorId: uuidv4(),
                            fragmentErrorId: errorId,
                        },
                    });
                });
        }

        noticeError(err, {
            type: 'FRAGMENT_ERROR',
            name: err.toString(),
            moduleName: err.appName,
            extraInfo: {
                errorId,
            },
        })
    });

    window.addEventListener('error', function (event) {
        const moduleInfo = System.getModuleInfo(event.filename);
        if (moduleInfo === null) {
            return;
        }

        event.preventDefault();

        noticeError(event.error, {
            type: 'MODULE_ERROR',
            name: event.error.toString(),
            moduleName: moduleInfo.name,
            dependants: moduleInfo.dependants,
            stack: event.error.stack.split("\n"),
            location: {
                fileName: event.filename,
                lineNo: event.lineno,
                colNo: event.colno,
            }
        });
    });

    window.addEventListener('ilcFragmentError', function (event) {
        noticeError(event.detail.error, {
            type: 'FRAGMENT_ERROR',
            name: event.detail.error.toString(),
            moduleName: event.detail.moduleInfo.name,
            extraInfo: event.detail.extraInfo,
            stack: event.detail.error.stack.split("\n"),
        });
    });
}

function noticeError(err, errInfo = {}) {
    if (newrelic && newrelic.noticeError) {
        newrelic.noticeError(err, JSON.stringify(errInfo));
    }
    console.error(errInfo);
}
