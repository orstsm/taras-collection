const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://asltoyrmipekmbsuhfvo.supabase.co', 'sb_publishable_mn_d7xVx13Jy165OUTSH3g_YcUtaDEr');
async function run() {
  const { data, error } = await supabase.from('proofs').select('*').limit(1);
  console.log('Select:', error || data);
}
run();
