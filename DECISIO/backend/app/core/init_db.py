"""Initialize database tables."""

from app.core.database import Base, engine
from app.models.decision import Decision
from app.models.project_context import ProjectContext
from app.models.evaluation import DecisionContextSnapshot, DecisionEvaluation


def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
