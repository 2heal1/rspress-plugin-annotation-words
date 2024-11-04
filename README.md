# rspress-plugin-annotation-words

A plugin for Rsoress to support annotation words.

## Examples
[Repo](https://github.com/module-federation/core/blob/main/apps/website-new/rspress.config.ts#L75)

[Docs url](https://module-federation.io/guide/troubleshooting/runtime/RUNTIME-007.html)

![image](https://github.com/user-attachments/assets/5c2f7e87-6c87-473c-b02a-2000856f0105)

## Install

```bash
# npm
npm install rspress-plugin-annotation-words
# yarn
yarn add rspress-plugin-annotation-words
# pnpm
pnpm install rspress-plugin-annotation-words
```

## Usage

```js
import { defineConfig } from 'rspress/config';
import { pluginAnnotationWords } from 'rspress-plugin-annotation-words'
import path from 'path';

export default defineConfig({
  // ...
  plugins:[pluginAnnotationWords({
    wordsMapPath:'words-map.json'
  })],
});
```

add `words-map.json` to `public` folder, the content is like this:
```json
{
  "word":{
    "id":"word",
    "lang":{
      "zh":{
        "aliases":[
          {"key":"word aliases"}
        ],
        "description":"描述",
        "related_meta":{
          "docs":[{
            "id":"word-docs",
            "title":"文档标题（通常用于 rspress 内部链接）",
            "url":"/zh/configure/name.html#name"
          }],
          "links":[{
            "id":"word-link",
            "title":"外部链接",
            "url":"https://github.com/2heal1/rspress-plugin-annotation-words"
          }]
        }
      },
      "en":{
        "aliases":[
          {"key":"word aliases"}
        ],
        "description":"word name",
        "related_meta":{
          "docs":[{
            "id":"word-docs",
            "title":"word title(usually used for rspress internal links)",
            "url":"/en/configure/name.html#name"
          }],
          "links":[{
            "id":"word-link",
            "title":"external link",
            "url":"https://github.com/2heal1/rspress-plugin-annotation-words"
          }]
        }
      }
    }
  },
}

```

## Options

```ts
interface Options {
  /**
   * words map path
   */
  wordsMapPath:string;
  ignoreWords?: string[];
  ignorePaths?: RegExp[];
}
```
