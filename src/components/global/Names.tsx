export interface NameProps {
    // Added null/undefined to safely accept data from optional chaining
    username?: string | string[] | null; 
    fullname?: boolean;
}

export default function Name({ username, fullname = false }: NameProps) {
    // 1. Early return if username is empty, null, or undefined
    if (!username) return null;

    // 2. Normalize the input to a single string
    const nameString = Array.isArray(username) ? username.join(" ") : username;
    const cleanName = nameString.trim();

    // 3. Return full name if requested
    if (fullname) {
        return cleanName;
    }

    // 4. Otherwise, return just the first name
    const firstName = cleanName.split(" ")[0];
    return firstName;
}

// export interface NameProps {
//     username: string | string[],
//     fullname?: boolean
// }

// export default function Name({ username, fullname }: NameProps) {
//     if (!fullname) {
//         if (typeof username === "string") {
//             const name = username.trim();
//             const firstName = name.split(" ")[0];
//             return firstName;
//         } else if (Array.isArray(username)) {
//             const name = username[0].trim();
//             const firstName = name.split(" ")[0];
//             return firstName;
//         }
//         return "";
//     }
//     return username;
// }