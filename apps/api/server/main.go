package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/mohammed-ayoub-dz/hifz/config"
)


func main(){

	config.Db();
	app := fiber.New();

	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
	}))

	log.Fatal(app.Listen(":3000"))
}