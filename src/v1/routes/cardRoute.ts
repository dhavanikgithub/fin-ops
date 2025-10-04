import express from 'express';
import { CardController } from '../controllers/cardController';

const router = express.Router();

/**
 * @route GET /api/v1/cards
 * @description Get all cards with transaction count (Legacy - without pagination)
 * @access Public
 */
router.get('/', CardController.getAllCards);

/**
 * @route GET /api/v1/cards/paginated
 * @description Get paginated cards with search and sort
 * @access Public
 * @query {
 *   page?: number,
 *   limit?: number,
 *   search?: string,
 *   sort_by?: string,
 *   sort_order?: string
 * }
 */
router.get('/paginated', CardController.getPaginatedCards);

/**
 * @route GET /api/v1/cards/autocomplete
 * @description Get cards for autocomplete dropdown
 * @access Public
 * @query {
 *   search?: string,
 *   limit?: number (default: 5, max: 10)
 * }
 */
router.get('/autocomplete', CardController.getCardsAutocomplete);

/**
 * @route POST /api/v1/cards
 * @description Create a new card
 * @access Public
 * @body { name: string }
 */
router.post('/', CardController.createCard);

/**
 * @route PUT /api/v1/cards
 * @description Update an existing card
 * @access Public
 * @body { id: number, name: string }
 */
router.put('/', CardController.updateCard);

/**
 * @route DELETE /api/v1/cards
 * @description Delete a card
 * @access Public
 * @body { id: number }
 */
router.delete('/', CardController.deleteCard);

export default router;