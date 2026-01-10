import express from 'express';
import { ProfilerClientController } from '../controllers/profilerClientController.js';

const router = express.Router();

/**
 * @route GET /api/v2/profiler/clients
 * @description Get all profiler clients (Legacy - without pagination)
 * @access Public
 */
router.get('/', ProfilerClientController.getAllClients);

/**
 * @route GET /api/v2/profiler/clients/paginated
 * @description Get paginated profiler clients with search and filters
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   has_profiles?: boolean,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', ProfilerClientController.getPaginatedClients);

/**
 * @route GET /api/v2/profiler/clients/autocomplete
 * @description Get profiler clients for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', ProfilerClientController.getClientsAutocomplete);

/**
 * @route GET /api/v2/profiler/clients/:id
 * @description Get profiler client by ID
 * @access Public
 */
router.get('/:id', ProfilerClientController.getClientById);

/**
 * @route POST /api/v2/profiler/clients
 * @description Create a new profiler client
 * @access Public
 * @body {
 *   name: string,
 *   email?: string,
 *   mobile_number?: string,
 *   aadhaar_card_number?: string,
 *   aadhaar_card_image?: string,
 *   notes?: string
 * }
 */
router.post('/', ProfilerClientController.createClient);

/**
 * @route PUT /api/v2/profiler/clients
 * @description Update an existing profiler client
 * @access Public
 * @body {
 *   id: number,
 *   name: string,
 *   email?: string,
 *   mobile_number?: string,
 *   aadhaar_card_number?: string,
 *   aadhaar_card_image?: string,
 *   notes?: string
 * }
 */
router.put('/', ProfilerClientController.updateClient);

/**
 * @route DELETE /api/v2/profiler/clients
 * @description Delete a profiler client (only if no profiles exist)
 * @access Public
 * @body { id: number }
 */
router.delete('/', ProfilerClientController.deleteClient);

export default router;
