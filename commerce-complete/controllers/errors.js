exports.get404 = (req, res, next) => {
    res.status(404).render('404', {
        docTitle: 'Content not found',
        path: null,
    })
};

exports.get500 = (req, res, next) => {
    res.status(500).render('500', {
        docTitle: 'Server Error',
        path: null,
    });
}