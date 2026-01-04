declare module "dotenv" {
  export interface DotenvConfigOptions {
    path?: string;
  }
  export function config(options?: DotenvConfigOptions): void;
}
