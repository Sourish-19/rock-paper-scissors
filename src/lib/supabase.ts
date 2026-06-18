import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://galgyakcgbfbljxtkots.supabase.co';
const supabaseAnonKey = 'sb_publishable_YS4FV_3_aVRHhJ3IXVHgfg_OjgFZK-a';

const isSSR = Platform.OS === 'web' && typeof window === 'undefined';

const ssrStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isSSR ? ssrStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
