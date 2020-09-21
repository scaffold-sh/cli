import IInfrastructureEnvVars from "./IInfrastructureEnvVars"

/**
 * Represents an infrastructure.
 * @property source_url The URL to the infrastructure source code zip.
 * @property source_container_folder_name The container folder name in infrastructure zip.
 */
interface IInfrastructure<T = IInfrastructureEnvVars> {
  readonly source_url: string;
  readonly source_container_folder_name: string;

  /**
   * Downloads and installs infrastructure.
   * @param inPath The path to install the infrastructure to.
   *
   * @returns Empty Promise object.
   */
  install(inPath: string): Promise<void>;

  /**
   * Configures a new environment.
   * @param configFilePath The path to the user config file.
   * @param defaults The environment variables default values.
   * @param hasGlobalEnv Do this infrastructure has a global environment?
   *
   * @returns Promise object representing configured environment variables.
   */
  configureEnv(configFilePath: string, defaults: Partial<T>, hasGlobalEnv: boolean): Promise<Partial<T>>;

  /**
   * Returns environment variables that need to be global.
   */
  globalEnvVars(): (keyof T)[];

  /**
   * Returns environment variables that need to be environment specific.
   */
  specificEnvVars(): (keyof T)[];

  /**
   * Returns URL to redirect user to after first install.
   */
  afterInstallURL(): string;
}

export default IInfrastructure
