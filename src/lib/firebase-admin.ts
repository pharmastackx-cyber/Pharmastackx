
import * as admin from 'firebase-admin';

// Service account key from Firebase Console, formatted for the SDK
const serviceAccount = {
  type: "service_account",
  projectId: "pharmastackx-a3beb",
  privateKeyId: "3e4e5fd673835aab2501b18f4cecf3801b87f77b",
  privateKey: "-----BEGIN PRIVATE KEY-----\n" +
    "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxuQiyzg+XAve6\n" +
    "6+ef8j1hkJqeR+Q+Ai6l/4ebK9BT5zq6iOH231r77SHYQg1GQtD+DlVhinYOPoVQ\n" +
    "dM0gvh8lM4KmeY7Go1zCvYHWsDZrWvOzW7u3luELWz/V2V54VeVk0n6sqfLEWb8g\n" +
    "lg+8gha63+QO53Xj0JKeBrvD8VyMkNHFQV0DRl75buAlIclGenWq1T7WN29JMNPG\n" +
    "iHvmWQFY91BCfOdL/takSe5oI3CADel4lNEjyvF8UV10KFjPZeyuGI7lQUCVSa76\n" +
    "vbqKc1Oic7mB4godgiGQ8J+GmmPFfOeVT4h7at6+kMbNhVK6/g7w2yzXnIi5jT6C\n" +
    "5nFM8i1JAgMBAAECggEABeuJvQ5iVGUH1F0XhWCynOgjT7qfLACdxgT4eFmx3MWi\n" +
    "/hk2sRGjdykLm6em8mGh6BXupVXmf6wjUTje0g8l5vLruyNpTI0fDH6hugF7LUF6\n" +
    "740n+DeJWLvp/l6Oss1RBkuBEZEvXM03hxHwmsEuRCcr8ozRGhe1y+1MqRGGbsk1\n" +
    "oQVbrghUL5oWKOTDpdxflA8Bjxl0nzI/idvMLqx/0q+SLJwlYItyFawH15YsCKb0\n" +
    "JITw/oqEGboO9D1mLzHRKbWucP/LZwL/hESAOJz32XOK6YUessIdxfKiH8xvWUq/\n" +
    "fR21XwNAmvZgEumwBdB6mOO5nKKW825gWquSPKlsAQKBgQDesjBgHVD+36IzS5KQ\n" +
    "2uMfHibg2FcIzUbrHm4Ks++Zt0+gzhNLE5EmnGGQGxAf+trAN3tteZqx+j2/YXzk\n-JrkAixfWqL9Rfk8sJtFB8/bLYSeFDz24FRlcrB7yMCMNl5Lok84DzeJzC4nY6vs\n" +
    "IeEd2X91e0ieOfwfRDbdJy8KAQKBgQDMTRC61QM8Zs+V/sVS3lUyop6PxyurIoYe\n" +
    "J/2XETRQNJ7WpiTz8Rzi64aWQxEwjAqzCNJOLZBDE2YLJ0Har3QgrbMoUXj5bRJ8\n" +
    "6PfsHt9WwJ808hoelEKYN7pF1bAeDEn5ZXVYsXhlpEdutG26vFnhmSwbOn4fFuED\n" +
    "wp47/EpTSQKBgEAzwvqSuR0hwBNlwDV+xWfdO3wrIrxo4f864KK5SWRZkt1bS/ij\n" +
    "BX/KKd5vzvBJU/OCi1T+b/jLmi2on2cqldUSQ1SiPsch+z7h84GtROF9d/RTBVhv\n" +
    "SCWPMQ4ezFQgAINxocEZsftKICw+8fu7sLj4UWS/TCpBsUwaUG7lswwBAoGAU/pd\n" +
    "pR7ITLzKGZL3E4A2rzCvUtSA+8CeNqkjkUROJ6XpoLv8tpVm1VQRJ5T77OOzxjIb\n" +
    "GG2cPiYsLOt/I2A5sPEVkr4ipwyRq+yrdFCgZ22YQ9A8slMpKJ7Hn8sdsMxGYBC3\n" +
    "crTIk6c6gaQC8t5XZ+dpfOvHSgpChiQqnOewuZkCgYA+aA653ayteQZcEYTsq20c\n" +
    "Lx6fLFyUz9u4/DSyZXB1fN3weK/ob8zDd/FHFP6GpNLYfIqrg6pzpW2tCLtihZT5\n" +
    "RDW6oKGc1F8YTQky1R00s9U5WDThsKcgEnHPlB2+IXYCPc2ClCkqmLCSvg0SCtmc\n" +
    "GKtinZzZImShCqQKprVNpg==\n" +
    "-----END PRIVATE KEY-----\n",
  clientEmail: "firebase-adminsdk-fbsvc@pharmastackx-a3beb.iam.gserviceaccount.com",
  clientId: "106603777206330979643",
  authUri: "https://accounts.google.com/o/oauth2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
  clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40pharmastackx-a3beb.iam.gserviceaccount.com",
  universeDomain: "googleapis.com"
} as admin.ServiceAccount;

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * Returns the initialized Firebase Admin SDK instance.
 * @returns {admin.app.App} The Firebase Admin SDK instance.
 */
export function getFirebaseAdmin() {
  return admin;
}
