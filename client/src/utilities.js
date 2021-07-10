const crypto = require('crypto');

export const generateUID = () => {
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
};


export const aesKeyiv = () => {
	const key = crypto.randomBytes(16).toString('hex'); // 16 bytes -> 32 chars
    const iv = crypto.randomBytes(8).toString('hex');   // 8 bytes -> 16 chars

  return { key, iv };
};


export const encryptAES = (buffer, secretKey, iv) => {
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv);
  const data = cipher.update(buffer);
  const encrypted = Buffer.concat([data, cipher.final()]);
  return encrypted;
};


export const decryptAES = (buffer, secretKey, iv) => {
  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, iv);
  const data = decipher.update(buffer);
  const decrpyted = Buffer.concat([data, decipher.final()]);
  return decrpyted;
};


export const mergearrays = (arraylist) => {
	// Get the total length of all arrays.
	var length = 0;
	arraylist.forEach(item => {
	  length += item.length;
	});

	// Create a new array with total length and merge all source arrays.
	var mergedArray = new Uint8Array(length);
	var offset = 0;
	arraylist.forEach(item => {
	  mergedArray.set(item, offset);
	  offset += item.length;
	});

	return mergedArray;

};


export const urlBlob = (docbuffer,doctype) => {

	const blob = new Blob([docbuffer],{type:doctype});
    const srcBlob = window.URL.createObjectURL(blob);

    return srcBlob;

};


