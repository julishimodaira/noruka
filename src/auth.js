import { supabase } from './supabase';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function saveProfile(email, profile) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ email, ...profile, updated_at: new Date() });
  if (error) throw error;
}

export async function loadProfile(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
}

export async function saveRoute(email, from, to, plan) {
  const { error } = await supabase
    .from('saved_routes')
    .insert({ user_email: email, from_station: from, to_station: to, plan });
  if (error) throw error;
}

export async function loadRoutes(email) {
  const { data, error } = await supabase
    .from('saved_routes')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function verifyElevator(stationId, elevatorIndex) {
  const { error } = await supabase
    .from('elevator_verifications')
    .insert({ station_id: stationId, elevator_index: elevatorIndex, is_working: true });
  if (error) throw error;
}

export async function getElevatorVerifications(stationId) {
  const { data, error } = await supabase
    .from('elevator_verifications')
    .select('*')
    .eq('station_id', stationId)
    .gte('verified_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  if (error) return [];
  return data;
}
