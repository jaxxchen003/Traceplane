import crypto from "node:crypto";

import "./_lib/load-env.mjs";

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key, value, encoding) {
  return crypto.createHmac("sha256", key).update(value).digest(encoding);
}

function sign(secretKey, dateStamp, region, service, stringToSign) {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  return crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
}

async function main() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing one or more required R2 environment variables");
  }

  const region = "auto";
  const service = "s3";
  const method = "GET";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucket}`;
  const canonicalQueryString = "list-type=2&max-keys=1";
  const payloadHash = sha256Hex("");

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");

  const signature = sign(secretAccessKey, dateStamp, region, service, stringToSign);
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `${endpoint.replace(/\/$/, "")}/${bucket}?${canonicalQueryString}`;
  const response = await fetch(url, {
    method,
    headers: {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`R2 verification failed with ${response.status}: ${text.slice(0, 240)}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        bucket,
        endpoint,
        status: response.status
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      },
      null,
      2
    )
  );
  process.exit(1);
});
