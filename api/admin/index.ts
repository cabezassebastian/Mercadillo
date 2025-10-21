/**
 * Admin dispatcher
 * ----------------
 * This file is the single Vercel function entrypoint for admin operations.
 *
 * Rationale: Vercel's Hobby plan counts each file under `api/` as a separate
 * serverless function. To avoid hitting the 12-function limit we keep a single
 * dispatcher here and move individual handlers outside of `api/` into
 * `server/admin_handlers/` (and keep originals in `api/_admin_archive/`).
 *
 * How to restore a standalone endpoint:
 * 1. Move the handler file back into `api/` (for example `api/admin/top-products.ts`).
 * 2. Ensure it exports a default function with signature (req,res) and uses
 *    the service-role key server-side only.
 * 3. Deploy — note that adding files back under `api/` increases function count.
 *
 * Keep secrets safe: all service-role operations should remain server-side and
 * never be bundled into client-side code.
 */
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// `topProducts` handler is imported dynamically below to avoid bundling
// it into the top-level function. Static import here caused Vercel to try to
// resolve the module at build time and fail in some deployment scenarios.
import { salesHandler } from '../../server/admin_handlers/sales'
import { productImagesHandler } from '../../server/admin_handlers/productImages'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Single entrypoint for admin RPCs and CRUD to reduce serverless function count
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const action = (req.query.action as string) || (req.query.route as string) || ''
    // normalize
    const act = action.toLowerCase()

    // Top products
    if (act === 'top-products') {
      const { topProductsHandler } = await import('../../server/admin_handlers/topProducts')
      return topProductsHandler(req, res, supabase)
    }

    // Sales (day/week/month)
    if (act === 'sales') {
      return salesHandler(req, res, supabase)
    }

    // Metrics: conversion / low_stock
    if (act === 'metrics') {
      return (await import('../../server/admin_handlers/metrics')).metricsHandler(req, res, supabase)
    }

    // Stats
    if (act === 'stats') {
      return (await import('../../server/admin_handlers/stats')).statsHandler(req, res, supabase)
    }

    // Options and values for a product
    if (act === 'options') {
      return (await import('../../server/admin_handlers/options')).optionsHandler(req, res, supabase)
    }

    // Variants for product
    if (act === 'variants') {
      return (await import('../../server/admin_handlers/variants')).variantsHandler(req, res, supabase)
    }

    // Product info
    if (act === 'product-info') {
      const id = req.query.id as string
      const { data, error } = await supabase.from('productos').select('id, precio').eq('id', id).single()
      if (error) return res.status(500).json({ error })
      return res.status(200).json({ data })
    }

    // Product images CRUD
    if (act === 'product-images') {
      return productImagesHandler(req, res, supabase)
    }

    // Orders: GET list, PATCH updates
    if (act === 'orders') {
      return (await import('../../server/admin_handlers/orders')).ordersHandler(req, res, supabase)
    }

    // Users: GET user by id
    if (act === 'users') {
      return (await import('../../server/admin_handlers/users')).usersHandler(req, res, supabase)
    }

    // Option and Option-values writes (simple wrapper)
    if (act === 'option' && req.method === 'POST') {
      const { product_id, name } = req.body
      const { data, error } = await supabase.from('product_options').insert([{ producto_id: product_id, name }]).select().single()
      if (error) return res.status(500).json({ error })
      return res.status(201).json({ data })
    }

    if (act === 'option-values') {
      if (req.method === 'POST') {
        const { option_id, value, metadata, visible } = req.body
        const { data, error } = await supabase.from('product_option_values').insert([{ option_id, value, metadata, visible }]).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(201).json({ data })
      }
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const { id, updates } = req.body
        const { data, error } = await supabase.from('product_option_values').update(updates).eq('id', id).select().single()
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ data })
      }
      if (req.method === 'DELETE') {
        const id = req.query.id as string
        const { error } = await supabase.from('product_option_values').delete().eq('id', id)
        if (error) return res.status(500).json({ error })
        return res.status(200).json({ ok: true })
      }
    }

    // Batch update option values (migrated from option-values/batch-update.ts)
    if (act === 'option-values-batch') {
      return (await import('../../server/admin_handlers/batchUpdate')).batchUpdateHandler(req, res, supabase)
    }

    // Variants write wrapper
    if (act === 'variants-write') {
      return (await import('../../server/admin_handlers/variantsWrite')).variantsWriteHandler(req, res, supabase)
    }

    return res.status(400).json({ error: 'Invalid admin action' })
  } catch (err) {
    console.error('Unexpected error in admin/index:', err)
    return res.status(500).json({ error: String(err) })
  }
}
