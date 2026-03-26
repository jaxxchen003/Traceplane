import crypto from "node:crypto";

type PersistArtifactBlobInput = {
  workspaceId: string;
  projectId: string;
  episodeId: string;
  artifactKey: string;
  version: number;
  fileType: string;
  titleI18n: unknown;
  contentI18n: unknown;
};

type PersistArtifactBlobResult = {
  uri: string | null;
  storageMode: "inline" | "r2";
  warning?: string;
};

function sha256Hex(value: string | Buffer) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string, encoding?: crypto.BinaryToTextEncoding) {
  const digest = crypto.createHmac("sha256", key).update(value);
  return encoding ? digest.digest(encoding) : digest.digest();
}

function sign(secretKey: string, dateStamp: string, region: string, service: string, stringToSign: string) {
  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  return crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");
}

function getBlobPath(input: PersistArtifactBlobInput) {
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

async function putR2Object(key: string, body: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const bucket = process.env.R2_BUCKET!;
  const endpoint = process.env.R2_ENDPOINT!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

  const region = "auto";
  const service = "s3";
  const method = "PUT";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucket}/${key}`;
  const payloadHash = sha256Hex(body);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalHeaders =
    `content-type:application/json\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    canonicalUri,
    "",
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

  const url = `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
  const response = await fetch(url, {
    method,
    headers: {
      host,
      "content-type": "application/json",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: authorization
    },
    body
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed with ${response.status}: ${(await response.text()).slice(0, 240)}`);
  }

  return `r2://${bucket}/${key}`;
}

export async function persistArtifactBlob(
  input: PersistArtifactBlobInput
): Promise<PersistArtifactBlobResult> {
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
    return {
      uri,
      storageMode: "r2"
    };
  } catch (error) {
    return {
      uri: null,
      storageMode: "inline",
      warning: error instanceof Error ? error.message : String(error)
    };
  }
}
