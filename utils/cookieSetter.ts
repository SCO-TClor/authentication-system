import * as http from 'http';

type expireTime = 'd' | 'h' | 'm';
enum expTimeEnum {
    day = 'd',
    hour = 'h',
    minute = 'm'
};

function timeMatcher(
    time: expireTime,
    expire: number
) {
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;

    if(time === expTimeEnum.minute) {
        return expire * minute;

    } else if(time === expTimeEnum.hour) {
        return expire * hour;

    } else if(time === expTimeEnum.day) {
        return expire * day;
    } else {
        throw new Error('CookieSetter time defined wrongly!');
    };
};

function setCookies(
    res: http.ServerResponse,
    name: string,
    cookie_value: string,
    time: expireTime,
    expire: number,
    path: string = '/',
    secured: boolean = false
) {
    const exp: number = timeMatcher(time, expire);

    const lastOnes = res.getHeader('Set-Cookie');

    const secure = secured ? ' Secure;' : '';

    const SameSite = secured ?  'SameSite=None;' : 'SameSite=Lax;';

    console.log(`Cookie setted: '${name}'`);
    console.log(SameSite);

    if(!lastOnes) {
        res.setHeader(`Set-Cookie`, `${name}=${cookie_value}; Path=${path}; HttpOnly;${secure} ${SameSite} Max-Age=${exp}`);
    } else if(Array.isArray(lastOnes)) {
        res.setHeader(`Set-Cookie`, [...lastOnes,`${name}=${cookie_value}; Path=${path}; HttpOnly;${secure} ${SameSite} Max-Age=${exp}`]);
    } else {
        const lastCookie = lastOnes?.toString();
        res.setHeader(`Set-Cookie`, [lastCookie,`${name}=${cookie_value}; Path=${path}; HttpOnly;${secure} ${SameSite} Max-Age=${exp}`]);
    };
};

export { setCookies };