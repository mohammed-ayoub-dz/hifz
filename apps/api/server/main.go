package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"

	"github.com/mohammed-ayoub-dz/hifz/config"
	"github.com/mohammed-ayoub-dz/hifz/middleware"
	authRoutes "github.com/mohammed-ayoub-dz/hifz/routes/auth"
	hifzRoutes "github.com/mohammed-ayoub-dz/hifz/routes/hifz"
	sessionRoutes "github.com/mohammed-ayoub-dz/hifz/routes/sessions"
	dailyRoutes "github.com/mohammed-ayoub-dz/hifz/routes/daily"
)

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET is not configured")
	}

	if os.Getenv("GOOGLE_CLIENT_ID") == "" {
		log.Fatal("GOOGLE_CLIENT_ID is not configured")
	}

	config.Db()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		AllowCredentials: true,
	}))

	api := app.Group("/api/v1")

	authRoutes.RegisterRoutes(api)

	protectedAPI := api.Group(
		"/",
		middleware.Protected(),
	)

	hifzRoutes.RegisterRoutes(protectedAPI)
	sessionRoutes.RegisterRoutes(protectedAPI)
	dailyRoutes.RegisterRoutes(protectedAPI)

	// Start server.
	log.Fatal(app.Listen(":8080"))
}
