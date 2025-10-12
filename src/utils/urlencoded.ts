export function urlencoded(str: string): Record<string, any> {
    const result: Record<string, any> = {};

    if (!str) return result;

    const pairs = str.split('&').filter(Boolean);

    for (const pair of pairs) {

        const [rawKey, ...rest] = pair.split('=');
        let key = decodeURIComponent(rawKey || '');
        let value = decodeURIComponent(rest.join('=') || '');

        // Manage arrays (keys ending by [])
        if (key.endsWith('[]')) {
            key = key.slice(0, -2);
            if (!Array.isArray(result[key])) {
                if(result[key]) result[key] = [result[key]];
                else result[key] = [];
            }
            result[key].push(value);
            continue;
        }
        

        // Si la clé est déjà utilisée, on convertit en tableau
        if (result[key] !== undefined) {
            if (Array.isArray(result[key])) {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        } else {
            result[key] = value;
        }
    }

    return result;
}
