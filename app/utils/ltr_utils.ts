
export function textAlign(str: string) {
    if (contains_heb(str)) {
        return 'right'
    }
}
export function contains_heb(str: string) {
    return (/[\u0590-\u05FF]/).test(str);
}