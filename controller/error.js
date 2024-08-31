exports.get404error = (req,res,next) => {
    res.status(404).render('error/404',{
        pagetitle:'This error page',
        isAuthntication :req.session.isLoggedIn
    })
}

exports.get500error = (req,res,next) => {
    res.status(500).render('error/500',{
        pagetitle:'This server error page',
        isAuthntication :req.session.isLoggedIn
    })
}