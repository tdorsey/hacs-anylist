import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import { ServerConfig, AnyListError, AnyListErrorType } from '../types';

/**
 * Events emitted by AnyListServer
 */
export interface AnyListServerEvents {
  'started': () => void;
  'stopped': (code: number | null) => void;
  'error': (error: Error) => void;
  'output': (data: string) => void;
}

/**
 * AnyList server process manager
 * 
 * Manages the lifecycle of the AnyList binary server process.
 * Converted from Python threading implementation to Node.js child process.
 */
export class AnyListServer extends EventEmitter {
  private config: ServerConfig;
  private process?: ChildProcess | undefined;
  private isRunning = false;

  /**
   * Creates a new AnyList server instance
   * 
   * @param config - Server configuration
   */
  constructor(config: ServerConfig) {
    super();
    this.config = config;
  }

  /**
   * Checks if the server is currently available
   * 
   * @returns True if server process is running
   */
  public get available(): boolean {
    return this.isRunning && this.process !== undefined;
  }

  /**
   * Starts the server process
   * 
   * @throws AnyListError if binary file doesn't exist or isn't executable
   */
  public start(): void {
    try {
      // Validate binary file exists
      if (!fs.existsSync(this.config.binary)) {
        throw new AnyListError(
          'Failed to locate server binary',
          AnyListErrorType.BINARY_ERROR
        );
      }

      // Check and fix permissions if needed
      this.ensureExecutablePermissions();

      // Build command arguments
      const args = [
        '--port', this.config.port,
        '--email', this.config.email,
        '--password', this.config.password,
        '--credentials-file', this.config.credentialsFile,
        '--ip-filter', this.config.ipFilter || '127.0.0.1'
      ];

      // Spawn the server process
      this.process = spawn(this.config.binary, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
      });

      this.isRunning = true;
      this.emit('started');

      // Handle process output
      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          const output = data.toString().trim();
          if (output) {
            this.emit('output', output);
          }
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          const output = data.toString().trim();
          if (output) {
            this.emit('output', `ERROR: ${output}`);
          }
        });
      }

      // Handle process exit
      this.process.on('exit', (code: number | null) => {
        this.isRunning = false;
        this.process = undefined;

        if (code !== null && code > 0) {
          const error = new AnyListError(
            `Binary server exited with error code: ${code}`,
            AnyListErrorType.BINARY_ERROR,
            code
          );
          this.emit('error', error);
        }

        this.emit('stopped', code);
      });

      // Handle process errors
      this.process.on('error', (error: Error) => {
        this.isRunning = false;
        this.process = undefined;
        
        const anylistError = new AnyListError(
          `Failed to start binary server: ${error.message}`,
          AnyListErrorType.BINARY_ERROR,
          undefined,
          error
        );
        this.emit('error', anylistError);
      });

    } catch (error) {
      this.isRunning = false;
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Failed to start server',
        AnyListErrorType.BINARY_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Stops the server process
   * 
   * @param signal - Signal to send to process (default: SIGTERM)
   * @param timeout - Timeout in milliseconds before force killing (default: 5000)
   * @returns Promise that resolves when server is stopped
   */
  public async stop(signal: NodeJS.Signals = 'SIGTERM', timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.isRunning) {
        resolve();
        return;
      }

      // Set up timeout for force kill
      const forceKillTimeout = setTimeout(() => {
        if (this.process && this.isRunning) {
          this.process.kill('SIGKILL');
          const error = new AnyListError(
            'Server process had to be force killed',
            AnyListErrorType.BINARY_ERROR
          );
          reject(error);
        }
      }, timeout);

      // Listen for process exit
      const onExit = (): void => {
        clearTimeout(forceKillTimeout);
        this.process?.removeListener('exit', onExit);
        this.process?.removeListener('error', onError);
        resolve();
      };

      const onError = (error: Error) => {
        clearTimeout(forceKillTimeout);
        this.process?.removeListener('exit', onExit);
        this.process?.removeListener('error', onError);
        reject(new AnyListError(
          `Error stopping server: ${error.message}`,
          AnyListErrorType.BINARY_ERROR,
          undefined,
          error
        ));
      };

      this.process.on('exit', onExit);
      this.process.on('error', onError);

      // Send termination signal
      this.process.kill(signal);
    });
  }

  /**
   * Restarts the server process
   * 
   * @returns Promise that resolves when server is restarted
   */
  public async restart(): Promise<void> {
    if (this.isRunning) {
      await this.stop();
    }
    
    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.start();
  }

  /**
   * Gets the current server configuration
   * 
   * @returns Server configuration object
   */
  public getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * Updates the server configuration
   * Note: Requires restart to take effect
   * 
   * @param newConfig - New configuration to merge with existing
   */
  public updateConfig(newConfig: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Ensures the binary file has executable permissions
   * 
   * @throws AnyListError if permissions cannot be set
   */
  private ensureExecutablePermissions(): void {
    try {
      const stats = fs.statSync(this.config.binary);
      
      // Check if already executable
      if ((stats.mode & fs.constants.S_IXUSR) !== 0) {
        return;
      }

      // Try to make executable
      fs.chmodSync(this.config.binary, stats.mode | fs.constants.S_IXUSR);

      // Verify it worked
      const newStats = fs.statSync(this.config.binary);
      if ((newStats.mode & fs.constants.S_IXUSR) === 0) {
        throw new AnyListError(
          'Failed to fix server binary permissions',
          AnyListErrorType.BINARY_ERROR
        );
      }
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Failed to check/set binary permissions',
        AnyListErrorType.BINARY_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Creates a server configuration from components
   * 
   * @param binary - Path to server binary
   * @param email - User email
   * @param password - User password
   * @param credentialsFile - Path to credentials file
   * @param port - Server port (default: "28597")
   * @param ipFilter - IP filter (default: "127.0.0.1")
   * @returns Server configuration object
   */
  public static createConfig(
    binary: string,
    email: string,
    password: string,
    credentialsFile: string,
    port = '28597',
    ipFilter = '127.0.0.1'
  ): ServerConfig {
    return {
      binary,
      port,
      email,
      password,
      credentialsFile,
      ipFilter
    };
  }

  /**
   * Validates server configuration
   * 
   * @param config - Configuration to validate
   * @throws AnyListError if configuration is invalid
   */
  public static validateConfig(config: ServerConfig): void {
    if (!config.binary) {
      throw new AnyListError(
        'Server binary path is required',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    if (!config.email) {
      throw new AnyListError(
        'Email is required',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    if (!config.password) {
      throw new AnyListError(
        'Password is required',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    if (!config.credentialsFile) {
      throw new AnyListError(
        'Credentials file path is required',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    if (!config.port) {
      throw new AnyListError(
        'Port is required',
        AnyListErrorType.VALIDATION_ERROR
      );
    }
  }
}

// Re-export types for convenience
export { ServerConfig, AnyListError, AnyListErrorType };