import IInfrastructureEnvVars from "./IInfrastructureEnvVars"

/**
 * Represents an infrastructure.
 * @property sourceUrl The URL to the infrastructure source code zip.
 * @property sourceContainerFolderName The container folder name in infrastructure zip.
 */
interface IInfrastructure<T = IInfrastructureEnvVars> {
  readonly sourceContainerFolderName: string;
  readonly sourceUrl: string;

  /**
   * Returns URL to redirect user to after first install.
   */
  afterInstallURL(): string;

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
   * Downloads and installs infrastructure.
   * @param inPath The path to install the infrastructure to.
   *
   * @returns Empty Promise object.
   */
  install(inPath: string): Promise<void>;

  /**
   * Returns environment variables that need to be environment specific.
   */
  specificEnvVars(): (keyof T)[];
}

export default IInfrastructure
