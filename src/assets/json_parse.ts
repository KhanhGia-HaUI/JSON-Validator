type Metadata = {
    message: string;
    position: number;
};

class JSONParseError extends SyntaxError {
    code: string;
    systemError: Error;
    position?: number;

    constructor(er: Error, txt: string, context?: number, caller?: Function) {
        context = context || 20;
        const metadata: Metadata = parseError(er, txt, context);
        super(metadata.message);
        Object.assign(this, metadata);
        this.code = "EJSONPARSE";
        this.systemError = er;
        Error.captureStackTrace(this, caller || this.constructor);
    }

    get name(): string {
        return this.constructor.name;
    }

    set name(_: string) {}
    get [Symbol.toStringTag](): string {
        return this.constructor.name;
    }
}

const hexify = (char: string): string => {
    const h = char.charCodeAt(0).toString(16).toUpperCase();
    return "0x" + (h.length % 2 ? "0" : "") + h;
};

const parseError = (e: Error, txt: string, context: number): Metadata => {
    if (!txt) {
        return {
            message: e.message + " while parsing empty string",
            position: 0,
        };
    }
    const badToken = e.message.match(
        /^Unexpected token (.) .*position\s+(\d+)/i
    );
    const errIdx = badToken
        ? +badToken[2]
        : e.message.match(/^Unexpected end of JSON.*/i)
        ? txt.length - 1
        : null;

    const msg = badToken
        ? e.message.replace(
              /^Unexpected token ./,
              `Unexpected token ${JSON.stringify(badToken[1])} (${hexify(
                  badToken[1]
              )})`
          )
        : e.message;

    if (errIdx !== null && errIdx !== undefined) {
        const start = errIdx <= context ? 0 : errIdx - context;

        const end =
            errIdx + context >= txt.length ? txt.length : errIdx + context;

        const slice =
            (start === 0 ? "" : "...") +
            txt.slice(start, end) +
            (end === txt.length ? "" : "...");

        const near = txt === slice ? "" : "near ";

        return {
            message: msg + ` while parsing ${near}${JSON.stringify(slice)}`,
            position: errIdx,
        };
    } else {
        return {
            message: msg + ` while parsing '${txt.slice(0, context * 2)}'`,
            position: 0,
        };
    }
};

const kIndent = Symbol.for("indent");
const kNewline = Symbol.for("newline");
const formatRE = /^\s*[{[]((?:\r?\n)+)([\s\t]*)/;
const emptyRE = /^(?:\{\}|\[\])((?:\r?\n)+)?$/;

const parseJson = (
    txt: string | Buffer,
    reviver?: (key: any, value: any) => any,
    context?: number
): any => {
    const parseText = stripBOM(txt);
    context = context || 20;
    try {
        const [, newline = "\n", indent = "  "] = parseText.match(emptyRE) ||
            parseText.match(formatRE) || [null, "", ""];

        const result = JSON.parse(parseText, reviver);
        if (result && typeof result === "object") {
            result[kNewline] = newline;
            result[kIndent] = indent;
        }
        return result;
    } catch (e: any) {
        if (typeof txt !== "string" && !Buffer.isBuffer(txt)) {
            const isEmptyArray =
                Array.isArray(txt) && (txt as any).length === 0;
            throw Object.assign(
                new TypeError(
                    `Cannot parse ${
                        isEmptyArray ? "an empty array" : String(txt)
                    }`
                ),
                {
                    code: "EJSONPARSE",
                    systemError: e,
                }
            );
        }

        throw new JSONParseError(e, parseText, context, parseJson);
    }
};

const stripBOM = (txt: string | Buffer): string =>
    String(txt).replace(/^\uFEFF/, "");

type ParseJson = {
    (
        txt: string | Buffer,
        reviver?: (key: any, value: any) => any,
        context?: number
    ): any;
    JSONParseError: typeof JSONParseError;
    noExceptions: (
        txt: string | Buffer,
        reviver?: (key: any, value: any) => any
    ) => any;
};

const parseJsonExport: ParseJson = parseJson as ParseJson;
parseJsonExport.JSONParseError = JSONParseError;

parseJsonExport.noExceptions = (
    txt: string | Buffer,
    reviver?: (key: any, value: any) => any
): any => {
    try {
        return JSON.parse(stripBOM(txt), reviver);
    } catch (e) {
        // no exceptions
    }
};

export default parseJsonExport;
