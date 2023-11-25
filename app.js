const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
app.use(express.json());

const cart = require('./emercado-api/cart/buy.json');
const categories = require('./emercado-api/cats/cat.json');
const sell = require('./emercado-api/sell/publish.json');
const userCart = require('./emercado-api/user_cart/25801.json');

app.use(express.urlencoded({extended:false})); // Necesario para enviar datos por urlencode en postman

const cors = require('cors');
app.use(cors({
    origin: '*'
}));


// Creacion de token

const hardcodedUser = {
    username: 'usuario',
    password: 'contraseña'
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Autenticación (en un entorno de producción, consulta una base de datos)
    if (username === hardcodedUser.username && password === hardcodedUser.password) {
        // Generar token con jwt.sign
        const token = jwt.sign({ username }, 'tu_secreto_secreto', { expiresIn: '1h' });

        res.json({ token });
    } else {
        res.status(401).json({ error: 'Autenticación fallida' });
    }
});



// funcion para usar la autenticación // Middleware 
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, 'tu_secreto_secreto', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Almacenar el usuario en la solicitud para su uso posterior
        req.user = decoded;

        next();
    });
};




// rutas

app.get('/', (req, res) => {
    res.send("hola mundo");
});

app.get('/cart', authenticateToken, (req, res) => {
    // La ruta /cart ahora está protegida y puedes acceder al usuario autenticado mediante req.user
    res.json({ message: 'Ruta protegida', user: req.user });
}); 

app.post('/cart', authenticateToken, (req, res) => {
    // La ruta /cart ahora está protegida y puedes acceder al usuario autenticado mediante req.user
    let {username} = req.user;
    let id = req.body.id;
    let name = req.body.name;
    let count = req.body.count;
    let unitCost = req.body.unitCost;
    let currency = req.body.currency;
    let image = req.body.image;
    


    //res.json(name)
    //res.json({ message: 'Ruta protegida', user: req.user });
}); 

app.get('/cats', (req, res) => {
    res.send(categories);
});

app.get('/cats/:id', (req, res) => {
    let idProduct = req.params.id
    let categorias = categories.find(categoria => categoria.id == idProduct) //
    
    if (categorias) {
      res.send(categorias);
  } else {
      res.status(404).send({ message: "No se encuentra la categoría" });
  }
});


app.get('/cats_products/:id.:json', (req, res) => {
    let idCat = req.params.id
    let cat_product = require(`./emercado-api/cats_products/${idCat}.json`) 
    
    res.send(cat_product);
});

app.get('/products/:id.:json', (req, res) => {
    let idProd = req.params.id
    let name_product = require(`./emercado-api/products/${idProd}.json`) 
    
    res.send(name_product);
});

app.get('/products_comments/:id.:json', (req, res) => {
    let idCom = req.params.id
    let comment = require(`./emercado-api/products_comments/${idCom}.json`) 
    
    res.send(comment);
});

app.get('/sell', (req, res) => {
    res.send(sell);
});



// se deja escuchando la app en el puerto seleccionado
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});