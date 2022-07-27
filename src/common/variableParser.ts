var stringify = require('json-stringify-safe');
import * as cache from './cache';

export interface IVariableResolveResult {
    value: any;
    hasResolved: boolean;
}

export class VariableParser {
    public readonly curlyBracketsVarMatchExp = /(?:\{\{)(SECRETS:)?([A-Za-z0-9._\-\[\]]*)(?:\}\})/ig;

    public readonly dollarSignVarMatchExp = /\$[A-Za-z0-9.-\[\]]*/gi;

    private static _instance: VariableParser;

    public static get instance(): VariableParser {
        return this._instance ?? (this._instance = new VariableParser());
    }

    constructor() { }

    public attemptToLoadVariable(text: string, valuesReplacedBySecrets: string[]): IVariableResolveResult {

        const groups = Array.from(text.matchAll(this.curlyBracketsVarMatchExp));

        let resolvedVariableValue = null;
        if (groups.length > 0) {
            resolvedVariableValue = this._attemptToLoadVariableFromRegex(text, groups, valuesReplacedBySecrets);
        } else {
            resolvedVariableValue = this._attemptToLoadVariableFromDollarToken(text, valuesReplacedBySecrets);
        }

        return {
            value: resolvedVariableValue,
            hasResolved: resolvedVariableValue !== text
        };
    }

    private _attemptToLoadVariableFromRegex(text: string, groups: RegExpMatchArray[], valuesReplacedBySecrets: string[]): string {
        for (const group of groups) {
            if (group.length !== 3) {
                console.log("Unable to process the extracted possible variable: ", group);
                continue;
            }

            const possibleVariable = group[2];
            const loadedFromVariable = cache.attemptToLoadVariable(possibleVariable);

            if (loadedFromVariable) {
                try {
                    if (typeof loadedFromVariable !== 'string') {
                        return text.replace(group[0], stringify(loadedFromVariable));
                    }

                    if (group[1]?.toUpperCase() === 'SECRETS:') {
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
        const indexOfDollarSign = text.indexOf('$');
        if (indexOfDollarSign === -1) {
            return text;
        }

        const beforeVariable = text.substring(0, indexOfDollarSign);

        const indexOfEndOfPossibleVariable = this._getEndOfWordIndex(text, indexOfDollarSign) + 1;
        const possibleVariable = text.substring(indexOfDollarSign + 1, indexOfEndOfPossibleVariable);
        const loadedFromVariable = cache.attemptToLoadVariable(possibleVariable);
        if (loadedFromVariable) {
            if (typeof loadedFromVariable !== 'string') {
                return beforeVariable + stringify(loadedFromVariable);
            }

            if (possibleVariable.startsWith('SECRETS')) {
                valuesReplacedBySecrets.push(loadedFromVariable);
            }
            return beforeVariable + loadedFromVariable;
        }

        return text;
    }

    private _getEndOfWordIndex(text: string, startingIndex?: number): number {
        let indexOfSpace = text.indexOf(' ', startingIndex ?? 0);
        let indexOfComma = text.indexOf(',', startingIndex ?? 0);
        let indexOfSemicolon = text.indexOf(';', startingIndex ?? 0);
        let indexOfEnd = text.length - 1;

        let values: number[] = [];

        if (indexOfSpace !== -1) { values.push(indexOfSpace); }
        if (indexOfComma !== -1) { values.push(indexOfComma); }
        if (indexOfSemicolon !== -1) { values.push(indexOfSemicolon); }

        return Math.min(...values, indexOfEnd);
    }
}