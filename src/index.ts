import { Auth, HttpFunction } from "gcip-cloud-functions";
import { beforeCreateHandler } from "./handler/BeforeCreate";
import { beforeSignInHandler } from "./handler/BeforeSignIn";
import { wrapWithCorrelationLoggingMiddleware } from './middleware/logging-middleware';

const authClient = new Auth();

export const beforeCreate: HttpFunction = authClient.functions().beforeCreateHandler(wrapWithCorrelationLoggingMiddleware(beforeCreateHandler));
export const beforeSignIn: HttpFunction = authClient.functions().beforeSignInHandler(wrapWithCorrelationLoggingMiddleware(beforeSignInHandler));
