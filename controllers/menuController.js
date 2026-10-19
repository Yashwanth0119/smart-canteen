import { dataStore } from '../data/store.js';

// READ - Get all menu items
export const getMenuItems = async (req, res) => {
  try {
    const { category, search, isVeg } = req.query;
    let items = await dataStore.getMenuItems();

    if (category && category !== 'All') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

    if (isVeg !== undefined && isVeg !== '') {
      const vegBool = isVeg === 'true';
      items = items.filter(i => i.isVeg === vegBool);
    }

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch menu items', error: error.message });
  }
};

// READ - Single item
export const getMenuItemById = async (req, res) => {
  try {
    const item = await dataStore.getMenuItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE - Add new food item (Worker)
export const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description, image, isVeg, prepTime, inStockCount } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide name, category, and price.' });
    }

    const newItem = await dataStore.createMenuItem({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      prepTime: Number(prepTime) || 10,
      isAvailable: true,
      inStockCount: Number(inStockCount) || 25,
      rating: 4.8
    });

    res.status(201).json({ success: true, message: 'New menu item added successfully!', data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating menu item', error: error.message });
  }
};

// UPDATE - Edit food item (Worker)
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.prepTime !== undefined) updates.prepTime = Number(updates.prepTime);
    if (updates.inStockCount !== undefined) updates.inStockCount = Number(updates.inStockCount);
    if (updates.isVeg !== undefined) updates.isVeg = Boolean(updates.isVeg);
    if (updates.isAvailable !== undefined) updates.isAvailable = Boolean(updates.isAvailable);

    const updated = await dataStore.updateMenuItem(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found to update' });
    }

    res.status(200).json({ success: true, message: 'Menu item updated successfully!', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating menu item', error: error.message });
  }
};

// DELETE - Remove food item (Worker)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await dataStore.deleteMenuItem(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Menu item not found or already deleted' });
    }

    res.status(200).json({ success: true, message: 'Menu item deleted successfully from canteen catalog.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting menu item', error: error.message });
  }
};
