exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        docTitle: 'Content not found',
        path: null,
        isAuthenticated: req.session.isLoggedIn
    })
};