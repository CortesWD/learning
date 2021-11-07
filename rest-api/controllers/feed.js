exports.getPosts = (req, res, next) => {
  res
    .status(200)
    .json({
      posts: [{
        title: 'first post',
        content: 'first post content'
      }]
    });
};

exports.createPost = (req, res, next) => {
  const { body: { title, content } } = req;
  res
    .status(201)
    .json({
      message: 'created successfully',
      post: {
        id: new Date().toISOString(),
        title,
        content,
      }
    })
}