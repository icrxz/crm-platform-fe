export function parseToCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function parseCurrencyToNumber(amount: string): number {
    const value = amount.replace(/[^0-9,-]+/g, "").replace(",", ".");

    return Number(value);
}

export function parseDocument(value: string): string {
    const parsedDoc = removeDocumentSymbols(value);
    switch (parsedDoc.length) {
        case 11:
            return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        case 14:
            return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        default:
            return value;
    }
}

export function removeDocumentSymbols(value: string): string {
    return value.replace(/[^0-9]+/g, "");
}

export function isDocument(value: string): boolean {
    const parsedDoc = removeDocumentSymbols(value);
    return parsedDoc.length === 11 || parsedDoc.length === 14;
}
