package storage

import (
	"context"
	"hackmit/internal/models"
	"hackmit/internal/storage/postgres/schema"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository interface {
	AddUser(ctx context.Context, userId string, firstName *string, lastName *string, email string) (*models.User, error)
	GetUserProfile(ctx context.Context, userID string) (*models.User, error)
	DeleteUser(ctx context.Context, userID string) (string, error)
}

type BottleRepository interface {
	CreateBottle(ctx context.Context, req models.CreateBottleRequest) (*models.Bottle, error)
	DeleteBottle(ctx context.Context, bottleId int) (string, error)
	GetBottles(ctx context.Context, filterParams models.GetBottlesRequest) ([]models.Bottle, error)
	GetBottlesByUser(ctx context.Context, userId int) ([]models.Bottle, error)
	GetRandomBottle(ctx context.Context, filterParams models.GetRandomBottleRequest, ocean models.Ocean) (*models.Bottle, error)
}

type OceanRepository interface {
	GetOceans(ctx context.Context, filterParams models.GetOceansRequest) ([]models.Ocean, error)
	GetDefaultOcean(ctx context.Context) (*models.Ocean, error)
	GetRandomPersonalOcean(ctx context.Context, currentUserId uuid.UUID) (*models.Ocean, error)
	GetOceanByUser(ctx context.Context, userId uuid.UUID) (*models.Ocean, error)
	CreateOcean(ctx context.Context, name *string, description *string, userId uuid.UUID) (*models.Ocean, error)
	GetOceanById(ctx context.Context, oceanId int) (*models.Ocean, error)
}

type TagRepository interface {
	GetTags(ctx context.Context, filterParams models.GetTagsRequest) ([]models.Tag, error)
	GetDefaultTag(ctx context.Context) (*models.Tag, error)
}

type Repository struct {
	db     *pgxpool.Pool
	User   UserRepository
	Bottle BottleRepository
	Ocean  OceanRepository
	Tag    TagRepository
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
		db:     db,
		User:   schema.NewUserRepository(db),
		Ocean:  schema.NewOceanRepository(db),
		Tag:    schema.NewTagRepository(db),
		Bottle: schema.NewBottleRepository(db),
	}
}
