/**
 * Represents the auth values received from API during login.
 * @param accessToken The API access token.
 * @param githubOauthToken The GitHub OAuth token.
 * @param userId The user ID as ObjectID.
 */
export interface IConfigAuth {
  accessToken: string;
  githubOauthToken: string;
  userId: string;
}

/**
 * Represents the stored user config file content.
 * @param auth The auth values received from API during login.
 */
interface IConfig {
  auth?: IConfigAuth;
}

export default IConfig
