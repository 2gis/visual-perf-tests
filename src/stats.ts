// @ https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php

// sort array ascending
const asc = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
    const mu = mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (sorted, q) => {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

const fmt = n => Number(n).toFixed(2)

export function stats (input: number[], percentiles = [.25, .5, .75, .90, .95, .99]) {
    asc(input);
    const output = {};
    for (const p of percentiles) {
        output[`q${Math.trunc(p * 100)}`] = fmt(quantile(input, p));
    }

    return output;
}

export function keyedStats (input: { [name: string]: number[] }) {
    const keys = Object.keys(input);
    const output = {};
    for (const k of keys) {
        output[k] = stats(input[k]);
    }
    return output;
}