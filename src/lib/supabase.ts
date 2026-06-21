import { createClient } from '@supabase/supabase-js';

// Access public configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_PUBLISHABLE_KEY' &&
  !supabaseUrl.includes('placeholder');

// Real Supabase client initialized only if config is present
let clientInstance: any = null;

if (isConfigured) {
  try {
    clientInstance = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

// In-memory/LocalStorage fallback driver to support instant zero-install local previews
export const isSupabaseConfigured = () => isConfigured;

// Define a minimal typesafe fallback client mimicking Supabase JS behavior
const getMockDatabase = () => {
  const keys = [
    'companies', 'contacts', 'companyContacts', 'documents', 'approvalRequests',
    'approvalDecisions', 'invoices', 'invoiceItems', 'payments', 'tasks',
    'offboardingCases', 'checklistItems', 'communications', 'notifications',
    'auditLogs', 'profiles', 'workspaces', 'workspace_memberships', 'workspace_invitations'
  ];
  const db: Record<string, any[]> = {};
  keys.forEach(k => {
    try {
      const stored = localStorage.getItem(`supamock_${k}`);
      db[k] = stored ? JSON.parse(stored) : [];
    } catch {
      db[k] = [];
    }
  });
  return db;
};

const saveMockDatabase = (db: Record<string, any[]>) => {
  Object.entries(db).forEach(([k, val]) => {
    try {
      localStorage.setItem(`supamock_${k}`, JSON.stringify(val));
    } catch (err) {
      console.error('mock save failed', err);
    }
  });
};

const createMockQueryBuilder = (tableName: string) => {
  const db = getMockDatabase();
  let data = [...(db[tableName] || [])];

  const builder = {
    tableName,
    select: (columns = '*') => {
      // Returns a chain of filtering functions or simulated response
      return builder;
    },
    insert: (values: any) => {
      const dbInstance = getMockDatabase();
      const rows = Array.isArray(values) ? values : [values];
      const newlyAdded: any[] = [];
      
      rows.forEach(r => {
        const row = { 
          id: r.id || crypto.randomUUID(), 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString(), 
          ...r 
        };
        dbInstance[tableName] = dbInstance[tableName] || [];
        dbInstance[tableName].push(row);
        newlyAdded.push(row);
      });
      saveMockDatabase(dbInstance);
      return Promise.resolve({ data: newlyAdded, error: null });
    },
    update: (updates: any) => {
      return {
        match: (filter: Record<string, any>) => {
          const dbInstance = getMockDatabase();
          let table = dbInstance[tableName] || [];
          let targetRows: any[] = [];
          table = table.map(row => {
            const matches = Object.entries(filter).every(([k, v]) => row[k] === v);
            if (matches) {
              const updatedRow = { ...row, ...updates, updated_at: new Date().toISOString() };
              targetRows.push(updatedRow);
              return updatedRow;
            }
            return row;
          });
          dbInstance[tableName] = table;
          saveMockDatabase(dbInstance);
          return Promise.resolve({ data: targetRows, error: null });
        },
        eq: (colName: string, val: any) => {
          const dbInstance = getMockDatabase();
          let table = dbInstance[tableName] || [];
          let targetRows: any[] = [];
          table = table.map(row => {
            if (row[colName] === val) {
              const updatedRow = { ...row, ...updates, updated_at: new Date().toISOString() };
              targetRows.push(updatedRow);
              return updatedRow;
            }
            return row;
          });
          dbInstance[tableName] = table;
          saveMockDatabase(dbInstance);
          return Promise.resolve({ data: targetRows, error: null });
        }
      };
    },
    delete: () => {
      return {
        match: (filter: Record<string, any>) => {
          const dbInstance = getMockDatabase();
          let table = dbInstance[tableName] || [];
          dbInstance[tableName] = table.filter(row => {
            return !Object.entries(filter).every(([k, v]) => row[k] === v);
          });
          saveMockDatabase(dbInstance);
          return Promise.resolve({ data: null, error: null });
        },
        eq: (colName: string, val: any) => {
          const dbInstance = getMockDatabase();
          let table = dbInstance[tableName] || [];
          dbInstance[tableName] = table.filter(row => row[colName] !== val);
          saveMockDatabase(dbInstance);
          return Promise.resolve({ data: null, error: null });
        }
      };
    },
    eq: (colName: string, val: any) => {
      data = data.filter(item => item[colName] === val);
      return builder;
    },
    match: (filter: Record<string, any>) => {
      data = data.filter(row => {
        return Object.entries(filter).every(([k, v]) => row[k] === v);
      });
      return builder;
    },
    order: (col: string, options?: { ascending: boolean }) => {
      const asc = options?.ascending !== false;
      data.sort((a, b) => {
        if (a[col] < b[col]) return asc ? -1 : 1;
        if (a[col] > b[col]) return asc ? 1 : -1;
        return 0;
      });
      return builder;
    },
    limit: (num: number) => {
      data = data.slice(0, num);
      return builder;
    },
    single: () => {
      return Promise.resolve({ data: data[0] || null, error: data[0] ? null : { message: 'Row not found' } });
    },
    then: (resolve: any, reject: any) => {
      resolve({ data, error: null });
    }
  };

  return builder;
};

// Simulated Auth API
const mockAuth = {
  signUp: async ({ email, password, options }: any) => {
    const db = getMockDatabase();
    const existing = db.profiles?.find(p => p.email === email);
    if (existing) {
      return { data: { user: null }, error: { message: 'User already exists' } };
    }
    const userId = crypto.randomUUID();
    const newUser = {
      id: userId,
      email,
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
    };
    const newProfile = {
      id: userId,
      email,
      first_name: options?.data?.first_name || 'New',
      last_name: options?.data?.last_name || 'User',
      display_name: `${options?.data?.first_name || ''} ${options?.data?.last_name || ''}`.trim(),
      preferred_language: 'en',
      is_active: true,
      created_at: new Date().toISOString()
    };
    db.profiles = db.profiles || [];
    db.profiles.push(newProfile);
    saveMockDatabase(db);
    localStorage.setItem('supamock_session', JSON.stringify({ user: newUser }));
    return { data: { user: newUser }, error: null };
  },
  signInWithPassword: async ({ email, password }: any) => {
    const db = getMockDatabase();
    // For demo convenience, let any password pass if profile exists or create one on the fly
    let profile = db.profiles?.find(p => p.email === email);
    if (!profile) {
      // Find within dbState defaultUsers or create
      const uid = crypto.randomUUID();
      profile = {
        id: uid,
        email,
        first_name: 'Staff',
        last_name: 'Member',
        display_name: 'Staff Member',
        preferred_language: 'en',
        is_active: true,
        created_at: new Date().toISOString()
      };
      db.profiles = db.profiles || [];
      db.profiles.push(profile);
      saveMockDatabase(db);
    }
    const user = {
      id: profile.id,
      email: profile.email,
    };
    localStorage.setItem('supamock_session', JSON.stringify({ user }));
    return { data: { user, session: { access_token: 'mock-token' } }, error: null };
  },
  signOut: async () => {
    localStorage.removeItem('supamock_session');
    return { error: null };
  },
  getSession: async () => {
    const stored = localStorage.getItem('supamock_session');
    return { data: { session: stored ? JSON.parse(stored) : null }, error: null };
  },
  getUser: async () => {
    const stored = localStorage.getItem('supamock_session');
    const sess = stored ? JSON.parse(stored) : null;
    return { data: { user: sess?.user || null }, error: null };
  },
  onAuthStateChange: (callback: any) => {
    // Return dummy unsubscriber
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

// Simulated Storage API
const mockStorage = {
  from: (bucketName: string) => {
    return {
      upload: async (path: string, file: File) => {
        return { data: { path }, error: null };
      },
      createSignedUrl: async (path: string, expiry: number) => {
        return { data: { signedUrl: `https://mock.storage.co/${bucketName}/${path}?token=expires-${expiry}` }, error: null };
      },
      list: async (path: string) => {
        return { data: [], error: null };
      },
      remove: async (paths: string[]) => {
        return { data: [], error: null };
      }
    };
  }
};

const mockSupabaseClient = {
  auth: mockAuth,
  storage: mockStorage,
  from: (tableName: string) => createMockQueryBuilder(tableName),
  rpc: async (funcName: string, args: any) => {
    console.log(`Mocking RPC call: ${funcName}`, args);
    // Mimic recalculate_company_risk, creates, updates
    return { data: { success: true }, error: null };
  }
};

export const supabase = clientInstance || mockSupabaseClient;
