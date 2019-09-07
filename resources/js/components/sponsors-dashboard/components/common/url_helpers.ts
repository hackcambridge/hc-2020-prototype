
export function validURL(url: string) {
    const urlTest = /(http[s]?:\/\/)?[^\s(["<,>]*\.[^\s[",><]*/;
    return urlTest.test(url);
}

export function extractHostname(url: string) {
    var hostname;
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}