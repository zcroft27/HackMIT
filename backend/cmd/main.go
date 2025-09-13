package main

import (
	"context"
	"hackmit/internal/config"
	"hackmit/internal/service"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/sethvargo/go-envconfig"
)

func main() {
	var config config.Config
	if err := envconfig.Process(context.Background(), &config); err != nil {
		log.Fatalln("Error processing .env file: ", err)
	}

	app := service.InitApp(config)

	// Pushing the closing of the database connection onto a
	// stack of statements to be executed when this function returns.

	// **Uncomment after repo connection is actually made**
	// defer app.Repo.Close()

	port := config.Application.Port
	// Listen for connections with a goroutine.
	go func() {
		if err := app.Server.Listen(":" + port); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Wait for the termination signal:
	<-quit

	// Then shutdown server gracefully.
	slog.Info("Shutting down server")
	if err := app.Server.Shutdown(); err != nil {
		slog.Error("failed to shutdown server", "error", err)
	}

	slog.Info("Server shutdown")
}
