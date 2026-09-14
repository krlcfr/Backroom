const forge = require('node-forge');
const fs = require('fs');

console.log('Generando par de claves...');
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'Backroom Test Certificate'
}, {
  name: 'countryName',
  value: 'CO'
}, {
  shortName: 'ST',
  value: 'Bogota'
}, {
  name: 'localityName',
  value: 'Bogota'
}, {
  name: 'organizationName',
  value: 'Backroom Testing'
}, {
  shortName: 'OU',
  value: 'Testing Dept'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// self-sign certificate
console.log('Firmando certificado...');
cert.sign(keys.privateKey);

// create PKCS12
console.log('Generando archivo .p12...');
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  keys.privateKey, [cert], 'password123',
  { generateLocalKeyId: true, friendlyName: 'test-cert' }
);
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

fs.writeFileSync('test-cert.p12', p12Der, 'binary');
console.log('¡Certificado generado exitosamente!');
console.log('Archivo: test-cert.p12');
console.log('Contraseña: password123');
