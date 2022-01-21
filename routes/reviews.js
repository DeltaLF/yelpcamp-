const express = require("express");
const catchAsync = require("../utils/catchAsync");
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("./../controllers/reviews");

router.post(
  "/",
  isLoggedIn,
  //isReviewAuthor, //not only reviewAuthor can write review but other loggedIn user
  validateReview,
  catchAsync(reviews.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
