import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Fetch from 'i18next-fetch-backend';
import {isDevMode} from '@kayac/utils';

const detectorOptions = {
    // order and from where user language should be detected
    order: [
        'querystring',
        'cookie',
        'localStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain',
    ],

    // keys or params to lookup language from
    lookupQuerystring: 'lng',
    lookupCookie: 'i18next',
    lookupLocalStorage: 'i18nextLng',
    lookupFromPathIndex: 0,
    lookupFromSubdomainIndex: 0,

    // cache user language on
    caches: ['localStorage', 'cookie'],

    // optional expire and domain for set cookie
    cookieMinutes: 10,

    // optional htmlTag with lang attribute, the default is:
    htmlTag: document.documentElement,
};

function init(path) {
    return i18next
        .use(LanguageDetector)
        .use(Fetch)
        .init({
            debug: isDevMode(),

            fallbackLng: 'zh-TW',

            detection: detectorOptions,
            backend: {
                requestOptions: {
                    mode: 'cors',
                    credentials: 'same-origin',
                    cache: 'default',
                },
                loadPath: `${path}/{{lng}}/{{ns}}.json`,
            },

            ns: ['cyberpunk', 'common'],
            defaultNS: 'cyberpunk',
        });
}

export default {init};
