package storage

import (
	"context"
	"hackmit/internal/service/models"
	"hackmit/internal/storage/postgres/schema"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	AddUser(ctx context.Context, userId string, firstName *string, lastName *string) (*models.User, error)
	GetUserProfile(ctx context.Context, userID string) (*models.User, error)
	DeleteUser(ctx context.Context, userID string) (string, error)
}

type Repository struct {
	db   *pgxpool.Pool
	User UserRepository
}

func (r *Repository) Close() error {
	r.db.Close()
	return nil
}

func (r *Repository) GetDB() *pgxpool.Pool {
	return r.db
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db:   db,
		User: schema.NewUserRepository(db),
	}
}
