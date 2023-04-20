export interface Options {
    stripWhitespace?: boolean;
}

function stripJsonTrailingCommas(content: string): string {
    return content.replace(
        /(?<=(true|false|null|["\d}\]])\s*)\s*,(?=\s*[}\]])/g,
        ""
    );
}

export default stripJsonTrailingCommas;
