package storage

import (
	"context"
	"hackmit/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type BottleRepository interface {
	CreateBottle(ctx context.Context, req models.CreateBottleRequest) (*models.Bottle, error)
	DeleteBottle(ctx context.Context, bottleId int) (string, error)
	GetBottles(ctx context.Context, filterParams models.GetBottlesRequest) ([]models.Bottle, error)
	GetBottlesByUser(ctx context.Context, userId int) ([]models.Bottle, error)
}

type OceanRepository interface {
	GetOceans(ctx context.Context, filterParams models.GetOceansRequest) ([]models.Ocean, error)
	GetDefaultOcean(ctx context.Context) (*models.Ocean, error)
	GetRandomPersonalOcean(ctx context.Context, currentUserId int) (*models.Ocean, error)
	GetOceanByUser(ctx context.Context, userId int) (*models.Ocean, error)
}

type TagRepository interface {
	GetTags(ctx context.Context, filterParams models.GetTagsRequest) ([]models.Tag, error)
	GetDefaultTag(ctx context.Context) (*models.Tag, error)
}

type Repository struct {
	db     *pgxpool.Pool
	Bottle BottleRepository
	Ocean  OceanRepository
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
		db: db,
	}
}
