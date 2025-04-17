
declare module 'data-context' {

    /** Creates a new data context. */
    export function CreateDataContext(
        /** The value to wrap. */
        value: any,
        /** The name of the property that this data context represents. */
        propertyName: string,
        /** The parent data context. */
        parent: DataContext
    ): DataContext;

    export interface CreateDataContextOptions {

        /** If true, the metadata is ignored. */
        IgnoreMetadata: boolean;
    }

    /**
     * The parse() static method parses a JSON string, 
     * constructing the JavaScript value or object described by the string. 
     * An optional reviver function can be provided to perform a transformation on the resulting object before it is returned.
     */
    export function Parse(
        /** The string to parse as JSON. See the JSON object for a description of JSON syntax. */
        text: string,
        /** If a function, this prescribes how each value originally produced by parsing is transformed before being returned. 
         * Non-callable values are ignored. */
        reviver?: (key: string, value: any) => any
    ): any;

    /**
     * The method converts a JavaScript value to a JSON string, 
     * optionally replacing values if a replacer function is specified or optionally 
     * including only the specified properties if a replacer array is specified.
     */
    export function Stringify(
        /** The value to convert to a JSON string. */
        value: any,
        /** A function that alters the behavior of the stringification process, 
         * or an array of strings and numbers that specifies properties of value to be included in the output. 
         * If replacer is an array, all elements in this array that are not strings or numbers (either primitives or wrapper objects), 
         * including Symbol values, are completely ignored. 
         * If replacer is anything other than a function or an array (e.g. null or not provided), 
         * all string-keyed properties of the object are included in the resulting JSON string. */
        replacer?: (key: string, value: any) => any | (string | number)[],
        /** A string or number that's used to insert white space (including indentation, line break characters, etc.)
         *  into the output JSON string for readability purposes.
         * 
         * If this is a number, it indicates the number of space characters to be used as indentation, 
         * clamped to 10 (that is, any number greater than 10 is treated as if it were 10). 
         * Values less than 1 indicate that no space should be used. */
        space?: string | number,
        /** Options */
        options?: Options
    ): string;

    export interface Options {

        /** Select modified data. */
        modifiedData: boolean;

        /** Set unmodified. */
        setUnmodified: boolean;

        /** Add the BOM to the beginning of the string. */
        includeBOM: boolean;
    }

    export interface DataContext {

        /** The value of the data context. (self-use) */
        _isDataContext: boolean;

        /** The value is modified. (self-use) */
        _isModified: boolean;

        /** The modified properties. (self-use) */
        _modified: Array<string>;

        /** The value property name. (self-use) */
        _propertyName: string;

        /** The parent data context. (self-use) */
        _parent: DataContext;

        /** The Events object. (self-use) */
        _events: object;

        once(
            /** The event name. */
            /** Data context events: 'new', 'set', 'delete', 'change', 'reposition'. */
            eventName: string,
            /** The event handler. */
            handler: (event: EventObject) => boolean
        ): DataContext;

        /** Add data to the context listener */
        on(
            /** The event name. */
            /** Data context events: 'new', 'set', 'delete', 'change', 'reposition'. */
            eventName: string,
            /** The event handler. 
             * Returning true means that the listening function is alive and will not be deleted. */
            handler: (event: EventObject | any) => boolean
        ): DataContext;

        /** Emits the event. Return true means that the listening is handled. */
        emit(
            /** The event name. */
            /** Data context events: 'new', 'set', 'delete', 'change', 'reposition'. */
            eventName: string,
            /** The event object. */
            event: EventObject | any
        ): boolean;

        /** Emits the event to parent. Return true means that the listening is handled. */
        emitToParent(
            /** The event name. */
            /** Data context events: 'new', 'set', 'delete', 'change', 'reposition'. */
            eventName: string,
            /** The event object. */
            event: EventObject | any
        ): boolean;

        /** The value to stringify. */
        toString(): string;

        /** The overwriting data */
        overwritingData(
            /** The string to parse as JSON. See the JSON object for a description of JSON syntax. */
            text: string,
            /** If a function, this prescribes how each value originally produced by parsing is transformed before being returned.
             * Non-callable values are ignored. */
            reviver?: (key: string, value: any) => any
        ): void;

        stringifyChanges(
            /** A function that alters the behavior of the stringification process, 
             * or an array of strings and numbers that specifies properties of value to be included in the output. 
             * If replacer is an array, all elements in this array that are not strings or numbers (either primitives or wrapper objects), 
             * including Symbol values, are completely ignored. 
             * If replacer is anything other than a function or an array (e.g. null or not provided), 
             * all string-keyed properties of the object are included in the resulting JSON string. */
            replacer?: (key: string, value: any) => any | (string | number)[],
            /** A string or number that's used to insert white space (including indentation, line break characters, etc.)
             *  into the output JSON string for readability purposes.
             * 
             * If this is a number, it indicates the number of space characters to be used as indentation, 
             * clamped to 10 (that is, any number greater than 10 is treated as if it were 10). 
             * Values less than 1 indicate that no space should be used. */
            space?: string | number,
            /** If true, get the modified data. Default is true. */
            modifiedData?: boolean,
            /** If true, set the modified data to unmodified. Default is true. */
            setUnmodified?: boolean
        ): string
    }

    export interface EventObject {
        /** The event name. */
        eventName: 'new' | 'set' | 'delete' | 'change' | 'reposition';

        /** The event target. */
        target: DataContext;

        /** The property path. */
        propertyPath: string[];

        /** The parent data context. */
        parent: DataContext;

        /** The old value. */
        oldValue: any;

        /** The new value. */
        newValue: any;
    }

    export default CreateDataContext;
}