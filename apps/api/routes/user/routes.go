package user

import (
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"

	"github.com/mohammed-ayoub-dz/hifz/handlers"
	"github.com/mohammed-ayoub-dz/hifz/middleware"
)

func RegisterRoutes(api fiber.Router) {
	user := api.Group(
		"/user",
		middleware.Protected(),
	)

	user.Post("/onboarding", handlers.CompleteOnboarding(&gorm.DB{}))
}