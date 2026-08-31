package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/mohammed-ayoub-dz/hifz/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Db(){
	err := godotenv.Load()

	if err != nil {
		log.Println("The .env file was not found in the runtime environment.")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	var dbErr error

	DB, dbErr = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if dbErr != nil {
		log.Fatal("Failed to connect to the database ", dbErr)
	}
	
	err = DB.AutoMigrate(
    &models.User{},
    &models.HifzProgress{},
    &models.DailyProgress{},
    &models.HifzSession{},
   )
	if err != nil {
		log.Fatal("Failed to create the users table: ", err)
	} 

	fmt.Println("Successfully connected to the database.")
		
}