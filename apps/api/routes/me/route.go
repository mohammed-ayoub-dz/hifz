package me

import (
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"

	"github.com/mohammed-ayoub-dz/hifz/handlers"
	"github.com/mohammed-ayoub-dz/hifz/middleware"
)

func RegisterRoutes(api fiber.Router) {
	me := api.Group(
		"/me",
		middleware.Protected(),
	)

	me.Get("/", handlers.GetMe(&gorm.DB{}))
}