-- Script para arreglar las transacciones que perdieron sus categorías
-- Mapea las viejas categorías de usuario a las categorías globales por nombre

-- Paso 1: Actualizar transacciones que tienen category_id de la vieja tabla categories
UPDATE transactions t
SET category_id = (
  SELECT gc.id
  FROM global_categories gc
  JOIN categories c ON LOWER(TRIM(c.name)) = LOWER(TRIM(gc.name_es))
  WHERE c.id = t.category_id
  AND gc.is_active = true
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM categories c WHERE c.id = t.category_id
);

-- Paso 2: Para transacciones que no encontraron match exacto, asignar por tipo
-- Ingresos -> asignar a "Salario" (income)
UPDATE transactions t
SET category_id = (
  SELECT id FROM global_categories 
  WHERE type = 'income' AND is_active = true 
  ORDER BY name_es 
  LIMIT 1
)
WHERE t.type = 'income' 
AND t.category_id IS NULL;

-- Egresos -> asignar a "Compras" (expense)
UPDATE transactions t
SET category_id = (
  SELECT id FROM global_categories 
  WHERE type = 'expense' AND is_active = true 
  ORDER BY name_es 
  LIMIT 1
)
WHERE t.type = 'expense' 
AND t.category_id IS NULL;

-- Verificar resultados
SELECT 
  COUNT(*) as total_transactions,
  COUNT(category_id) as with_category,
  COUNT(*) - COUNT(category_id) as still_without_category
FROM transactions;
