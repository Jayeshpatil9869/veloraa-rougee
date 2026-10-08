import { createHash, timingSafeEqual } from 'node:crypto';

export function sha512(value: string) {
  return createHash('sha512').update(value).digest('hex');
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left.toLowerCase());
  const b = Buffer.from(right.toLowerCase());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** PayU request hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt */
export function payuRequestHash(input: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  salt: string;
}) {
  return sha512(
    [
      input.key,
      input.txnid,
      input.amount,
      input.productinfo,
      input.firstname,
      input.email,
      input.udf1 ?? '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      input.salt,
    ].join('|'),
  );
}

/** Reverse hash. additionalCharges, when present, is prefixed. */
export function payuResponseHash(input: {
  key: string;
  salt: string;
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
}) {
  const sequence = [
    input.salt,
    input.status,
    '',
    '',
    '',
    '',
    '',
    input.udf5 ?? '',
    input.udf4 ?? '',
    input.udf3 ?? '',
    input.udf2 ?? '',
    input.udf1 ?? '',
    input.email,
    input.firstname,
    input.productinfo,
    input.amount,
    input.txnid,
    input.key,
  ];
  if (input.additionalCharges) sequence.unshift(input.additionalCharges);
  return sha512(sequence.join('|'));
}

export function verifyPayuHash(body: Record<string, string>, key: string, salt: string) {
  const expected = payuResponseHash({
    key,
    salt,
    status: body.status ?? '',
    txnid: body.txnid ?? '',
    amount: body.amount ?? '',
    productinfo: body.productinfo ?? '',
    firstname: body.firstname ?? '',
    email: body.email ?? '',
    udf1: body.udf1,
    udf2: body.udf2,
    udf3: body.udf3,
    udf4: body.udf4,
    udf5: body.udf5,
    additionalCharges: body.additionalCharges,
  });
  if (!body.hash) return false;
  return safeEqual(expected, body.hash);
}

export function payuVerifyCommandHash(key: string, txnid: string, salt: string) {
  return sha512(`${key}|verify_payment|${txnid}|${salt}`);
}

export function amountToPaise(amount: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}
