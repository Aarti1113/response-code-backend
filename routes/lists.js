const express = require('express');
const List = require('../models/List');
const router = express.Router();
const authenticate = require('../middleware/auth');

const responseCodes = {
  '200': 'https://http.dog/200.jpg',
  '201': 'https://http.dog/201.jpg',
  '202': 'https://http.dog/202.jpg',
  '203': 'https://http.dog/203.jpg',
  '204': 'https://http.dog/204.jpg',
  '300': 'https://http.dog/300.jpg',
  // Add other response codes as needed...
};

// Filter Response Codes
router.get('/filter', (req, res) => {
    const { filter } = req.query;
  
    if (!filter) {
      return res.status(400).json({ error: 'Filter parameter is required' });
    }
  
    const regex = new RegExp(`^${filter.replace('x', '\\d')}$`);
    const filteredCodes = Object.keys(responseCodes).filter((code) => regex.test(code));
  
    if (filteredCodes.length === 0) {
      return res.status(404).json({ error: 'No matching response codes found' });
    }
  
    const filteredImages = filteredCodes.map((code) => ({ code, image: responseCodes[code] }));
    res.status(200).json(filteredImages);
  });

// Save List
router.post('/save', authenticate, async (req, res) => {
    const { listName, responseCodes, images } = req.body;
    console.log('Request body:', req.body);
    console.log('Authenticated user ID:', req.user?.id);
    if (!listName || !responseCodes || !images) {
        return res.status(400).json({ error: 'All fields (listName, responseCodes, and images) are required' });
      }
    try {
      const newList = new List({
        name: listName, // Use `listName` from the request body
      responseCodes,
      imageLinks: images,
      createdAt: new Date(),
      userId: req.user.id,
      });
  
      await newList.save();
      res.status(201).json({ message: 'List saved successfully' });
    } catch (error) {
      // res.status(500).json({ error: error.message });
      console.error('Error saving list:', error);
    return res.status(500).json({ error: error.message });
    }
  });


router.get('/', authenticate, async (req, res) => {
  try {
      const lists = await List.find({ userId: req.user.id });  // Fetch lists associated with the logged-in user
      res.status(200).json(lists);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
router.delete('/:id', authenticate, async (req, res) => {
  console.log('Received request to delete list with ID:', req.params.id);  // Log the ID from the request URL
    console.log('Authenticated user ID:', req.user.id);
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Using findByIdAndDelete
    await List.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'List deleted successfully' });

    // OR you could use:
    // await list.deleteOne(); // Delete the document
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: error.message });
  }
});
// routes/lists.js (PUT /lists/:id)
router.put('/:id', authenticate, async (req, res) => {
  const { listName, responseCodes, images } = req.body;

  try {
      const list = await List.findById(req.params.id);

      if (!list) return res.status(404).json({ error: 'List not found' });

      if (list.userId.toString() !== req.user.id) {
          return res.status(403).json({ error: 'Unauthorized' });
      }

      list.name = listName || list.name;
      list.responseCodes = responseCodes || list.responseCodes;
      list.imageLinks = images || list.imageLinks;
      await list.save();

      res.status(200).json({ message: 'List updated successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


module.exports = router;
