package handlers

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/mohammed-ayoub-dz/hifz/config"
	"github.com/mohammed-ayoub-dz/hifz/models"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

type GoogleAuthRequest struct {
	Token string `json:"token"`
}

type AuthUserResponse struct {
	ID     uint   `json:"id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Hearts int    `json:"hearts"`
	Streak int    `json:"streak"`
}

type AuthClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}


const tokenIDBytes = 16
var ErrTokenIDGeneration = errors.New("failed to generate secure token ID")


func GoogleLogin(c fiber.Ctx) error {

	var req GoogleAuthRequest

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body.",
		})
	}

	req.Token = strings.TrimSpace(req.Token)

	if req.Token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "A Google token is required.",
		})
	}
	googleClientID := strings.TrimSpace(
		os.Getenv("GOOGLE_CLIENT_ID"),
	)

	jwtSecret := os.Getenv("JWT_SECRET")

	if googleClientID == "" {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Authentication service is not configured.",
		})
	}

	if len(jwtSecret) < 32 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Authentication service is not configured.",
		})
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	payload, err := idtoken.Validate(
		ctx,
		req.Token,
		googleClientID,
	)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Google token is invalid or expired.",
		})
	}

	googleID := strings.TrimSpace(payload.Subject)

	if googleID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid Google identity.",
		})
	}

	email, ok := payload.Claims["email"].(string)

	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Google account email is missing.",
		})
	}

	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Google account email is missing.",
		})
	}

	emailVerified, ok := payload.Claims["email_verified"].(bool)

	if !ok || !emailVerified {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Google email is not verified.",
		})
	}

	name, _ := payload.Claims["name"].(string)
	avatar, _ := payload.Claims["picture"].(string)

	name = strings.TrimSpace(name)
	avatar = strings.TrimSpace(avatar)

	var user models.User

	err = config.DB.Transaction(func(tx *gorm.DB) error {

		result := tx.
			Where("google_id = ?", googleID).
			First(&user)

		if result.Error == nil {
			user.Name = name
			user.Avatar = avatar

			return tx.Model(&user).Updates(map[string]interface{}{
				"name":   name,
				"avatar": avatar,
			}).Error
		}

		if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return result.Error
		}
		result = tx.
			Where("email = ?", email).
			First(&user)

		if result.Error == nil {
			user.GoogleID = googleID
			user.Name = name
			user.Avatar = avatar

			return tx.Model(&user).Updates(map[string]interface{}{
				"google_id": googleID,
				"name":      name,
				"avatar":    avatar,
			}).Error
		}

		if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return result.Error
		}

		user = models.User{
			GoogleID: googleID,
			Email:    email,
			Name:     name,
			Avatar:   avatar,
			Hearts:   5,
			Streak:   0,
		}

		if err := tx.Create(&user).Error; err != nil {
			return err
		}

		return nil
	})


	if err != nil {

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unable to complete authentication.",
		})
	}


	now := time.Now()

	tokenID, err := generateTokenID()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unable to create authentication session.",
		})
	}

	claims := AuthClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer: "hifz-api",

			Subject: googleID,

			Audience: jwt.ClaimStrings{
				"hifz-client",
			},

			IssuedAt: jwt.NewNumericDate(now),

			NotBefore: jwt.NewNumericDate(now),

			ExpiresAt: jwt.NewNumericDate(
				now.Add(72 * time.Hour),
			),

			ID: tokenID,
		},
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		claims,
	)

	tokenString, err := token.SignedString(
		[]byte(jwtSecret),
	)

	if err != nil {

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unable to create authentication session.",
		})
	}


	userResponse := AuthUserResponse{
		ID:     user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Avatar: user.Avatar,
		Hearts: user.Hearts,
		Streak: user.Streak,
	}

	sameSiteMode := "Lax"
	if isProduction() {
		sameSiteMode = "None" 
	}

	c.Cookie(&fiber.Cookie{
    Name:     "hifz_token",
    Value:    tokenString,
    Expires:  time.Now().Add(72 * time.Hour),
    HTTPOnly: true,                 
    Secure:   isProduction(),                 
    SameSite: sameSiteMode,                
    Path:     "/",
    })

	
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Logged in successfully.",
		"token":   tokenString,
		"user":    userResponse,
	})
}

func generateTokenID() (string, error) {
	var b [tokenIDBytes]byte

	if _, err := rand.Read(b[:]); err != nil {
		return "", ErrTokenIDGeneration
	}

	return hex.EncodeToString(b[:]), nil
}


func isProduction() bool {
	return os.Getenv("APP_ENV") == "production" || os.Getenv("NODE_ENV") == "production"
}