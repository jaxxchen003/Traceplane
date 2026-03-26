import crypto from "node:crypto";

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

function getBlobPath(input) {
  return [
    "workspaces",
    input.workspaceId,
    "projects",
    input.projectId,
    "episodes",
    input.episodeId,
    "artifacts",
    input.artifactKey,
    `v${input.version}.json`
  ].join("/");
}

function isR2Configured() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.R2_BUCKET &&
      process.env.R2_ENDPOINT &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY
  );
}

function getR2Host() {
  return `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

function getR2EndpointUrl() {
  return process.env.R2_ENDPOINT.replace(/\/$/, "");
}

function getAuthHeaders({ method, key, payloadHash, contentType = "application/json" }) {
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const region = "auto";
  const service = "s3";
  const host = getR2Host();
  const canonicalUri = `/${bucket}/${key}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256Hex(canonicalRequest)].join("\n");
  const signature = sign(secretAccessKey, dateStamp, region, service, stringToSign);
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `${getR2EndpointUrl()}/${bucket}/${key}`,
    headers: {
      host,
      "content-type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization
    }
  };
}

async function putR2Object(key, body) {
  const method = "PUT";
  const payloadHash = sha256Hex(body);
  const { url, headers } = getAuthHeaders({ method, key, payloadHash });
  const response = await fetch(url, {
    method,
    headers,
    body
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed with ${response.status}: ${(await response.text()).slice(0, 240)}`);
  }

  return `r2://${process.env.R2_BUCKET}/${key}`;
}

function parseR2Uri(uri) {
  const normalized = uri.replace(/^r2:\/\//, "");
  const [bucket, ...segments] = normalized.split("/");
  return {
    bucket,
    key: segments.join("/")
  };
}

async function readR2Object(uri) {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured");
  }

  const { bucket, key } = parseR2Uri(uri);
  if (!bucket || !key) {
    throw new Error(`Invalid R2 URI: ${uri}`);
  }

  if (bucket !== process.env.R2_BUCKET) {
    throw new Error(`R2 URI bucket mismatch: ${bucket}`);
  }

  const method = "GET";
  const payloadHash = sha256Hex("");
  const { url, headers } = getAuthHeaders({ method, key, payloadHash });
  const response = await fetch(url, {
    method,
    headers
  });

  if (!response.ok) {
    throw new Error(`R2 read failed with ${response.status}: ${(await response.text()).slice(0, 240)}`);
  }

  return {
    contentType: response.headers.get("content-type") || undefined,
    body: Buffer.from(await response.arrayBuffer())
  };
}

export async function persistArtifactBlob(input) {
  if (!input.contentI18n) {
    return { uri: null, storageMode: "inline" };
  }

  if (!isR2Configured()) {
    return { uri: null, storageMode: "inline" };
  }

  const key = getBlobPath(input);
  const payload = JSON.stringify(
    {
      artifactKey: input.artifactKey,
      version: input.version,
      fileType: input.fileType,
      titleI18n: input.titleI18n,
      contentI18n: input.contentI18n,
      storedAt: new Date().toISOString()
    },
    null,
    2
  );

  try {
    const uri = await putR2Object(key, payload);
    return { uri, storageMode: "r2" };
  } catch (error) {
    return {
      uri: null,
      storageMode: "inline",
      warning: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function readArtifactBlob(uri) {
  if (!uri || !uri.startsWith("r2://")) {
    return null;
  }

  const response = await readR2Object(uri);
  return JSON.parse(response.body.toString("utf8"));
}
