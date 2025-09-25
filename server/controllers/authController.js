const User = require('../models/User');
const jwt = require('jsonwebtoken')

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: '', firstName: '', lastName: ''};

    //duplicate eror code
    if (err.code === 11000) {
        errors.email = 'That email is already registered'
        return errors
    }
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered'
    }
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect'
    }
    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        });
    }
    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
    return jwt.sign({id, role}, 'kevin secret', {
        expiresIn: maxAge
    })
}

module.exports.register = async(req, res) =>{

    const { email, password, firstName, lastName, role } = req.body;
    try {
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: ['farmer','lender','cold_storage_owner'].includes(role) ? role : 'farmer'
        });
        const token = createToken(user._id, user.role);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000, secure: false, sameSite: 'lax'});
        res.status(201).json({user: user._id, role: user.role, token});
        console.log(token);
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json( {errors} );
    }
}

module.exports.login = async(req, res) =>{
    const { email, password} = req.body;
    try { 
        const user = await User.login(email, password);
        const token = createToken(user._id, user.role);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000, secure: false, sameSite: 'lax'});
        res.status(200).json({ user: user._id, role: user.role, token});
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1});
    res.redirect('/')
}

module.exports.getCurrentUser = async (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, 'kevin secret');
        const user = await User.findById(decodedToken.id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt || null
            }
        });

    } catch (err) {
        console.error('Get current user error:', err.message);
        res.status(401).json({ error: 'Invalid token' });
    }
}