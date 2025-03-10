import { writable } from 'svelte/store';


interface User {
    access_token: string;
}

export const auth = writable<User | null>(null);

export function logout() {
    auth.set(null);
    localStorage.removeItem('access_token');
    window.location.href = '/signin';
}