const express = require('express');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
const cart = require('./emercado-api/cart/buy.json');
const categories = require('./emercado-api/cats/cat.json');
const sell = require('./emercado-api/sell/publish.json');
const userCart = require('./emercado-api/user_cart/25801.json');
const archivoCarrito = "carrito.json"

app.use(express.urlencoded({ extended: false })); // Necesario para enviar datos por urlencode en postman

const cors = require('cors');
app.use(cors({
    origin: '*'
}));


// Creacion de token

const hardcodedUser = {
    username: 'usuario@gmail.com',
    password: 'contraseña'
};

const secretKey = 'tu_clave_secreta';

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Autenticación (en un entorno de producción, consulta una base de datos)
    if (username === hardcodedUser.username && password === hardcodedUser.password) {
        // Generar token con jwt.sign
        const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });

        res.json({ token });
    } else {
        res.status(401).json({ error: 'Autenticación fallida' });
    }
});



// Clave secreta para firmar y verificar tokens (se recomienda almacenar esto de forma segura)


// Middleware para verificar el token en las rutas protegidas
const authenticateToken = (req, res, next) => {
    // Obtener el token de la cabecera de autorización
    const auth = req.get('authorization');
    let token = null

    if (auth && auth.toLowerCase().startsWith('bearer')) {
        token = auth.substring(7);
    }

    let decodeToken = jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token no válido' });
        }

        // Guardar el usuario en la solicitud para su uso posterior
        req.user = user;

        next(); // Continuar con la siguiente función de middleware
    });

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
};


// funcion para guardar datos

function guardarDatos(datos) {
    // Lee el contenido actual del archivo, si existe
    let contenidoExistente = {};
    try {
        contenidoExistente = JSON.parse(fs.readFileSync(archivoCarrito, 'utf-8'));
    } catch (error) {
        // Si el archivo no existe o no se puede leer, se inicializa como un objeto vacío
    }

    // Verifica si ya hay datos para este usuario
    if (contenidoExistente[datos.user]) {
        // Si ya hay datos, agrega el nuevo artículo al array articles
        contenidoExistente[datos.user].articles.push(...datos.articles);
    } else {
        // Si no hay datos para este usuario, simplemente asigna los datos al usuario
        contenidoExistente[datos.user] = datos;

    }

    // Escribe el contenido actualizado en el archivo
    fs.writeFileSync(archivoCarrito, JSON.stringify(contenidoExistente, null, 2), 'utf-8');
}




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
    const userInfo = req.user;
    let articles = req.body

  
    // Datos a guardar en el archivo
      const datos = {
        user: username,
        articles: [articles], // Se inicializa con el nuevo artículo
      };

    // Guardar datos en un archivo JSON
    guardarDatos(datos);

    res.json({ mensaje: 'Este es un recurso protegido', usuario: userInfo });


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