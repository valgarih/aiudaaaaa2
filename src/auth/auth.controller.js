const User = require('./auth.dao');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = 'secretkey123456';

exports.createUser = (req, res, next) =>{
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    User.create(newUser, (err, user ) => {
        if(err) return res.status(500).send('Server error');
        const expiresIn = 24*60*60;
        const accessToken = jwt.sign({id: user.id},
        SECRET_KEY, 
        {
            expiresIn: expiresIn
        });
        res.send({user});
    })
}

exports.loginUser = (req, res, next) =>{
    const userData = {
        email: req.body.email,
        password: req.body.password
    }
    User.findOne({ email: userData.email}, (err, user,password) =>{
        if(err) return res.status(500).send('Server error');

        if(!user){
            res.status(409).send({message: 'Correo Incorrecto'});
        }else {
            // const resultPassword = userData.password;
            if(!password){
                res.status(409).send({ message : 'Contraseña Incorrecta'});
            }else {
                const expiresIn = 24*60*60;
                const accessToken = jwt.sign({id: user.id},
                    SECRET_KEY, 
                    {
                        expiresIn: expiresIn
                    });
                res.send({ userData});
                
            }
        }
    });


}