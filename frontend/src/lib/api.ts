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
        throw new Error(await getErrorMessage(response));
    }

    return response.json() as Promise<T>;
}

export async function apiPost<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json() as Promise<T>;
}

export async function apiPut<T>(
    endpoint: string,
    data: unknown
): Promise<T> {
    if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json() as Promise<T>;
}

export async function apiDelete(endpoint: string): Promise<void> {
    if (!API_BASE_URL) {
        throw new Error("API base URL is not configured.");
    }

    const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const response = await fetch(url, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }
}

async function getErrorMessage(response: Response): Promise<string> {
    const raw = await response.text();

    if (!raw) {
        return `API request failed: ${response.status} ${response.statusText}`;
    }

    try {
        const data = JSON.parse(raw);

        if (data.errors) {
            return Object.values(data.errors)
                .flat()
                .join("\n");
        }

        return (
            data.message ||
            data.detail ||
            data.title ||
            raw
        );
    } catch {
        return raw;
    }
}