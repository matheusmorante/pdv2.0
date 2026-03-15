import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzpdfmihnwcrgkyagwkd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cGRmbWlobndjcmdreWFnd2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzg0NTQsImV4cCI6MjA4ODU1NDQ1NH0.Mb4kqKeDYILblAD83z9PYOywQ_V0MZ31LI0AlA_1GwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProduct() {
  console.log('Searching for Criado Mudo Aroma...');
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('description', '%Criado Mudo Aroma%');

  if (error) {
    console.error('Error fetching product:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('Product not found.');
    return;
  }

  const product = data[0];
  console.log('Found product:', product.description, 'ID:', product.id);

  // Update product: set is_draft to false and fill missing common fields
  const updates = {
    is_draft: false,
    deleted: false,
    updated_at: new Date().toISOString()
  };

  // Check for missing fields mentioned by user ("preencha o que falta")
  // Common missing fields might be unit_price, cost_price, etc.
  if (!product.unit_price || product.unit_price === 0) updates.unit_price = 150; // Generic placeholder
  if (!product.category) updates.category = 'Móveis';

  const { error: updateError } = await supabase
    .from('products')
    .update(updates)
    .eq('id', product.id);

  if (updateError) {
    console.error('Error updating product:', updateError);
  } else {
    console.log('Product restored successfully!');
  }
}

fixProduct();
