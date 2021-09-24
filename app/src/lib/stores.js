import { writable } from 'svelte/store';
import { MAIN_NET, DEV_NET } from './constants.js';

export const selectedNetwork = writable(DEV_NET);
