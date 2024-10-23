import * as path from 'path';
import { RspressPlugin } from '@rspress/shared';

const PLUGIN_NAME = 'plugin-annotation-words';
interface Options {
  /**
   * words map path
   */
  wordsMapPath:string;
  ignoreWords?: string[];
  ignorePaths?: RegExp[];
}

function serializeIgnorePaths(ignorePaths: RegExp[]): [string, string][] {
  const ignorePathRegs: [string, string][] = [];
  for (const ignorePath of ignorePaths) {
    if (ignorePath instanceof RegExp) {
      ignorePathRegs.push([ignorePath.source, ignorePath.flags]);
    } else {
      throw new Error(
        `[${PLUGIN_NAME}]: Unknown type of "ignorePaths", "ignorePaths" option only supports RegExp type`,
      );
    }
  }
  return ignorePathRegs;
}

export function pluginAnnotationWords(options: Options): RspressPlugin {
  if(!options.wordsMapPath){
    throw new Error(
      `[${PLUGIN_NAME}]: "path" option is required!`,
    );
  }
  return {
    name: PLUGIN_NAME,
    globalUIComponents: [
      path.resolve(__dirname, '../src/components/AnnotationWords.tsx'),
    ],
    builderConfig: {
      source: {
        define: {
          USER_DATA_PATH: JSON.stringify(options.wordsMapPath),
          USER_IGNORE_WORDS: JSON.stringify(
            options.ignoreWords || [],
          ),
          USER_IGNORE_PATHS: JSON.stringify(
            serializeIgnorePaths(options.ignorePaths || []),
          ),
        },
      },
      output: {
        cssModules: {
          localIdentName: '[hash:6]',
        },
      },
    },
  };
}
