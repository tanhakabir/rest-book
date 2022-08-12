var stringify = require('json-stringify-safe');
import * as cache from './cache';
import { getSecret } from './secrets';

export interface IVariableResult {
    value: any;
    hasResolved: boolean;
}

export class VariableParser {
    public readonly curlyBracketsVarMatchExp = /(?:\{\{)(SECRETS:)?([A-Za-z0-9._\-\[\]]*)(?:\}\})/ig;

    public readonly dollarSignVarMatchExp = /\$[A-Za-z0-9.-\[\]]*/gi;

    private _valuesReplacedBySecrets: string[] = [];

    private static _instance: VariableParser;

    public static get instance(): VariableParser {
        return this._instance ?? (this._instance = new VariableParser());
    }

    constructor() { }

    public attemptToLoadVariable(text: string): IVariableResult {

        const groups = Array.from(text.matchAll(this.curlyBracketsVarMatchExp));

        let resolvedVariableValue = null;
        if (groups.length > 0) {
            resolvedVariableValue = this._attemptToLoadVariableFromRegex(text, groups, this._valuesReplacedBySecrets);
        } else {
            resolvedVariableValue = this._attemptToLoadVariableFromDollarToken(text, this._valuesReplacedBySecrets);
        }

        return {
            value: resolvedVariableValue,
            hasResolved: resolvedVariableValue !== text
        };
    }

    public wasReplacedBySecret(text: string): boolean {
        if (typeof text === 'string') {
            for (let replaced of this._valuesReplacedBySecrets) {
                if (text.includes(replaced)) {
                    return true;
                }
            }
        } else if (typeof text === 'number') {
            for (let replaced of this._valuesReplacedBySecrets) {
                if (`${text}`.includes(replaced)) {
                    return true;
                }
            }
        }

        return false;
    }

    private _attemptToLoadVariableFromRegex(text: string, groups: RegExpMatchArray[], valuesReplacedBySecrets: string[]): string {
        for (const group of groups) {
            if (group.length !== 3) {
                console.log("Unable to process the extracted possible variable: ", group);
                continue;
            }

            const isSecretLookup = group[1]?.toUpperCase() === 'SECRETS:';
            const possibleVariable = group[2];
            const loadedFromVariable = isSecretLookup ?
                getSecret(possibleVariable) :
                cache.attemptToLoadVariable(possibleVariable);

            if (loadedFromVariable) {
                try {
                    if (typeof loadedFromVariable !== 'string') {
                        return text.replace(group[0], stringify(loadedFromVariable));
                    }

                    // Add the value into the list of values that won't be displayed in the sent request.
                    // TODO: Possibly use an expression to forbid displaying the value of a secret by testing the key instead of the value
                    if (isSecretLookup && valuesReplacedBySecrets.indexOf(loadedFromVariable) === -1) {
                        valuesReplacedBySecrets.push(loadedFromVariable);
                    }
                    return text.replace(group[0], loadedFromVariable);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }

        return text;
    }

    private _attemptToLoadVariableFromDollarToken(text: string, valuesReplacedBySecrets: string[]): string {
        // TODO: Support multiple $ placeholders using the same replacement logic
        const indexOfDollarSign = text.indexOf('$');
        if (indexOfDollarSign === -1) {
            return text;
        }

        const beforeVariable = text.substring(0, indexOfDollarSign);

        const indexOfEndOfPossibleVariable = this._getEndOfWordIndex(text, indexOfDollarSign);
        const possibleVariable = text.substring(indexOfDollarSign + 1, indexOfEndOfPossibleVariable);

        const isSecretLookup = possibleVariable.toUpperCase().startsWith('SECRETS:');
        const loadedFromVariable = isSecretLookup ?
            getSecret(possibleVariable.substring(8)) :
            cache.attemptToLoadVariable(possibleVariable);

        if (loadedFromVariable) {
            if (typeof loadedFromVariable !== 'string') {
                text = text.replace("$" + possibleVariable, stringify(loadedFromVariable));
            } else {
                text = text.replace("$" + possibleVariable, loadedFromVariable);
            }

            // Add the value into the list of values that won't be displayed in the sent request.
            // TODO: Possibly use an expression to forbid displaying the value of a secret by testing the key instead of the value
            if (isSecretLookup && valuesReplacedBySecrets.indexOf(loadedFromVariable) === -1) {
                valuesReplacedBySecrets.push(loadedFromVariable);
            }
        }

        return text;
    }

    private _getEndOfWordIndex(text: string, startingIndex?: number): number {
        const indexOfEnd = text.length - 1;

        let indexOfAcceptedDelimiters: number[] = [
            text.indexOf(' ', startingIndex ?? 0),
            text.indexOf(',', startingIndex ?? 0),
            text.indexOf(';', startingIndex ?? 0),
            text.indexOf('\n', startingIndex ?? 0),
            text.indexOf('&', startingIndex ?? 0)
        ];

        const positiveIndexes = indexOfAcceptedDelimiters.filter((indexValue) => indexValue !== -1);

        return Math.min(...positiveIndexes, indexOfEnd);
    }
}