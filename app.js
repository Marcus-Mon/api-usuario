const express = require('express');
const fs = require('fs');

const app = express();
const PUERTO = 3000;

app.use(express.json());

const leerUsuarios = () => {
    const datos = fs.readFileSync('users.json');
    return JSON.parse(datos);
};

const guardarUsuarios = (usuarios) => {
    fs.writeFileSync('users.json', JSON.stringify(usuarios, null, 2));
};

const validarUsuario = (usuario) => {
    if (!usuario.nombre) return "El nombre es obligatorio";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) return "Email inválido";

    if (usuario.edad <= 0) return "La edad debe ser mayor a 0";

    if (typeof usuario.activo !== "boolean") return "Activo debe ser true o false";

    return null;
};

app.get('/users', (req, res) => {
    const usuarios = leerUsuarios();
    res.status(200).json(usuarios);
});

app.get('/users/:id', (req, res) => {
    const usuarios = leerUsuarios();
    const usuario = usuarios.find(u => u.id == req.params.id);

    if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
});

app.post('/users', (req, res) => {
    const usuarios = leerUsuarios();
    const error = validarUsuario(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    const nuevoUsuario = {
        id: usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1,
        ...req.body
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    res.status(201).json(nuevoUsuario);
});

app.put('/users/:id', (req, res) => {
    let usuarios = leerUsuarios();
    const indice = usuarios.findIndex(u => u.id == req.params.id);

    if (indice === -1) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const error = validarUsuario(req.body);
    if (error) {
        return res.status(400).json({ error });
    }

    usuarios[indice] = { id: usuarios[indice].id, ...req.body };
    guardarUsuarios(usuarios);

    res.status(200).json(usuarios[indice]);
});

app.delete('/users/:id', (req, res) => {
    let usuarios = leerUsuarios();
    const indice = usuarios.findIndex(u => u.id == req.params.id);

    if (indice === -1) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const eliminado = usuarios.splice(indice, 1);
    guardarUsuarios(usuarios);

    res.status(200).json(eliminado);
});

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});