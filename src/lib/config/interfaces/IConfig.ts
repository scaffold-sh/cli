/**
 * Represents the auth values received from API during login.
 * @param user_id The user ID as ObjectID.
 * @param access_token The API access token.
 * @param github_oauth_token The GitHub OAuth token.
 */
export interface IConfigAuth {
  user_id: string;
  access_token: string;
  github_oauth_token: string;
}

/**
 * Represents the stored user config file content.
 * @param auth The auth values received from API during login.
 */
interface IConfig {
  auth?: IConfigAuth;
}

export default IConfig
