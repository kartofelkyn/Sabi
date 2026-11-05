const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet<T>(endpoint: string): Promise<T> {
    if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
    }
    const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(
        url,
        {
            next: {
                revalidate: 60,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
        );
    }

    return response.json() as Promise<T>;
}