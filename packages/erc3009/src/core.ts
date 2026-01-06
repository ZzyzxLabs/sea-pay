/**
 * Core ERC-3009 namespace with all builder functions
 */
import {
  buildTypes,
  buildMessage,
  buildMessageWithTTL,
  buildTypedData,
  signTransferWithAuthorization,
  recoverSigner,
  verifySignature,
} from "./erc3009/index.js";

export const erc3009 = {
  buildTypes,
  buildMessage,
  buildMessageWithTTL,
  buildTypedData,
  sign: signTransferWithAuthorization,
  recoverSigner,
  verifySignature,
} as const;

