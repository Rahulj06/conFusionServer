const express = require("express");
const bodyParser = require("body-parser");

const cors = require("./cors");

const Favorites = require("../models/favorite");

const favoriteRouter = express.Router();

var authenticate = require("../authenticate");

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    const userId = req.user._id;
    Favorites.findOne({
      user: userId,
    })
      .populate("dishes")
      .populate("user")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const userId = req.user._id;
    Favorites.findOne({
      user: userId,
    })
      .then((favorite) => {
        if (!favorite) {
          Favorites.create({
            user: userId,
            dishes: [...new Set(req.body.map(({ _id }) => _id))],
          })
            .then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          Favorites.findByIdAndUpdate(
            favorite._id,
            {
              dishes: [
                ...new Set(
                  favorite.dishes
                    .map((i) => i.toString())
                    .concat(req.body.map(({ _id }) => _id))
                ),
              ],
            },
            { new: true }
          )
            .then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,

    (req, res, next) => {
      Favorites.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:dishId")
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const userId = req.user._id;
    const dishId = req.params.dishId;

    Favorites.findOne({
      user: userId,
    })
      .then((favorite) => {
        if (!favorite) {
          Favorites.create({
            user: userId,
            dishes: dishId,
          })
            .then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        } else {
          Favorites.findByIdAndUpdate(
            favorite._id,
            {
              dishes:
                favorite.dishes.indexOf(req.params.dishId) > 0
                  ? favorite.dishes
                  : favorite.dishes.concat([req.params.dishId]),
            },
            { new: true }
          )
            .then(
              (fav) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(fav);
              },
              (err) => next(err)
            )
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const userId = req.user._id;
    const dishId = req.params.dishId;
    Favorites.findOne({
      user: userId,
    })
      .then(
        (favorite) => {
          if (favorite && favorite.dishes) {
            Favorites.findByIdAndUpdate(
              favorite._id,
              {
                dishes: favorite.dishes.filter((i) => i.toString() !== dishId),
              },
              { new: true }
            )
              .then(
                (fav) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(fav);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(null);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;