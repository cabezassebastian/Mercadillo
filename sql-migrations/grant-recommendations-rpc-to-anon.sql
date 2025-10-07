-- Grant anon role execute on recommendation RPCs so frontend can call them
GRANT EXECUTE ON FUNCTION public.get_also_bought_products(uuid,int) TO anon;
GRANT EXECUTE ON FUNCTION public.get_top_selling_products(text,int) TO anon;
GRANT EXECUTE ON FUNCTION public.get_related_by_category_price(uuid,int) TO anon;

-- Note: If you're using Row Level Security, ensure the functions are SECURITY DEFINER
-- (they already are) and that the functions perform necessary access checks.
