const express = require('express');
const fs = require('fs');
const router = express.Router();
const cartsFilePath = './src/data/carts.json';

/* Función para leer los carritos desde el archivo */
const getCartsFromFile = () => {
    /* Si no existe el archivo, creamos uno vacío */
    if (!fs.existsSync(cartsFilePath)) {
        fs.writeFileSync(cartsFilePath, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
};

/* Función para guardar los carritos en el archivo */
const saveCartsToFile = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

/* Ruta para crear un nuevo carrito */
router.post('/', (req, res) => {
    const carts = getCartsFromFile();
    /* Generamos un nuevo carrito con un ID único */
    const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
    carts.push(newCart);
    saveCartsToFile(carts); /* Guardamos el carrito */
    res.status(201).json(newCart); /* Enviamos la respuesta */
});

/* Ruta para obtener los productos de un carrito por su ID */
router.get('/:cid', (req, res) => {
    const carts = getCartsFromFile();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (cart) {
        res.json(cart.products); /* Devolvemos los productos del carrito */
    } else {
        res.status(404).json({ error: 'No se encontró el carrito' }); /* Error si no existe el carrito */
    }
});

/* Ruta para agregar un producto al carrito */
router.post('/:cid/product/:pid', (req, res) => {
    const carts = getCartsFromFile();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    
    /* Verificamos si el carrito existe */
    if (cart) {
        const productId = parseInt(req.params.pid);
        const products = getCartsFromFile(); /* Leemos los productos */
        const productExists = products.some(p => p.id === productId);

        /* Si el producto no existe, retornamos un error */
        if (!productExists) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        /* Buscamos si el producto ya está en el carrito */
        const existingProduct = cart.products.find(p => p.product === productId);

        if (existingProduct) {
            /* Si el producto ya está, aumentamos su cantidad */
            existingProduct.quantity += 1;
            res.status(200).json({ message: 'Producto actualizado en el carrito', cart });
        } else {
            /* Si el producto no está, lo agregamos con cantidad 1 */
            cart.products.push({ product: productId, quantity: 1 });
            res.status(200).json({ message: 'Producto agregado al carrito', cart });
        }
        
        saveCartsToFile(carts); /* Guardamos el carrito actualizado */
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

module.exports = router;
