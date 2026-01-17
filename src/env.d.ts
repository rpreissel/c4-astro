/// <reference path="../.astro/types.d.ts" />

declare module 'plantuml-encoder' {
  function encode(puml: string): string;
  function decode(encoded: string): string;
  export = { encode, decode };
}
