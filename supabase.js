// Supabase REST Client Wrapper
// Handles fetches and updates directly using standard fetch calls.

class SupabaseConnector {
  constructor() {
    this.url = localStorage.getItem('supabase_url') || 'https://mujqmdmzloizqhglayxe.supabase.co';
    this.key = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';
  }

  setCredentials(url, key) {
    this.url = url.trim().replace(/\/$/, '');
    this.key = key.trim();
    localStorage.setItem('supabase_url', this.url);
    localStorage.setItem('supabase_key', this.key);
  }

  getHeaders() {
    return {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async fetchCandidates() {
    // Select everything from raw_submissions and do left outer joins on round_1_evaluation, round_2_evaluation, round_3_evaluation
    const endpoint = `${this.url}/rest/v1/raw_submissions?select=*,round_1_evaluation(*),round_2_evaluation(*),round_3_evaluation(*)&order=id.asc`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch candidates: ${response.statusText}`);
    }
    return await response.ok ? response.json() : [];
  }

  async upsertRound1(id, data) {
    return this.upsertTable('round_1_evaluation', id, data);
  }

  async upsertRound2(id, data) {
    return this.upsertTable('round_2_evaluation', id, data);
  }

  async upsertRound3(id, data) {
    return this.upsertTable('round_3_evaluation', id, data);
  }

  async updateRawSubmission(id, data) {
    const endpoint = `${this.url}/rest/v1/raw_submissions?id=eq.${id}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to update raw submission: ${response.statusText}`);
    }
    return response.json();
  }

  async upsertTable(tableName, id, data) {
    // First, check if the record exists
    const checkEndpoint = `${this.url}/rest/v1/${tableName}?id=eq.${id}`;
    const checkResponse = await fetch(checkEndpoint, {
      method: 'GET',
      headers: this.getHeaders()
    });
    
    if (!checkResponse.ok) {
      throw new Error(`Failed to verify record in ${tableName}: ${checkResponse.statusText}`);
    }
    
    const records = await checkResponse.json();
    const hasRecord = records && records.length > 0;
    
    let response;
    if (hasRecord) {
      // Update
      response = await fetch(checkEndpoint, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
    } else {
      // Insert
      response = await fetch(`${this.url}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ id, ...data })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save to ${tableName}: ${errorText || response.statusText}`);
    }
    return response.json();
  }
}

window.supabaseConnector = new SupabaseConnector();
