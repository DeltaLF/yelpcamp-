module.exports = function catchAsync(fn) {
  return function (req, res, next) {
    console.log("IIIIIIIn catchAsync");
    fn(req, res, next).catch((e) => next(e));
  };
};
