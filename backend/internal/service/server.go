package service

import (
	"context"
	"hackmit/internal/config"
	errs "hackmit/internal/errs"
	"hackmit/internal/handler/auth"
	"hackmit/internal/handler/tag"
	"hackmit/internal/storage"
	"hackmit/internal/storage/postgres"
	"net/http"

	go_json "github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/swagger"
)

type App struct {
	Server *fiber.App
	Repo   *storage.Repository
}

// Initialize the App union type containing a fiber app, a repository, and a climatiq client.
func InitApp(config config.Config) *App {
	ctx := context.Background()
	repo := postgres.NewRepository(ctx, config.DB)

	app := SetupApp(config, repo)

	return &App{
		Server: app,
		Repo:   repo,
	}
}

// Setup the fiber app with the specified configuration, database, and climatiq client.
func SetupApp(config config.Config, repo *storage.Repository) *fiber.App {
	app := fiber.New(fiber.Config{
		JSONEncoder:  go_json.Marshal,
		JSONDecoder:  go_json.Unmarshal,
		ErrorHandler: errs.ErrorHandler,
	})

	app.Use(recover.New())
	app.Use(favicon.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// Use logging middleware
	app.Use(logger.New())

	// Use CORS middleware to configure CORS and handle preflight/OPTIONS requests.
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://localhost:8080, http://127.0.0.1:8080,http://127.0.0.1:3000",
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS", // Using these methods.
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true, // Allow cookies
		ExposeHeaders:    "Content-Length, X-Request-ID",
	}))

	app.Static("/api", "/app/api")

	app.Get("/swagger/*", swagger.New(swagger.Config{
		URL:         "/api/openapi.yaml",
		DeepLinking: false,
	}))

	app.Get("/", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).SendString("Welcome to The DIGITAL OCEAN!")
	})

	apiV1 := app.Group("/api/v1")

	apiV1.Get("/health", func(c *fiber.Ctx) error {
		return c.SendStatus(http.StatusOK)
	})

	SupabaseAuthHandler := auth.NewHandler(config.Supabase, repo.User)

	apiV1.Route("/auth", func(router fiber.Router) {
		router.Post("/signup", SupabaseAuthHandler.SignUp)
		router.Post("/login", SupabaseAuthHandler.Login)
		router.Post("/forgot-password", SupabaseAuthHandler.ForgotPassword)
		router.Post("/reset-password", SupabaseAuthHandler.ResetPassword)
		router.Post("/sign-out", SupabaseAuthHandler.SignOut)
		router.Delete("/delete-account/:id", func(c *fiber.Ctx) error {
			id := c.Params("id")
			return SupabaseAuthHandler.DeleteAccount(c, id)
		})
	})

	TagHandler := tag.NewHandler(repo.Tag)
	apiV1.Route("/tags", func(router fiber.Router) {
		router.Get("/", TagHandler.Get)
	})

	// Handle 404 - Route not found
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Route not found",
			"path":  c.Path(),
		})
	})

	return app
}
