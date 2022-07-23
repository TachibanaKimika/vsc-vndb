export enum NodeModulesKeys {
  js,
  css,
  uiToolkit,
}

export interface NodeModulesValue {
  sourcePath: string[];
  destinationPath: string[];
  fileName: string;
  includeFolder?: boolean;
}

export class NodeModulesAccessor {
  static readonly outputPath = 'dist';

  private static readonly pathMapping = new Map<
    NodeModulesKeys,
    NodeModulesValue
  >([
    [
      NodeModulesKeys.js,
      {
        sourcePath: ['src', 'assets'],
        destinationPath: ['assets'],
        fileName: 'main.js',
      },
    ],
    [
      NodeModulesKeys.css,
      {
        sourcePath: ['src', 'assets', 'style'],
        destinationPath: ['assets'],
        fileName: 'main.css',
        // includeFolder: true,
      },
    ],
    [
      NodeModulesKeys.uiToolkit,
      {
        sourcePath: ['node_modules', '@vscode', 'webview-ui-toolkit', 'dist'],
        destinationPath: ['assets'],
        fileName: 'toolkit.min.js',
        // includeFolder: true,
      },
    ],
  ]);

  static getPathToOutputFile(key: NodeModulesKeys): string[] {
    const path = this.getMappedValue(key);
    return [this.outputPath, ...path.destinationPath, path.fileName];
  }

  static getPathToNodeModulesFile(key: NodeModulesKeys): NodeModulesValue {
    return this.getMappedValue(key);
  }

  private static getMappedValue(key: NodeModulesKeys): NodeModulesValue {
    const value = this.pathMapping.get(key);
    if (!value) {
      throw Error(`Path to "${key}" is not mapped.`);
    }
    return value;
  }
}
