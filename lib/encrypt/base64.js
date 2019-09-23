
/**
 * 使用base64加密信息.
 * 
 * @param {*} text 原文
 */
exports.encrypt = function(text) {
    return new Buffer(text).toString('base64');
}

/**
 * 使用base64解密信息.
 * 
 * @param {*} text 加密文本
 */
exports.decrypt = function(text) {
    return new Buffer(text, 'base64').toString();
}

/**
 * 加密ssr原文.其中加密后的ssr文本去掉末尾的等号, /需要转换为_, +需要替换为-.
 * 
 * @param {*} text ssr原文
 */
exports.encryptSsr = function(text) {
    var encryptText = this.encrypt(text);
    encryptText = encryptText.replace(/=/g, '');
    encryptText = encryptText.replace(/\//g, '_');
    encryptText = encryptText.replace(/\+/g, '-');
    return encryptText;
}

/**
 * 解密ssr加密文本.其中需要先替换_为/, 替换-为+, 然后才进行解密.
 * 
 * @param {*} text ssr加密文本
 */
exports.decryptSsr = function(text) {
    text = text.replace(/_/g, '/');
    text = text.replace(/-/g, '+');
    return this.decrypt(text);
}

