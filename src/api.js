const API_URL = "http://localhost:8080";

export const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
    });

    return res.json();
};

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    return res.json();
};

export const getProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    return res.json();
};

export const addToFavorites = async (productId, token) => {
    const res = await fetch(`${API_URL}/favorites/products/${productId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.json();
};

export const getFavorites = async (token) => {
    const res = await fetch(`${API_URL}/favorites/products`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.json();
};

export const removeFromFavorites = async (productId, token) => {
    const res = await fetch(`${API_URL}/favorites/products/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.json();
};