import express from 'express';
import { ClientController } from '../controllers/clientController';

const router = express.Router();

/**
 * @route GET /api/v1/clients
 * @description Get all clients with transaction count (Legacy - without pagination)
 * @access Public
 */
router.get('/', ClientController.getAllClients);

/**
 * @route GET /api/v1/clients/paginated
 * @description Get paginated clients with search and sort
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', ClientController.getPaginatedClients);

/**
 * @route GET /api/v1/clients/autocomplete
 * @description Get clients for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', ClientController.getClientsAutocomplete);

/**
 * @route GET /api/v1/clients/:id
 * @description Get client by ID with transaction count
 * @access Public
 */
router.get('/:id', ClientController.getClientById);

/**
 * @route GET /api/v1/clients/name/:name
 * @description Get client by name with transaction count
 * @access Public
 */
router.get('/name/:name', ClientController.getClientByName);

/**
 * @route POST /api/v1/clients
 * @description Create a new client
 * @access Public
 * @body { name: string, email?: string, contact?: string, address?: string }
 */
router.post('/', ClientController.createClient);

/**
 * @route PUT /api/v1/clients
 * @description Update an existing client
 * @access Public
 * @body { id: number, name: string, email?: string, contact?: string, address?: string }
 */
router.put('/', ClientController.updateClient);

/**
 * @route DELETE /api/v1/clients
 * @description Delete a client
 * @access Public
 * @body { id: number }
 */
router.delete('/', ClientController.deleteClient);

export default router;