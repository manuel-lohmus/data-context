// Type definitions for data-context v2.0
// Project: https://www.npmjs.com/package/data-context
// Definitions by: Manuel Lõhmus and contributors

/* eslint-disable @typescript-eslint/ban-types */

declare namespace DC {
  type Primitive = string | number | boolean | null | undefined;

  interface ChangeEvent<T = any> {
    eventName: 'new' | 'set' | 'reposition' | 'delete' | '-change' | string;
    target: DataContext<any>;
    propertyPath: string[];
    oldValue: any;
    newValue: any;
  }

  interface StringifyOptions {
    modifiedData?: boolean;
    setUnmodified?: boolean;
    includeBOM?: boolean;
  }

  type JSONReplacer = (this: any, key: string, value: any) => any;

  interface WatchJsonFileOptions {
    filePath?: string;
    data?: any;
    removeUnusedKeys?: boolean;
    allowFileReadWrite?: boolean;
    onDataChange?: (event: {
      strChanges: string | undefined;
      strJson: string | undefined;
      datacontext: DataContext<any>;
    }) => void;
    onFileChange?: (event: {
      strChanges: string | undefined;
      strJson: string | undefined;
      datacontext: DataContext<any>;
    }) => void;
  }

  interface DataContextBase {
    readonly _isDataContext: true;
    _isModified: boolean;
    readonly _modified: string[];
    _propertyName: string | null;
    _parent: DataContext<any> | null;

    toString(createModifiedData?: boolean): string;

    overwritingData(text: string | number | null | undefined, reviver?: any): void;

    stringifyChanges(
      replacer?: JSONReplacer | string[] | null,
      space?: number | string,
      modifiedData?: boolean,
      setUnmodified?: boolean
    ): string | undefined;

    readonly isChanged: boolean;

    resetChanges(): void;

    once(eventName: string, listener: (event: ChangeEvent) => boolean | void): this;

    on(
      eventName: string,
      listener: (event: ChangeEvent) => boolean | void,
      isActive?: boolean | (() => boolean) | { isConnected?: boolean } | any
    ): this;

    emitToParent(eventName: string, ...params: any[]): boolean;

    emit(eventName: string, ...params: any[]): boolean;
  }

  type DataContextArray<T> = DataContextBase & Array<DataContext<T>>;

  type DataContextObject<T extends object> = DataContextBase & {
    [K in keyof T]: DataContext<T[K]>;
  };

  type DataContext<T> =
    T extends Function
      ? T
      : T extends Array<infer U>
        ? DataContextArray<U>
        : T extends object
          ? DataContextObject<T>
          : T;

  interface CreateDataContext {
    <T>(value: T, propertyName?: string | null, parent?: any): DataContext<T>;

    /** Create a new proxy object with the same structure as the original object. */
    createDataContext: CreateDataContext;

    /** Merge/sync source into target (recursively). */
    syncData<T>(target: T, source: any, removeUnusedKeys?: boolean): T;

    /** Parse text into value (optionally reviving into DataContext). */
    parse<T = any>(text: string | number | null | undefined): T | undefined;
    parse<T = any>(text: string | number | null | undefined, reviver: JSONReplacer): any;
    parse<T = any>(text: string | number | null | undefined, reviver: CreateDataContext): DataContext<T>;
    parse<T = any>(text: string | number | null | undefined, reviver: DataContext<any>): DataContext<T>;

    /** Stringify value with support for metadata and modified-data modes. */
    stringify(
      value: any,
      replacer?: JSONReplacer | string[] | null,
      space?: number | string,
      options?: StringifyOptions
    ): string | undefined;

    /**
     * Node.js only: watch and persist a JSON file to a DataContext.
     * Returns an implementation-specific watcher/handle (or undefined in non-Node environments).
     */
    watchJsonFile(options?: WatchJsonFileOptions): unknown;

    /** When true, reading/writing files via watchJsonFile is enabled. */
    enableFileReadWrite: boolean;

    /** When true, metadata comments are ignored during parse/stringify. */
    ignoreMetadata: boolean;
  }
}

declare const createDataContext: DC.CreateDataContext;

export = createDataContext;