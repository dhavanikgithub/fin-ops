import express from 'express';
import { ProfilerProfileController } from '../controllers/profilerProfileController.js';

const router = express.Router();

/**
 * @route GET /api/v2/profiler/profiles
 * @description Get all profiler profiles (Legacy - without pagination)
 * @access Public
 */
router.get('/', ProfilerProfileController.getAllProfiles);

/**
 * @route GET /api/v2/profiler/profiles/paginated
 * @description Get paginated profiler profiles with search and filters
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   client_id?: number | number[],
 *   bank_id?: number | number[],
 *   status?: 'active' | 'done' | array,
 *   carry_forward_enabled?: boolean,
 *   has_positive_balance?: boolean,
 *   has_negative_balance?: boolean,
 *   balance_greater_than?: number,
 *   balance_less_than?: number,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', ProfilerProfileController.getPaginatedProfiles);

/**
 * @route GET /api/v2/profiler/profiles/dashboard
 * @description Get dashboard profiles (active with positive balance)
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   client_id?: number,
 *   bank_id?: number
 * }
 */
router.get('/dashboard', ProfilerProfileController.getDashboardProfiles);

/**
 * @route GET /api/v2/profiler/profiles/autocomplete
 * @description Get profiler profiles for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   client_id?: number,
 *   status?: 'active' | 'done',
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', ProfilerProfileController.getProfilesAutocomplete);

/**
 * @route GET /api/v2/profiler/profiles/client/:clientId
 * @description Get all profiles for a specific client
 * @access Public
 */
router.get('/client/:clientId', ProfilerProfileController.getProfilesByClient);

/**
 * @route GET /api/v2/profiler/profiles/:id
 * @description Get profiler profile by ID
 * @access Public
 */
router.get('/:id', ProfilerProfileController.getProfileById);

/**
 * @route POST /api/v2/profiler/profiles
 * @description Create a new profiler profile
 * @access Public
 * @body {
 *   client_id: number,
 *   bank_id: number,
 *   credit_card_number: string,
 *   pre_planned_deposit_amount: number,
 *   carry_forward_enabled?: boolean,
 *   notes?: string
 * }
 */
router.post('/', ProfilerProfileController.createProfile);

/**
 * @route PUT /api/v2/profiler/profiles
 * @description Update an existing profiler profile
 * @access Public
 * @body {
 *   id: number,
 *   bank_id?: number,
 *   credit_card_number?: string,
 *   pre_planned_deposit_amount?: number,
 *   carry_forward_enabled?: boolean,
 *   notes?: string
 * }
 */
router.put('/', ProfilerProfileController.updateProfile);

/**
 * @route PUT /api/v2/profiler/profiles/mark-done
 * @description Mark a profile as done
 * @access Public
 * @body { id: number }
 */
router.put('/mark-done', ProfilerProfileController.markProfileAsDone);

/**
 * @route DELETE /api/v2/profiler/profiles
 * @description Delete a profiler profile (only if no transactions exist)
 * @access Public
 * @body { id: number }
 */
router.delete('/', ProfilerProfileController.deleteProfile);

export default router;
