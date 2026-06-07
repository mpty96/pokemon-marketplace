import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  create,
  list,
  getOne,
  update,
  remove,
  myListings,
  listingsHistory,
  homeRecentListings,
  homePopularListings,
} from '../controllers/listing.controller';

const router = Router();

router.get('/',        list);
router.get('/my',      authenticate, myListings);
router.get('/history', authenticate, listingsHistory);
router.get('/home/recent', homeRecentListings);
router.get('/home/popular', homePopularListings);
router.get('/:id',     getOne);
router.post('/',       authenticate, upload.array('images', 1), create);
router.put('/:id',     authenticate, update);
router.delete('/:id',  authenticate, remove);

export default router;