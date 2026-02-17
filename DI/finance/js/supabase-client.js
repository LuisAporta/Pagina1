// Inicialización de cliente Supabase
let supabase;

if (typeof supabase !== 'undefined' && CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    console.log("Supabase inicializado correctamente.");
} else {
    console.warn("Supabase no configurado o librería no cargada. Modo offline limitado.");
}
