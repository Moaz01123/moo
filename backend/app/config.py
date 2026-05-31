from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database. Defaults to a local SQLite file; set DATABASE_URL to a
    # Postgres URL (postgresql+psycopg://...) in production.
    database_url: str = "sqlite:///./kavo.db"

    # Auth
    jwt_secret: str = "kavo-dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # Default admin bootstrapped on startup if no admin exists.
    admin_username: str = "admin"
    admin_password: str = "kavo-admin-2026"

    # CORS: comma separated list of allowed origins. "*" allows all.
    cors_origins: str = "*"

    # Optional OpenAI integration for the support assistant. When unset the
    # assistant falls back to a built-in rule-based knowledge engine.
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Optional Stripe keys (structure is ready; checkout works without them).
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
