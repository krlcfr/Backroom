const fs = require('fs'); 
const path = require('path'); 
const PROJECT_REF = 'hxammkcbwqpbeqgixogv'; 
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YW1ta2Nid3FwYmVxZ2l4b2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU0MzQ2MSwiZXhwIjoyMDk5MTE5NDYxfQ.hPsehr8aC41AscAF_1cD1lDcpt8XHKQT7zI753L5r18'; 
const sql = fs.readFileSync('supabase/migrations/20260821000001_document_signatures.sql', 'utf8'); 

fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, { 
  method: 'POST', 
  headers: { 
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 
    'Content-Type': 'application/json' 
  }, 
  body: JSON.stringify({ query: sql }) 
})
.then(res => res.text())
.then(body => console.log('Response:', body));
